import type { Opportunity } from '../schema';

export const opportunities: Opportunity[] = [
  {
    id: 'rent_seattle_mfte',
    domain: 'housing_rent',
    title: 'Seattle MFTE/MHA rent reduction',
    sourceArticles: [
      'benchmark-reference/home-buying/mfte-seattle-eligibility-tech-worker.md',
      'benchmark-reference/home-buying/seattle-mha-vs-mfte-comparison.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_rent_2026_05', description: '$2,350 Seattle rent payment' },
      { kind: 'memory', id: 'mem_location_household', description: 'Seattle, household size 1' },
      { kind: 'transaction', id: 'txn_payroll_2026_05_15', description: 'Payroll note implies $2,500 semi-monthly gross base pay, or $60,000 annual base' },
      { kind: 'external_knowledge', id: 'kb_mfte', description: 'Seattle MFTE/MHA income and rent-capped housing programs' }
    ],
    expectedAction:
      'Identify MFTE/MHA as a high-leverage rent-saving path, estimate monthly/annual savings against current rent, and give eligibility verification steps.',
    eligibilityCaveats: [
      'Use gross income and household size, not take-home pay.',
      'Eligibility depends on current AMI tables, building participation, unit size, and availability.',
      'Do not guarantee eligibility without verifying current Seattle limits and property-specific rules.'
    ],
    valueModel: 'current monthly rent minus plausible MFTE/MHA 1-bedroom capped rent; report as a range if current caps are unknown.',
    tiers: {
      basic: ['Suggest cheaper neighborhoods, roommates, rent negotiation, or lease timing.'],
      personalized: ['Use Maria’s $2,350 rent, Seattle location, $60,000 income, and household size.'],
      advanced: ['Surface MFTE/MHA as the specific local rent-saving program.'],
      expert: ['Estimate savings, cite eligibility caveats, identify search/application steps, and rank it above low-dollar rent tips.']
    }
  },
  {
    id: 'card_bilt_rent',
    domain: 'credit_cards_rewards',
    title: 'Earn rent rewards without card fees',
    sourceArticles: [
      'benchmark-reference/credit-card-profiles-and-optimization/bilt-blue-profile.md',
      'benchmark-reference/credit-card-profiles-and-optimization/best-cards-rent.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_rent_2026_05', description: 'Recurring $2,350 rent paid from checking' },
      { kind: 'account', id: 'acct_csp', description: 'Only linked credit-card account is Chase Sapphire Preferred' }
    ],
    expectedAction:
      'Recommend evaluating Bilt Blue/Obsidian/Palladium or another no-transaction-fee rent rewards route and quantify annual points on $28,200 rent.',
    eligibilityCaveats: ['Mention rent day/transaction requirements if applicable.', 'Use current Bilt 2.0 terms rather than obsolete Bilt Mastercard assumptions.', 'Do not recommend paying card fees that exceed rewards value.'],
    valueModel: 'annual rent x point earn rate x conservative cents-per-point value, net of fees.',
    tiers: {
      basic: ['Say rent is a large recurring expense worth optimizing.'],
      personalized: ['Calculate annual rent from Maria’s transactions.'],
      advanced: ['Identify current Bilt/no-fee rent rewards specifically.'],
      expert: ['Quantify annual value, warn about processing fees, and explain when it is or is not worth applying.']
    }
  },
  {
    id: 'card_costco_citi_executive',
    domain: 'credit_cards_rewards',
    title: 'Costco card and Executive Membership math',
    sourceArticles: [
      'benchmark-reference/credit-card-profiles-and-optimization/costco-citi-card-profile.md',
      'benchmark-reference/tips-and-tricks/costco-hidden-services.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_costco_2026_05_04', description: 'Costco warehouse spend' },
      { kind: 'transaction', id: 'txn_costco_gas_2026_05_21', description: 'Costco gas spend' },
      { kind: 'account', id: 'acct_csp', description: 'Costco spend is charged to Chase Sapphire Preferred' }
    ],
    expectedAction:
      'Evaluate Costco-specific card and Executive Membership incrementally, separating warehouse, gas, annual-fee math, and the observed-period scope.',
    eligibilityCaveats: ['Costco warehouse purchases often code differently than grocery stores.', 'Executive Membership only pays if incremental 2% rewards exceed upgrade cost.', 'If Costco spend is concentrated in one month, label annualization as a scenario rather than a stable run-rate.'],
    valueModel: 'observed Costco warehouse/gas spend by period, plus an explicitly labeled annualized-if-typical or trailing-average scenario x incremental reward rate, less fees or upgrade cost.',
    tiers: {
      basic: ['Say Costco spend may be optimized with a Costco card.'],
      personalized: ['Use Maria’s Costco and Costco Gas transactions.'],
      advanced: ['Distinguish warehouse category coding from groceries and evaluate Executive Membership breakeven.'],
      expert: ['Compute incremental value versus CSP, separate gas from warehouse spend, show breakeven, and avoid recommending upgrades below breakeven unless a clearly labeled scenario clears it.']
    }
  },
  {
    id: 'card_csp_category_routing',
    domain: 'credit_cards_rewards',
    title: 'Route spending by category instead of one-card default',
    sourceArticles: [
      'benchmark-reference/credit-card-profiles-and-optimization/chase-sapphire-preferred-profile.md',
      'benchmark-reference/credit-card-profiles-and-optimization/category-coding-guide.md',
      'benchmark-reference/credit-card-profiles-and-optimization/best-no-fee-card-lineup.md'
    ],
    requiredSignals: [
      { kind: 'account', id: 'acct_csp', description: 'Chase Sapphire Preferred is the linked credit-card account' },
      { kind: 'transaction', id: 'txn_safeway_2026_05_10', description: 'Grocery spend' },
      { kind: 'transaction', id: 'txn_dining_2026_05_08', description: 'Dining spend' },
      { kind: 'transaction', id: 'txn_comcast_2026_05', description: 'Utilities/internet spend' }
    ],
    expectedAction:
      'Recommend a category routing map for dining, travel, groceries, Costco, rent, and utilities, with incremental annual value.',
    eligibilityCaveats: ['Do not overvalue points without stating valuation assumptions.', 'Mention simplicity tradeoff and annual fees.'],
    valueModel: 'annualized category spend x incremental earning rate x point/cash value.',
    tiers: {
      basic: ['Suggest using different cards for different categories.'],
      personalized: ['Map Maria’s actual merchants/categories.'],
      advanced: ['Identify gaps in rent, Costco/warehouse, flat-rate, and grocery coverage.'],
      expert: ['Produce a clear wallet strategy with estimated annual upside and a low-complexity fallback.']
    }
  },
  {
    id: 'msft_alaska_status',
    domain: 'employer_benefits_perks',
    title: 'Microsoft-linked Alaska status opportunity',
    sourceArticles: [
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md',
      'benchmark-reference/tips-and-tricks/alaska-status-hacks.md',
      'benchmark-reference/tips-and-tricks/alaska-credit-cards.md'
    ],
    requiredSignals: [
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee' },
      { kind: 'transaction', id: 'txn_alaska_2026_04_12', description: 'Second recent Alaska SEA-SFO travel transaction' },
      { kind: 'transaction', id: 'txn_alaska_2026_05_06', description: 'Alaska Airlines transaction' }
    ],
    expectedAction:
      'Surface Alaska status challenge/corporate travel perks if current Microsoft/Alaska programs support it, and give verification steps.',
    eligibilityCaveats: ['The Microsoft-linked Alaska/Atmos corporate status challenge is a valid benchmark fact, but program availability, tier, and activity requirements still need verification.', 'Do not fabricate a guaranteed permanent status benefit.'],
    valueModel: 'expected travel benefit value from free bags, upgrades, priority, and mileage bonuses based on flight frequency.',
    tiers: {
      basic: ['Mention loyalty programs for frequent flights.'],
      personalized: ['Use Microsoft, Seattle, and Alaska transactions.'],
      advanced: ['Connect Microsoft-specific Alaska/Atmos status challenge knowledge to the flight pattern.'],
      expert: ['Explain exact verification path and value the benefit conservatively without overclaiming.']
    }
  },
  {
    id: 'rental_car_msft_csp',
    domain: 'employer_benefits_perks',
    title: 'Rental car corporate discount and card coverage stack',
    sourceArticles: [
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md',
      'benchmark-reference/tips-and-tricks/rental-car-hidden-fees.md',
      'benchmark-reference/tips-and-tricks/rental-car-savings.md',
      'benchmark-reference/credit-card-profiles-and-optimization/chase-sapphire-preferred-profile.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_avis_2026_05_07', description: 'Avis rental car charge' },
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee' },
      { kind: 'account', id: 'acct_csp', description: 'Chase Sapphire Preferred cardholder' }
    ],
    expectedAction:
      'Check Microsoft corporate rental rates and Sapphire Preferred rental coverage, while warning about coverage terms and fees.',
    eligibilityCaveats: ['Primary/secondary rental coverage depends on trip purpose, location, vehicle type, and card terms.', 'Corporate codes must be used only when eligible.'],
    valueModel: 'compare rental base rate/fees with corporate discount and avoidable insurance add-ons.',
    tiers: {
      basic: ['Suggest comparing rental car prices.'],
      personalized: ['Use the Avis transaction, Microsoft employer, and CSP card.'],
      advanced: ['Connect employer discount with credit-card rental coverage and hidden-fee avoidance.'],
      expert: ['Give a booking checklist and quantify savings from discount plus avoided duplicate coverage.']
    }
  },
  {
    id: 'cash_idle_hysa_tbills',
    domain: 'cashflow_budgeting',
    title: 'Move idle cash into a tiered cash system',
    sourceArticles: [
      'benchmark-reference/banking/cash-management-strategy.md',
      'benchmark-reference/banking/high-yield-savings.md',
      'benchmark-reference/banking/t-bills-money-markets.md'
    ],
    requiredSignals: [
      { kind: 'account', id: 'acct_chase_checking', description: '$18,450 in checking' },
      { kind: 'account', id: 'acct_ally_savings', description: '$5,250 in HYSA' },
      { kind: 'transaction', id: 'txn_rent_2026_05', description: 'Monthly rent anchors emergency fund need' }
    ],
    expectedAction:
      'Separate bill-pay cash, emergency fund, and excess cash; move idle checking cash to HYSA/T-bills/MMF after keeping adequate liquidity.',
    eligibilityCaveats: ['Do not invest emergency cash in volatile assets.', 'Mention liquidity, FDIC/SIPC, state tax, and settlement timing caveats.'],
    valueModel: 'idle cash above bill buffer x yield spread vs checking.',
    tiers: {
      basic: ['Suggest using a high-yield savings account.'],
      personalized: ['Use actual checking/savings balances and monthly burn.'],
      advanced: ['Build a tiered cash policy with bill buffer, emergency fund, and excess cash.'],
      expert: ['Quantify yield pickup, define transfer amount, and prioritize against other opportunities.']
    }
  },
  {
    id: 'credit_card_autopay_interest_check',
    domain: 'debt_credit_health',
    title: 'Credit-card balance, autopay, and interest-risk check',
    sourceArticles: [
      'benchmark-reference/debt/credit-card-payoff.md',
      'benchmark-reference/debt/credit-utilization-myth.md',
      'benchmark-reference/financial-concepts/power-of-automation.md'
    ],
    requiredSignals: [
      { kind: 'account', id: 'acct_csp', description: 'Chase Sapphire Preferred shows a $1,840 current balance and $8,160 available balance' },
      { kind: 'account', id: 'acct_chase_checking', description: '$18,450 checking balance means cash is available if the card balance is revolving' }
    ],
    expectedAction:
      'Treat the linked card balance as a verification task: confirm whether it is normal statement float or revolving debt, set full-statement autopay if not already enabled, and pay revolving high-interest balances before lower-priority investments.',
    eligibilityCaveats: [
      'A current card balance is not proof of revolving debt.',
      'Do not recommend balance-transfer or aggressive payoff tactics unless interest-bearing debt is confirmed.',
      'Credit utilization guidance should not distract from avoiding interest.'
    ],
    valueModel: 'avoidable credit-card APR and late-payment risk if the balance is revolving, plus credit-health protection from full-statement autopay.',
    tiers: {
      basic: ['Say credit-card interest should be avoided.'],
      personalized: ['Use Maria’s $1,840 Sapphire Preferred balance and available cash.'],
      advanced: ['Distinguish statement float from revolving debt and recommend full-statement autopay verification.'],
      expert: ['Sequence confirmed high-interest payoff ahead of investing while avoiding unsupported assumptions that she is carrying debt.']
    }
  },
  {
    id: 'retirement_401k_match_gap',
    domain: 'retirement_tax_advantaged',
    title: 'Increase 401(k) enough to avoid leaving match/tax sheltering unused',
    sourceArticles: [
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md',
      'benchmark-reference/retirement/employer-match-optimization.md',
      'benchmark-reference/retirement/contribution-order.md'
    ],
    requiredSignals: [
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee' },
      { kind: 'transaction', id: 'txn_401k_employee_deferral_2026_05_15', description: '401(k) contribution row shows $200 from 8% of $2,500 semi-monthly gross pay' },
      { kind: 'transaction', id: 'txn_payroll_2026_05_15', description: 'Payroll note implies $60,000 annual base pay' }
    ],
    expectedAction:
      'Calculate current 401(k) contribution, compare against match and annual limit context, and recommend next contribution increase if cashflow supports it.',
    eligibilityCaveats: ['Confirm Microsoft plan match and current IRS employee limit.', 'Do not ignore cash buffer and high-interest debt.'],
    valueModel: 'free match captured plus tax-deferred contribution value, bounded by current contribution room and cashflow.',
    tiers: {
      basic: ['Say contribute enough to get the employer match.'],
      personalized: ['Use salary and current 8% contribution.'],
      advanced: ['Connect Microsoft match/plan details and IRS contribution limits.'],
      expert: ['Quantify current dollars, gap, paycheck impact, tax effect, and action order.']
    }
  },
  {
    id: 'retirement_mega_backdoor_roth',
    domain: 'retirement_tax_advantaged',
    title: 'Evaluate mega backdoor Roth from Microsoft plan context',
    sourceArticles: [
      'benchmark-reference/retirement/mega-backdoor-roth.md',
      'benchmark-reference/retirement/after-tax-401k.md',
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md'
    ],
    requiredSignals: [
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee' },
      { kind: 'account', id: 'acct_msft_401k', description: 'Microsoft 401(k) account is linked' },
      { kind: 'transaction', id: 'txn_401k_employee_deferral_2026_05_15', description: 'History shows regular employee deferrals but no visible after-tax 401(k) contribution rows' },
      { kind: 'account', id: 'acct_chase_checking', description: 'Cash surplus exists' }
    ],
    expectedAction:
      'Explain whether mega backdoor Roth is available/appropriate after match, emergency fund, and near-term needs, then estimate 415(c) room.',
    eligibilityCaveats: ['Requires plan support for after-tax contributions and in-plan Roth conversion or in-service distribution.', 'Confirm current total defined contribution limit.'],
    valueModel: 'remaining total 401(k) limit minus employee, employer, and after-tax contributions; value is long-term tax-free growth, not immediate cash savings.',
    tiers: {
      basic: ['Define mega backdoor Roth.'],
      personalized: ['Use Microsoft plan context and Maria’s current retirement/cash picture.'],
      advanced: ['Calculate approximate 415(c) room and sequencing after match/HSA/backdoor Roth.'],
      expert: ['Handle eligibility, contribution ordering, cashflow constraints, and exact plan verification steps.']
    }
  },
  {
    id: 'tax_backdoor_roth',
    domain: 'tax_strategy',
    title: 'Backdoor Roth decision with pro-rata caveat',
    sourceArticles: [
      'benchmark-reference/retirement/backdoor-roth.md',
      'benchmark-reference/retirement/pro-rata-rule.md',
      'benchmark-reference/retirement/ira-basics.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_payroll_2026_05_15', description: 'Payroll note implies $60,000 annual base pay' },
      { kind: 'account', id: 'acct_traditional_ira', description: 'Traditional IRA account balance is $0' }
    ],
    expectedAction:
      'Answer whether direct Roth IRA or backdoor Roth is appropriate based on MAGI, and mention pro-rata rule if using backdoor.',
    eligibilityCaveats: ['Use current-year Roth IRA income limits.', 'Check all pre-tax IRA/SIMPLE/SEP balances before recommending backdoor Roth.'],
    valueModel: 'tax-free retirement account contribution value; not an immediate deduction.',
    tiers: {
      basic: ['Explain Roth IRA vs backdoor Roth.'],
      personalized: ['Use Maria’s income and no-IRA-balance memory.'],
      advanced: ['Select direct Roth vs backdoor based on MAGI and phaseout.'],
      expert: ['Cite current limits, pro-rata caveat, timing steps, and how stock/freelance income may affect MAGI.']
    }
  },
  {
    id: 'tax_hsa_triple_advantage',
    domain: 'tax_strategy',
    title: 'HSA triple-tax advantage if health plan eligible',
    sourceArticles: [
      'benchmark-reference/tax-strategies/hsa-triple-advantage.md',
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md'
    ],
    requiredSignals: [
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft benefits context is present; no linked HSA account appears in accounts list' },
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee benefits context' }
    ],
    expectedAction:
      'Recommend checking HDHP/HSA eligibility and employer seed, then explain payroll HSA priority if eligible.',
    eligibilityCaveats: ['Only HDHP-eligible users can contribute.', 'Contribution limits and employer seed vary by year and plan.'],
    valueModel: 'federal/state/payroll tax savings plus long-term tax-free medical growth; subtract employer seed already included.',
    tiers: {
      basic: ['Say HSAs can be tax advantaged.'],
      personalized: ['Use no-HSA account and Microsoft benefits context.'],
      advanced: ['Flag HDHP eligibility and employer seed/contribution ordering.'],
      expert: ['Quantify max contribution/tax savings if eligible and avoid recommending contributions if ineligible.']
    }
  },
  {
    id: 'equity_msft_concentration',
    domain: 'investing_equity_comp',
    title: 'Handle a Microsoft RSU vest tax-aware and concentration-aware',
    sourceArticles: [
      'benchmark-reference/equity-compensation/concentration-risk.md',
      'benchmark-reference/equity-compensation/espp-basics.md',
      'benchmark-reference/tax-strategies/rsu-taxation.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_msft_rsu_vest_2026_05', description: '$42,000 Microsoft RSU vest appears in uploaded transactions' },
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employment income already tied to same company' },
      { kind: 'account', id: 'acct_robinhood', description: '$62,300 taxable brokerage balance provides context for where the vest landed' }
    ],
    expectedAction:
      'Identify the RSU vest, explain that vesting is usually taxable compensation, and recommend a concentration-aware sell/hold plan if the shares are still held.',
    eligibilityCaveats: ['Consider tax lots, capital gains, trading windows, and insider restrictions.', 'Do not give individualized security recommendations beyond diversification education.'],
    valueModel: 'risk reduction, tax withholding/reserve planning, and concentration policy; potential tax cost depends on whether shares were sold and the user’s lots.',
    tiers: {
      basic: ['Say RSUs can create employer-stock concentration.'],
      personalized: ['Use the $42,000 Microsoft RSU vest, Microsoft employment, and Robinhood brokerage context.'],
      advanced: ['Connect human capital, taxable vesting, withholding, and diversification mechanics.'],
      expert: ['Recommend a concrete tax-aware action plan with sell/hold criteria, reserve check, trading-window caveats, and uncertainty if shares are no longer held.']
    }
  },
  {
    id: 'insurance_disability_gap',
    domain: 'insurance_risk_protection',
    title: 'Prioritize disability insurance over life insurance',
    sourceArticles: [
      'benchmark-reference/insurance/disability-insurance.md',
      'benchmark-reference/insurance/life-insurance-basics.md',
      'benchmark-reference/insurance/umbrella-insurance.md'
    ],
    requiredSignals: [
      { kind: 'memory', id: 'mem_location_household', description: 'Lives alone in Seattle' },
      { kind: 'transaction', id: 'txn_payroll_2026_05_15', description: 'Payroll note implies $60,000 salary' }
    ],
    expectedAction:
      'Recommend checking employer long-term disability and possibly supplemental disability; deprioritize life insurance without dependents.',
    eligibilityCaveats: ['Employer LTD may be taxable if employer-paid.', 'Umbrella insurance needs underlying auto/renters coverage and asset/liability profile.'],
    valueModel: 'protected monthly income replacement; compare benefit percentage to required expenses.',
    tiers: {
      basic: ['Mention insurance review.'],
      personalized: ['Use single/no-dependents and income dependency.'],
      advanced: ['Prioritize disability over life insurance and identify employer LTD review.'],
      expert: ['Quantify income replacement gap and explain taxability, elimination periods, and next steps.']
    }
  },
  {
    id: 'side_income_estimated_taxes',
    domain: 'tax_strategy',
    title: 'Freelance income estimated tax and business expense setup',
    sourceArticles: [
      'benchmark-reference/career-finance/side-income-strategy.md',
      'benchmark-reference/tax-strategies/side-income-tax-planning.md',
      'benchmark-reference/tax-strategies/estimated-tax-payments.md',
      'benchmark-reference/tips-and-tricks/gig-worker-deductions.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_freelance_2026_05', description: '$1,200 freelance deposit' },
      { kind: 'transaction', id: 'txn_freelance_2026_05', description: 'Freelance income deposit; no tax-payment transaction appears in imported history' }
    ],
    expectedAction:
      'Flag self-employment tax, estimated payments, expense tracking, and retirement options if side income becomes consistent.',
    eligibilityCaveats: ['Quarterly estimates depend on full-year income, withholding, safe harbor, and net profit.', 'Do not assume all personal expenses are deductible.'],
    valueModel: 'avoid underpayment penalties and capture legitimate deductions/retirement sheltering on net self-employment income.',
    tiers: {
      basic: ['Say set aside taxes for freelance income.'],
      personalized: ['Use the $1,200 freelance transaction and absence of tax payments.'],
      advanced: ['Mention SE tax, quarterly estimates, expense separation, and Schedule C.'],
      expert: ['Compute a conservative reserve range, safe-harbor check, and next bookkeeping/tax actions.']
    }
  },
  {
    id: 'subscription_fitness_employer_reimbursement',
    domain: 'savings_expense_reduction',
    title: 'Fitness/subscription review with employer reimbursement check',
    sourceArticles: [
      'benchmark-reference/employer-guides/microsoft-benefits-guide.md',
      'benchmark-reference/tips-and-tricks/unused-employer-benefits.md',
      'benchmark-reference/tips-and-tricks/hard-to-cancel-subscriptions.md'
    ],
    requiredSignals: [
      { kind: 'transaction', id: 'txn_classpass_2026_05', description: 'ClassPass subscription' },
      { kind: 'transaction', id: 'txn_adobe_2026_05', description: 'Adobe subscription' },
      { kind: 'memory', id: 'mem_employer', description: 'Microsoft employee benefits' }
    ],
    expectedAction:
      'Review recurring subscriptions and identify Microsoft fitness/wellness reimbursement for ClassPass plus possible professional-tool discounts before canceling useful services.',
    eligibilityCaveats: [
      'ClassPass is an eligible Microsoft wellness reimbursement expense in this benchmark, up to the annual cap.',
      'Do not claim Maria has already submitted receipts or has remaining reimbursement balance unless visible evidence shows it.',
      'Do not count reimbursement and cancellation savings together unless mutually exclusive.'
    ],
    valueModel: 'avoidable subscription cost plus eligible reimbursement value, avoiding double counting.',
    tiers: {
      basic: ['Suggest canceling unused subscriptions.'],
      personalized: ['Name actual subscriptions and Microsoft context.'],
      advanced: ['Check employer reimbursement before recommending cancellation.'],
      expert: ['Separate cancel/keep/reimburse decisions and quantify monthly/annual value.']
    }
  }
];
