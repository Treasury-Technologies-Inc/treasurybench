# Monarch Full TreasuryBench Run Notes

Provider: Monarch
Personas: Maria Seattle, Patel Denver, Jordan Freelancer
Tasks: 81 total, 27 per persona
Judge: Gemini `gemini-3.1-flash-lite`

## Headline Score

- Master final score: 52
- Judge score: 53
- Deterministic score: 64
- Judge coverage: 81/81
- Median latency: 100.7s
- Judge overrides: 15
- Divergence/factual-cap warnings: 39
- Factual Integrity: 86% clean (70/81); 2 material, 9 dangerous contradictions

Scores are task-weighted across all 81 final scored rows, judge-primary where judge output exists; factual contradictions against the locked-fact table apply hard caps (material 65, dangerous 40). See `../RUN_INTEGRITY.md` for the mechanism. Per-domain numbers are sourced from `results/final-summary.md`.

## Persona Scores

- Maria Seattle: final 57, median latency 28.5s
- Patel Denver: final 46, median latency 97.8s
- Jordan Freelancer: final 53, median latency 112.2s

## Strongest Domains

- Debt & Credit Health: 72
- Insurance & Risk Protection: 70
- Investing & Equity Compensation: 67
- Transaction Intelligence: 58

## Weakest Domains

- Savings & Expense Reduction: 25
- Credit Cards & Rewards: 34
- Housing & Rent: 41
- Retirement & Tax-Advantaged Accounts: 42

## Quality Dimensions

- Prudence: 60
- Correctness: 55
- Grounding: 46
- Resolution: 44

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
