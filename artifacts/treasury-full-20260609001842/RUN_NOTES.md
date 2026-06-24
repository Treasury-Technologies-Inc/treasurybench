# Treasury Full TreasuryBench Run Notes

Provider: Treasury PWA
Mode: automated Treasury product run
Personas: Maria Seattle, Patel Denver, Jordan Freelancer
Tasks: 81 total, 27 per persona
Provider runtime: Treasury production PWA advisor (live agent with tool calls)
Judge: Gemini `gemini-3.1-flash-lite`

## Headline Score

- Master final score: 86
- Judge score: 87
- Deterministic score: 86
- Judge coverage: 81/81
- Median latency: 13.7s
- Judge overrides: 0
- Divergence/factual-cap warnings: 12
- Factual Integrity: 93% clean (75/81); 5 material, 1 dangerous contradiction
- Per-persona: Maria 87, Patel 85, Jordan 84

(Scores produced by the table-grounded factual policy — see `../RUN_INTEGRITY.md`. Per-domain numbers below are sourced from `results/final-summary.md`; Factual Integrity is in that file too.)

Scores are task-weighted across all 81 final scored rows. The master final score is judge-primary where judge output exists; factual contradictions against the locked-fact table apply hard caps (material 65, dangerous 40).

## Strongest Domains

- Transaction Intelligence: 92
- Life Planning & Major Decisions: 90
- Insurance & Risk Protection: 89
- Housing & Rent: 89
- Retirement & Tax-Advantaged Accounts: 87

## Weakest Domains

- Savings & Expense Reduction: 77
- Credit Cards & Rewards: 80
- Investing & Equity Compensation: 82
- Debt & Credit Health: 84
- Tax Strategy: 85

## Review Flags

- This is the source-of-truth Treasury product run for the V1 comparison.
- The run used the live PWA Treasury agent with tool calls, not a direct full-context prompt.
- Two official captures (`treasury.jordan_business_banking_perks.json` and `treasury.patel_401k_contribution.json`) preserve the scored display/stream-leakage penalty (`no_raw_tool_or_stream_output`) while the raw render itself is redacted to `[Display artifact omitted from public capture]`; see the "Capture display markers" section of `../RUN_INTEGRITY.md`.
- Several rows were capped where the answer contradicted a locked fact; see `results/divergence-report.md` for the audit trail and `results/final-summary.md` for the Factual Integrity breakdown. Captures are immutable raw evidence; scores are produced by the table-grounded factual policy against a 69-fact, multi-source-verified locked-fact set (see `../RUN_INTEGRITY.md`).

## Standard Full-Run Outputs

- Captures: `captures/` (81 files)
- User prompts: `../prompts/product/manifest.json` and `../prompts/product/files/`
- Judge prompts: `judge-prompts/` (81 files)
- Judge outputs: `judgments/` (81 files)
- Summary: `results/summary.md`
- Machine-readable summary: `results/summary.json`
- All scored rows: `results/final-evaluations.json` and `results/final-evaluations.csv`
- Raw evaluation rows: `results/evaluations.json` and `results/evaluations.csv`
- Divergence report: `results/divergence-report.md`, `results/divergence-report.json`, and `results/divergence-report.csv`
