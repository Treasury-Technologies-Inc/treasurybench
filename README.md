# TreasuryBench

Personal-finance assistant benchmark — evaluate how well AI-powered finance products and frontier models use real user data to surface high-leverage financial opportunities.

**v0.1.0** · 3 personas · 81 tasks · 12 domains · judge-primary scoring with table-grounded factual verification

---

## Results — v0.1.0

### Leaderboard

| Provider | Lane | Score | Factually Clean | Median Latency |
| --- | --- | ---: | ---: | ---: |
| **Treasury** | Product contender | **85.5** | 93% | 13.7s |
| ChatGPT `chat-latest` | Full-context baseline † | 79.6 | 83% | 8.0s |
| **Origin** | Product contender | **71.0** ‡ | 86% | 46.0s |
| **Monarch** | Product contender | **52.1** | 86% | 100.7s |

† Full-context baselines paste the persona's transactions, balances, and memories directly into the prompt — this is not how a real consumer product works. It is a ceiling estimate, not a product contender.

‡ 73.1 when the 16 tasks where balance import silently failed are excluded. See [artifacts/RUN_INTEGRITY.md](artifacts/RUN_INTEGRITY.md).

Scores are 0–100, judge-primary with table-grounded factual caps. Stale or wrong financial facts (contribution limits, tax rules, program terms) hard-cap the task score regardless of prose quality — material errors cap at 65, dangerous errors at 40. Full scoring architecture: [SCORING.md](SCORING.md).

### By Domain

Best score per row bolded. † marks the full-context baseline (not a product contender).

| Domain | Tasks | Treasury | Origin | Monarch | ChatGPT † |
| --- | ---: | ---: | ---: | ---: | ---: |
| Transaction Intelligence | 9 | **92** | 82 | 64 | 89 |
| Tax Strategy | 12 | **85** | 74 | 58 | 73 |
| Retirement & Tax-Advantaged Accounts | 9 | **87** | 62 | 44 | 71 |
| Investing & Equity Compensation | 6 | **82** | 60 | 65 | 78 |
| Housing & Rent | 6 | 89 | 80 | 39 | **91** |
| Employer Benefits & Workplace Perks | 6 | **87** | 74 | 54 | 76 |
| Credit Cards & Rewards | 9 | **80** | 66 | 29 | 75 |
| Insurance & Risk Protection | 6 | 89 | 79 | 73 | **90** |
| Cashflow & Budgeting | 6 | 87 | 67 | 60 | **89** |
| Savings & Expense Reduction | 6 | **77** | 58 | 25 | 70 |
| Debt & Credit Health | 3 | 84 | 80 | 81 | **96** |
| Life Planning & Major Decisions | 3 | **90** | 79 | 51 | 71 |

### By Persona

| Persona | Treasury | Origin | Monarch | ChatGPT † |
| --- | ---: | ---: | ---: | ---: |
| Maria Chen — Seattle, Microsoft, renter | 87 | 71 | 57 | 80 |
| Priya Patel — Denver, dual income, homeowner | 85 | 69 | 46 | 70 |
| Jordan Rivera — Austin, self-employed | 84 | 73 | 53 | 89 |

### Factual Integrity

Share of answers with no locked-fact contradiction across 81 tasks. Dangerous = incorrect fact that could cause real financial harm (e.g. stale contribution limit cited as actionable advice).

| Provider | Factually Clean | Material errors | Dangerous errors |
| --- | ---: | ---: | ---: |
| Treasury | **93%** (75/81) | 5 | 1 |
| Origin | 86% (70/81) | 7 | 4 |
| Monarch | 86% (70/81) | 2 | 9 |
| ChatGPT † | 83% (67/81) | 2 | 12 |

ChatGPT's 12 dangerous errors drive the largest gap between its judged quality (85) and final score (79.6): it consistently cites stale 2025 contribution limits as current, even under idealized in-prompt context.

---

## Published Artifacts

All captures, judge prompts, judgments, and scored results are in `artifacts/`.

