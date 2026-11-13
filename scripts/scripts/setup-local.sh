#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../contract"
npm ci --ignore-scripts
# SDK2.0.0 script downloads pinned compiler releases. Inspect it before use.
(cd node_modules/near-sdk-js && node lib/cli/post-install.js)
npm run build
npx --no-install near-sdk-js build tests/recipient.ts build/recipient.wasm
npx --no-install near-sdk-js build tests/adversarial-recipient.ts build/adversarial-recipient.wasm
