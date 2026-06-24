# Run Integrity & Disclosures

This document records the conditions, known artifacts, and scoring decisions
behind the published TreasuryBench runs so results are auditable rather than
just summarized. It is deliberately self-critical: where a run condition could
be read as favoring any provider, it is disclosed here with the magnitude.

## Corrected headline scores

| Provider | Lane | Final | Factually Clean | Notes |
| --- | --- | ---: | ---: | --- |
| Treasury | product contender | 85.5 | 93% | live PWA agent with tool calls |
| ChatGPT (`chat-latest`) | full-context baseline | 79.6 | 83% | reference baseline, **not** a product contender (idealized in-prompt context) |
| Origin | product contender | 71.0 | 86% | 73.1 excluding capture-harness import failures — see below |
| Monarch | product contender | 52.1 | 86% | |

Scores are task-weighted across all 81 final scored rows per provider, judge-primary
where judge output exists, with factual contradictions against the locked-fact
table applying hard caps (material 65, dangerous 40). Equal-weighted-domain,
per-domain, and Factual Integrity breakdowns are in each run's
`results/final-summary.md`.

## How factual accuracy is graded (table-grounded policy)

For a personal-finance product an incorrect fact (a stale contribution limit, a
fabricated benefit, a wrong card term) is more harmful than weak prose, so factual
accuracy is graded harshly — but only when it can be *verified*. The mechanism:

- **The LLM judge grades quality (the four dimensions) but does not decide factual
  truth from its own memory.** For each checkable external fact an answer asserts,
  the judge emits a structured claim `{claim, tableKey, state}` where state is
  `verified_correct`, `verified_incorrect`, or `unverified`. It may mark a claim
  *incorrect* only by citing the locked fact it contradicts.
- **A deterministic guard enforces this in code.** Any `verified_incorrect` whose
  `tableKey` does not resolve to a real locked fact — or that actually states the
  fact's current value — is demoted, so the judge cannot invent a contradiction
  from out-of-date training data (the failure mode that produces false penalties).
- **Only verified contradictions cap the score:** material → 65, dangerous → 40
  (dangerous = facts whose error risks real financial harm, e.g. contribution
  limits). The judge's free-text notes are advisory and do not affect the score.
- **Facts the judge cannot match to the table are logged, not guessed.** Every
  `unverified` claim goes to `unknown-facts.json` with no score impact.

This makes factual grading reproducible (the verdict is a table lookup, not a
per-run LLM judgment) and identical across providers, while letting factual errors
bite hard *without* amplifying judge noise — harsh penalties are safe only because
detection is verifiable.

### The locked-fact table and the ledger loop

The locked-fact table holds **69 facts, every one web-verified against multiple
independent current 2026 sources** (IRS Revenue Procedures/Notices, SSA, FHFA,
state revenue departments, card-issuer pages). It was built by working the
unknown-facts ledger: run → verify the logged unknowns offline (multi-source) →
add the confirmed facts → re-judge. The ledger converged from **133 → 69** over
two iterations; the residual is intentionally *not* locked — dynamic values (APYs,
mortgage/insurance rates, promo prices the advisor should not cite anyway),
universally-true principles with no staleness risk, and unverifiable
employer-benefit specifics.

Verification caught real errors now graded correctly — e.g. Colorado's 2026 rate
is 4.40% (not the stale 4.25%), the CO 529 deduction cap is $26,200/$39,200 (the
candidate "$30,000/no cap" claims were wrong), and the crypto wash-sale rule still
does **not** apply in 2026 (OBBBA did not change it; one source had conflated a
proposal with enacted law). No wrong answer was found scoring high (no false
credit); every contradiction penalty traces to a verified locked fact.

Why this changes the leaderboard: the ChatGPT full-context baseline (79.6) sits
below Treasury (85.5) primarily because it has **12 dangerous contradictions** —
it cites stale 2025 contribution limits as current even with idealized context —
while Treasury, grounding answers in current facts, has 1. For a finance product,
factual currentness is the intended differentiator.

## Judge independence (known limitation)

