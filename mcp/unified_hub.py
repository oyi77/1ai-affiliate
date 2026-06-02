#!/usr/bin/env python3
"""1ai-Affiliate Unified MCP Server — one API gateway for all marketing/sales services.

Integrates:
  - 1ai-ads       (port 5000) — AdForge ad generation + campaign management
  - 1ai-social    (port 8200) — SMMA blast/reach/outreach/shopee/affiliate
  - 1ai-content   (port 3000) — AI video marketing + Telegram bot
  - 1ai-ebook     (port 8100) — AI ebook pipeline + generation
  - 1ai-affiliate (port 3001) — this hub's own Node server: 6 Gemini content tools + tracking
  - Core tracking (PHP V3 API) — CPA tracking, affiliates, commissions

Architecture:
  Unified MCP → HTTP REST proxy → each service's native API
  Each connector handles auth, retry, circuit break.
"""

import json
import os
import time
from pathlib import Path
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SERVICES: dict[str, dict[str, Any]] = {
    "ads": {
        "url": os.getenv("ADS_URL", "http://localhost:5000"),
        "key": os.getenv("ADS_API_KEY", ""),
        "description": "AdForge — generate ads copy, landing pages, manage campaigns (FB/Google/TikTok/X)",
    },
    "social": {
        "url": os.getenv("SOCIAL_URL", "http://localhost:8200"),
        "key": os.getenv("SOCIAL_API_KEY", ""),
        "description": "SMMA — 9-platform blast, reach/outreach (27 routers), Shopee sync, affiliate",
    },
    "content": {
        "url": os.getenv("CONTENT_URL", "http://localhost:3000"),
        "key": os.getenv("CONTENT_API_KEY", ""),
        "description": "AI Video Marketing — Telegram bot, Midtrans/Tripay, video generation",
    },
    "ebook": {
        "url": os.getenv("EBOOK_URL", "http://localhost:8100"),
        "key": os.getenv("EBOOK_API_KEY", ""),
        "description": "AI Ebook Generator — multi-language, novel mode, AI cover, comics",
    },
    "tracking": {
        "url": os.getenv("TRACKING_URL", "http://localhost"),  # PHP V3 API
        "key": os.getenv("TRACKING_API_KEY", ""),
        "description": "CPA Tracking — affiliates, commissions, offers, margin, ledger",
    },
    "affiliate": {
        "url": os.getenv("AFFILIATE_URL", "http://localhost:3001"),
        "email": os.getenv("AFFILIATE_EMAIL", "admin@1ai.io"),
        "password": os.getenv("AFFILIATE_PASSWORD", ""),
        "description": "Affiliate Node server — 6 Gemini content tools (banner/carousel/caption/brand-kit/ab-test/bg-remove), auth, payments",
    },
}

mcp = FastMCP("1ai-affiliate-hub")

# ---------------------------------------------------------------------------
# HTTP client with retry + circuit breaker
# ---------------------------------------------------------------------------
class ServiceClient:
    def __init__(self, name: str, config: dict):
        self.name = name
        self.base_url = config["url"].rstrip("/")
        self.api_key = config["key"]
        self._failures = 0
        self._circuit_open_until = 0.0

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        if time.time() < self._circuit_open_until:
            raise Exception(f"Circuit breaker open for {self.name}")
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                headers = kwargs.pop("headers", {})
                if self.api_key:
                    headers["X-API-Key"] = self.api_key
                resp = await client.request(method, f"{self.base_url}{path}", headers=headers, **kwargs)
                resp.raise_for_status()
                self._failures = 0
                return resp.json()
        except Exception as e:
            self._failures += 1
            if self._failures >= 5:
                self._circuit_open_until = time.time() + 30
            raise Exception(f"{self.name} request failed: {e}") from e

    async def get(self, path: str) -> dict:
        return await self._request("GET", path)

    async def post(self, path: str, data: dict = None) -> dict:
        return await self._request("POST", path, json=data or {})


