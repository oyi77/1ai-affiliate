const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const yaml = require('js-yaml');
const axios = require('axios');

const execAsync = promisify(exec);

// ── Config (env vars with dev-friendly defaults) ──────────────
const NGINX_SITES_AVAILABLE = process.env.NGINX_SITES_AVAILABLE || '/etc/nginx/sites-available';
const NGINX_SITES_ENABLED  = process.env.NGINX_SITES_ENABLED  || '/etc/nginx/sites-enabled';
const SSL_BASE_DIR         = process.env.SSL_BASE_DIR         || path.join(__dirname, '..', 'ssl');
const ACME_ROOT            = process.env.ACME_ROOT            || path.join(__dirname, '..', 'public');
const CF_ROUTER_URL        = process.env.CF_ROUTER_URL        || 'http://127.0.0.1:7070';
const CF_ACCOUNT_ID        = process.env.CF_ACCOUNT_ID        || 'cf_1781776521858';
const CF_ZONE_ID           = process.env.CF_ZONE_ID           || '4a56e4de3b8d9e8b11c5bea50a2ff0df';
const APP_PROXY_PORT       = process.env.APP_PROXY_PORT       || 3001;

/**
 * Infrastructure Manager Service
 * Automates Nginx config generation, cf-router integration, and Cloudflare DNS management
 */
class InfrastructureManager {
  constructor() {
    this.nginxSitesAvailable = NGINX_SITES_AVAILABLE;
    this.nginxSitesEnabled = NGINX_SITES_ENABLED;
    this.cfRouterPath = path.join(process.env.HOME || '/root', process.env.CF_ROUTER_DIR || 'projects/1ai-cf-router');
    this.cfRouterAppsYaml = path.join(this.cfRouterPath, 'apps.yaml');
  }

