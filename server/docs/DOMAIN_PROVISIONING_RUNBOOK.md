# Domain Provisioning Operational Runbook

## Quick Reference

### Critical Paths
- **Nginx configs**: `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`
- **SSL certificates**: `~/projects/1ai-affiliate/server/ssl/`
- **cf-router config**: `~/projects/1ai-cf-router/apps.yaml`
- **Service logs**: `pm2 logs 1ai-affiliate`

### Quick Commands
```bash
# Check service status
pm2 status 1ai-affiliate

# View logs
pm2 logs 1ai-affiliate --lines 50

# Restart service
pm2 restart 1ai-affiliate

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check cf-router
curl http://localhost:7070/health
```

---

## Domain Creation Workflow

### Normal Flow
1. **API Request**: POST `/api/admin/domains`
2. **Database Insert**: Record created in `1ai_smartlink_domains`
3. **SSL Provisioning** (if `ssl_enabled: true`):
   - Create Cloudflare DNS A record
   - Start HTTP-01 challenge handler
   - Request certificate from Let's Encrypt
   - Save certificate files to `server/ssl/<domain>/`
4. **Nginx Configuration**:
   - Generate vhost config file
   - Symlink to sites-enabled
   - Test config validity
   - Reload Nginx
5. **cf-router Registration**:
   - Add entry to apps.yaml
   - Restart cf-router service
6. **Response**: Return 201 with domain details

### Failure Points & Recovery

#### 1. Cloudflare DNS Creation Fails

**Symptoms**:
- 500 error with "Failed to create Cloudflare DNS record"
- No DNS record visible in Cloudflare dashboard

**Causes**:
- Invalid/missing `CLOUDFLARE_API_TOKEN`
- Token lacks DNS:Edit permission
- Invalid zone for domain
- Rate limit exceeded

**Diagnosis**:
```bash
# Check if token is set
grep CLOUDFLARE_API_TOKEN server/.env

# Test token manually
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Check zones accessible by token
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

**Fix**:
1. Get valid token from https://dash.cloudflare.com/profile/api-tokens
2. Ensure permissions: Zone.DNS:Edit for target zone
3. Update `CLOUDFLARE_API_TOKEN` in server/.env
4. Retry domain creation

**Cleanup** (if partial state):
```sql
-- Remove database record
DELETE FROM 1ai_smartlink_domains WHERE domain = 'failed-domain.com';
```

#### 2. SSL Certificate Provisioning Fails

**Symptoms**:
- 500 error with "SSL certificate provisioning failed"
- No certificate files in `server/ssl/<domain>/`
- Cloudflare DNS record exists but no certificate

**Causes**:
- DNS not propagated yet (too fast after DNS creation)
- Port 80 blocked/unavailable
- ACME challenge timeout
- Let's Encrypt rate limit
- Invalid `ACME_EMAIL`

**Diagnosis**:
```bash
# Check DNS propagation
dig +short <domain>

# Verify points to correct IP
echo $SERVER_IP

# Test port 80 accessibility from outside
curl -I http://<domain>

# Check Let's Encrypt rate limits
# https://letsencrypt.org/docs/rate-limits/

# View recent challenge attempts
pm2 logs 1ai-affiliate | grep -i acme
```

**Fix**:
1. **DNS not propagated**: Wait 2-5 minutes, retry provisioning
2. **Port 80 blocked**: 
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw status
   ```
3. **Rate limit**: Use staging for testing or wait 7 days
4. **Invalid email**: Update `ACME_EMAIL` in server/.env

**Manual Certificate Request** (if needed):
```bash
cd ~/projects/1ai-affiliate/server
node -e "
const sslManager = require('./services/sslManager');
sslManager.obtainCertificate('<domain>')
  .then(() => console.log('Success'))
  .catch(err => console.error('Error:', err));
"
```

**Cleanup** (if partial state):
```bash
# Remove DNS record from Cloudflare (via dashboard or API)
# Remove database record
mysql -u root 1ai_affiliate -e "DELETE FROM 1ai_smartlink_domains WHERE domain = '<domain>';"
# Remove any partial SSL files
rm -rf server/ssl/<domain>/
```

#### 3. Nginx Configuration Fails

**Symptoms**:
- 500 error with "Failed to provision Nginx vhost"
- No vhost file in `/etc/nginx/sites-enabled/`
- `nginx -t` shows syntax errors

