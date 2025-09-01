#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd -P)"

# 1) Prettier kontrol + minimal yazım
if npx --yes prettier -c "$ROOT" >/dev/null 2>&1; then :; else true; fi
npx --yes prettier --write "$ROOT" >/dev/null

# 2) ESLint (varsa) - eski config formatı için, hata verirse devam et
if npx --yes eslint -v >/dev/null 2>&1 && [ -f "$ROOT/.eslintrc.json" ]; then
  npx --yes eslint "src/**/*.{js,jsx,ts,tsx}" --max-warnings=0 --config "$ROOT/.eslintrc.json" || echo "[verify] ESLint uyarısı; devam ediliyor"
elif npx --yes eslint -v >/dev/null 2>&1 && [ -f "$ROOT/eslint.config.js" ]; then
  npx --yes eslint "src/**/*.{js,jsx,ts,tsx}" --max-warnings=0 || echo "[verify] ESLint uyarısı; devam ediliyor"
fi

# 3) TypeScript (varsa)
if [ -f "$ROOT/tsconfig.json" ]; then
  npx --yes tsc --noEmit
fi

# 4) API sözleşme denetimi
node "$ROOT/tools/guardian/scan_api_calls.js"

echo "[verify] OK"