| Run | Score | Tasks | Captured | Notes |
| --- | ---: | ---: | --- | --- |
| `treasury-full-20260609001842` | 85.5 | 81 | 2026-06-09 | Live Treasury PWA advisor with tool calls |
| `chatgpt-chat-latest-full-20260609121316` | 79.6 | 81 | 2026-06-09 | Full-context baseline — not a product contender |
| `origin-full-20260605T160538` | 71.0 / 73.1 | 81 | 2026-06-05 | 73.1 excluding 16 balance-import failures |
| `monarch-full-20260605T200447` | 52.1 | 81 | 2026-06-05 | |

Each run directory contains `captures/`, `judge-prompts/`, `judgments/`, and `results/` with machine-readable CSVs and divergence reports. See [artifacts/RUN_INTEGRITY.md](artifacts/RUN_INTEGRITY.md) for the judge-independence caveat, the Origin import-failure disclosure, and the self-authorship disclosure.

---

## What's Being Tested

TreasuryBench asks whether a personal-finance assistant can:

- Read transaction and balance data accurately.
- Connect user context to personal-finance concepts.
- Surface high-value opportunities hidden in ordinary financial data.
- Use current financial rules, limits, product terms, and local programs correctly.
- Quantify impact and give exact next steps.
- Avoid unsupported assumptions, stale facts, unsafe recommendations, and generic boilerplate.

### Personas

Three synthetic US households with transaction history, account balances, saved memories, employer, location, and goals:

- **Maria Chen** — late 20s, Seattle, Microsoft software engineer, renter.
- **Priya Patel** — dual income, Denver, homeowner, two kids.
- **Jordan Rivera** — Austin, self-employed, gig/freelance income.

### Tasks

81 natural user questions (27 per persona) across 12 domains. Tasks are phrased like real user questions — "How can I save money on rent?" not "Identify Seattle MFTE eligibility." The assistant must infer the opportunity from the persona's signals.

### Scoring

Judge-primary when LLM judge output is available. Deterministic evaluators catch exact data use, arithmetic, and planted-signal discovery. The LLM judge grades synthesis, personalization, and open-ended credit. Stale or wrong financial facts apply hard caps regardless of prose quality.

Full architecture: [SCORING.md](SCORING.md) · Methodology: [METHODOLOGY.md](METHODOLOGY.md) · Limitations: [LIMITATIONS.md](LIMITATIONS.md) · Run integrity: [artifacts/RUN_INTEGRITY.md](artifacts/RUN_INTEGRITY.md)

---

## Recreate

### Install

```sh
pnpm install
pnpm validate    # verify schema consistency and scoring totals
pnpm report      # print a compact task/domain summary
pnpm smoke       # run the fixture provider end-to-end
```

### Run a full-context baseline

```sh
pnpm export-prompts -- --out=runs/my-openai-run/prompts --mode=full_context_baseline
pnpm run-provider -- --provider=openai --out=runs/my-openai-run --live=true \
  --model=chat-latest --max-output-tokens=2200 --env-file=.env
pnpm evaluate-run -- --run=runs/my-openai-run
pnpm run-judge -- --run=runs/my-openai-run --env-file=.env \
  --judge-provider=gemini --model=gemini-3.1-flash-lite
pnpm score-run -- --run=runs/my-openai-run
```

`.env` needs `OPENAI_API_KEY` (provider) and `GOOGLE_GENERATIVE_AI_API_KEY` (judge). Use `--judge-provider=openai` with `OPENAI_API_KEY` to judge with OpenAI instead.

### Capture a product manually

```sh
pnpm export-persona-data -- --out=runs/my-product-data
pnpm make-capture-templates -- --out=runs/my-product --provider=myproduct --mode=product_capture
# seed each persona into your product, ask the natural prompt, paste the answer
# into the `response` field of each captures/*.json file
pnpm evaluate-run -- --run=runs/my-product
pnpm run-judge -- --run=runs/my-product --env-file=.env \
  --judge-provider=gemini --model=gemini-3.1-flash-lite
pnpm score-run -- --run=runs/my-product
```

See [docs/product-capture-protocol.md](docs/product-capture-protocol.md) for the full seeding protocol.

### Re-score a published run

```sh
pnpm score-run -- --run=artifacts/treasury-full-20260609001842
```

To re-judge from existing captures:

```sh
pnpm run-judge -- --run=artifacts/treasury-full-20260609001842 --env-file=.env \
  --judge-provider=gemini --model=gemini-3.1-flash-lite
```

---

## License

MIT — see [LICENSE](LICENSE).
