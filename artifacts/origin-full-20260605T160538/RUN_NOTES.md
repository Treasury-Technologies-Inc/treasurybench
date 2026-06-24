# Origin Full TreasuryBench Run Notes

Provider: Origin
Personas: Maria Seattle, Patel Denver, Jordan Freelancer
Tasks: 81 total, 27 per persona
Judge: Gemini `gemini-3.1-flash-lite`

## Headline Score

- Master final score: 71 (full run) / 73 excluding 16 capture-harness balance-import-failure tasks
- Judge score: 73
- Deterministic score: 79
- Judge coverage: 81/81
- Median latency: 46.0s
- Judge overrides: 7
- Divergence/factual-cap warnings: 24
- Factual Integrity: 86% clean (70/81); 7 material, 4 dangerous contradictions

Scores are task-weighted across all 81 final scored rows, judge-primary where judge output exists; factual contradictions against the locked-fact table apply hard caps (material 65, dangerous 40). See `../RUN_INTEGRITY.md` for the mechanism, the 16 balance-import-failure tasks, and the "Origin both-ways" scoring (71 full / 73 excluding). Per-domain numbers are sourced from `results/final-summary.md`.

## Persona Scores

- Maria Seattle: final 71, median latency 35.3s
- Patel Denver: final 69, median latency 53.1s
- Jordan Freelancer: final 73, median latency 52.1s

## Strongest Domains

- Transaction Intelligence: 80
- Housing & Rent: 79
- Employer Benefits & Workplace Perks: 78
- Insurance & Risk Protection: 77

## Weakest Domains

- Retirement & Tax-Advantaged Accounts: 59
- Investing & Equity Compensation: 61
- Cashflow & Budgeting: 64
- Savings & Expense Reduction: 64

## Quality Dimensions

- Grounding: 71
- Correctness: 72
- Resolution: 65
- Prudence: 76

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