All published runs were graded by a single judge, Gemini `gemini-3.1-flash-lite`.
Any LLM-judged benchmark carries same-family bias risk: a contender built on the
same base model family as the judge can be scored more favorably by it. We found
no evidence of favoritism here — the judge penalizes the top contender's own
factual errors (see that run's `divergence-report.md`) and the fact-check pass
above raised competitors as much as the leader — but single-judge grading is a
real limitation. A
cross-judge run with an independent model (the harness supports
`--judge-provider=openai`) is recommended before treating any single number as
definitive, and is planned as follow-up validation.

## Capture-date spread

- Treasury and the ChatGPT baseline were captured **2026-06-09**.
- Monarch and Origin were captured **2026-06-05**.
- The benchmark date (used for all fact-currentness grading) is locked to each
  persona's `asOfDate` (**2026-05-31**), so fact grading is identical regardless
  of capture date.

One consequence: a provider that truthfully described its own capture date
("accounts added today, June 5") could be marked for a date mismatch against the
2026-05-31 benchmark date. Such capture-date statements are artifacts of the
capture window, not advice-quality errors, and should not be read as factual
defects.

## Origin balance-import failures

The balance-import artifact surfaced on **at least 19 of 81** Origin captures: the
product ingested the persona's accounts but the **balances failed to populate**, so
Origin saw `$0` and flagged a data-sync issue. On **16 of those tasks** the missing
balances **materially broke the answer** — Origin answered as if the user had no
assets or deflected — and those 16 form the excluded set below. On **3 others**
(`maria_extra_10000`, `maria_credit_card_strategy`, `patel_property_insurance_review`)
Origin flagged the `$0` but still produced a usable answer and was not penalized for
it (they scored 85, 46, and 88), so they are **retained** in both published figures.
This is a capture-harness ingestion artifact, not Origin's advice quality.

Examples (from Origin's own captures):

- `jordan_crypto_concentration` — *"all five show $0 balances … added today (June
  5) as manual accounts, so balances haven't been entered yet."* The question was
  literally about the user's crypto balance, which Origin therefore could not see.
- `patel_taxable_investing_priority` — *"No assets added. We couldn't find any
  assets for this account."*
- `maria_401k_contribution` — *"the balance is currently showing as $0 — this is
  likely a data sync issue."*

The judge correctly records these as grounding failures (the CSV it holds shows
real balances), so the affected tasks score low (affected-task mean **63** vs
**73** on Origin's clean tasks). Treasury and the ChatGPT baseline never hit this:
Treasury was captured on its own PWA (native ingestion) and ChatGPT received the
data directly in-prompt, so Origin alone bore ingestion risk in a lane meant to
test advice-given-the-data.

Both numbers are published:

- **Origin full run: 71.0** (all 81 tasks).
- **Origin excluding the 16 import-failure tasks: 73.1** (65 tasks).

Honest caveat: excluding whole tasks is *generous* to Origin, because a few of
those tasks also contain an unrelated real error (e.g. `patel_extra_15000` also
miscomputes the annual 401(k) deferral). The import-failure-adjusted figure is
therefore best read as **~72**, between the two. We did **not** edit Origin's
response text — altering a competitor's captured answer would be the one move
that genuinely compromises the artifact.

Affected tasks: `jordan_business_banking_perks`, `jordan_credit_card_balance_check`,
`jordan_crypto_concentration`, `jordan_idle_cash`, `jordan_where_wasting_money`,
`maria_401k_contribution`, `maria_checking_buffer`, `maria_credit_card_balance_check`,
`maria_idle_cash`, `maria_msft_stock_risk`, `patel_checking_buffer`,
`patel_credit_card_balance_check`, `patel_extra_15000`, `patel_idle_cash`,
`patel_life_insurance_need`, `patel_taxable_investing_priority`.

## Judge-override directionality

The judge-override rule (the judge score replaces a weighted blend when
deterministic checks exceed the judge by ≥30 points) is symmetric by design — it
exists to stop brittle exact-match validators from inflating a weak answer. In
practice the overrides fell disproportionately on the lower-scoring contenders
(Monarch 15, Origin 7, Treasury 0), because those runs more often passed surface
deterministic checks while giving answers the judge scored as weak (e.g. counting
a credit-card payment as spending, or deflecting a question into a survey).
Reviewers comparing providers should read each override against its
`divergence-report.md` row rather than treating the count as a quality score.

## Scoring philosophy aligns with the product thesis

TreasuryBench rewards surfacing the highest-leverage *planted* opportunity in a
persona's data rather than giving generically-correct advice (see `SCORING.md`).
That is, by design, close to Treasury's own product thesis (finding hidden,
personalized money-saving opportunities). This is disclosed so readers can weigh
it: a self-authored benchmark choosing "surface the obscure planted play" as a
win condition structurally rewards the author's product strengths, even though
the rubric and locked facts are applied identically to every provider.

## Capture display markers (Treasury run)

Treasury's product renders some answers with an inline visual card. In the
captures this appears two ways, by design:

- `[Displayed Treasury Insight card]` followed by the card's summary and
  `Highlights:` line — the normal case. The card text is user-visible advice and
  is kept in the capture so the answer is graded on its full visible content.
- `[Display artifact omitted from public capture]` — used on the two captures
  (`treasury.jordan_business_banking_perks.json`, `treasury.patel_401k_contribution.json`)
  where the product additionally emitted raw display/stream output. The raw
  internal rendering detail is redacted to avoid publishing product internals,
  while the visible answer text and the deterministic leakage penalty
  (`no_raw_tool_or_stream_output`) are preserved. These two are intentionally
  *not* "cleaned up" to look better — the leakage is a real, scored data point.

## Coverage

V1 uses **3 synthetic personas** (a Seattle Microsoft employee, a Denver
dual-income family, an Austin freelancer) across 81 tasks. All three are
relatively affluent US tech-worker households. The benchmark does not yet cover
low-income, retiree, non-US, or thin-file profiles, and results should not be
generalized to them. All personas and financial data are synthetic (see
`LIMITATIONS.md`).
