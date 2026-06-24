# TreasuryBench Final Scores

Captures scored: 81

| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| monarch | 81 | 52 | 53 | 64 | 100% | 15 | 39 | 100669ms |

## Factual Integrity

Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.

| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: | ---: |
| monarch | 81 | 86% (70/81) | 2 | 9 | 9 |

## Domains

| Provider | Domain | Tasks | Final | Judge | Deterministic |
| --- | --- | ---: | ---: | ---: | ---: |
| monarch | Cashflow & Budgeting | 6 | 60 | 60 | 84 |
| monarch | Credit Cards & Rewards | 9 | 29 | 29 | 52 |
| monarch | Debt & Credit Health | 3 | 81 | 78 | 93 |
| monarch | Employer Benefits & Workplace Perks | 6 | 54 | 55 | 64 |
| monarch | Housing & Rent | 6 | 39 | 38 | 49 |
| monarch | Insurance & Risk Protection | 6 | 73 | 72 | 74 |
| monarch | Investing & Equity Compensation | 6 | 65 | 65 | 65 |
| monarch | Life Planning & Major Decisions | 3 | 51 | 58 | 79 |
| monarch | Retirement & Tax-Advantaged Accounts | 9 | 44 | 49 | 60 |
| monarch | Savings & Expense Reduction | 6 | 25 | 26 | 46 |
| monarch | Tax Strategy | 12 | 58 | 61 | 58 |
| monarch | Transaction Intelligence | 9 | 64 | 60 | 77 |

## Divergence Warnings

| Provider | Task | Final | Judge | Deterministic | Source | Warning |
| --- | --- | ---: | ---: | ---: | --- | --- |
| monarch | jordan_business_expenses_may | 74 | 65 | 83 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| monarch | jordan_checking_buffer | 35 | 35 | 100 | judge_override | Deterministic/judge divergence 65 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | jordan_credit_card_balance_check | 60 | 55 | 80 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | jordan_credit_card_strategy | 10 | 10 | 42 | judge_override | Deterministic/judge divergence 32 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | jordan_office_supplies_rewards | 5 | 0 | 25 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | jordan_quarterly_estimated_taxes | 78 | 75 | 88 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| monarch | jordan_recurring_charges_audit | 0 | 0 | 50 | judge_override | Deterministic/judge divergence 50 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | jordan_rent_affordability | 10 | 5 | 30 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | jordan_scorp_or_llc | 74 | 75 | 70 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| monarch | jordan_solo401k_or_sep | 40 | 75 | 63 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (stale_415c_69000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | jordan_subscriptions_benefits | 0 | 0 | 61 | judge_override | Deterministic/judge divergence 61 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | jordan_where_wasting_money | 0 | 0 | 33 | judge_override | Deterministic/judge divergence 33 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | maria_401k_contribution | 35 | 35 | 75 | judge_override | Deterministic/judge divergence 40 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | maria_alaska_microsoft | 79 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | maria_backdoor_roth | 40 | 45 | 25 | weighted_blend | Score cap 80 checked: stale/wrong locked current fact detected (stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | maria_checking_buffer | 70 | 75 | 50 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | maria_costco_optimization | 11 | 5 | 33 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. |
| monarch | maria_credit_card_strategy | 25 | 25 | 64 | judge_override | Deterministic/judge divergence 39 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | maria_extra_10000 | 45 | 45 | 100 | judge_override | Deterministic/judge divergence 55 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | maria_idle_cash | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | maria_mega_backdoor | 40 | 55 | 50 | weighted_blend | Score cap 70 checked: multiple stale/wrong locked current facts detected (stale_401k_23000, stale_415c_69000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (2 dangerous) |
| monarch | maria_recurring_charges_audit | 88 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | maria_tax_optimization | 40 | 65 | 50 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_401k_contribution | 5 | 5 | 67 | judge_override | Deterministic/judge divergence 62 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | patel_401k_percent_to_limit | 31 | 25 | 50 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| monarch | patel_529_tax_strategy | 62 | 65 | 50 | weighted_blend | Score cap 65 checked: answer contradicts a locked fact (1 material); uncapped score was already at or below the cap. |
| monarch | patel_backdoor_roth | 40 | 45 | 50 | weighted_blend | Score cap 80 checked: stale/wrong locked current fact detected (stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_checking_buffer | 25 | 25 | 75 | judge_override | Deterministic/judge divergence 50 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | patel_costco_target_optimization | 65 | 65 | 70 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| monarch | patel_credit_card_strategy | 5 | 5 | 58 | judge_override | Deterministic/judge divergence 53 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | patel_daycare_rewards | 40 | 55 | 67 | weighted_blend | Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_dependent_care_fsa | 40 | 45 | 60 | weighted_blend | Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_employer_family_benefits | 40 | 45 | 57 | weighted_blend | Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_extra_15000 | 40 | 65 | 57 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| monarch | patel_idle_cash | 78 | 72 | 100 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| monarch | patel_property_insurance_review | 25 | 25 | 67 | judge_override | Deterministic/judge divergence 42 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| monarch | patel_recurring_charges_audit | 0 | 0 | 33 | judge_override | Deterministic/judge divergence 33 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | patel_subscriptions_benefits | 15 | 15 | 50 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| monarch | patel_tax_optimization | 19 | 15 | 44 | weighted_blend | Deterministic/judge divergence 29 points; inspect validator brittleness or judge reasoning. Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |

Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.
