#!/bin/bash
# Update GeoIP databases from P3TERX/GeoLite.mmdb (free, no license key needed)
# Run monthly via cron: 0 0 1 * * /path/to/update-geoip.sh

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "[$(date)] Updating GeoIP databases..."

curl -sL "https://github.com/P3TERX/GeoLite.mmdb/releases/latest/download/GeoLite2-Country.mmdb" -o Country.mmdb.tmp
curl -sL "https://github.com/P3TERX/GeoLite.mmdb/releases/latest/download/GeoLite2-City.mmdb" -o City.mmdb.tmp
curl -sL "https://github.com/P3TERX/GeoLite.mmdb/releases/latest/download/GeoLite2-ASN.mmdb" -o GeoLite2-ASN.mmdb.tmp

# Verify files are valid MMDB (at least 100KB)
for f in Country.mmdb.tmp City.mmdb.tmp GeoLite2-ASN.mmdb.tmp; do
  if [ "$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)" -lt 100000 ]; then
    echo "ERROR: $f too small, download may have failed"
    rm -f "$f"
    exit 1
  fi
done

mv Country.mmdb.tmp Country.mmdb
mv City.mmdb.tmp City.mmdb
mv GeoLite2-ASN.mmdb.tmp GeoLite2-ASN.mmdb

echo "[$(date)] GeoIP databases updated successfully"
echo "  Country: $(wc -c < Country.mmdb) bytes"
echo "  City: $(wc -c < City.mmdb) bytes"
echo "  ASN: $(wc -c < GeoLite2-ASN.mmdb) bytes"
