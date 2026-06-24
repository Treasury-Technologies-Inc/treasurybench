# TreasuryBench

TreasuryBench is a personal-finance assistant benchmark for evaluating real
finance products against synthetic but realistic user data.

The benchmark is intentionally **targeted in construction, natural in prompting,
and flexible in grading**:

- Personas contain realistic transaction, balance, memory, employer, location,
  and household signals.
- Prompts sound like real user questions instead of benchmark labels.
- Rubrics reward generic correctness, but reserve the highest scores for
  data-grounded, high-dollar, factually current, actionable insights.
- Unexpected ideas can earn open credit when they are factual, relevant,
  grounded in the persona, conservatively valued, and safe.

## Benchmark Lanes

TreasuryBench separates product contenders from full-context model baselines.

| Lane | Examples | Data Exposure | Public Interpretation |
| --- | --- | --- | --- |
| Product capture | Treasury, Monarch, Origin | Same uploaded transactions, balances, and seeded memories inside each product UI | Apples-to-apples product benchmark |
| Full-context baseline | ChatGPT full-context | Upload-shaped balances/transactions CSVs and memory JSON directly in the prompt | Reference point for frontier-model answer quality, not a consumer product contender |
| Fixture | Fixture provider | Synthetic canned answers | Harness test only |

The ChatGPT full-context baseline is not a benchmark contender. It receives the
persona's transactions, balances, and memories directly in the prompt, which is a
cleaner context path than a normal consumer finance app has. It is included to
estimate how close products are to a strong frontier-model answer under
idealized context access.

The benchmark should not hand assistants the finance trick in the prompt. For
example, the rent task asks "How can I save money on rent?" and expects stronger
systems to infer Seattle MFTE/MHA from rent, location, income, and household
context.

## Scoring

Each task uses public quality dimensions plus tiered opportunity scoring. See
`SCORING.md` for the scoring architecture.

Public quality dimensions:

- **Grounding:** Uses visible transactions, balances, and memories correctly.
- **Correctness:** Gets math, financial mechanics, current facts, and program
  rules right.
- **Resolution:** Answers the question with quantified impact and exact next
  steps.
- **Prudence:** Handles eligibility, caveats, uncertainty, tradeoffs, and
  downside.
- **Speed:** Measured separately from quality.

Expected opportunities use tier examples:

- **Basic:** Correct but generic personal-finance advice.
- **Personalized:** Uses the user's transactions, accounts, balances, income,
  location, employer, goals, or memories.
- **Advanced:** Surfaces the intended domain-specific opportunity from planted
  signals.
- **Expert:** Quantifies impact, handles eligibility/caveats, gives exact next
  steps, and prioritizes correctly.
- **Open credit:** Rewards unexpected but valid opportunities.
- **Penalties:** Remove credit for fabricated facts, stale limits, unsafe
  recommendations, irrelevant boilerplate, or overconfident eligibility claims.

Do not give full credit for generic advice when the persona has enough signal
for a higher-leverage personalized play.

## Commands

In the standalone public repo:

```sh
pnpm install
pnpm validate
pnpm report
pnpm smoke
pnpm prompt -- --task=maria_save_on_rent --mode=full_context_baseline
pnpm export-persona-data -- --out=runs/maria-data
pnpm make-capture-templates -- --out=runs/monarch-manual --provider=monarch --mode=product_capture
pnpm capture-status -- --captures=runs/monarch-manual/captures
pnpm evaluate-run -- --run=runs/monarch-manual
pnpm score-run -- --run=runs/monarch-manual
pnpm export-prompts -- --out=runs/chatgpt-full-context/prompts --mode=full_context_baseline
pnpm export-judge-prompts -- --captures=runs/chatgpt-full-context/captures --out=runs/chatgpt-full-context/judge-prompts
pnpm run-provider -- --provider=fixture_provider --out=runs/fixture-provider
```

`validate` checks schema consistency, scoring totals, opportunity references,
and source references. `report` prints a compact domain/task/opportunity summary
for review.

## Capture Flow

### Product Captures

For Treasury, Monarch, Origin, and future product contenders, seed the same
persona data into the product first:

- Transactions CSV: `Date,Merchant,Category,Account,Original Statement,Notes,Amount,Tags,Owner`
- Balances CSV: `Date,Balance,Account`
- Seeded memories/context: same persona memory set for every product

Then ask only the natural user prompt and save the answer in the shared capture
shape:

```json
{
  "taskId": "maria_save_on_rent",
  "personaId": "maria_seattle_v0",
  "provider": "treasury",
  "mode": "product_capture",
  "capturedAt": "2026-06-09T00:00:00.000Z",
  "latencyMs": 13700,
  "response": "..."
}
```

Generate capture templates:

```sh
pnpm export-persona-data -- --out=runs/maria-data
pnpm make-capture-templates -- --out=runs/treasury-manual --provider=treasury --mode=product_capture
pnpm make-capture-templates -- --out=runs/monarch-manual --provider=monarch --mode=product_capture
pnpm make-capture-templates -- --out=runs/origin-manual --provider=origin --mode=product_capture
```

### Full-Context Baselines

For a full-context model baseline, export prompts that include the persona's
memories, balances, and transactions directly in the prompt:

```sh
pnpm export-prompts -- --out=runs/chatgpt-full-context/prompts --mode=full_context_baseline
```

Save responses using:

```json
{
  "taskId": "maria_save_on_rent",
  "personaId": "maria_seattle_v0",
  "provider": "chatgpt-chat-latest-full-context",
  "mode": "full_context_baseline",
  "capturedAt": "2026-06-09T00:00:00.000Z",
  "latencyMs": 8000,
  "response": "..."
}
```

You can also run an OpenAI full-context baseline through the provider harness:

```sh
pnpm run-provider -- --provider=openai --out=runs/chatgpt-dry --tasks=maria_save_on_rent --model=chat-latest
pnpm run-provider -- --provider=openai --out=runs/chatgpt-live --live=true --model=chat-latest --max-output-tokens=2200
```

`--live=true` is required for API calls. The provider reads only
`OPENAI_API_KEY` and `TREASURYBENCH_OPENAI_MODEL` from `--env-file`; it does not
print secrets.

## Evaluation Flow

Deterministic evaluation writes:

- `results/evaluations.json`
- `results/evaluations.csv`
- `results/summary.json`
- `results/summary.md`

Final scoring writes:

- `results/final-evaluations.json`
- `results/final-evaluations.csv`
- `results/final-summary.md`
- `results/divergence-report.json`
- `results/divergence-report.csv`
- `results/divergence-report.md`

Run:

```sh
pnpm evaluate-run -- --run=runs/treasury-manual
pnpm run-judge -- --run=runs/treasury-manual --env-file=.env --judge-provider=gemini --model=gemini-3.1-flash-lite
pnpm score-run -- --run=runs/treasury-manual
```

The deterministic score is not the whole benchmark. It catches exact data use,
arithmetic, planted-signal discovery, and factual hooks. LLM judges sit on top
for synthesis, judgment, factual verification, prose quality, and open-ended
extra credit.

When judge output exists, public scoring is judge-primary:

- Data retrieval: 50% deterministic, 50% judge.
- Advice, insight discovery, what-if, and prioritization: mostly LLM-judged.
- If deterministic and judge scores diverge by 30+ points, `score-run` emits a
  divergence warning.
- If no judge output exists, deterministic-only scores are capped so an
  open-ended answer cannot look fully benchmarked without LLM review.

The judge prompt includes the visible memories/balances/transactions, locked
benchmark facts, hidden task rubric, planted opportunities, deterministic
evidence, invalid-answer patterns, and structured JSON output schema.
Provider-private tool traces are intentionally hidden for public scoring.

Pairwise preference validation is available as a separate sanity check:

```sh
pnpm run-pairwise -- --run-a=runs/treasury-manual --run-b=runs/chatgpt-full-context --tasks=maria_food_spend_may,maria_recurring_charges_audit,maria_credit_card_strategy --env-file=.env --model=chat-latest
```

Pairwise preference is not part of the main score. Use it to catch cases where
numeric rubrics disagree with human preference.

## Current V0.1 Shape

- 3 personas: Maria Chen, Priya Patel, and Jordan Rivera.
- 16 planted opportunities linked to public benchmark source references.
- 81 natural user tasks, 27 per persona.
- Deterministic evaluators for every current task-level check.
- LLM-judged public scoring for Treasury, Monarch, and Origin product captures.
- ChatGPT full-context included as a reference baseline, not as a product
  contender.
- Current persisted benchmark artifacts live in `artifacts/README.md`.

Public domains:

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

Public quality dimensions:

- Grounding
- Correctness
- Resolution
- Prudence
- Speed
