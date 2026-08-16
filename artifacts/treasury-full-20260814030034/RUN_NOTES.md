# Treasury Full TreasuryBench Run Notes (V2)

Provider: Treasury PWA
Mode: automated Treasury product run
Personas: Maria Seattle, Patel Denver, Jordan Freelancer
Tasks: 83 total (29 Maria, 27 Patel, 27 Jordan)
Provider runtime: Treasury production PWA advisor (live agent with tool calls)
Judge: Gemini `gemini-3.1-flash-lite`
Captured: 2026-08-14

## Headline Score

- Master final score: 89
- Judge score: 90
- Deterministic score: 86
- Judge coverage: 83/83
- Median latency: 11.6s
- Judge overrides: 0
- Divergence/factual-cap warnings: 4
- Factual Integrity: 100% clean (83/83); 0 material, 0 dangerous contradictions
- Per-persona: Maria 92, Jordan 87, Patel 87

(Scores produced by the table-grounded factual policy — see `../RUN_INTEGRITY.md`. Per-domain numbers below are sourced from `results/final-summary.md`; Factual Integrity is in that file too.)

Scores are task-weighted across all 83 final scored rows. The master final score is judge-primary where judge output exists; factual contradictions against the locked-fact table apply hard caps (material 65, dangerous 40).

## Comparison to V1 (2026-06-09)

V1 scored 86 across 81 tasks. Restricted to V1's exact 81-task set, this run also
scores 89, so the movement is not an artifact of the two added tasks.

- Overall: 86 → 89
- Factual Integrity: 93% clean (5 material, 1 dangerous) → 100% clean (0, 0)
- Median latency: 13.7s → 11.6s
- Per-persona: Maria 87 → 92, Patel 85 → 87, Jordan 84 → 87

What changed between runs: the Treasury advisor now runs on a different
underlying model. The benchmark grew from 81 to 83 tasks (two spending tasks
added to the Maria set). The judge model, rubrics, locked-fact table and scoring
rules are unchanged, so the two runs are directly comparable.

**The competitor runs in this repo (Origin, Monarch, ChatGPT full-context) are
from June 2026 and have NOT been re-measured.** Any comparison between this run
and those is a comparison across two different dates.

## Strongest Domains

- Debt & Credit Health: 93
- Retirement & Tax-Advantaged Accounts: 91
- Tax Strategy: 91
- Transaction Intelligence: 91
- Investing & Equity Compensation: 90

## Weakest Domains

- Savings & Expense Reduction: 85
- Credit Cards & Rewards: 85
- Insurance & Risk Protection: 87
- Housing & Rent: 88
- Cashflow & Budgeting: 89

## Review Flags

- This is the source-of-truth Treasury product run for V2. It is a **single
  sample**. Advisor turns are stochastic (the agentic loop can spiral on hard
  tasks), so individual task scores move between runs and the headline score
  should be read with that in mind.
- Four tasks regressed by 10 points or more against V1 and were not individually
  investigated: `patel_daycare_rewards` (94 → 78), `jordan_home_office_rent`
  (96 → 81), `jordan_recurring_charges_audit` (76 → 63), `patel_tax_optimization`
  (89 → 79).
- Four rows carry deterministic/judge divergence warnings (`patel_hsa_family` 35
  points, `jordan_solo401k_or_sep` 29, `jordan_business_banking_perks` 28,
  `jordan_recurring_charges_audit` 25). Historically these indicate validator
  brittleness rather than a bad answer, but `jordan_recurring_charges_audit` is
  both divergent and regressed and is the most likely genuine miss. See
  `results/divergence-report.md`.
- One latency outlier: `maria_msft_stock_risk` took 166s against an 11.6s median.
- 20 unverified factual claims were logged to the unknown-facts ledger (not
  scored) — see `results/unknown-facts.json`.

## Public-Capture Sanitisation

As in V1, captures are sanitised before publication: product-internal execution
detail is removed, and the product's inline display placeholder is redacted to
`[Display artifact omitted from public capture]` (38 occurrences across 33 files
in this run — 12 captures, the 12 matching judge prompts, and 14 references
inside 9 judgments — following the policy in `../RUN_INTEGRITY.md`).

Redaction happens after judging, so it does not affect any score. The visible
answer text around each redaction is untouched.

## Standard Full-Run Outputs

- Captures: `captures/` (83 files)
- Judge prompts: `judge-prompts/` (83 files)
- Judge outputs: `judgments/` (83 files)
- Summary: `results/summary.md`
- Machine-readable summary: `results/summary.json`
- All scored rows: `results/final-evaluations.json` and `results/final-evaluations.csv`
- Raw evaluation rows: `results/evaluations.json` and `results/evaluations.csv`
- Divergence report: `results/divergence-report.md`, `.json` and `.csv`
