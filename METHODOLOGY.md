# Methodology

TreasuryBench evaluates personal-finance assistants on realistic synthetic
personas, uploaded financial data, natural user questions, and finance-specific
rubrics.

## What Is Tested

TreasuryBench focuses on whether an assistant can:

- Read transaction and balance data accurately.
- Connect user context to personal-finance concepts.
- Surface high-value opportunities hidden in ordinary financial data.
- Use current financial rules, limits, product terms, and local programs
  correctly.
- Quantify impact and give clear next steps.
- Avoid unsupported assumptions, stale facts, unsafe recommendations, and
  generic boilerplate.

## Lanes

Product contenders are evaluated through product-like capture flows. Each
product receives the same transactions, balances, and seeded memories through
its normal import or setup workflow, then receives only the natural user
question.

Full-context baselines receive the persona's memories, balances, and
transactions directly in the prompt. These baselines are not consumer product
contenders. They estimate how close real products are to a strong frontier-model
answer when the model has idealized context access.

## Personas

Each persona is synthetic and includes:

- Transaction history.
- Account balances.
- Saved memories/context.
- Location, employer, household, income, and goals where relevant.
- Planted opportunities that are derivable from the visible data plus current
  financial knowledge.

The prompt should not disclose the planted opportunity. For example, a rent task
asks how to save on rent; the assistant must infer whether local affordable
housing programs, rent rewards, negotiation, or relocation are relevant.

## Tasks

Tasks are natural user questions grouped across public domains:

- Transaction Intelligence
- Cashflow & Budgeting
- Savings & Expense Reduction
- Credit Cards & Rewards
- Housing & Rent
- Employer Benefits & Workplace Perks
- Tax Strategy
- Retirement & Tax-Advantaged Accounts
- Investing & Equity Compensation
- Insurance & Risk Protection
- Debt & Credit Health
- Life Planning & Major Decisions

Each task has expected-answer notes, deterministic checks where appropriate, an
LLM judge rubric, invalid-answer patterns, and an open-credit policy for
unexpected but correct insights.

## Judging

TreasuryBench uses deterministic validation for exact data retrieval and narrow
math checks, then uses an LLM judge for open-ended quality dimensions:

- Grounding
- Correctness
- Resolution
- Prudence

Judges receive visible persona context, locked benchmark facts, deterministic
evidence, task rubrics, expected opportunities, and invalid-answer patterns.
Provider-private tool traces are intentionally hidden for public scoring.

## Artifacts

Official runs publish:

- Raw captured answers.
- Judge prompts.
- Judge outputs.
- Deterministic evaluations.
- Final blended scores.
- Divergence reports.
- Run notes.

This makes benchmark results inspectable rather than just summarized.
