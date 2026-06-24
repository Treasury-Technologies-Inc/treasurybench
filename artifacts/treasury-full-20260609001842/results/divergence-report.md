# TreasuryBench Divergence Report

Rows with scoring warnings: 12

| Provider | Task | Domain | Final | Judge | Deterministic | Det/Judge Delta | Final/Judge Delta | Source | Warning |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| treasury | jordan_business_banking_perks | Employer Benefits & Workplace Perks | 65 | 82 | 70 | 12 | 17 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | jordan_scorp_or_llc | Tax Strategy | 70 | 78 | 40 | 38 | 8 | weighted_blend | Deterministic/judge divergence 38 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_checking_buffer | Cashflow & Budgeting | 73 | 82 | 38 | 44 | 9 | weighted_blend | Deterministic/judge divergence 44 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_costco_optimization | Credit Cards & Rewards | 65 | 78 | 100 | 22 | 13 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | maria_credit_card_strategy | Credit Cards & Rewards | 65 | 65 | 86 | 21 | 0 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | maria_rent_rewards | Credit Cards & Rewards | 76 | 82 | 50 | 32 | 6 | weighted_blend | Deterministic/judge divergence 32 points; inspect validator brittleness or judge reasoning. |
| treasury | maria_side_income_tax | Tax Strategy | 89 | 95 | 67 | 28 | 6 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. |
| treasury | patel_529_tax_strategy | Tax Strategy | 86 | 92 | 63 | 29 | 6 | weighted_blend | Deterministic/judge divergence 29 points; inspect validator brittleness or judge reasoning. |
| treasury | patel_childcare_tax_credits | Tax Strategy | 65 | 78 | 80 | 2 | 13 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | patel_college_savings_allocation | Investing & Equity Compensation | 65 | 82 | 83 | 1 | 17 | weighted_blend | Score cap 65 applied: answer contradicts a locked fact (1 material) |
| treasury | patel_spend_may_total | Transaction Intelligence | 78 | 85 | 71 | 14 | 7 | weighted_blend | Score cap 85 checked: judge found the user-visible answer was truncated, cut off, or incomplete; uncapped score was already at or below the cap. |
| treasury | patel_subscriptions_benefits | Savings & Expense Reduction | 40 | 75 | 86 | 11 | 35 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 75 applied: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000) Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
