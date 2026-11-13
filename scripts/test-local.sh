#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../contract"
node --test tests/engine.test.mjs tests/adversarial-engine.test.mjs
node tests/sandbox.mjs
node tests/atomic-success-keys.mjs
node tests/adversarial-sandbox.mjs
