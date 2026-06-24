# TreasuryBench Final Scores

Captures scored: 81

| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| origin | 81 | 71 | 73 | 79 | 100% | 7 | 24 | 46016ms |

## Factual Integrity

Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.

| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: | ---: |
| origin | 81 | 86% (70/81) | 7 | 4 | 21 |

## Domains

| Provider | Domain | Tasks | Final | Judge | Deterministic |
| --- | --- | ---: | ---: | ---: | ---: |
| origin | Cashflow & Budgeting | 6 | 67 | 65 | 80 |
| origin | Credit Cards & Rewards | 9 | 66 | 70 | 82 |
| origin | Debt & Credit Health | 3 | 80 | 78 | 88 |
| origin | Employer Benefits & Workplace Perks | 6 | 74 | 78 | 89 |
| origin | Housing & Rent | 6 | 80 | 81 | 76 |
| origin | Insurance & Risk Protection | 6 | 79 | 81 | 71 |
| origin | Investing & Equity Compensation | 6 | 60 | 62 | 74 |
| origin | Life Planning & Major Decisions | 3 | 79 | 78 | 81 |
| origin | Retirement & Tax-Advantaged Accounts | 9 | 62 | 62 | 76 |
| origin | Savings & Expense Reduction | 6 | 58 | 65 | 71 |
| origin | Tax Strategy | 12 | 74 | 77 | 82 |
| origin | Transaction Intelligence | 9 | 82 | 84 | 80 |

## Divergence Warnings

| Provider | Task | Final | Judge | Deterministic | Source | Warning |
| --- | --- | ---: | ---: | ---: | --- | --- |
| origin | jordan_crypto_concentration | 25 | 25 | 60 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| origin | jordan_hsa | 65 | 85 | 67 | weighted_blend | Final/judge divergence 20 points; public score may not match judged response quality. Score cap 65 applied: answer contradicts a locked fact (1 material) |
| origin | jordan_office_supplies_rewards | 80 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| origin | jordan_roth_or_traditional_ira | 41 | 35 | 64 | weighted_blend | Deterministic/judge divergence 29 points; inspect validator brittleness or judge reasoning. Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| origin | jordan_scorp_or_llc | 65 | 82 | 60 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| origin | jordan_solo401k_or_sep | 65 | 65 | 63 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| origin | jordan_travel_rewards | 48 | 45 | 60 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| origin | jordan_where_wasting_money | 69 | 65 | 92 | weighted_blend | Deterministic/judge divergence 27 points; inspect validator brittleness or judge reasoning. |
| origin | maria_401k_contribution | 25 | 25 | 75 | judge_override | Deterministic/judge divergence 50 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| origin | maria_alaska_microsoft | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| origin | maria_costco_optimization | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. Score cap 65 checked: answer contradicts a locked fact (1 material); uncapped score was already at or below the cap. |
| origin | maria_mfte_eligibility_check | 78 | 85 | 50 | weighted_blend | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. |
| origin | maria_rent_rewards | 65 | 85 | 100 | weighted_blend | Final/judge divergence 20 points; public score may not match judged response quality. Score cap 65 applied: answer contradicts a locked fact (1 material) |
| origin | maria_rsu_tax_withholding | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. Score cap 65 checked: answer contradicts a locked fact (1 material); uncapped score was already at or below the cap. |
| origin | maria_where_wasting_money | 41 | 45 | 17 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. |
| origin | patel_401k_percent_to_limit | 35 | 35 | 75 | judge_override | Deterministic/judge divergence 40 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| origin | patel_529_tax_strategy | 65 | 78 | 63 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| origin | patel_checking_buffer | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| origin | patel_childcare_family_spend_may | 76 | 92 | 60 | weighted_blend | Deterministic/judge divergence 32 points; inspect validator brittleness or judge reasoning. |
| origin | patel_college_savings_allocation | 65 | 78 | 75 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| origin | patel_daycare_rewards | 40 | 65 | 75 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| origin | patel_employer_family_benefits | 40 | 65 | 86 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| origin | patel_subscriptions_benefits | 40 | 82 | 100 | weighted_blend | Final/judge divergence 42 points; public score may not match judged response quality. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| origin | patel_tax_optimization | 40 | 65 | 88 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 70 checked: multiple stale/wrong locked current facts detected (wrong_401k_24000_limit, stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |

Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.
