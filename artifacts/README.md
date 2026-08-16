# TreasuryBench Artifact Handoff

Generated for open-source/presentation handoff on 2026-06-09; Treasury re-measured
2026-08-14 (see **V2** below).

> **Read this before quoting any comparison.** Treasury's current run is from
> **August 2026**. Every competitor run in this repo is from **June 2026** and has
> not been re-measured — those products may have improved since. A Treasury-vs-rival
> table built from these artifacts spans two measurement dates, and should say so. Scores are produced
by the **table-grounded factual policy**: an LLM judge grades quality, but factual
accuracy is graded only against the locked-fact table — a claim is penalized as a
contradiction only when it conflicts with a verified locked fact, and facts the
judge cannot match are logged (not guessed) to `unknown-facts.json` for offline
verification. See **`RUN_INTEGRITY.md`** for the mechanism, judge-independence
caveat, capture-date spread, and the Origin balance-import-failure disclosure.

## Current Treasury Run (V2, August 2026)

| Product | Run | Tasks | Final | Judge | Deterministic | Median Speed |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Treasury | `treasury-full-20260814030034` | 83 | 89 | 90 | 86 | 11.6s |

Treasury scored **89** (86 in V1). Restricted to V1's exact 81-task set it also
scores 89, so the change is not an artifact of the two tasks added since. Factual
integrity went from 93% clean (5 material, 1 dangerous) to **100% clean (0, 0)**.
It is a **single sample** and four tasks regressed by 10+ points — see that run's
`RUN_NOTES.md` for the caveats before quoting the number.

## Source-Of-Truth V1 Runs (June 2026)

The competitor baseline. Treasury's V1 row is kept for comparison; its current
result is the V2 run above.

| Product Contender | Run(s) | Tasks | Final | Judge | Deterministic | Median Speed |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Treasury (superseded) | `treasury-full-20260609001842` | 81 | 85.5 | 86.9 | 86.2 | 13.7s |
| Monarch | `monarch-full-20260605T200447` | 81 | 52.1 | 52.9 | 64.3 | 100.7s |
| Origin | `origin-full-20260605T160538` | 81 | 71.0 | 73.1 | 79.0 | 46.0s |

Origin's full run is **71.0**; excluding the 16 tasks where a capture-harness
balance-import failure (Origin saw `$0` despite the data containing real balances)
materially broke the answer, Origin is **73.1** (best read as ~72, since a few
excluded tasks also contain unrelated errors). The same `$0` artifact surfaced on 3
additional captures without breaking the answer; those are retained. Both numbers,
the full affected-task list, and the broader-count disclosure are in
`RUN_INTEGRITY.md`. Captures were not edited.

| Reference Baseline | Run(s) | Tasks | Final | Judge | Deterministic | Median Speed |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| ChatGPT full-context | `chatgpt-chat-latest-full-20260609121316` | 81 | 79.6 | 84.7 | 86.4 | 8.0s |

ChatGPT full-context is a reference baseline, not a product contender. It receives upload-shaped transactions, balances, and memories directly in the prompt, which is an idealized context path that normal consumer finance apps do not get.

## Factual Integrity (June 2026 cross-provider run)

> These four rows are all from the **June 2026** runs, so they compare like with
> like. Treasury's **current** August figures are 100% clean (83/83), 0 material,
> 0 dangerous — see `treasury-full-20260814030034/results/final-summary.md`. The
> Treasury row below is its superseded June result, kept so the cross-provider
> comparison stays internally consistent.

Share of each provider's answers with no locked-fact contradiction. A contradiction
is graded only against the locked-fact table; **material** = a wrong fact that
changes the answer, **dangerous** = a wrong fact that could cause real financial
harm if acted on (e.g. a stale contribution limit that risks an excess
contribution). Unverified Claims = count of factual-claim instances not yet in the
table (deduped to fewer unique entries in `unknown-facts.json`); not scored.
Material contradictions cap a task at 65, dangerous at 40.

| Provider | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: |
| Treasury | 93% (75/81) | 5 | 1 | 28 |
| ChatGPT (baseline) | 83% (67/81) | 2 | 12 | 23 |
| Origin | 86% (70/81) | 7 | 4 | 21 |
| Monarch | 86% (70/81) | 2 | 9 | 9 |

The factual policy is why the ChatGPT baseline (79.6) sits below Treasury (85.5)
despite a comparable judged quality: with idealized context it still cites stale
2025 contribution limits as current (12 dangerous contradictions), whereas
Treasury grounds answers in current facts. This is the intended signal for a
finance product — being factually current matters more than polish.