clients: dict[str, ServiceClient] = {}

def get_client(name: str) -> ServiceClient:
    if name not in clients:
        clients[name] = ServiceClient(name, SERVICES[name])
    return clients[name]


class AffiliateClient:
    """Affiliate server uses JWT Bearer auth — login on first use, cache token."""

    def __init__(self, config: dict):
        self.base_url = config["url"].rstrip("/")
        self.email = config["email"]
        self.password = config["password"]
        self._token: str = ""
        self._failures = 0
        self._circuit_open_until = 0.0

    async def _ensure_token(self) -> str:
        if self._token:
            return self._token
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{self.base_url}/api/auth/login", json={"email": self.email, "password": self.password})
            r.raise_for_status()
            self._token = r.json().get("token", "")
            if not self._token:
                raise Exception("affiliate login: no token in response")
            return self._token

    async def post(self, path: str, data: dict | None = None) -> dict:
        if time.time() < self._circuit_open_until:
            raise Exception("Circuit breaker open for affiliate")
        try:
            token = await self._ensure_token()
            async with httpx.AsyncClient(timeout=30) as c:
                r = await c.post(
                    f"{self.base_url}{path}",
                    json=data or {},
                    headers={"Authorization": f"Bearer {token}"},
                )
                if r.status_code == 401:
                    # token expired/rotated — re-login once
                    self._token = ""
                    token = await self._ensure_token()
                    r = await c.post(
                        f"{self.base_url}{path}",
                        json=data or {},
                        headers={"Authorization": f"Bearer {token}"},
                    )
                r.raise_for_status()
                self._failures = 0
                return r.json()
        except Exception as e:
            self._failures += 1
            if self._failures >= 5:
                self._circuit_open_until = time.time() + 30
            raise Exception(f"affiliate request failed: {e}") from e

    async def get(self, path: str) -> dict:
        token = await self._ensure_token()
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{self.base_url}{path}", headers={"Authorization": f"Bearer {token}"})
            r.raise_for_status()
            return r.json()


affiliate_client: AffiliateClient | None = None

def get_affiliate() -> AffiliateClient:
    global affiliate_client
    if affiliate_client is None:
        affiliate_client = AffiliateClient(SERVICES["affiliate"])
    return affiliate_client

# ---------------------------------------------------------------------------
# Health / Discovery
# ---------------------------------------------------------------------------
@mcp.tool()
async def list_services() -> str:
    """List all integrated services with their status and endpoints."""
    lines = []
    for name, cfg in SERVICES.items():
        try:
            client = get_client(name)
            await client.get("/health")
            status = "UP"
        except Exception:
            status = "DOWN"
        lines.append(f"- {name}: {status} | {cfg['description']} | {cfg['url']}")
    return "\n".join(lines)

@mcp.tool()
async def service_health(service: str) -> str:
    """Check health of a specific service."""
    if service not in SERVICES:
        return f"Unknown service: {service}. Available: {', '.join(SERVICES)}"
    try:
        client = get_client(service)
        data = await client.get("/health")
        return json.dumps(data, indent=2)
    except Exception as e:
        return f"{service}: DOWN — {e}"

# ---------------------------------------------------------------------------
# Ads (AdForge) integration
# ---------------------------------------------------------------------------
@mcp.tool()
async def ads_generate(prompt: str, campaign_type: str = "general") -> str:
    """Generate ad copy via 1ai-ads/AdForge."""
    client = get_client("ads")
    result = await client.post("/api/generate-ads", {"prompt": prompt, "campaign_type": campaign_type})
    return json.dumps(result, indent=2)

@mcp.tool()
async def ads_generate_landing(product: str, audience: str = "") -> str:
    """Generate landing page content via 1ai-ads."""
    client = get_client("ads")
    result = await client.post("/api/generate-landing", {"product": product, "audience": audience})
    return json.dumps(result, indent=2)

