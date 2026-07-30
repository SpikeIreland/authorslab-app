#!/usr/bin/env bash
# Migrate just 5.2 Taylor Generate Covers to authorslab.
# Deletes n8n-workflows/ folder after successful migration.
set -u

INSTANCE="https://authorslab.app.n8n.cloud"
API_KEY=$(cat n8n-authorslab-key)
TARGET=TmIX5fPCwK2rbdUy
JSON_FILE="n8n-workflows/for-api-put/${TARGET}.json"

if [[ ! -f "$JSON_FILE" ]]; then
  echo "ERROR: $JSON_FILE not found"
  exit 1
fi

echo "5.2 Taylor Generate Covers → $TARGET"
echo ""

# Deactivate
DEACT=$(curl -sS -X POST -H "X-N8N-API-KEY: $API_KEY" -o /dev/null -w "%{http_code}" \
  "${INSTANCE}/api/v1/workflows/${TARGET}/deactivate")
echo "  deactivate: $DEACT"

# PUT the new definition
PUT=$(curl -sS -X PUT \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "@$JSON_FILE" \
  -o /tmp/put-52.json \
  -w "%{http_code}" \
  "${INSTANCE}/api/v1/workflows/${TARGET}")
echo "  put:        $PUT"

if [[ "$PUT" != "200" ]]; then
  echo ""
  echo "PUT failed — response body:"
  head -c 500 /tmp/put-52.json
  echo ""
  exit 1
fi

# Reactivate
ACT=$(curl -sS -X POST -H "X-N8N-API-KEY: $API_KEY" -o /dev/null -w "%{http_code}" \
  "${INSTANCE}/api/v1/workflows/${TARGET}/activate")
echo "  activate:   $ACT"

if [[ "$DEACT" == "200" && "$PUT" == "200" && "$ACT" == "200" ]]; then
  echo ""
  echo "SUCCESS. Cleaning up n8n-workflows/ folder (only belongs on the snapshot branch)."
  rm -rf n8n-workflows/
  echo "Done."
fi
