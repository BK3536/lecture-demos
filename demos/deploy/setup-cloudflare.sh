#!/usr/bin/env bash
# setup-cloudflare.sh — Add labs.remilab.ai DNS + Tunnel ingress via Cloudflare API
#
# Prerequisites:
#   1. Create API token at https://dash.cloudflare.com/profile/api-tokens
#      - Permissions: Zone:DNS:Edit, Account:Cloudflare Tunnel:Edit
#      - Zone: remilab.ai
#   2. Export the token:
#      export CF_API_TOKEN="your-token-here"
#
# Usage:
#   chmod +x setup-cloudflare.sh
#   CF_API_TOKEN="xxx" ./setup-cloudflare.sh

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────
ZONE_NAME="remilab.ai"
SUBDOMAIN="labs"
FQDN="${SUBDOMAIN}.${ZONE_NAME}"
TUNNEL_SERVICE="http://remilab-labs:80"   # Docker container name:port
# ───────────────────────────────────────────────────────────────────

API="https://api.cloudflare.com/client/v4"
AUTH="Authorization: Bearer ${CF_API_TOKEN:?Set CF_API_TOKEN first}"
CT="Content-Type: application/json"

echo "=== Cloudflare Setup for ${FQDN} ==="

# 1. Get Zone ID
echo "[1/4] Looking up zone ID for ${ZONE_NAME}..."
ZONE_ID=$(curl -sf -H "$AUTH" "${API}/zones?name=${ZONE_NAME}" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])")
echo "  Zone ID: ${ZONE_ID}"

# 2. Get Account ID + Tunnel ID
echo "[2/4] Looking up tunnel..."
ACCOUNT_ID=$(curl -sf -H "$AUTH" "${API}/zones/${ZONE_ID}" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['account']['id'])")
echo "  Account ID: ${ACCOUNT_ID}"

# Find tunnel (assumes one active tunnel for this account)
TUNNEL_INFO=$(curl -sf -H "$AUTH" "${API}/accounts/${ACCOUNT_ID}/cfd_tunnel?is_deleted=false&status=active" | python3 -c "
import sys, json
tunnels = json.load(sys.stdin)['result']
for t in tunnels:
    print(t['id'], t['name'])
")
TUNNEL_ID=$(echo "$TUNNEL_INFO" | head -1 | awk '{print $1}')
TUNNEL_NAME=$(echo "$TUNNEL_INFO" | head -1 | awk '{$1=""; print $0}' | xargs)
echo "  Tunnel: ${TUNNEL_NAME} (${TUNNEL_ID})"

# 3. Add DNS CNAME record
echo "[3/4] Adding DNS CNAME: ${FQDN} -> ${TUNNEL_ID}.cfargotunnel.com..."
DNS_RESULT=$(curl -sf -X POST -H "$AUTH" -H "$CT" \
  "${API}/zones/${ZONE_ID}/dns_records" \
  -d "{
    \"type\": \"CNAME\",
    \"name\": \"${SUBDOMAIN}\",
    \"content\": \"${TUNNEL_ID}.cfargotunnel.com\",
    \"proxied\": true,
    \"ttl\": 1
  }" | python3 -c "
import sys, json
r = json.load(sys.stdin)
if r['success']:
    print('OK - Record ID:', r['result']['id'])
else:
    errors = r.get('errors', [])
    # 81057 = record already exists
    if any(e.get('code') == 81057 for e in errors):
        print('SKIP - Record already exists')
    else:
        print('FAIL -', errors)
        sys.exit(1)
")
echo "  DNS: ${DNS_RESULT}"

# 4. Update Tunnel ingress config
echo "[4/4] Adding tunnel ingress: ${FQDN} -> ${TUNNEL_SERVICE}..."

# Get current config
CURRENT_CONFIG=$(curl -sf -H "$AUTH" \
  "${API}/accounts/${ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/configurations" | python3 -c "
import sys, json
print(json.dumps(json.load(sys.stdin)['result']['config']))
")

# Add new ingress rule (before the catch-all)
NEW_CONFIG=$(echo "$CURRENT_CONFIG" | python3 -c "
import sys, json
config = json.load(sys.stdin)
ingress = config.get('ingress', [])

# Check if already exists
fqdn = '${FQDN}'
service = '${TUNNEL_SERVICE}'
for rule in ingress:
    if rule.get('hostname') == fqdn:
        print(json.dumps(config))
        print('SKIP - Ingress rule already exists', file=sys.stderr)
        sys.exit(0)

# Insert before catch-all (last rule has no hostname)
new_rule = {'hostname': fqdn, 'service': service}
if ingress and 'hostname' not in ingress[-1]:
    ingress.insert(-1, new_rule)
else:
    ingress.append(new_rule)

config['ingress'] = ingress
print(json.dumps(config))
")

TUNNEL_RESULT=$(curl -sf -X PUT -H "$AUTH" -H "$CT" \
  "${API}/accounts/${ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/configurations" \
  -d "{\"config\": ${NEW_CONFIG}}" | python3 -c "
import sys, json
r = json.load(sys.stdin)
print('OK' if r['success'] else 'FAIL - ' + str(r.get('errors', [])))
")
echo "  Tunnel: ${TUNNEL_RESULT}"

echo ""
echo "=== Done! ==="
echo "Verify: curl -sI https://${FQDN}/"
echo ""
echo "Note: If the container isn't running yet, the tunnel will return 502."
echo "Start it with: docker compose -f docker-compose.labs.yml up -d"
