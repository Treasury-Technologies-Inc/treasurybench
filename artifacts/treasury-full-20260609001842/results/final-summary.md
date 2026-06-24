# TreasuryBench Final Scores

Captures scored: 81

| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| treasury | 81 | 86 | 87 | 86 | 100% | 0 | 12 | 13698ms |

## Factual Integrity

Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.

| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: | ---: |
| treasury | 81 | 93% (75/81) | 5 | 1 | 28 |

## Domains

| Provider | Domain | Tasks | Final | Judge | Deterministic |
| --- | --- | ---: | ---: | ---: | ---: |
| treasury | Cashflow & Budgeting | 6 | 87 | 87 | 86 |
| treasury | Credit Cards & Rewards | 9 | 80 | 83 | 83 |
| treasury | Debt & Credit Health | 3 | 84 | 82 | 93 |
| treasury | Employer Benefits & Workplace Perks | 6 | 87 | 89 | 93 |
| treasury | Housing & Rent | 6 | 89 | 87 | 94 |
| treasury | Insurance & Risk Protection | 6 | 89 | 90 | 87 |
| treasury | Investing & Equity Compensation | 6 | 82 | 85 | 83 |
| treasury | Life Planning & Major Decisions | 3 | 90 | 89 | 93 |
| treasury | Retirement & Tax-Advantaged Accounts | 9 | 87 | 88 | 85 |
| treasury | Savings & Expense Reduction | 6 | 77 | 83 | 80 |
| treasury | Tax Strategy | 12 | 85 | 87 | 80 |
| treasury | Transaction Intelligence | 9 | 92 | 91 | 92 |

## Divergence Warnings

| Provider | Task | Final | Judge | Deterministic | Source | Warning |
| --- | --- | ---: | ---: | ---: | --- | --- |
| treasury | jordan_business_banking_perks | 65 | 82 | 70 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | jordan_scorp_or_llc | 70 | 78 | 40 | weighted_blend | Deterministic/judge divergence 38 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_checking_buffer | 73 | 82 | 38 | weighted_blend | Deterministic/judge divergence 44 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_costco_optimization | 65 | 78 | 100 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | maria_credit_card_strategy | 65 | 65 | 86 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | maria_rent_rewards | 76 | 82 | 50 | weighted_blend | Deterministic/judge divergence 32 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_side_income_tax | 89 | 95 | 67 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. |
| treasury | patel_529_tax_strategy | 86 | 92 | 63 | weighted_blend | Deterministic/judge divergence 29 points; inspect validator brittleness or judge reasoning. |
| treasury | patel_childcare_tax_credits | 65 | 78 | 80 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | patel_college_savings_allocation | 65 | 82 | 83 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | patel_spend_may_total | 78 | 85 | 71 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| treasury | patel_subscriptions_benefits | 40 | 75 | 86 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 75 applied: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000) Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |

Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.
