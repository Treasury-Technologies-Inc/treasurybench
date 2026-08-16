# TreasuryBench Final Scores

Captures scored: 83

| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| treasury | 83 | 89 | 90 | 86 | 100% | 0 | 4 | 11620ms |

## Factual Integrity

Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.

| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |
| --- | ---: | ---: | ---: | ---: | ---: |
| treasury | 83 | 100% (83/83) | 0 | 0 | 20 |

## Domains

| Provider | Domain | Tasks | Final | Judge | Deterministic |
| --- | --- | ---: | ---: | ---: | ---: |
| treasury | Cashflow & Budgeting | 6 | 89 | 89 | 85 |
| treasury | Credit Cards & Rewards | 9 | 85 | 86 | 82 |
| treasury | Debt & Credit Health | 3 | 93 | 92 | 96 |
| treasury | Employer Benefits & Workplace Perks | 6 | 89 | 89 | 88 |
| treasury | Housing & Rent | 6 | 88 | 89 | 82 |
| treasury | Insurance & Risk Protection | 6 | 87 | 88 | 80 |
| treasury | Investing & Equity Compensation | 6 | 90 | 90 | 90 |
| treasury | Life Planning & Major Decisions | 3 | 89 | 90 | 79 |
| treasury | Retirement & Tax-Advantaged Accounts | 9 | 91 | 92 | 83 |
| treasury | Savings & Expense Reduction | 6 | 85 | 86 | 84 |
| treasury | Tax Strategy | 12 | 91 | 92 | 88 |
| treasury | Transaction Intelligence | 11 | 91 | 93 | 89 |

## Divergence Warnings

| Provider | Task | Final | Judge | Deterministic | Source | Warning |
| --- | --- | ---: | ---: | ---: | --- | --- |
| treasury | jordan_business_banking_perks | 84 | 88 | 60 | weighted_blend | Deterministic/judge divergence 28 points; inspect validator brittleness or judge reasoning. |
| treasury | jordan_recurring_charges_audit | 63 | 75 | 50 | weighted_blend | Deterministic/judge divergence 25 points; inspect validator brittleness or judge reasoning. |
| treasury | jordan_solo401k_or_sep | 86 | 92 | 63 | weighted_blend | Deterministic/judge divergence 29 points; inspect validator brittleness or judge reasoning. |
| treasury | patel_hsa_family | 88 | 95 | 60 | weighted_blend | Deterministic/judge divergence 35 points; inspect validator brittleness or judge reasoning. |

Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.