`monarch-full-20260605T200447` and `origin-full-20260605T160538` are consolidated full-run directories built from their three persona product captures. All four run directories use the same top-level layout: `captures/`, `judge-prompts/`, `judgments/`, and standard `results/*` files. Shared user prompts live once under `prompts/product/` for Treasury, Monarch, and Origin, and `prompts/chatgpt-full-context/` for the ChatGPT full-context baseline. Each prompt set has a `manifest.json` mapping task IDs to files so identical prompt text is stored once. Each full-run directory has one master `RUN_NOTES.md`.

## Comparison Matrix (June 2026 cross-provider run)

> As above: every column here — including Treasury's — is the **June 2026**
> measurement. Treasury's current per-domain scores are in
> `treasury-full-20260814030034/results/final-summary.md` and are higher in most
> domains. Do not read the Treasury column below as current.

| Domain | Treasury | ChatGPT | Monarch | Origin |
| --- | ---: | ---: | ---: | ---: |
| Transaction Intelligence | 91.9 | 89.0 | 64.0 | 82.0 |
| Cashflow & Budgeting | 86.7 | 88.7 | 59.5 | 66.5 |
| Savings & Expense Reduction | 76.5 | 70.0 | 25.3 | 58.0 |
| Credit Cards & Rewards | 80.2 | 74.8 | 29.1 | 66.2 |
| Debt & Credit Health | 84.0 | 96.0 | 81.3 | 80.3 |
| Retirement & Tax-Advantaged Accounts | 87.4 | 70.6 | 44.2 | 61.6 |
| Tax Strategy | 84.6 | 72.9 | 57.9 | 73.7 |
| Employer Benefits & Workplace Perks | 87.0 | 75.7 | 54.0 | 73.8 |
| Housing & Rent | 88.5 | 91.3 | 39.2 | 80.2 |
| Investing & Equity Compensation | 81.5 | 78.3 | 65.0 | 60.2 |
| Insurance & Risk Protection | 89.0 | 90.0 | 72.8 | 78.5 |
| Life Planning & Major Decisions | 90.0 | 70.7 | 50.7 | 78.7 |

| Quality Dimension | Treasury | ChatGPT | Monarch | Origin |
| --- | ---: | ---: | ---: | ---: |
| Grounding | 90.6 | 92.8 | 50.9 | 76.1 |
| Correctness | 86.0 | 82.7 | 57.4 | 75.0 |
| Resolution | 82.7 | 80.6 | 47.7 | 67.6 |
| Prudence | 89.8 | 82.1 | 58.5 | 74.9 |

## Run Status

- Shared product prompts: `prompts/product/manifest.json` with prompt files under `prompts/product/files/`, used by Treasury, Monarch, and Origin.
- ChatGPT full-context prompts: `prompts/chatgpt-full-context/manifest.json` with prompt files under `prompts/chatgpt-full-context/files/`, used by the ChatGPT baseline.
- Treasury full run (August 2026, current): 83 captures, 83 judge prompts, 83 judgments, 83 final rows.
- Treasury full run (June 2026, superseded): 81 captures, 81 judge prompts, 81 judgments, 81 final rows.
- ChatGPT full-context run: 81 captures, 81 judge prompts, 81 judgments, 81 final rows.
- Monarch full run: 81 captures, 81 judge prompts, 81 judgments, 81 final rows, and one master `RUN_NOTES.md`.
- Origin full run: 81 captures, 81 judge prompts, 81 judgments, 81 final rows, and one master `RUN_NOTES.md`.
- Each run's `results/final-summary.md` includes a Factual Integrity table; each run's `results/unknown-facts.json` and the master `unknown-facts.json` hold the deduped unverified-fact worklist.
- The locked-fact table (`src/data/locked-facts.ts`) holds 69 web-verified 2026 facts; 28 were added by working the unknown-facts ledger (133 → 69 converged).
- `pnpm validate` passed with 3 personas, 16 opportunities, 81 tasks, 0 errors, and 0 warnings.
- `pnpm typecheck` passed.

## Review Flags Before Publishing

- ChatGPT is a full-context reference baseline using `chat-latest`; it is not a public ChatGPT product benchmark because the prompt includes upload-shaped balances, transactions, and memories directly.
- Display-artifact redaction differs by run. The June Treasury run has two captures where display-artifact leakage affected scoring (`treasury.jordan_business_banking_perks.json`, `treasury.patel_401k_contribution.json`). The August (V2) run redacts an inline display placeholder in 12 captures, with the same redaction carried into the matching judge prompts and judgments (38 occurrences across 33 files). In both cases public captures omit the raw display detail while preserving the visible answer text and the score impact.
