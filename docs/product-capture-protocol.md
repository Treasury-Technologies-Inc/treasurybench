# Product Capture Protocol

Use this protocol for Treasury, Monarch, Origin, and any future personal-finance
product contender.

## Principle

Every product contender should receive the same benchmark persona data through
the closest available product-like workflow. The prompt should be only the
natural user question.

Do not give product contenders the full benchmark rubric, planted opportunity,
judge notes, or full-context baseline prompt.

## Seed Data

For each persona, seed:

- Transactions CSV.
- Balances CSV.
- Saved memories or equivalent product context.

If a product does not support a memory/context feature, document the closest
available setup and the gap in `RUN_NOTES.md`.

## Prompting

Ask each task prompt exactly once, unless the response is corrupt, blank,
truncated, or otherwise not a real answer. If a retry is needed, retry once and
preserve a note in the run folder.

Use the natural product prompt from `prompts/product/`.

## Capture Shape

Save each response as:

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

Do not include private implementation traces, session identifiers, database
details, provider-private tool traces, or product source code details in public capture
artifacts.

## Scoring

After capture:

```sh
pnpm evaluate-run -- --run=runs/<run-id>
pnpm run-judge -- --run=runs/<run-id> --env-file=.env --judge-provider=gemini --model=gemini-3.1-flash-lite
pnpm score-run -- --run=runs/<run-id>
```

Review `results/divergence-report.md` before publishing. Divergences are audit
flags, not automatic failures.

## Run Notes

`RUN_NOTES.md` should include:

- Product name and run date.
- Persona coverage.
- Import/setup method.
- Any product limitations that affected capture.
- Any retries due to corrupt, blank, truncated, or rate-limited answers.

Do not include private credentials, local paths, account identifiers, or private
implementation details.
