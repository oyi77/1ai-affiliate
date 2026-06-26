# Default Credentials — 1AI Affiliate Platform

## Quick Reference

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | admin@1ai.io | admin123 | Full platform access |
| **Admin** | openclaw@example.com | openclaw123 | Full platform access |
| **Offer Manager** | offers@1ai.io | offers123 | Manage offers, approve/reject |
| **Affiliate Manager** | affiliates@1ai.io | affiliates123 | Manage affiliates, payouts |
| **Finance Manager** | finance@1ai.io | finance123 | Payments, payouts, billing |
| **Advertiser** | acme@test.com | acme123 | Create offers, view conversions |
| **Advertiser** | shopee@bemob.import | shopee123 | Shopee affiliate integration |
| **Advertiser** | testadvertiser@test.com | testadvertiser123 | Test advertiser |
| **Advertiser** | advtest2@test.com | advtest123 | Test advertiser |
| **Affiliate** | alice@1ai.io | alice123 | Browse offers, generate links |
| **Affiliate** | bob@1ai.io | bob123 | Browse offers, generate links |
| **Affiliate** | test@test.com | test123 | Test affiliate |
| **Affiliate** | aff@test.com | aff123 | Test affiliate |
| **Affiliate** | testaffiliate@test.com | testaffiliate123 | Test affiliate |
| **Affiliate** | test@1ai.local | testuser123 | Test affiliate (archived data) |
| **Affiliate** | flowtest@test.com | flowtest123 | Test affiliate |

## Role Capabilities

### Admin
- Full CRUD on all entities (campaigns, offers, affiliates, advertisers)
- Approve/reject offers from advertisers
- Approve/reject conversions
- Process payouts
- Configure platform settings
- View all analytics and reports

### Offer Manager (admin role)
- Create/edit/delete offers
- Approve/reject advertiser offers
- View offer performance
- Cannot manage users or system settings

### Affiliate Manager (admin role)
- Create/edit/delete affiliates
- Process affiliate payouts
- View affiliate performance
- Manage affiliate tiers

### Finance Manager (admin role)
- Process payouts
- View payment history
- Configure payment gateways
- Manage billing

### Advertiser
- Login → Advertiser Dashboard
- Create offers (pending admin approval)
- View own conversions
- Approve/reject own conversions
- View payout history
- Update company profile

### Affiliate
- Login → Affiliate Dashboard
- Browse approved offers
- Generate tracking links
- View clicks, conversions, earnings
- Configure payout methods
- Request payouts

## Login URL
https://affiliate.berkahkarya.org/

## API Authentication
```bash
# Login
curl -X POST https://affiliate.berkahkarya.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@1ai.io","password":"admin123"}'

# Use token
curl -H "Authorization: Bearer <token>" https://affiliate.berkahkarya.org/api/auth/me
```