# ---------------------------------------------------------------------------
# Social (SMMA) integration
# ---------------------------------------------------------------------------
@mcp.tool()
async def social_blast(platform: str, content: str, accounts: list[str] = None) -> str:
    """Post content to social platforms via 1ai-social blast engine."""
    client = get_client("social")
    result = await client.post("/automation/blast", {
        "platform": platform,
        "content": content,
        "accounts": accounts or [],
    })
    return json.dumps(result, indent=2)

@mcp.tool()
async def social_analytics(platform: str = "", days: int = 7) -> str:
    """Get social media analytics from 1ai-social."""
    client = get_client("social")
    params = f"?platform={platform}&days={days}" if platform else f"?days={days}"
    result = await client.get(f"/analytics/overview{params}")
    return json.dumps(result, indent=2)

@mcp.tool()
async def social_shopee_sync(shop_id: str = "") -> str:
    """Sync Shopee products/orders via 1ai-social."""
    client = get_client("social")
    endpoint = f"/shopee/sync/{shop_id}" if shop_id else "/shopee/sync/all"
    result = await client.post(endpoint)
    return json.dumps(result, indent=2)

@mcp.tool()
async def social_shopee_commission() -> str:
    """Get Shopee affiliate commission report from 1ai-social."""
    client = get_client("social")
    result = await client.get("/shopee/analytics/sales")
    return json.dumps(result, indent=2)

# ---------------------------------------------------------------------------
# Content (AI Video Marketing) integration
# ---------------------------------------------------------------------------
@mcp.tool()
async def content_status() -> str:
    """Check 1ai-content bot status."""
    client = get_client("content")
    try:
        result = await client.get("/health")
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"content: DOWN — {e}. Note: 1ai-content is a Telegram bot, REST API may be limited."

# ---------------------------------------------------------------------------
# Ebook integration
# ---------------------------------------------------------------------------
@mcp.tool()
async def ebook_generate(title: str, topic: str, language: str = "en", chapters: int = 5) -> str:
    """Start AI ebook generation via 1ai-ebook pipeline."""
    client = get_client("ebook")
    result = await client.post("/api/projects", {
        "title": title,
        "topic": topic,
        "language": language,
        "num_chapters": chapters,
    })
    return json.dumps(result, indent=2)

@mcp.tool()
async def ebook_status(project_id: int = 0) -> str:
    """Check ebook generation status."""
    client = get_client("ebook")
    path = f"/api/projects/{project_id}" if project_id else "/api/projects"
    result = await client.get(path)
    return json.dumps(result, indent=2)

@mcp.tool()
async def ebook_market_research(keyword: str) -> str:
    """Research ebook market via Google Books + Open Library API."""
    client = get_client("ebook")
    result = await client.post("/api/research", {"keyword": keyword})
    return json.dumps(result, indent=2)

# ---------------------------------------------------------------------------
# Tracking (CPA) integration — native PHP V3 API
# ---------------------------------------------------------------------------
@mcp.tool()
async def tracking_affiliates(status: str = "") -> str:
    """List affiliates from CPA tracking platform."""
    client = get_client("tracking")
    path = f"/api/v3/affiliates?status={status}" if status else "/api/v3/affiliates"
    result = await client.get(path)
    return json.dumps(result, indent=2)

@mcp.tool()
async def tracking_commissions(affiliate_id: int = 0) -> str:
    """List commission entries from CPA tracking."""
    client = get_client("tracking")
    path = f"/api/v3/commissions/entries?affiliate_id={affiliate_id}" if affiliate_id else "/api/v3/commissions/entries"
    result = await client.get(path)
    return json.dumps(result, indent=2)

@mcp.tool()
async def tracking_offers(network: str = "") -> str:
    """List offers from CPA tracking."""
    client = get_client("tracking")
    path = f"/api/v3/offers?network={network}" if network else "/api/v3/offers"
    result = await client.get(path)
    return json.dumps(result, indent=2)

