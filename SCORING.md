# TreasuryBench Scoring Model

TreasuryBench is a finance-domain benchmark that can run through Promptfoo-style
providers and assertions. Promptfoo should own repeatable execution, reporting,
provider comparison, and model-graded assertion plumbing. TreasuryBench owns the
personal-finance domain logic: personas, uploaded transactions and balances,
seeded memories, locked facts, expected opportunities, custom validators, and
finance-specific judge rubrics.

## Public Domains

Public domain scores answer the question users actually care about: "What kind
of financial job is this assistant good at?"

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

Domain scores should be shown publicly only when the domain has enough active
coverage. V1 treats three focused tasks as the minimum for a mature public
domain score; thinner domains should be labeled pilot coverage.

## Quality Dimensions

Each task is scored across four quality dimensions plus speed.

- Grounding: Uses the visible transactions, balances, and seeded memories
  correctly. Does not invent user data.
- Correctness: Gets math, limits, product facts, tax rules, and program facts
  right for the benchmark date.
- Resolution: Actually answers the user's question with a useful conclusion,
  quantified impact, and exact next actions.
- Prudence: Handles eligibility, caveats, uncertainty, tradeoffs, reversibility,
  and downside without turning correct advice into generic hedging.
- Speed: Measured separately from quality.

Task rubrics may weight these dimensions differently. Data retrieval puts more
weight on grounding and correctness. Open-ended advice puts more weight on
resolution. Insurance, tax, debt, and major-decision tasks give prudence more
weight.

## Promptfoo Assertion Mapping

TreasuryBench can be represented as Promptfoo tests, but the finance-specific
checks should remain in custom JavaScript or Python assertions.

- Grounding: custom deterministic assertions for exact transactions, balances,
  date ranges, category boundaries, and fabricated-user-data detectors; model
  graded context-faithfulness where the answer is open-ended.
- Correctness: custom math validators for known totals and limits; Promptfoo
  factuality or search-rubric assertions for current external facts; stale-fact
  detectors for common IRS/card/program failures.
- Resolution: LLM rubric, model-graded closed QA, and answer relevance
  assertions, using expected opportunities and open-credit policy.
- Prudence: LLM rubric or G-Eval-style criteria plus deterministic overclaim
  detectors for guaranteed eligibility, unsupported enrollment/participation,
  unsafe debt/investment/tax sequencing, and hidden assumptions.
- Speed: Promptfoo latency metadata where available, or captured product
  response latency from the product capture protocol.

Deterministic text metrics such as contains, regex, Levenshtein, ROUGE, BLEU, or
similarity are not core quality metrics. They can be weak helpers, but they
should not decide whether a financial answer is good. Provider tool or trajectory
assertions are not part of public scoring unless every provider exposes
comparable traces under the same capture protocol.

## Aggregation

For a task:

`judge_quality = weighted_avg(Grounding, Correctness, Resolution, Prudence)`

When a judge score exists, the public task score is judge-primary:

- Data retrieval: 50% deterministic, 50% judge.
- Insight discovery: 15% deterministic, 85% judge.
- Domain advice: 20% deterministic, 80% judge.
- Prioritization: 15% deterministic, 85% judge.
- What-if: 25% deterministic, 75% judge.

If deterministic and judge scores diverge by 30+ points, the final score uses a
judge override and emits a divergence warning. This prevents brittle exact
validators from silently dominating the public score. Deterministic-only scores
remain capped development fallbacks when no judge output exists.

For a domain:

`domain_score = average(public_task_score for active tasks in domain)`

For the master score:

`master_score = equal_weighted_average(mature_domain_scores)`

Equal domain weighting prevents a benchmark with many rewards questions from
overpowering thinner but important domains like insurance or debt. Internal
diagnostics should still expose missed opportunities, wrong facts, stale facts,
math errors, unsupported assumptions, vague dodges, and context-retrieval failures
so product work can target the root cause.

Every final run should also emit divergence diagnostics:

- `abs(deterministic - judge) >= 25`
- `abs(final - judge) >= 20`

These rows are not automatic judge failures. They are audit flags: either the
deterministic validator is brittle, the judge missed something, or the final
blend is not representing judged answer quality well enough.

For key tasks, add pairwise validation as a separate sanity check:

`Which answer would be more useful and trustworthy to the user?`

Pairwise preference is not the main score. It validates whether rubric scoring
matches human preference and highlights cases where the numeric score needs
benchmark review.

## Task Design Rules

Each TreasuryBench task should have:

- A natural user question, not a benchmark-shaped instruction.
- A focused data setup that makes at least one valuable answer derivable from
  uploaded transactions, balances, and memories.
- Expected opportunities with basic, personalized, advanced, and expert tiers.
- Deterministic validators for narrow facts that can be checked exactly.
- Model-graded rubric dimensions for open-ended quality.
- Open-credit language so a factual, grounded, useful surprise is rewarded.
- Invalid-pattern language for common generic, stale, unsafe, or fabricated
  answers.
- Expected-answer scope notes for ambiguous prompts, especially food/category
  scope, subscription-vs-recurring scope, local housing eligibility, and rent
  rewards fee math.

## Fact Taxonomy

Judges and validators should use the same source taxonomy:

- `visible_data`: transactions, balances, account names/types, and dates visible
  in the uploaded CSVs.
- `seeded_memory`: persona memories seeded into every provider.
- `locked_benchmark_fact`: benchmark facts that are authoritative for the
  benchmark date, such as 2026 IRS limits or locked Microsoft plan facts.
- `dynamic_external_fact`: current product, program, tax, card, local housing,
  or employer facts not listed as locked. These need currentness and caveats.
- `unsupported`: claims not grounded in visible data, seeded memories, locked
  facts, or independently verifiable current knowledge.

Plan-level facts should not become user-specific participation claims. For
example, "Microsoft offers a $1,000 HSA seed for eligible HDHP/HSA enrollment"
is a locked plan-level fact; "Maria receives the seed" requires enrollment
evidence.
