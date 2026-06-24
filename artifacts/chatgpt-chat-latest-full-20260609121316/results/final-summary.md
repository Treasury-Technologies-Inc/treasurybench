# TreasuryBench Final Scores

Captures scored: 81

| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| openai:chat-latest | 81 | 80 | 85 | 86 | 100% | 1 | 18 | 8010ms |

## Factual Integrity

Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.

| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: | ---: |
| openai:chat-latest | 81 | 83% (67/81) | 2 | 12 | 23 |

## Domains

| Provider | Domain | Tasks | Final | Judge | Deterministic |
| --- | --- | ---: | ---: | ---: | ---: |
| openai:chat-latest | Cashflow & Budgeting | 6 | 89 | 88 | 92 |
| openai:chat-latest | Credit Cards & Rewards | 9 | 75 | 81 | 83 |
| openai:chat-latest | Debt & Credit Health | 3 | 96 | 95 | 100 |
| openai:chat-latest | Employer Benefits & Workplace Perks | 6 | 76 | 79 | 87 |
| openai:chat-latest | Housing & Rent | 6 | 91 | 91 | 93 |
| openai:chat-latest | Insurance & Risk Protection | 6 | 90 | 91 | 88 |
| openai:chat-latest | Investing & Equity Compensation | 6 | 78 | 85 | 82 |
| openai:chat-latest | Life Planning & Major Decisions | 3 | 71 | 84 | 79 |
| openai:chat-latest | Retirement & Tax-Advantaged Accounts | 9 | 71 | 81 | 84 |
| openai:chat-latest | Savings & Expense Reduction | 6 | 70 | 76 | 83 |
| openai:chat-latest | Tax Strategy | 12 | 73 | 80 | 79 |
| openai:chat-latest | Transaction Intelligence | 9 | 89 | 94 | 95 |

## Divergence Warnings

| Provider | Task | Final | Judge | Deterministic | Source | Warning |
| --- | --- | ---: | ---: | ---: | --- | --- |
| openai:chat-latest | jordan_roth_or_traditional_ira | 40 | 78 | 64 | weighted_blend | Final/judge divergence 38 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | maria_401k_contribution | 81 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| openai:chat-latest | maria_401k_percent_to_limit | 40 | 75 | 90 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (wrong_401k_24000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | maria_alaska_microsoft | 79 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| openai:chat-latest | maria_hsa | 70 | 75 | 50 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| openai:chat-latest | maria_rent_rewards | 55 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. Final/judge divergence 20 points; public score may not match judged response quality. Score cap 55 applied: answer contradicts multiple locked facts (2 material) |
| openai:chat-latest | maria_tax_optimization | 40 | 55 | 50 | weighted_blend | Score cap 70 checked: multiple stale/wrong locked current facts detected (stale_401k_23500, stale_ira_7000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (2 dangerous) |
| openai:chat-latest | maria_where_wasting_money | 65 | 65 | 100 | judge_override | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. Judge override applied because deterministic exceeded judge by at least 30 points; deterministic checks likely over-passed response quality. |
| openai:chat-latest | patel_401k_percent_to_limit | 40 | 65 | 75 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (wrong_401k_24000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_529_tax_strategy | 65 | 75 | 100 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. Score cap 80 checked: stale/wrong locked current fact detected (stale_529_k12_10000_limit); uncapped score was already at or below the cap. Score cap 65 applied: answer contradicts a locked fact (1 material) |
| openai:chat-latest | patel_backdoor_roth | 40 | 65 | 58 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_childcare_tax_credits | 40 | 65 | 80 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_daycare_rewards | 40 | 75 | 83 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 75 applied: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000) Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_dependent_care_fsa | 40 | 65 | 80 | weighted_blend | Final/judge divergence 25 points; public score may not match judged response quality. Score cap 75 checked: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_extra_15000 | 40 | 78 | 71 | weighted_blend | Final/judge divergence 38 points; public score may not match judged response quality. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_recurring_charges_audit | 40 | 85 | 100 | weighted_blend | Final/judge divergence 45 points; public score may not match judged response quality. Score cap 75 applied: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000) Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_subscriptions_benefits | 40 | 75 | 86 | weighted_blend | Final/judge divergence 35 points; public score may not match judged response quality. Score cap 75 applied: critical stale/wrong locked current fact detected (stale_dependent_care_fsa_5000) Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |
| openai:chat-latest | patel_taxable_investing_priority | 40 | 78 | 67 | weighted_blend | Final/judge divergence 38 points; public score may not match judged response quality. Score cap 80 checked: stale/wrong locked current fact detected (wrong_401k_24000_limit); uncapped score was already at or below the cap. Score cap 40 applied: answer contradicts a locked fact whose error could cause financial harm (1 dangerous) |

Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.