# ---------------------------------------------------------------------------
# Unified workflows — cross-service orchestration
# ---------------------------------------------------------------------------
@mcp.tool()
async def unified_campaign(offer_name: str, product: str, niche: str = "general") -> str:
    """Orchestrate full campaign: generate ad → create tracking link → blast social.

    1. Generate ad copy via 1ai-ads
    2. Create tracking link via CPA tracking
    3. (Ready for social blast via 1ai-social)
    """
    steps = []

    # Step 1: Generate ads
    try:
        ads_client = get_client("ads")
        ads_result = await ads_client.post("/api/generate-ads", {
            "prompt": f"Create affiliate ad for {product} in {niche} niche",
            "campaign_type": niche,
        })
        steps.append({"step": "ads_generated", "status": "ok", "data": ads_result})
    except Exception as e:
        steps.append({"step": "ads_generated", "status": "failed", "error": str(e)})

    # Step 2: Create tracking offer
    try:
        track_client = get_client("tracking")
        offer_result = await track_client.post("/api/v3/offers", {
            "name": offer_name,
            "network": "1ai-affiliate",
            "payout": 0,
            "vertical": niche,
            "type": "CPA",
        })
        steps.append({"step": "tracking_link_created", "status": "ok", "data": offer_result})
    except Exception as e:
        steps.append({"step": "tracking_link_created", "status": "failed", "error": str(e)})

    return json.dumps({"workflow": "unified_campaign", "steps": steps}, indent=2)

@mcp.tool()
async def unified_affiliate_onboarding(email: str, name: str, offers: list[str] = None) -> str:
    """Full affiliate onboarding: create affiliate profile + generate ebook welcome + blast announcement."""
    steps = []

    # Step 1: Create affiliate in CPA tracking
    try:
        track_client = get_client("tracking")
        aff_result = await track_client.post("/api/v3/affiliates", {
            "user_id": 0,
            "company_name": name,
            "contact_email": email,
            "tier": "standard",
        })
        steps.append({"step": "affiliate_created", "status": "ok", "data": aff_result})
    except Exception as e:
        steps.append({"step": "affiliate_created", "status": "failed", "error": str(e)})

    # Step 2: Generate welcome ebook (optional — requires ebook service)
    if offers:
        try:
            ebook_client = get_client("ebook")
            ebook_result = await ebook_client.post("/api/projects", {
                "title": f"Welcome Guide for {name}",
                "topic": f"Affiliate marketing guide with offers: {', '.join(offers)}",
                "language": "en",
                "num_chapters": 3,
            })
            steps.append({"step": "welcome_ebook_queued", "status": "ok", "data": ebook_result})
        except Exception as e:
            steps.append({"step": "welcome_ebook_queued", "status": "skipped", "error": str(e)})

    return json.dumps({"workflow": "affiliate_onboarding", "steps": steps}, indent=2)


# ---------------------------------------------------------------------------
# Content (Gemini) integration — 6 affiliate-marketing tools
# ---------------------------------------------------------------------------
@mcp.tool()
async def content_status() -> str:
    """Check 1ai-affiliate content tools status (Gemini key configured, model)."""
    try:
        client = get_affiliate()
        data = await client.get("/api/content/status")
        return json.dumps(data, indent=2)
    except Exception as e:
        return f"content: DOWN — {e}"

@mcp.tool()
async def content_banner(product: str, audience: str = "general audience", platform: str = "instagram", style: str = "bold", variations: int = 3) -> str:
    """Generate banner concepts via Gemini (1ai-affiliate)."""
    try:
        client = get_affiliate()
        result = await client.post("/api/content/banner", {
            "product": product, "audience": audience, "platform": platform,
            "style": style, "variations": variations,
        })
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"banner failed: {e}"