**Causes**:
- Insufficient permissions (can't write to /etc/nginx/)
- Invalid domain characters in filename
- Syntax error in generated config
- Nginx config test failure

**Diagnosis**:
```bash
# Check if vhost file exists
ls -la /etc/nginx/sites-available/<domain>
ls -la /etc/nginx/sites-enabled/<domain>

# Test Nginx config
sudo nginx -t

# Check Nginx syntax manually
sudo nginx -T | grep -A 50 "server_name <domain>"

# Check user permissions
id
sudo -l
```

**Fix**:
1. **Permission denied**: Ensure openclaw user has sudo NOPASSWD for nginx/systemctl:
   ```bash
   sudo visudo
   # Add: openclaw ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
   ```

2. **Syntax error**: Manually edit generated config:
   ```bash
   sudo nano /etc/nginx/sites-available/<domain>
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Missing symlink**:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/<domain> /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

**Manual Nginx Setup**:
```bash
# Generate config manually
cat > /tmp/nginx-<domain>.conf << 'EOF'
server {
    listen 80;
    server_name <domain>;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Copy and enable
sudo cp /tmp/nginx-<domain>.conf /etc/nginx/sites-available/<domain>
sudo ln -sf /etc/nginx/sites-available/<domain> /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 4. cf-router Registration Fails

**Symptoms**:
- 500 error with "Failed to add domain to cf-router"
- Domain not in `~/projects/1ai-cf-router/apps.yaml`
- cf-router health check fails

**Causes**:
- cf-router service not running
- Invalid apps.yaml syntax after modification
- File permission issues

**Diagnosis**:
```bash
# Check cf-router status
pm2 status cf-router

# Check apps.yaml syntax
cd ~/projects/1ai-cf-router
cat apps.yaml | grep -A 5 "<domain>"

# Test YAML validity
node -e "const yaml = require('js-yaml'); const fs = require('fs'); yaml.load(fs.readFileSync('apps.yaml'));"

# Check cf-router health
curl http://localhost:7070/health
```

**Fix**:
1. **Service not running**:
   ```bash
   pm2 start cf-router
   ```

2. **Invalid YAML**:
   ```bash
   # Backup current config
   cp ~/projects/1ai-cf-router/apps.yaml ~/projects/1ai-cf-router/apps.yaml.backup
   
   # Manually edit to fix syntax
   nano ~/projects/1ai-cf-router/apps.yaml
   
   # Restart cf-router
   pm2 restart cf-router
   ```

3. **Manual entry addition**:
   ```yaml
   # Add to apps.yaml under appropriate zone
   - name: <domain>
     enabled: true
     port: 3001
   ```

**Cleanup** (if partial state):
```bash
# Remove from apps.yaml
cd ~/projects/1ai-cf-router
nano apps.yaml  # Delete domain entry
pm2 restart cf-router

# Remove Nginx config
sudo rm /etc/nginx/sites-enabled/<domain>
sudo rm /etc/nginx/sites-available/<domain>
sudo systemctl reload nginx

# Remove DNS record (Cloudflare dashboard or API)

# Remove SSL files
rm -rf ~/projects/1ai-affiliate/server/ssl/<domain>/

# Remove database record
mysql -u root 1ai_affiliate -e "DELETE FROM 1ai_smartlink_domains WHERE domain = '<domain>';"
```

---

## Domain Update Workflow

### Normal Flow
1. **API Request**: PUT `/api/admin/domains/:id`
2. **Database Update**: Modify record in `1ai_smartlink_domains`
3. **If domain name changed**:
   - Deprovision old domain (remove Nginx, cf-router, DNS, SSL)
   - Provision new domain (full creation workflow)
4. **If SSL toggled**:
   - Enable: Provision certificate, update Nginx config
   - Disable: Update Nginx config (remove SSL section)
5. **Response**: Return 200 with updated domain details

### Failure Points & Recovery

#### Domain Rename Fails Mid-Process

**Symptom**: Old domain deprovisioned but new domain provisioning failed

**Impact**: 
- Old domain inaccessible (DNS gone, Nginx removed)
- New domain not working (partial setup)
- Smartlinks using old domain broken

**Recovery**:
1. Check database state:
   ```sql
   SELECT * FROM 1ai_smartlink_domains WHERE id = <domain_id>;
   ```

2. If domain name is NEW but infrastructure incomplete:
   ```bash
   # Manually complete provisioning for new domain
   # Follow "Manual Nginx Setup" and "Manual cf-router entry" above
   ```

3. If domain name is OLD (rollback occurred):
   ```bash
   # Re-provision old domain
   # Use manual steps from "Domain Creation Workflow"
   ```

4. Check affected smartlinks:
   ```sql
   SELECT id, name, short_code FROM 1ai_smartlinks 
   WHERE domain_id = <domain_id> AND is_active = 1;
   ```

#### SSL Enable/Disable Fails

**Symptom**: Database shows `ssl_enabled` toggled but Nginx config unchanged

**Diagnosis**:
```bash
# Check current Nginx config
cat /etc/nginx/sites-enabled/<domain> | grep -i ssl

# Check database state
mysql -u root 1ai_affiliate -e "SELECT domain, ssl_enabled FROM 1ai_smartlink_domains WHERE domain = '<domain>';"

# Check certificate files exist
ls -la server/ssl/<domain>/
```

**Fix - Enable SSL**:
```bash
# If certificate missing, provision it
cd ~/projects/1ai-affiliate/server
node -e "const sslManager = require('./services/sslManager'); sslManager.obtainCertificate('<domain>').then(console.log).catch(console.error);"

# Update Nginx config to add SSL
sudo nano /etc/nginx/sites-available/<domain>
# Add SSL directives, then:
sudo nginx -t && sudo systemctl reload nginx
```

**Fix - Disable SSL**:
```bash
# Remove SSL directives from Nginx config
sudo nano /etc/nginx/sites-available/<domain>
# Keep only HTTP (port 80) section, remove HTTPS (port 443)
sudo nginx -t && sudo systemctl reload nginx
```

---

## Domain Deletion Workflow

### Normal Flow
1. **API Request**: DELETE `/api/admin/domains/:id`
2. **Validation**:
   - Check domain exists
   - Prevent deletion if `is_default: true`
   - Check for associated smartlinks (count > 0)
3. **Infrastructure Cleanup**:
   - Remove from cf-router apps.yaml
   - Remove Nginx vhost
   - Delete Cloudflare DNS record
   - **Note**: SSL certificates remain on disk
4. **Database Deletion**: Remove record from `1ai_smartlink_domains`
5. **Response**: Return 200 with deleted domain details

### Failure Points & Recovery

#### Delete Fails - Has Active Smartlinks

**Symptom**: 400 error "Cannot delete domain: 5 smartlinks still using it"

**Resolution**:
1. Reassign smartlinks to another domain:
   ```sql
   -- Find target domain (e.g., default domain)
   SELECT id, domain FROM 1ai_smartlink_domains WHERE is_default = 1;
   
   -- Reassign smartlinks
   UPDATE 1ai_smartlinks 
   SET domain_id = <new_domain_id> 
   WHERE domain_id = <old_domain_id>;
   ```

2. Retry deletion

#### Delete Fails - Infrastructure Cleanup Error

**Symptom**: 
- 500 error "Failed to deprovision domain" 
- OR Domain deleted from database but infrastructure remains

**Diagnosis**:
```bash
# Check if domain still in cf-router
grep "<domain>" ~/projects/1ai-cf-router/apps.yaml

# Check if Nginx vhost still exists
ls -la /etc/nginx/sites-enabled/<domain>

# Check if DNS record still exists (Cloudflare dashboard)

# Check database
mysql -u root 1ai_affiliate -e "SELECT * FROM 1ai_smartlink_domains WHERE domain = '<domain>';"
```

**Manual Cleanup**:
```bash
# Remove from cf-router
cd ~/projects/1ai-cf-router
nano apps.yaml  # Delete domain entry
pm2 restart cf-router

# Remove Nginx vhost
sudo rm /etc/nginx/sites-enabled/<domain>
sudo rm /etc/nginx/sites-available/<domain>
sudo nginx -t && sudo systemctl reload nginx

# Remove Cloudflare DNS (via dashboard or API)
# Use Cloudflare dashboard at https://dash.cloudflare.com

# Remove database record (if still exists)
mysql -u root 1ai_affiliate -e "DELETE FROM 1ai_smartlink_domains WHERE domain = '<domain>';"

# Optional: Remove SSL certificates
rm -rf ~/projects/1ai-affiliate/server/ssl/<domain>/
```

---

## Health Checks

### Service Status
```bash
# Check all services
pm2 status

# Expected output:
# ┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┐
# │ id │ name               │ status   │ ↺    │ cpu       │ memory   │
# ├────┼────────────────────┼──────────┼──────┼───────────┼──────────┤
# │ 5  │ 1ai-affiliate      │ online   │ 0    │ 0%        │ 50.0mb   │
# │ 0  │ cf-router          │ online   │ 0    │ 0%        │ 45.0mb   │
# └────┴────────────────────┴──────────┴──────┴───────────┴──────────┘
```

### Nginx Status
```bash
# Check Nginx is running
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Expected: "syntax is ok" and "test is successful"
```

### Domain Accessibility
```bash
# Test domain resolves
dig +short <domain>

# Test HTTP response
curl -I http://<domain>

# Test HTTPS response (if SSL enabled)
curl -I https://<domain>

# Expected: HTTP 200 or 301/302 redirect
```

### Database Connectivity
```bash
# Test connection
mysql -u root 1ai_affiliate -e "SELECT COUNT(*) FROM 1ai_smartlink_domains;"

# Should return a count, not an error
```

---

## Emergency Procedures

### Complete Service Restart
```bash
# Restart application
pm2 restart 1ai-affiliate

# Restart Nginx
sudo systemctl restart nginx

# Restart cf-router
pm2 restart cf-router

# Verify all services
pm2 status
sudo systemctl status nginx
```

### Rollback Failed Domain Creation
```bash
DOMAIN="failed-domain.com"

# 1. Remove from cf-router
cd ~/projects/1ai-cf-router
nano apps.yaml  # Delete entry for $DOMAIN
pm2 restart cf-router

# 2. Remove Nginx
sudo rm /etc/nginx/sites-enabled/$DOMAIN
sudo rm /etc/nginx/sites-available/$DOMAIN
sudo systemctl reload nginx

# 3. Remove DNS (Cloudflare dashboard)

# 4. Remove SSL
rm -rf ~/projects/1ai-affiliate/server/ssl/$DOMAIN/

# 5. Remove from database
mysql -u root 1ai_affiliate -e "DELETE FROM 1ai_smartlink_domains WHERE domain = '$DOMAIN';"
```

### Restore from Backup
```bash
# Backup cf-router apps.yaml
cp ~/projects/1ai-cf-router/apps.yaml ~/projects/1ai-cf-router/apps.yaml.backup

# Restore if needed
cp ~/projects/1ai-cf-router/apps.yaml.backup ~/projects/1ai-cf-router/apps.yaml
pm2 restart cf-router
```

---

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Service uptime**: `pm2 status` should show "online"
2. **Error rate**: Check `pm2 logs` for errors
3. **Certificate expiry**: All certs should have >30 days remaining
4. **DNS resolution**: All domains should resolve to correct IP
5. **HTTP response codes**: Should be 200/301/302, not 502/503/504

### Log Locations
- **Application logs**: `pm2 logs 1ai-affiliate`
- **Nginx access log**: `/var/log/nginx/access.log`
- **Nginx error log**: `/var/log/nginx/error.log`
- **cf-router logs**: `pm2 logs cf-router`

### Common Error Patterns
```bash
# SSL certificate errors
pm2 logs 1ai-affiliate | grep -i "ssl\|certificate\|acme"

# Database errors
pm2 logs 1ai-affiliate | grep -i "mysql\|database\|connection"

# Cloudflare API errors
pm2 logs 1ai-affiliate | grep -i "cloudflare\|dns"

# Nginx reload failures
sudo journalctl -u nginx | grep -i "error\|fail"
```

---

## Contact & Escalation

### Self-Service Resources
1. **SSL Management Guide**: `server/docs/SSL_MANAGEMENT.md`
2. **PM2 Documentation**: https://pm2.keymetrics.io/docs/
3. **Nginx Documentation**: https://nginx.org/en/docs/
4. **Let's Encrypt Docs**: https://letsencrypt.org/docs/

### Known Issues
- **No auto-renewal**: SSL certificates require manual renewal at 60 days
- **No certificate cleanup**: Deleted domain certificates remain on disk
- **No monitoring**: No alerts for certificate expiry or service downtime

### Future Improvements
- [ ] Automated SSL certificate renewal (cron job)
- [ ] Certificate expiry monitoring and alerts
- [ ] Automatic certificate cleanup on domain deletion
- [ ] Health check endpoint with infrastructure status
- [ ] Prometheus metrics export for monitoring
- [ ] Cloudflare cache purging on domain changes
