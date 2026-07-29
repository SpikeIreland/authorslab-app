#!/usr/bin/env bash
# migrate-n8n-workflows.sh
# Batch-migrate n8n workflows from spikeislandstudios to authorslab by PUTting
# pre-transformed JSON payloads to their existing authorslab workflow IDs.
#
# Run from the repo root (~/Desktop/authorslab-app).
# Requires: n8n-authorslab-key file at repo root containing the API key.
#
# Deferred / skipped:
#   - 2.5 Alex Chat (7J7XPacBxUwlgwQY) — already migrated as smoke test
#   - 5.2 Taylor Generate Covers — needs OpenAI HTTP auth credential first
#   - 6.1 Format Manuscript — needs ConvertAPI credential first
#   - craft-call-cell — already imported via UI (S9PSKvvRp5FqnRmv)

set -u  # unset var = error, but don't -e (we want to continue past failures)

INSTANCE="https://authorslab.app.n8n.cloud"
API_KEY=$(cat n8n-authorslab-key)
LOG_DIR="/tmp/n8n-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$LOG_DIR"
echo "Log dir: $LOG_DIR"
echo ""

# 21 workflows to migrate. Format: "friendly_name|target_id"
WORKFLOWS=(
  "0.1 Admin Send Welcome|bA083558zoNPXEV1"
  "1.0 Manuscript Cleanup Reload|K2BPyKDvOdXUHo7U"
  "1.1 Extract PDF|T91LN7tpQb8Ie327"
  "1.2 PDF Word Count|NLXgIX51SqGAsMY3"
  "1.3 Author Onboarding|13ZlbXvu1yGFlOU1"
  "1.4 Parse Chapters|AeoOCHAG1Xu2wNoE"
  "1.5 Generate Manuscript Versions|cbxufgtMPlVd2iJ1"
  "2.1 Alex Generate Chapter Summaries|XlY2H6JXG4tr4OzK"
  "2.2 Alex Generate Summary Points|dN2u3Ey9DdmvK2rb"
  "2.3 Alex Full Manuscript Analysis|MzvfEpFPTC0kBB1x"
  "2.4 Alex Chapter Analysis|H2W5o1Kz6Cz6LlBg"
  "3.1 Sam Full Manuscript Analysis|6Pq81ATqXBDPEC02"
  "3.2 Sam Chapter Analysis|T3ZxBrfZveJZwUpI"
  "3.3 Sam Chat|OISYFmpBLaWR4rPH"
  "4.1 Jordan Full Manuscript Analysis|5NUdaWD7d187bxJS"
  "4.2 Jordan Chapter Analysis|5zud393gLIRDLOpL"
  "4.3 Jordan Chat|I14pMBOOxXgcvlqD"
  "5.1 Taylor Assessment|1UKRsLl1KRfDNtC4"
  "5.3 Taylor Detect Cover Intent|fc7ghCggRqUBnhGY"
  "5.4 Taylor Chat|UyUMNntAG5vy19iI"
  "Token Validation|ffS7WLalzIZTRFlx"
)

TOTAL=${#WORKFLOWS[@]}
SUCCESS=0
FAILED=0
FAILED_LIST=()

for entry in "${WORKFLOWS[@]}"; do
  NAME="${entry%%|*}"
  ID="${entry##*|}"
  JSON_FILE="n8n-workflows/for-api-put/${ID}.json"

  printf "%-42s  " "$NAME"

  if [[ ! -f "$JSON_FILE" ]]; then
    echo "SKIP  (missing $JSON_FILE)"
    FAILED=$((FAILED+1))
    FAILED_LIST+=("$NAME (file missing)")
    continue
  fi

  # 1. Deactivate (accept any response — inactive workflows may 4xx and that's fine)
  curl -sS -X POST \
    -H "X-N8N-API-KEY: $API_KEY" \
    -o "$LOG_DIR/${ID}-deactivate.json" \
    -w "" \
    "${INSTANCE}/api/v1/workflows/${ID}/deactivate" > /dev/null

  # 2. PUT the new definition — this is the critical step
  PUT_STATUS=$(curl -sS -X PUT \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary "@$JSON_FILE" \
    -o "$LOG_DIR/${ID}-put.json" \
    -w "%{http_code}" \
    "${INSTANCE}/api/v1/workflows/${ID}")

  if [[ "$PUT_STATUS" != "200" ]]; then
    echo "PUT ${PUT_STATUS}  ✗  (see $LOG_DIR/${ID}-put.json)"
    FAILED=$((FAILED+1))
    FAILED_LIST+=("$NAME (PUT $PUT_STATUS)")
    continue
  fi

  # 3. Reactivate
  ACT_STATUS=$(curl -sS -X POST \
    -H "X-N8N-API-KEY: $API_KEY" \
    -o "$LOG_DIR/${ID}-activate.json" \
    -w "%{http_code}" \
    "${INSTANCE}/api/v1/workflows/${ID}/activate")

  if [[ "$ACT_STATUS" != "200" ]]; then
    echo "PUT 200 · activate ${ACT_STATUS}  ⚠  (workflow updated but INACTIVE — see $LOG_DIR/${ID}-activate.json)"
    FAILED=$((FAILED+1))
    FAILED_LIST+=("$NAME (activate $ACT_STATUS)")
    continue
  fi

  echo "PUT 200 · activate 200  ✓"
  SUCCESS=$((SUCCESS+1))

  # Small pause to avoid rate limiting
  sleep 0.5
done

echo ""
echo "=========================================="
echo "Total:   $TOTAL"
echo "Success: $SUCCESS"
echo "Failed:  $FAILED"
if [[ ${#FAILED_LIST[@]} -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for f in "${FAILED_LIST[@]}"; do
    echo "  - $f"
  done
fi
echo "=========================================="
echo "Full response bodies in: $LOG_DIR"
