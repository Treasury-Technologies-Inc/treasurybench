# Limitations

TreasuryBench is designed to be transparent and repeatable, but it is not a
perfect measure of every personal-finance assistant.

## Synthetic Data

All personas and financial data are synthetic. They are designed to be realistic
and benchmarkable, but they cannot cover every household, institution, employer,
tax profile, merchant pattern, or local program.

## Product Capture Constraints

Product contenders are captured through their actual product workflows where
possible. This creates realistic constraints, but it can also introduce product
UI, import, rate-limit, memory, or response-format artifacts. Raw captures are
published so readers can inspect these cases directly.

## Full-Context Baselines

ChatGPT full-context is a reference baseline, not a consumer product contender.
It receives the persona's memories, balances, and transactions directly in the
prompt. A normal personal-finance product must ingest, retrieve, select, and
apply context through its own product workflow.

Use the full-context baseline as an upper reference for answer quality under
idealized context access, not as an apples-to-apples product comparison.

## LLM Judges

LLM judges can make mistakes. TreasuryBench mitigates this by publishing judge
prompts, judge outputs, deterministic evidence, locked facts, and divergence
reports. Large deterministic/judge divergences should be reviewed before using a
score as product evidence.

## Current Facts

Personal-finance facts change over time. TreasuryBench locks specific facts for
the benchmark date where possible, and judges should treat those locked facts as
authoritative. Dynamic external facts still require currentness and caveats.

## Not Financial Advice

TreasuryBench is an evaluation framework. Its personas, prompts, answers, and
scores are not financial, tax, legal, or investment advice.
