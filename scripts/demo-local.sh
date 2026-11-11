#!/usr/bin/env bash
# Start the real-model demo on the presenting laptop (task X-16, docs/DEFENSE-RUNBOOK.md):
# the model API on port 8000 with the team's weights, then the web app's production build.
# Ctrl+C stops both.
#
#   PYTHON=api/.venv/bin/python WEB_PORT=3000 scripts/demo-local.sh
#
# PYTHON   the Python that has api/requirements.txt installed (default: api/.venv/bin/python)
# WEIGHTS  the weights file inside api/ (default: the champion, weights/jolscan-e4.pt; never committed)
# WEB_PORT the web app's port (default: 3000)
set -euo pipefail
cd "$(dirname "$0")/.."
PYTHON=${PYTHON:-api/.venv/bin/python}
WEIGHTS=${WEIGHTS:-weights/jolscan-e4.pt}
WEB_PORT=${WEB_PORT:-3000}
PY_ABS=$(cd "$(dirname "$PYTHON")" && pwd)/$(basename "$PYTHON")

for port in 8000 "$WEB_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop that program, or set WEB_PORT to a free port."; exit 1
  fi
done
[ -f "api/$WEIGHTS" ] || { echo "Missing api/$WEIGHTS: copy it from the shared Drive (weights/ folder)."; exit 1; }
[ -f web/.next/BUILD_ID ] || { echo "No production build: run 'cd web && pnpm build' once while online."; exit 1; }

(cd api && MODEL_WEIGHTS="$WEIGHTS" exec "$PY_ABS" -m uvicorn main:app --port 8000) &
API=$!
WEB=""
trap 'kill $API $WEB 2>/dev/null || true' EXIT INT TERM

for _ in $(seq 1 60); do curl -sf localhost:8000/health >/dev/null && break; sleep 1; done
curl -s localhost:8000/health; echo
# Warm the pothole model once so the first real photo in the demo is fast (model loading takes a few seconds).
(cd api && "$PY_ABS" smoke.py --url http://127.0.0.1:8000 >/dev/null 2>&1) && echo "Pothole model warmed up." || echo "Warm-up failed: check the API log above."

(cd web && MODEL_API_URL=http://localhost:8000 exec pnpm start -p "$WEB_PORT") &
WEB=$!
echo "Open http://localhost:$WEB_PORT, then Settings: Local, Check connection. Ctrl+C stops both."
wait