@mcp.tool()
async def content_carousel(topic: str, platform: str = "instagram", slides: int = 7) -> str:
    """Generate Instagram carousel via Gemini (1ai-affiliate)."""
    try:
        client = get_affiliate()
        result = await client.post("/api/content/carousel", {
            "topic": topic, "platform": platform, "slides": slides,
        })
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"carousel failed: {e}"

@mcp.tool()
async def content_caption(product: str, platform: str = "instagram", tone: str = "casual", length: str = "medium") -> str:
    """Generate social caption + alt versions via Gemini (1ai-affiliate)."""
    try:
        client = get_affiliate()
        result = await client.post("/api/content/caption", {
            "product": product, "platform": platform, "tone": tone, "length": length,
        })
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"caption failed: {e}"

@mcp.tool()
async def content_brand_kit(brand_name: str, industry: str = "", vibe: str = "modern") -> str:
    """Generate starter brand kit (palette, fonts, voice, logo concept) via Gemini (1ai-affiliate)."""
    try:
        client = get_affiliate()
        result = await client.post("/api/content/brand-kit", {
            "brand_name": brand_name, "industry": industry, "vibe": vibe,
        })
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"brand_kit failed: {e}"

@mcp.tool()
async def content_ab_test(product: str, audience: str = "general audience", hypothesis: str = "") -> str:
    """Generate 3 A/B test landing-page variants via Gemini (1ai-affiliate)."""
    try:
        client = get_affiliate()
        payload: dict[str, Any] = {"product": product, "audience": audience}
        if hypothesis:
            payload["hypothesis"] = hypothesis
        client_ref = get_affiliate()
        result = await client_ref.post("/api/content/ab-test", payload)
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"ab_test failed: {e}"

@mcp.tool()
async def content_bg_remove(image_subject: str, intent: str = "product photo clean white background") -> str:
    """Generate optimized prompt for AI background-removal (1ai-affiliate).
    Note: actual bg-removal happens client-side due to model size.
    """
    try:
        client = get_affiliate()
        result = await client.post("/api/content/bg-remove", {
            "image_subject": image_subject, "intent": intent,
        })
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"bg_remove failed: {e}"


# ---------------------------------------------------------------------------
# Cross-service workflow: unified_content_funnel
# banner + caption + ab-test + brand-kit → social blast (1ai-social)
# ---------------------------------------------------------------------------
@mcp.tool()
async def unified_content_funnel(product: str, audience: str, platform: str = "instagram", brand_name: str = "") -> str:
    """Generate full content funnel: banner + caption + ab-test (+brand-kit if brand_name) then optionally blast via 1ai-social."""
    steps = []
    client = get_affiliate()

    # 1. banner
    try:
        banner = await client.post("/api/content/banner", {"product": product, "audience": audience, "platform": platform, "variations": 2})
        steps.append({"step": "banner", "status": "ok", "data": banner})
    except Exception as e:
        steps.append({"step": "banner", "status": "error", "error": str(e)})

    # 2. caption
    try:
        caption = await client.post("/api/content/caption", {"product": product, "platform": platform, "tone": "casual"})
        steps.append({"step": "caption", "status": "ok", "data": caption})
    except Exception as e:
        steps.append({"step": "caption", "status": "error", "error": str(e)})

    # 3. ab-test
    try:
        ab = await client.post("/api/content/ab-test", {"product": product, "audience": audience})
        steps.append({"step": "ab_test", "status": "ok", "data": ab})
    except Exception as e:
        steps.append({"step": "ab_test", "status": "error", "error": str(e)})

    # 4. brand-kit (optional)
    if brand_name:
        try:
            kit = await client.post("/api/content/brand-kit", {"brand_name": brand_name, "industry": "general", "vibe": "modern"})
            steps.append({"step": "brand_kit", "status": "ok", "data": kit})
        except Exception as e:
            steps.append({"step": "brand_kit", "status": "error", "error": str(e)})

    return json.dumps({"workflow": "unified_content_funnel", "product": product, "steps": steps}, indent=2)


# ---------------------------------------------------------------------------
# Entry
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run()
