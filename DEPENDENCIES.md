# Dependencies and current tooling audit

Release notice, November13 2026. Original code is MIT licensed under LICENSE. Upstream dependency licenses are not replaced.

AI-assisted original code. Runtime contract SDK near-sdk-js2.0.0 (MIT AND Apache-2.0); test framework near-workspaces5.0.0 (MIT AND Apache-2.0); near-api-js5.1.1 imported by local tests from the locked dependency tree. See dependencies for their respective copyright and license texts.

Current npm audit reports21 affected packages:1critical,6high,14low. This is not21 independent vulnerabilities. The critical package classification is tar, used by near-sandbox's local runtime installer, with archive parsing/extraction vulnerabilities. SDK sourcemap/build-tool findings remain. This is not an audit of the contract or evidence of an on-chain exploit. No automatic fix is currently reported for these chains.

Use isolated local development with trusted source and compiler/runtime downloads only. Do not extract untrusted archives or source maps with this tooling. Network/compiler/sandbox supply-chain safety has not been established. No real funds.

Audit references:
- https://github.com/advisories/GHSA-23hp-3jrh-7fpw
- https://github.com/advisories/GHSA-34x7-hfp2-rc4v
- https://github.com/advisories/GHSA-83g3-92jg-28cx
- https://github.com/advisories/GHSA-848j-6mx2-7j84
- https://github.com/advisories/GHSA-8qq5-rm4j-mr97
- https://github.com/advisories/GHSA-8x88-c5mf-7j5w
- https://github.com/advisories/GHSA-9ppj-qmqm-q256
- https://github.com/advisories/GHSA-gcqx-w48m-w2h4
- https://github.com/advisories/GHSA-gvwx-54wh-qm9j
- https://github.com/advisories/GHSA-qffp-2rhf-9h96
- https://github.com/advisories/GHSA-qr28-fpjm-wq7f
- https://github.com/advisories/GHSA-r292-9mhp-454m
- https://github.com/advisories/GHSA-r6q2-hw4h-h46w
- https://github.com/advisories/GHSA-vcc3-ghjq-m6fr
- https://github.com/advisories/GHSA-vmf3-w455-68vh
- https://github.com/advisories/GHSA-w8wr-v893-vjvp