  /**
   * Generate Nginx vhost configuration for a custom domain
   */
  generateNginxConfig(domain, sslEnabled = true) {
    const sslCertPath = path.join(SSL_BASE_DIR, domain, 'fullchain.pem');
    const sslKeyPath = path.join(SSL_BASE_DIR, domain, 'privkey.pem');
    
    if (sslEnabled) {
      return `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    
    # ACME challenge location for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root ${ACME_ROOT};
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain};

    ssl_certificate ${sslCertPath};
    ssl_certificate_key ${sslKeyPath};
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy to 1ai-affiliate service
    location / {
        proxy_pass http://localhost:${this.servicePort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`;
    } else {
      // HTTP-only configuration
      return `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    
    # Proxy to 1ai-affiliate service
    location / {
        proxy_pass http://localhost:${this.servicePort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`;
    }
  }
  /**
   * Write Nginx config file and enable the site
   */
  async provisionNginxVhost(domain, { sslCertPath, sslKeyPath }) {
    try {
      const sitesAvailablePath = path.join(this.nginxSitesAvailable, domain);
      const sitesEnabledPath = path.join(this.nginxSitesEnabled, domain);
      const tempConfigPath = `/tmp/nginx-${domain}-${Date.now()}.conf`;

      const nginxConfig = `
server {
    listen 80;
    server_name ${domain};

    ${sslCertPath ? `
    listen 443 ssl;
    ssl_certificate ${sslCertPath};
    ssl_certificate_key ${sslKeyPath};
    ` : ''}

    location / {
        proxy_pass http://localhost:${APP_PROXY_PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

      // Write to temp location first (no root permissions needed)
      await fs.writeFile(tempConfigPath, nginxConfig.trim(), 'utf8');

      // Use sudo to move to sites-available
      await execAsync(`sudo mv ${tempConfigPath} ${sitesAvailablePath}`);

      // Use sudo to create symlink to sites-enabled
      await execAsync(`sudo ln -sf ${sitesAvailablePath} ${sitesEnabledPath}`);

      // Test Nginx configuration
      await execAsync('sudo nginx -t');

      // Reload Nginx
      await execAsync('sudo systemctl reload nginx');

    console.log(`✅ Nginx vhost provisioned: ${domain}`);
      return { success: true };
    } catch (error) {
      // Clean up temp file if it exists
      const tempFiles = await fs.readdir('/tmp').catch(() => []);
      const tempFile = tempFiles.find(f => f.startsWith(`nginx-${domain}-`));
      if (tempFile) {
        await fs.unlink(`/tmp/${tempFile}`).catch(() => {});
      }
      
      console.error(`❌ Nginx vhost provisioning failed for ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Remove Nginx vhost configuration
   */
  async deprovisionNginxVhost(domain) {
    try {
      const configPath = path.join(this.nginxSitesAvailable, domain);
      const enabledPath = path.join(this.nginxSitesEnabled, domain);
      
      // Remove symlink from sites-enabled
      try {
        await fs.unlink(enabledPath);
        console.log(`✅ Removed enabled site: ${enabledPath}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      
      // Remove config from sites-available
      try {
        await fs.unlink(configPath);
        console.log(`✅ Removed Nginx config: ${configPath}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      
      // Reload Nginx
      await execAsync('sudo systemctl reload nginx');
      console.log('✅ Nginx reloaded successfully');
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to deprovision Nginx vhost for ${domain}:`, error.message);
      throw new Error(`Nginx deprovisioning failed: ${error.message}`);
    }
  }

  /**
   * Add domain to 1ai-cf-router apps.yaml
   */
  async addToCfRouter(domain) {
    try {
      // Check if cf-router directory exists
      try {
        await fs.access(this.cfRouterPath);
      } catch {
        console.warn(`⚠️  cf-router not found at ${this.cfRouterPath}, skipping cf-router integration`);
        return { success: false, reason: 'cf-router not found' };
      }
      
      const yamlContent = await fs.readFile(this.cfRouterAppsYaml, 'utf8');
      const config = yaml.load(yamlContent) || {};
      
      // Ensure apps key exists
      if (!config.apps) config.apps = {};
      // Check if domain already exists (apps is an object, not array)
      const existingAppKey = Object.keys(config.apps || {}).find(key => 
        config.apps[key].hostname === domain
      );
      if (existingAppKey) {
        console.log(`ℹ️  Domain ${domain} already exists in cf-router apps.yaml`);
        return { success: true, alreadyExists: true };
      }
      
      // Generate app key from domain (e.g., "test20_berkahkarya_org")
      const appKey = domain.replace(/\./g, '_');
      
      // Add new app entry as object property
      config.apps[appKey] = {
        enabled: true,
        hostname: domain,
        mode: 'port',
        port: this.servicePort
      };
      
      // Write back to apps.yaml
      const updatedYaml = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      
      await fs.writeFile(this.cfRouterAppsYaml, updatedYaml, 'utf8');
      console.log(`✅ Added ${domain} to cf-router apps.yaml`);
      
      // TODO: Trigger cf-router reload if it has a reload mechanism
      
      return { success: true, appKey };
    } catch (error) {
      console.error(`❌ Failed to add ${domain} to cf-router:`, error.message);
      throw error;
    }
  }

  /**
   * Remove domain from 1ai-cf-router apps.yaml
   */
  async removeFromCfRouter(domain) {
    try {
      // Check if cf-router directory exists
      try {
        await fs.access(this.cfRouterPath);
      } catch {
        console.warn(`⚠️  cf-router not found at ${this.cfRouterPath}, skipping cf-router integration`);
        return { success: false, reason: 'cf-router not found' };
      }
      
      // Read current apps.yaml
      const yamlContent = await fs.readFile(this.cfRouterAppsYaml, 'utf8');
      const config = yaml.load(yamlContent) || {};
      
      // Ensure apps key exists
      if (!config.apps) config.apps = {};
      const entries = Object.entries(config.apps || {});
      const targetEntry = entries.find(([, v]) => v.hostname === domain);
      if (!targetEntry) {
        console.log(`ℹ️  Domain ${domain} not found in cf-router apps.yaml`);
        return { success: true, notFound: true };
      }
      delete config.apps[targetEntry[0]];
      
      // Write back to apps.yaml
      const updatedYaml = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      
      await fs.writeFile(this.cfRouterAppsYaml, updatedYaml, 'utf8');
      console.log(`✅ Removed ${domain} from cf-router apps.yaml`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to remove ${domain} from cf-router:`, error.message);
      throw new Error(`cf-router deintegration failed: ${error.message}`);
    }
  }

  /**
   * Create Cloudflare DNS A record pointing to server IP
   */
  async createCloudflareDnsRecord(domain, zoneId, ipAddress) {
    try {
      const cfRouterUrl = CF_ROUTER_URL;
      const accountId = CF_ACCOUNT_ID;
      const defaultZoneId = CF_ZONE_ID;
      const targetZoneId = zoneId || defaultZoneId;
      const serverIp = ipAddress || process.env.SERVER_IP;
      
      if (!serverIp) {
        throw new Error('SERVER_IP environment variable not set and no ipAddress provided');
      }

      const response = await axios.post(
        `${cfRouterUrl}/api/cf/${accountId}/${targetZoneId}/dns`,
        { type: 'A', name: domain, content: serverIp, ttl: 1, proxied: true },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      console.log(`✅ Cloudflare DNS record created for ${domain} via cf-router`);
      return { success: true, record: response.data };
    } catch (error) {
      console.error(`❌ Failed to create Cloudflare DNS record for ${domain}:`, error.message);
      throw new Error(`Cloudflare DNS creation failed: ${error.message}`);
    }
  }

  /**
   * Delete a Cloudflare DNS record via cf-router HTTP API
   * @param {string} domain - Domain name to delete
   * @param {string} zoneId - Cloudflare zone ID (optional, defaults to berkahkarya.org)
   */
  async deleteCloudflareDnsRecord(domain, zoneId) {
    try {
      const cfRouterUrl = CF_ROUTER_URL;
      const accountId = process.env.CF_DELETE_ACCOUNT_ID || CF_ACCOUNT_ID;
      const defaultZoneId = CF_ZONE_ID;

      const response = await axios.delete(
        `${cfRouterUrl}/api/cf/${accountId}/${targetZoneId}/dns/${domain}`,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
          validateStatus: (status) => status === 200 || status === 404
        }
      );

      if (response.status === 404) {
        console.log(`⚠️  Cloudflare DNS record for ${domain} not found (already deleted or never existed)`);
        return { success: true, alreadyDeleted: true };
      }

      console.log(`✅ Cloudflare DNS record deleted for ${domain} via cf-router`);
      return { success: true, deleted: true };
    } catch (error) {
      console.error(`❌ Failed to delete Cloudflare DNS record for ${domain}:`, error.message);
      throw new Error(`Cloudflare DNS deletion failed: ${error.message}`);
    }
  }

  /**
   * Full provisioning workflow for a new custom domain
   */
  async provisionDomain(domain, options = {}) {
    const {
      sslEnabled = true,
      cloudflareZoneId = null,
      serverIp = null
    } = options;
    
    const results = {
      nginx: null,
      cfRouter: null,
      cloudflareDns: null
    };
    
    try {
      // 1. Provision Nginx vhost (skip SSL config if SSL not enabled yet)
      results.nginx = await this.provisionNginxVhost(domain, false); // Initial HTTP-only config
      
      // 2. Add to cf-router
      results.cfRouter = await this.addToCfRouter(domain);
      
      // 3. Create Cloudflare DNS record if zone ID provided
      if (cloudflareZoneId && serverIp) {
        results.cloudflareDns = await this.createCloudflareDnsRecord(domain, cloudflareZoneId, serverIp);
      }
      
      return { success: true, results };
    } catch (error) {
      console.error(`❌ Domain provisioning failed for ${domain}:`, error.message);
      // Attempt rollback on failure
      try {
        await this.deprovisionDomain(domain, { cloudflareZoneId });
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
      }
      throw error;
    }
  }

  /**
   * Full deprovisioning workflow for removing a custom domain
   */
  async deprovisionDomain(domain, options = {}) {
    const { cloudflareZoneId = null } = options;
    
    const results = {
      nginx: null,
      cfRouter: null,
      cloudflareDns: null
    };
    
    try {
      // 1. Remove Cloudflare DNS record if zone ID provided
      if (cloudflareZoneId) {
        results.cloudflareDns = await this.deleteCloudflareDnsRecord(domain, cloudflareZoneId);
      }
      
      // 2. Remove from cf-router
      results.cfRouter = await this.removeFromCfRouter(domain);
      
      // 3. Deprovision Nginx vhost
      results.nginx = await this.deprovisionNginxVhost(domain);
      
      return { success: true, results };
    } catch (error) {
      console.error(`❌ Domain deprovisioning failed for ${domain}:`, error.message);
      throw error;
    }
  }

  /**
   * Update Nginx config to enable SSL after certificate is obtained
   */
  async enableSsl(domain) {
    try {
      // Generate SSL-enabled config
      const configContent = this.generateNginxConfig(domain, true);
      const configPath = path.join(this.nginxSitesAvailable, domain);
      
      // Overwrite existing config
      await fs.writeFile(configPath, configContent, 'utf8');
      console.log(`✅ Updated Nginx config with SSL for ${domain}`);
      
      // Test and reload Nginx
      await execAsync('sudo nginx -t');
      await execAsync('sudo systemctl reload nginx');
      console.log('✅ Nginx reloaded with SSL configuration');
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to enable SSL for ${domain}:`, error.message);
      throw new Error(`SSL enablement failed: ${error.message}`);
    }
  }
}

module.exports = new InfrastructureManager();
