# AgentGuard threat model and known gaps

## Protected path

An untrusted agent controls a request-only, receiver-bound function-call key. The trusted owner configures a fixed recipient, method, JSON arguments, per-request cap and daily budget. `request` derives its agent identity from the predecessor, not user-supplied identity. It reserves spend and advances a nonce before scheduling the payment. The owner initializes through an atomic self deploy/init path to prevent first-caller takeover.

Key allowance pays gas only. Contract policy, not the key allowance, controls transfers from the vault. The sandbox independently checks receiver/method/deposit/full-access restrictions. Testnet evidence covers one successful restricted-key request only.

## Conservative accounting and availability

A recipient failure returns `failure_budget_retained`; it does not erase the budget charge. This can reduce usable budget even when a payment ultimately refunds. One pending request per agent prevents overlap while settlement is unresolved. A missing or failed callback can leave an agent locked indefinitely. No safe timeout, proof-based settlement, force-unlock or callback-out-of-gas recovery is implemented. Do not clear a reservation merely because time passed: the recipient might already have received funds.

Day changes reset daily accounting only when there is no pending request. Policy changes retain used spend, request count and nonce. The owner cannot reconfigure a pending agent. Owner configuration remains trusted, not a governance mechanism.

## Evidence, not guarantees

November10 regression reran17 core,11 original runtime,14 success/key and4 adversarial runtime checks. It includes recipient panic, recipient gas exhaustion, one concurrent same-agent pair, replay, caps, serialization, clock reversal and wrong callback identity. Recipient gas exhaustion is not callback gas exhaustion. One concurrent pair is not stress testing.

Not established: forced callback failure recovery, long-run storage/gas behavior, arbitrary account-name edge cases, formal verification, independent audit, runtime/compiler supply-chain safety, real-world attack recall or financial loss reduction. The fixture does not test a real API or oracle, cross-chain settlement, Intents, mainnet or a learned anomaly detector.

## Safe demo use

Use only disposable local sandbox funds. November8 public testnet accounts have no retained signing ability. Do not run the historical testnet scripts, faucet code or deploy to a public chain as part of the default reproducibility command. Real deployment needs a separate reviewed authority and security plan. Never commit keys or reuse demo keys for funds with value.
