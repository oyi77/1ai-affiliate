#!/bin/bash
# Weekly GeoIP database update from Loyalsoldier/geoip
# Add to crontab: 0 3 * * 0 /home/openclaw/projects/1ai-affiliate/config/geo/update-geoip.sh

set -euo pipefail

GEO_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_URL="https://raw.githubusercontent.com/Loyalsoldier/geoip/release"

FILES=("Country.mmdb" "GeoLite2-ASN.mmdb")

for FILE in "${FILES[@]}"; do
  echo "[$(date -Iseconds)] Updating ${FILE}..."
  TEMP="${GEO_DIR}/${FILE}.tmp"
  if curl -fsSL -o "${TEMP}" "${BASE_URL}/${FILE}"; then
    # Verify it's a valid MMDB (check magic bytes: \xab\xcd\xef\x19)
    MAGIC=$(xxd -l 4 -p "${TEMP}")
    if [ "${MAGIC}" = "abcdef19" ]; then
      mv "${TEMP}" "${GEO_DIR}/${FILE}"
      echo "[$(date -Iseconds)] ${FILE} updated successfully"
    else
      echo "[$(date -Iseconds)] ERROR: ${FILE} has invalid MMDB magic bytes: ${MAGIC}"
      rm -f "${TEMP}"
    fi
  else
    echo "[$(date -Iseconds)] ERROR: Failed to download ${FILE}"
    rm -f "${TEMP}"
  fi
done

echo "[$(date -Iseconds)] GeoIP update complete"