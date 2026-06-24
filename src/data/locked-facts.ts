import type { FactConflictSeverity, FactSourceKind } from '../schema';

export interface LockedFact {
  id: string;
  kind: Extract<FactSourceKind, 'locked_benchmark_fact' | 'dynamic_external_fact'>;
  text: string;
  currentness: 'benchmark_year' | 'benchmark_context' | 'dynamic_terms';
  userSpecificity: 'plan_level' | 'program_level' | 'tax_rule' | 'product_terms';
  /**
   * How harmful it is for an answer to contradict this fact, used to size the
   * factual score cap. Defaults to 'material'. Mark 'dangerous' when a wrong
   * value could cause real financial harm if acted on — e.g. asserting
   * user-specific benefit participation/eligibility, or a contribution limit
   * error that could drive an excess contribution and penalty.
   */
  severity?: FactConflictSeverity;
  /**
   * Canonical current-value string(s) for this fact (e.g. ['24,500']). A
   * deterministic guard: if the judge marks a claim `verified_incorrect` against
   * this fact but the claim text actually contains a current value, the verdict
   * is a mistake (the answer stated the right number) and is demoted to
   * `verified_correct`. Provide for numeric facts where a verdict-flip is
   * plausible. Use the bare grouped number without the dollar sign.
   */
  currentValues?: string[];
}

