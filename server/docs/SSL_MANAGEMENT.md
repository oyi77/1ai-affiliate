# SSL Certificate Management

## Overview
The 1ai-affiliate system uses Let's Encrypt ACME protocol for automatic SSL certificate provisioning and renewal. Certificates are managed via the `sslManager` service.

## Certificate Storage
All SSL certificates are stored in: `~/projects/1ai-affiliate/server/ssl/`

Directory structure:
```
server/ssl/
├── <domain>/
│   ├── cert.pem          # Public certificate
│   ├── privkey.pem       # Private key
│   ├── chain.pem         # Certificate chain
│   ├── fullchain.pem     # Combined cert + chain
│   └── account.key       # ACME account key (shared)
```

## Certificate Lifecycle

### 1. Initial Provisioning
When a new domain is created with `ssl_enabled: true`:
1. Domain DNS A record is created in Cloudflare
2. HTTP-01 challenge handler is started on port 80
3. ACME certificate request is submitted to Let's Encrypt
4. Challenge is validated via `http://<domain>/.well-known/acme-challenge/<token>`
5. Certificate files are written to `server/ssl/<domain>/`
6. Nginx vhost is updated with SSL configuration
7. Nginx is reloaded

### 2. Renewal
- Certificates expire after 90 days
- Auto-renewal should occur at 60 days (30-day buffer)
- **MANUAL RENEWAL REQUIRED** - No auto-renewal cron job implemented yet

Manual renewal command:
```bash
cd ~/projects/1ai-affiliate/server
node -e "
const sslManager = require('./services/sslManager');
sslManager.renewCertificate('domain.example.com')
  .then(() => console.log('Renewed'))
  .catch(err => console.error('Failed:', err));
"
```

### 3. Revocation
When a domain is deleted:
1. Nginx vhost is removed
2. cf-router entry is removed
3. Cloudflare DNS record is deleted
4. **Certificate files remain on disk** (manual cleanup required)

## Environment Variables

Required in `server/.env`:
```bash
# Email for Let's Encrypt certificate expiry notifications
ACME_EMAIL=admin@berkahkarya.org

# Let's Encrypt directory URL
ACME_DIRECTORY_URL=https://acme-v02.api.letsencrypt.org/directory
```

## Certificate Verification

Check certificate details:
```bash
openssl x509 -in server/ssl/<domain>/cert.pem -text -noout
```

Check expiry date:
```bash
openssl x509 -in server/ssl/<domain>/cert.pem -enddate -noout
```

List all certificates with expiry dates:
```bash
for dir in server/ssl/*/; do
  domain=$(basename "$dir")
  if [ -f "$dir/cert.pem" ]; then
    expiry=$(openssl x509 -in "$dir/cert.pem" -enddate -noout | cut -d= -f2)
    echo "$domain: $expiry"
  fi
done
```

## Troubleshooting

### Challenge Validation Fails
**Symptom**: ACME challenge fails with HTTP timeout or 404

**Causes**:
1. Port 80 not accessible from internet
2. Cloudflare DNS record not propagated yet
3. Another service occupying port 80

**Debug**:
```bash
# Check DNS propagation
dig +short <domain>

# Test HTTP challenge endpoint accessibility
curl -v http://<domain>/.well-known/acme-challenge/test

# Check port 80 availability
sudo netstat -tulpn | grep :80
```

**Fix**:
- Ensure firewall allows incoming port 80/tcp
- Wait 2-5 minutes for DNS propagation
- Verify no conflicting services on port 80

### Certificate Not Loading
**Symptom**: Browser shows SSL error despite certificate files existing

**Causes**:
1. Nginx not reloaded after certificate creation
2. Wrong certificate file paths in Nginx config
3. File permissions preventing Nginx from reading certs

**Debug**:
```bash
# Test Nginx config
sudo nginx -t

# Check certificate file permissions
ls -la server/ssl/<domain>/

# Verify Nginx SSL configuration
cat /etc/nginx/sites-enabled/<domain>
```

**Fix**:
```bash
# Reload Nginx
sudo systemctl reload nginx

# Fix permissions if needed
chmod 644 server/ssl/<domain>/*.pem
chmod 600 server/ssl/<domain>/privkey.pem
```

### Rate Limiting
**Symptom**: Let's Encrypt returns "too many certificates" error

**Cause**: Let's Encrypt rate limits (50 certificates per registered domain per week)

**Fix**:
- Use Let's Encrypt staging environment for testing: `https://acme-staging-v02.api.letsencrypt.org/directory`
- Wait for rate limit window to expire (1 week)
- Batch certificate requests to stay under limit

## Security Notes

1. **Private Key Protection**: `privkey.pem` contains sensitive private key material
   - Must have permissions 600 (read/write owner only)
   - Never commit to version control
   - Never transmit over insecure channels

2. **ACME Account Key**: `account.key` is shared across all domains
   - Used for authentication with Let's Encrypt
   - Loss requires re-registration with Let's Encrypt
   - Backup recommended

3. **HTTP-01 Challenge Handler**: Temporary HTTP server on port 80
   - Only runs during certificate issuance
   - Serves only `/.well-known/acme-challenge/*` paths
   - Auto-closes after challenge completion

## Future Improvements

- [ ] Implement automatic renewal cron job (run daily, renew certs expiring within 30 days)
- [ ] Certificate expiry monitoring/alerting
- [ ] Automatic certificate cleanup on domain deletion
- [ ] Support for wildcard certificates (requires DNS-01 challenge)
- [ ] Certificate backup/restore procedures
- [ ] Multi-account support for rate limit distribution
