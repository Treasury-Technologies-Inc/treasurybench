# ChatGPT Full-Context TreasuryBench Run Notes

Provider: ChatGPT baseline
Mode: full-context raw model baseline
Model: OpenAI `chat-latest`
Personas: Maria Seattle, Patel Denver, Jordan Freelancer
Tasks: 81 total, 27 per persona
Judge: Gemini `gemini-3.1-flash-lite`

## Headline Score

- Master final score: 80
- Judge score: 85
- Deterministic score: 86
- Judge coverage: 81/81
- Median latency: 8.0s
- Judge overrides: 1
- Divergence/factual-cap warnings: 18
- Factual Integrity: 83% clean (67/81); 2 material, 12 dangerous contradictions
- Per-persona: Jordan 89, Maria 80, Patel 70

Scores are task-weighted across all 81 final scored rows, judge-primary where judge output exists; factual contradictions against the locked-fact table apply hard caps (material 65, dangerous 40). The final (80) sits well below the judged quality (85) because this full-context baseline repeatedly cites stale 2025 contribution limits as current (12 dangerous contradictions), which the factual policy caps at 40 — see `../RUN_INTEGRITY.md`.

## Strongest Domains

- Debt & Credit Health: 96
- Transaction Intelligence: 93
- Housing & Rent: 91
- Insurance & Risk Protection: 91
- Cashflow & Budgeting: 89

## Weakest Domains

- Savings & Expense Reduction: 76
- Retirement & Tax-Advantaged Accounts: 80
- Credit Cards & Rewards: 82
- Employer Benefits & Workplace Perks: 82
- Tax Strategy: 82

## Review Flags

- This is an internal raw-model baseline, not a public ChatGPT product benchmark.
- The prompt directly included upload-shaped persona context: balances, transactions, and seeded memories. A real consumer ChatGPT finance product would need equivalent data access/tooling to be comparable.
- The run uses `chat-latest` without a custom reasoning-effort setting.
- Several rows were capped or warning-flagged for stale/wrong factual wording in the answer.

## Standard Full-Run Outputs

- Captures: `captures/` (81 files)
- User prompts: `../prompts/chatgpt-full-context/manifest.json` and `../prompts/chatgpt-full-context/files/`
- Judge prompts: `judge-prompts/` (81 files)
- Judge outputs: `judgments/` (81 files)
- Summary: `results/summary.md`
- Machine-readable summary: `results/summary.json`
- All scored rows: `results/final-evaluations.json` and `results/final-evaluations.csv`
- Raw evaluation rows: `results/evaluations.json` and `results/evaluations.csv`
- Divergence report: `results/divergence-report.md`, `results/divergence-report.json`, and `results/divergence-report.csv`