export const lockedFactTable: LockedFact[] = [
  {
    id: 'irs_2026_401k_employee_deferral',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['24,500'],
    text: 'For benchmark year 2026, the 401(k)/403(b)/governmental 457/TSP employee elective deferral limit is $24,500. 2025 was $23,500; 2024 was $23,000.'
  },
  {
    id: 'irs_2026_415c_defined_contribution',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['72,000'],
    text: 'For benchmark year 2026, the section 415(c) defined-contribution annual additions limit is $72,000 before catch-up contributions.'
  },
  {
    id: 'irs_2026_ira_limit',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['7,500'],
    text: 'For benchmark year 2026, the traditional/Roth IRA contribution limit is $7,500 before age-based catch-up.'
  },
  {
    id: 'irs_2026_roth_single_phaseout',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, the Roth IRA contribution phaseout for single filers (and heads of household) is $153,000 to $168,000 modified AGI. Do not penalize a response for applying this range to head-of-household filers.'
  },
  {
    id: 'irs_2026_roth_mfj_phaseout',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, the Roth IRA contribution phaseout for married filing jointly or qualifying surviving spouse is $242,000 to $252,000 modified AGI.'
  },
  {
    id: 'irs_2026_standard_deduction',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['32,200', '16,100', '24,150'],
    text: 'For benchmark year 2026, the standard deduction is $32,200 for married filing jointly, $16,100 for single or married filing separately, and $24,150 for head of household.'
  },
  {
    id: 'irs_2026_salt_cap',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['40,400'],
    text: 'For benchmark year 2026, the overall SALT deduction limit is $40,400, or $20,200 for married filing separately, and the limit phases down for modified AGI above $505,000, or $252,500 if married filing separately, but not below $10,000, or $5,000 if married filing separately.'
  },
  {
    id: 'irs_2026_hsa_self_only',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['4,400'],
    text: 'For benchmark year 2026, the HSA contribution limit for self-only HDHP coverage is $4,400.'
  },
  {
    id: 'irs_2026_hsa_family',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['8,750'],
    text: 'For benchmark year 2026, the HSA contribution limit for family HDHP coverage is $8,750 before age-based catch-up contributions.'
  },
  {
    id: 'irs_2026_dependent_care_fsa',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    severity: 'dangerous',
    currentValues: ['7,500', '3,750'],
    text: 'For benchmark year 2026, the dependent care FSA/dependent care assistance program exclusion limit is $7,500 for single filers or married couples filing jointly and $3,750 for married individuals filing separately. The benchmark constants cite IRS Publication 15-B (2026) and the One Big Beautiful Bill Act as the source for this higher 2026 DCAP limit. Employer plans may need to adopt the higher limit, so user-specific availability still requires plan verification.'
  },
  {
    id: 'irs_2026_529_k12_limit',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['20,000'],
    text: 'For benchmark year 2026, the federal annual 529 distribution limit for qualified K-12 expenses is $20,000 per beneficiary. Treat $10,000 as stale when a response presents it as the current 2026 K-12 529 limit.'
  },
  {
    id: 'irs_2026_social_security_wage_base',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['184,500'],
    text: 'For benchmark year 2026, the Social Security (OASDI) maximum taxable wage base is $184,500, up from $176,100 in 2025. Do not penalize $184,500 as the 2026 wage base; treat $176,100 as the prior-year (2025) value. Self-employment tax is 15.3% on net earnings (12.4% Social Security up to the $184,500 wage base, plus 2.9% Medicare with no cap), and the 0.9% Additional Medicare Tax applies above $200,000 single or $250,000 married filing jointly.'
  },
  {
    id: 'irs_2026_child_dependent_care_credit',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, the Child and Dependent Care Tax Credit (CDCTC) eligible-expense caps remain $3,000 for one qualifying individual and $6,000 for two or more. These caps did NOT change for 2026, so do not flag $3,000/$6,000 as stale. The One Big Beautiful Bill Act raised the maximum credit rate to 50% (phasing down to 20%/35% by income), but the expense caps are unchanged. The CDCTC is separate from the dependent care FSA/DCAP exclusion.'
  },
  {
    id: 'obbba_2025_enacted_law',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'The One Big Beautiful Bill Act (OBBBA) is a real, enacted 2025 federal tax law (signed July 2025) and the source of several 2026 changes used in this benchmark (the $7,500 dependent care FSA/DCAP exclusion, the $20,000 529 K-12 limit, the enhanced CDCTC credit rate, OBBBA-adjusted standard deduction and SALT figures, and the expanded QBI phase-in ranges). OBBBA also made the TCJA individual income-tax rate brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%) permanent. Do not treat references to OBBBA / the One Big Beautiful Bill Act, including the claim that it made the TCJA brackets permanent, as fabricated or hallucinated.'
  },
  {
    id: 'irs_2026_qbi_199a_thresholds',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['201,750', '403,500'],
    text: 'For benchmark year 2026, the Section 199A qualified business income (QBI) deduction taxable-income thresholds are $201,750 for single and head-of-household filers (phasing out to $276,750) and $403,500 for married filing jointly (phasing out to $553,500). OBBBA expanded the phase-in range to $75,000 (single) and $150,000 (MFJ). Treat $201,750 / $403,500 as the current thresholds; figures such as $191,950 or $197,300 are prior-year (2024/2025) single-filer values and are stale for 2026.'
  },
  {
    id: 'irs_2026_standard_mileage_rate',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['72.5'],
    text: 'For benchmark year 2026, the IRS standard mileage rate for business use is 72.5 cents per mile (up from 70 cents in 2025). Treat 67 cents (the 2024 rate) and 70 cents (the 2025 rate) as stale when presented as the current 2026 business mileage rate.'
  },
  {
    id: 'irs_2026_catchup_contributions',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, catch-up contribution amounts differ by account type and must not be conflated: IRA catch-up (age 50+) is $1,100 (newly indexed by SECURE 2.0, up from $1,000; total IRA limit $8,600 at 50+); 401(k)/403(b)/457/TSP catch-up (age 50+) is $8,000; the 401(k) super catch-up (ages 60-63) is $11,250; and the HSA catch-up (age 55+) is $1,000 (a fixed statutory amount that is NOT inflation-indexed and remains $1,000). Do not penalize $1,100 as the IRA catch-up, and do not "correct" the $1,000 HSA catch-up to $1,100 — $1,000 is the correct 2026 HSA catch-up.'
  },
  {
    id: 'irs_2026_income_tax_brackets',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026 (per Rev. Proc. 2025-32, OBBBA-adjusted), the single-filer ordinary income tax brackets are: 10% to $12,400; 12% to $50,400; 22% to $105,700; 24% to $201,775; 32% to $256,225; 35% to $640,600; 37% above $640,600. Married-filing-jointly: 10% to $24,800; 12% to $100,800; 22% to $211,400; 24% to $403,550; 32% to $512,450; 35% to $768,700; 37% above $768,700. Treat these as the current thresholds — e.g. the single 35% bracket beginning at $256,226 is correct for 2026; do not flag $256,225 or $640,600 as non-standard, and treat the 2025 single figures ($250,525 / $626,350) as stale.'
  },
  {
    id: 'irs_2026_child_tax_credit',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['2,200'],
    text: 'For benchmark year 2026, the federal Child Tax Credit is $2,200 per qualifying child under age 17 (OBBBA made the credit permanent and began inflation indexing, up from $2,000), with up to $1,700 refundable as the Additional Child Tax Credit. Phaseout begins above $200,000 AGI (single) / $400,000 (MFJ). Treat $2,200 as the current amount; $2,000 is the prior (pre-OBBBA-indexing) value and $2,500 is not a correct 2026 figure. This is distinct from the Child and Dependent Care Tax Credit (CDCTC).'
  },
  {
    id: 'obbba_2026_bronze_catastrophic_hsa',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'Effective January 1, 2026, OBBBA (clarified by IRS Notice 2026-05) treats Bronze and Catastrophic ACA Exchange plans as HSA-compatible "deemed HDHPs," so enrollees can open and fund an HSA regardless of whether the plan meets the general HDHP definition. Do not treat the claim that OBBBA made Bronze/Catastrophic marketplace plans HSA-eligible as fabricated; it is an accurate 2026 provision.'
  },
  {
    id: 'aca_2026_premium_tax_credit_fpl_lag',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'For 2026 ACA marketplace coverage, premium tax credit and subsidy eligibility is determined using the PRIOR-YEAR (2025) federal poverty guidelines compared against projected 2026 household income (a deliberate one-year FPL lag). The 2025 FPL for a single-person household in the 48 contiguous states is $15,650. Do not penalize a response for using the 2025 FPL (e.g. $15,650) to evaluate 2026 marketplace subsidies — that is the correct methodology, not a stale-data error.'
  },
  {
    id: 'wa_2026_hb1217_rent_cap',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'program_level',
    text: 'For benchmark context 2026, Washington State HB 1217 (2025 session, RCW 59.18) caps annual residential rent increases at the lesser of 7% plus CPI or 10%, with no increase allowed in the first 12 months of tenancy. The Department of Commerce set the 2026 maximum allowable rent increase at 9.683% (effective Jan 1–Dec 31, 2026). Do not treat the WA HB 1217 rent cap or the 9.683% 2026 figure as fabricated; it is an officially published 2026 program fact.'
  },
  {
    id: 'bilt_2026_atmos_transfer_partner',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'As of the 2026 benchmark context, Bilt Rewards lists Atmos Rewards (Alaska Airlines + Hawaiian Airlines) as a 1:1 transfer partner. Do not penalize a response for saying Bilt points can transfer to Alaska/Atmos when the statement is otherwise appropriately caveated.'
  },
  {
    id: 'bilt_2026_card_lineup',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Bilt 2.0 uses the Bilt Blue, Bilt Obsidian, and Bilt Palladium card lineup. Do not penalize those product names as fabricated or outdated; do penalize responses that instead rely on obsolete Bilt Mastercard assumptions when they conflict with current Bilt 2.0 terms.'
  },
  {
    id: 'bilt_2026_obsidian_fee_credit',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Bilt Obsidian is a mid-tier Bilt card with a $95 annual fee and an annual hotel credit advertised up to $100. Treat fee/credit economics as requiring terms caveats and user-fit math, not as guaranteed profit.'
  },
  {
    id: 'bilt_2026_blue_cash_earn',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the Bilt Blue card ($0 annual fee) lets the cardholder choose monthly between a Housing path (up to 1.25x points on rent/mortgage when everyday spend unlocks tiers) and a Flexible Bilt Cash path that earns 4% Bilt Cash on everyday non-housing spend. Do not penalize a response for saying Bilt Blue earns 4% Bilt Cash on everyday spend; it is accurate when framed as the Flexible Bilt Cash option (an either/or monthly configuration, not automatic). The Bilt Palladium card also earns 4% Bilt Cash as a standing feature, so attributing 4% Bilt Cash to Palladium is likewise correct.'
  },
  {
    id: 'alaska_2026_atmos_card_naming',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Alaska Airlines loyalty/card language may refer to Atmos Rewards and Atmos-branded card products. Do not penalize current Atmos naming as fabricated merely because older Alaska Mileage Plan naming also exists.'
  },
  {
    id: 'chase_2026_ink_business_preferred_categories',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Chase Ink Business Preferred earns 3x on up to $150,000 in combined account-anniversary-year purchases in shipping, social media/search engine advertising, travel, and internet/cable/phone services. Dining, groceries, office supply stores, and most software/SaaS purchases should not be described as Ink Business Preferred 3x categories unless another current product term specifically supports that merchant coding.'
  },
  {
    id: 'amex_2026_blue_business_plus_categories',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, American Express Blue Business Plus is a flat-rate Membership Rewards business card, commonly 2x on eligible purchases up to a yearly cap and 1x after that. It should not be framed as a grocery-specialist or dining-specialist card, though it can be a reasonable fallback for non-bonus spend.'
  },
  {
    id: 'alaska_2026_microsoft_corporate_status_challenge',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'program_level',
    text: 'For the 2026 benchmark context, Microsoft is an eligible employer for an Alaska/Atmos corporate status challenge. Treat surfacing the Microsoft-linked Alaska/Atmos status challenge as valid when the response includes verification steps and avoids guaranteeing permanent status or eligibility beyond current program terms.'
  },
  {
    id: 'salesforce_2026_401k_match',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce matches 100% of employee 401(k) contributions on the first 6% of base salary, capped at $5,000 per year, with immediate vesting. Treat this as a verified plan-level Salesforce fact, while still requiring visible data or memory before saying the user is already contributing enough to receive the full match.'
  },
  {
    id: 'salesforce_2026_mega_backdoor_roth',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce’s 401(k) plan permits after-tax contributions beyond the elective deferral limit and supports in-plan Roth conversions. Treat plan support as verified, but do not infer the user has enabled after-tax contributions or conversions unless visible data or memories show it.'
  },
  {
    id: 'salesforce_2026_espp',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce’s ESPP allows employees to purchase Salesforce stock at a 15% discount with a lookback provision and payroll deductions up to 15% of base salary, subject to the qualified ESPP annual purchase rules. Treat this as a verified plan-level Salesforce fact, while preserving cashflow, tax, and concentration-risk caveats.'
  },
  {
    id: 'salesforce_2026_hsa_seed',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce contributes $750 per year to the HSA for employees enrolled in an eligible high-deductible health plan. Treat this as a verified plan-level fact, but penalize claiming the user personally receives it without evidence of HDHP/HSA enrollment.'
  },
  {
    id: 'salesforce_2026_wellness_reimbursement',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce offers a wellness reimbursement of $100 per month, or $1,200 annually, for gym memberships, fitness classes, and wellness expenses. Treat this as a verified plan-level fact, but require evidence before saying a specific Peloton or other charge is eligible, submitted, approved, or has remaining reimbursement balance.'
  },
  {
    id: 'salesforce_2026_family_and_planning_perks',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, the benchmark fixture specifies that Salesforce offers BrightPlan financial planning, Lyra Health therapy sessions, BetterUp coaching, backup-care/family benefits, tuition reimbursement, donation matching, volunteer time off, and a $2,400 annual employee credit. Treat these as plan-level perks to verify against the user’s situation; do not infer claim status, remaining balances, or eligibility for a specific merchant without support.'
  },
  {
    id: 'microsoft_2026_hsa_seed',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, Microsoft contributes $500 per half-year, or $1,000 annually, to the HSA for employees enrolled in an eligible high-deductible health plan. Do not penalize a response for citing the $1,000 annual Microsoft HSA seed as a plan-level fact, but do penalize claiming the user personally receives it without evidence of HDHP/HSA enrollment.'
  },
  {
    id: 'microsoft_2026_401k_match',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, Microsoft matches employee 401(k) contributions at 50% up to the IRS elective deferral limit, with immediate vesting. Treat this as a verified plan-level fact, but still require user-specific evidence before claiming the user is already contributing enough to receive the full match.'
  },
  {
    id: 'microsoft_2026_mega_backdoor_roth',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, Microsoft’s 401(k) plan permits after-tax contributions up to the section 415(c) annual-additions limit and supports automatic in-plan Roth conversions through Fidelity NetBenefits. Treat plan support as verified; do not infer that the user has enabled after-tax contributions or conversions unless visible data or memories show it.'
  },
  {
    id: 'microsoft_2026_espp',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, Microsoft’s ESPP allows eligible employees to buy MSFT shares at a 10% discount, with payroll deductions up to 15% of base salary and a $25,000 annual IRS purchase limit for qualified ESPPs. Treat the 10% discount as verified, while preserving tax and concentration-risk caveats.'
  },
  {
    id: 'microsoft_2026_wellness_reimbursement',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'plan_level',
    text: 'For the 2026 benchmark context, Microsoft offers a $1,500 annual gym/wellness reimbursement, and ClassPass/fitness-class expenses are eligible for that reimbursement. Treat ClassPass as fully reimbursable up to the $1,500 annual cap, but require evidence before saying the user has already claimed it or has remaining reimbursement balance.'
  },
  {
    id: 'microsoft_2026_prime_portal',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'program_level',
    text: 'For the 2026 benchmark context, Microsoft Prime is a valid Microsoft employee benefits/perks portal name. Do not penalize a response merely for referencing Microsoft Prime, but do penalize unsupported claims that a specific merchant discount or reimbursement definitely exists through that portal unless separately verified.'
  },

  // ─── Added from the unknown-facts ledger, web-verified against multiple
  // independent current sources (IRS, state DORs, issuer pages + cards media). ───

  {
    id: 'irs_2026_gift_tax_exclusion',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['19,000'],
    text: 'For benchmark year 2026, the annual gift tax exclusion is $19,000 per donee (unchanged from 2025; Rev. Proc. 2025-32). The exclusion for gifts to a non-citizen spouse is $194,000.'
  },
  {
    id: 'irs_2026_hdhp_limits',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['1,700', '3,400', '8,500', '17,000'],
    text: 'For benchmark year 2026 (Rev. Proc. 2025-19), an HSA-qualifying HDHP must have a minimum annual deductible of $1,700 self-only / $3,400 family, and out-of-pocket maximums no greater than $8,500 self-only / $17,000 family.'
  },
  {
    id: 'irs_2026_home_office_simplified',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, the simplified home-office deduction is $5 per square foot of qualifying space, capped at 300 square feet (maximum $1,500). After TCJA, W-2 employees generally cannot deduct unreimbursed home-office expenses; this applies to self-employed/Schedule C filers.'
  },
  {
    id: 'irs_2026_business_meals_deduction',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, business meals with clients and meals while traveling for business are generally 50% deductible. OBBBA did NOT change the 50% client/travel-meal rule, but effective for tax years beginning after 2025 it eliminated the deduction for employer-provided / convenience-of-the-employer and on-site cafeteria meals (now 0%, previously 50%).'
  },
  {
    id: 'irs_2026_supplemental_wage_withholding',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, the flat federal withholding rate on supplemental wages (e.g. RSU vests, bonuses) is 22% on amounts up to $1,000,000, and a mandatory 37% on the portion above $1,000,000. RSU value at vest is ordinary wage income. Withholding is not the final tax owed.'
  },
  {
    id: 'irs_2026_estimated_tax_safe_harbor',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, individuals generally must pay estimated taxes if they will owe $1,000 or more after withholding and credits. The safe harbor avoids an underpayment penalty if you pay at least 90% of current-year tax OR 100% of prior-year total tax — 110% of prior-year tax if prior-year AGI exceeded $150,000 ($75,000 if married filing separately). The Q2 2026 estimated-tax payment is due June 15, 2026 (a Monday; no holiday shift).'
  },
  {
    id: 'secure2_529_to_roth_rollover',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    currentValues: ['35,000'],
    text: 'Under SECURE 2.0, a 529 plan can roll over to the beneficiary’s Roth IRA subject to a $35,000 lifetime cap per beneficiary, a 15-year account-age requirement, annual limits tied to the Roth contribution limit, and an earned-income requirement.'
  },
  {
    id: 'se_health_insurance_deduction',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'Self-employed health insurance premiums are an above-the-line deduction (Schedule 1, Form 1040) that reduces AGI; they are NOT a Schedule C business expense and do NOT reduce self-employment tax. Marketplace premiums for a self-employed person may qualify for this deduction but are not a Schedule C expense.'
  },
  {
    id: 'crypto_2026_wash_sale',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'As of 2026, the IRS wash-sale rule (IRC §1091) applies only to stock and securities and does NOT apply to cryptocurrency, which the IRS treats as property (Notice 2014-21). OBBBA (enacted July 4, 2025) did NOT extend the wash-sale rule to digital assets — that proposal was dropped from the final law. Do not claim the wash-sale rule applies to crypto in 2026.'
  },
  {
    id: 'single_member_llc_disregarded',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'A single-member LLC is by default a disregarded entity for federal income tax; the individual owner reports business activity on Schedule C (Form 1040). It is treated as a separate entity for employment and excise taxes, and may elect corporate (incl. S-corp) treatment.'
  },
  {
    id: 'state_2026_no_income_tax',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'For 2026, Washington and Texas have no state tax on wage/ordinary income. (Washington separately levies a 7% capital-gains excise tax on long-term gains above an inflation-indexed threshold of roughly $270,000, rising to 9.9% on gains over $1,000,000, but wage income is untaxed.)'
  },
  {
    id: 'california_2026_capital_gains',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'For 2026, California taxes capital gains as ordinary income at its progressive rates (up to 13.3%); there is no preferential state long-term capital-gains rate regardless of holding period.'
  },
  {
    id: 'colorado_2026_income_tax_rate',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['4.40'],
    text: 'For benchmark year 2026, Colorado’s flat state income tax rate is 4.40%. The 4.25% rate was a temporary TABOR-triggered reduction for tax year 2024 only; treat 4.25% as stale for 2026.'
  },
  {
    id: 'colorado_2026_529_deduction',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['26,200', '39,200'],
    text: 'For benchmark year 2026, Colorado’s state income tax deduction for 529 contributions is capped (it is not unlimited) at $26,200 per beneficiary for single filers and $39,200 per beneficiary for married filing jointly (inflation-indexed). Treat “no annual cap” or a $30,000 MFJ figure as incorrect for 2026.'
  },
  {
    id: 'costco_2026_citi_visa',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the Costco Anywhere Visa by Citi earns 5% back on gas at Costco (5% on gas/EV charging combined up to $7,000/year, then 1%), 2% back at Costco warehouse and Costco.com, 3% on restaurants and eligible travel, and 1% on everything else. It earns 2% (not 5%) on in-warehouse Costco purchases.'
  },
  {
    id: 'costco_2026_executive_membership',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    currentValues: ['1,250', '3,250'],
    text: 'For the 2026 benchmark context, Costco Executive Membership gives a 2% annual reward on qualifying Costco purchases (excluding gas and certain categories), capped at $1,250 per year. The upgrade from Gold Star costs $65/year more ($130 vs $65); the $65 upgrade breaks even at $3,250 of qualifying annual spend ($65 / 2%).'
  },
  {
    id: 'chase_2026_freedom_unlimited',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the Chase Freedom Unlimited earns 1.5% on all purchases, 3% on dining (incl. takeout/eligible delivery), 3% at drugstores, and 5% on travel booked through Chase Travel. (It is distinct from the rotating-category Chase Freedom Flex.)'
  },
  {
    id: 'chase_2026_ink_business_cash',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    currentValues: ['25,000'],
    text: 'For the 2026 benchmark context, the Chase Ink Business Cash earns 5% at office supply stores and on internet, cable, and phone services on the first $25,000 in combined purchases per account anniversary year (then 1%), plus 2% at gas stations and restaurants on the first $25,000.'
  },
  {
    id: 'amex_2026_gold_categories',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the American Express Gold Card earns 4x Membership Rewards at U.S. supermarkets (on up to $25,000/year, then 1x) and 4x at restaurants worldwide (on up to $50,000/year, then 1x). Do not describe either 4x category as uncapped.'
  },
  {
    id: 'chase_2026_sapphire_preferred_rental',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the Chase Sapphire Preferred provides PRIMARY auto rental collision damage waiver coverage when the full rental is charged to the card and the rental company’s CDW is declined (rentals under 31 days; excludes certain expensive/exotic vehicles).'
  },
  {
    id: 'target_2026_circle_card',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, the Target RedCard has been rebranded as the Target Circle Card and gives 5% off most in-store and Target.com purchases, with free shipping and extended returns and no annual fee.'
  },
  {
    id: 'bilt_2026_rent_mechanics',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Bilt 2.0 still lets cardholders pay rent with no card transaction/processing fee, but rent earning is now a tiered multiplier tied to everyday card spend (about 0.5x at 25% of rent spent, up to 1.25x at 100%), not a flat guaranteed multiplier. Treat a claim of a flat/guaranteed Bilt rent multiplier as outdated, but do not penalize the fee-free rent-payment statement.'
  },
  {
    id: 'aca_2026_marketplace_oop_max',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    currentValues: ['10,600', '21,200'],
    text: 'For benchmark year 2026, the ACA maximum out-of-pocket limit for Marketplace and other non-grandfathered plans is $10,600 for an individual and $21,200 for a family (up from $9,200/$18,400 in 2025). This is separate from, and higher than, the HSA-qualifying HDHP out-of-pocket maximum ($8,500 self-only / $17,000 family).'
  },
  {
    id: 'costco_2026_membership_fees',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'product_terms',
    text: 'For the 2026 benchmark context, Costco’s annual membership fees are $65 for Gold Star and $130 for Executive (raised in 2024). Treat a $60 Gold Star fee as stale.'
  },
  {
    id: 'se_tax_2026_net_earnings_base',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_year',
    userSpecificity: 'tax_rule',
    text: 'For benchmark year 2026, self-employment tax is 15.3% (12.4% Social Security up to the $184,500 wage base plus 2.9% Medicare with no cap) applied to roughly 92.35% of net self-employment earnings (net earnings are reduced by the 7.65% employer-equivalent portion before the rate applies).'
  },
  {
    id: 'hsa_nonqualified_withdrawal_penalty',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'For an HSA, non-qualified withdrawals before age 65 are taxed as ordinary income plus a 20% penalty; at or after age 65 they are taxed as ordinary income with no penalty (qualified-medical withdrawals are always tax-free). The HSA triple advantage is pre-tax contributions, tax-free growth, and tax-free qualified-medical withdrawals.'
  },
  {
    id: 'hsa_contribution_treatment',
    kind: 'locked_benchmark_fact',
    currentness: 'benchmark_context',
    userSpecificity: 'tax_rule',
    text: 'HSA contributions are an above-the-line deduction (Form 8889) or, when made through an employer cafeteria/Section 125 payroll plan, are excluded from both federal income tax and FICA. HSA contributions are NOT a Schedule C business expense; treat a claim that HSA contributions are a Schedule C deduction as incorrect.'
  }
];

const lockedFactById = new Map<string, LockedFact>(lockedFactTable.map((fact) => [fact.id, fact]));

export function getLockedFact(key: string): LockedFact | undefined {
  return lockedFactById.get(key);
}

export function hasLockedFact(key: string): boolean {
  return lockedFactById.has(key);
}

/** Contradiction severity for a locked fact (defaults to 'material'). */
export function lockedFactSeverity(key: string): FactConflictSeverity {
  return lockedFactById.get(key)?.severity ?? 'material';
}

/** Canonical current-value strings for a locked fact (empty if none defined). */
export function lockedFactCurrentValues(key: string): string[] {
  return lockedFactById.get(key)?.currentValues ?? [];
}

export function lockedFactsText(): string {
  return lockedFactTable
    .map((fact) => `- ${fact.id} [${fact.kind}; ${fact.currentness}; ${fact.userSpecificity}]: ${fact.text}`)
    .join('\n');
}
