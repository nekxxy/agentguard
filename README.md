# AgentGuard

Local contract-policy prototype prepared for NEAR HACKATHON. Not a submitted entry. Original code is MIT licensed.

AgentGuard is an experimental NEAR contract policy vault for an agent with a restricted function-call key. It binds each agent to a recipient, method and arguments, reserves integer-denominated spending before an asynchronous payment, and enforces a per-request cap, UTC daily budget, daily request count and monotonic nonce. The restricted key may call only `request` on the vault; it cannot attach funds, transfer directly or configure policies.

## What the prototype actually shows

A local sandbox fixture accepts a fixed `sku` and 60 yoctoNEAR. A restricted key requests that fixed purchase. The recipient records the payment, the private callback clears pending state, and used budget remains charged. Attempts to bypass recipient binding, replay a nonce or exceed the budget fail. Recipient failures conservatively retain the budget charge. This fixture is not a real external paid API.

A separate one-off testnet experiment was performed November8. That historical evidence is not bundled in this local-only release candidate. Local cap and key-restriction tests are separate evidence.

## Try the local checks

Linux x86_64 with Node18+ and the NEAR sandbox prerequisites is the tested environment. Dependencies are pinned in `contract/package-lock.json`.

1. Inspect `scripts/setup-local.sh` and the pinned SDK post-install script, then run `bash scripts/setup-local.sh` from the project root. It installs lockfile dependencies without automatic scripts, explicitly downloads the SDK's pinned compiler releases and rebuilds the vault and two fixtures. It does not create public accounts or call a faucet.
2. Run `bash scripts/test-local.sh`. This runs only the explicitly named local tests, no public-chain scripts. The sandbox launcher downloads its local runtime binary when absent.
3. Expect17 core tests,11 original sandbox checks,14 restricted-key/success checks and4 adversarial sandbox checks. Expected denial stack traces are part of the test logs. Each suite must finish with its summary, not merely print an expected failure.

On November11, after restoring a source archive into a fresh environment and reinstalling dependencies/toolchain, all46 checks completed successfully. On November13 this curated release tree was rebuilt with fresh dependency installation and all46 checks plus the actual replay completed again. This is clean-install local regression evidence on Linux x86_64, not a security audit or proof for other platforms. No external model/API call or public-chain transaction is part of these commands. Compiler and sandbox binary downloads still require network access; dependency supply-chain review remains incomplete.

## Actual command replay

After setup, run `cd contract && node tests/demo-local.mjs`. Expect one successful fixed purchase, recipient calls1/total60, replay and budget rejections, final used60/nonce1/pendingnull, and process exit0. This is the command recorded in the November13 local video. The output is not an API, anomaly scorer or reusable app.

## Threat boundary

Read `THREAT-MODEL.md` before trying funds of any value. The owner is trusted to configure policies. A malicious or compromised owner can change future policy. The design does not make an untrusted recipient useful or honest. It is not audited, not production-ready and must not hold real money.

No ML anomaly scorer, real API adapter, weekly budget, cooling-off policy or reusable UI is implemented. Contract source is `contract/src/contract.ts` with policy logic in `contract/src/engine.js`.

## Provenance and dependencies

Original prototype work was prepared during the hackathon window. An October21 design document was a baseline plan, not implemented code. The implementation uses AI-assisted code, near-sdk-js2.0.0, near-workspaces5.0.0 and near-api-js transitively. Existing libraries retain their own licenses; these are not relicensed by an original-code LICENSE. Pinned build/test dependencies have outstanding audit findings in `DEPENDENCIES.md`; do not feed untrusted source maps or archives to the toolchain.

See LICENSE and dependency-licenses for original and upstream terms. The public demo post and final entry are separate from this repository release.
