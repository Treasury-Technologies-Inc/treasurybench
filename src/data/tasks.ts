import type { ScoreDimension, Task } from '../schema';

const dataRetrievalRubric: ScoreDimension[] = [
  {
    id: 'grounding',
    label: 'Grounding',
    points: 40,
    guidance:
      'Uses the visible transactions, balances, date range, categories, accounts, and memories correctly without inventing user data.'
  },
  {
    id: 'correctness',
    label: 'Correctness',
    points: 35,
    guidance:
      'Calculates totals, signs, category boundaries, and external facts accurately for the benchmark context.'
  },
  {
    id: 'resolution',
    label: 'Resolution',
    points: 20,
    guidance:
      'Answers the exact question with a useful breakdown, clear explanation, and no unnecessary detours.'
  },
  {
    id: 'prudence',
    label: 'Prudence',
    points: 5,
    guidance:
      'Flags material scope, classification, pending-data, or uncertainty caveats when they affect the answer.'
  }
];


const adviceRubric: ScoreDimension[] = [
  {
    id: 'grounding',
    label: 'Grounding',
    points: 25,
    guidance:
      'Links advice to the visible transactions, balances, memories, employer, location, accounts, and goals.'
  },
  {
    id: 'correctness',
    label: 'Correctness',
    points: 30,
    guidance:
      'Gets math, financial mechanics, tax limits, product/program facts, and eligibility facts right.'
  },
  {
    id: 'resolution',
    label: 'Resolution',
    points: 30,
    guidance:
      'Gives a clear answer, quantified impact where possible, and exact next steps instead of generic tips.'
  },
  {
    id: 'prudence',
    label: 'Prudence',
    points: 15,
    guidance:
      'Handles caveats, uncertainty, tradeoffs, reversibility, fees, participation/enrollment checks, and downside risk.'
  }
];

const discoveryRubric: ScoreDimension[] = [
  {
    id: 'grounding',
    label: 'Grounding',
    points: 25,
    guidance:
      'Finds and cites the relevant signals in transactions, balances, memories, employer context, location, or accounts.'
  },
  {
    id: 'correctness',
    label: 'Correctness',
    points: 25,
    guidance: 'Gets calculations, financial rules, current facts, and program mechanics right.'
  },
  {
    id: 'resolution',
    label: 'Resolution',
    points: 35,
    guidance:
      'Surfaces the high-value personalized opportunity, estimates impact, and gives exact next actions.'
  },
  {
    id: 'prudence',
    label: 'Prudence',
    points: 15,
    guidance:
      'Separates verified facts from assumptions, handles eligibility and participation caveats, and avoids unsafe overreach.'
  }
];

const planningRubric: ScoreDimension[] = [
  {
    id: 'grounding',
    label: 'Grounding',
    points: 20,
    guidance:
      'Bases the plan on the visible accounts, transactions, memories, cashflow, goals, and user constraints.'
  },
  {
    id: 'correctness',
    label: 'Correctness',
    points: 25,
    guidance:
      'Uses correct math, limits, product/program facts, tax mechanics, and financial sequencing.'
  },
  {
    id: 'resolution',
    label: 'Resolution',
    points: 30,
    guidance:
      'Makes a decision, prioritizes the next move, quantifies tradeoffs, and explains why that order fits the user.'
  },
  {
    id: 'prudence',
    label: 'Prudence',
    points: 25,
    guidance:
      'Explains certainty, downside, liquidity, tax risk, fees, eligibility, and when another reasonable order may be better.'
  }
];

const openCreditPolicy =
  'Give credit for unexpected recommendations only when they are factual, grounded in the user’s visible data or seeded context, materially relevant, conservatively valued, and actionable. Do not give full credit for generic advice when the planted data supports a higher-value personalized play.';

type NewTask = Omit<Task, 'opportunityIds' | 'scoreDimensions' | 'invalidOrHarmful' | 'openCreditPolicy' | 'deterministicChecks'> & {
  rubric?: ScoreDimension[];
  invalidOrHarmful?: string[];
  opportunityIds?: string[];
  deterministicChecks?: string[];
};

function newTask({
  rubric,
  invalidOrHarmful,
  opportunityIds,
  deterministicChecks,
  ...task
}: NewTask): Task {
  return {
    ...task,
    opportunityIds: opportunityIds ?? [],
    scoreDimensions: rubric ?? adviceRubric,
    invalidOrHarmful: invalidOrHarmful ?? [],
    openCreditPolicy,
    deterministicChecks: deterministicChecks ?? []
  };
}

const mariaTasks: Task[] = [
  {
    id: 'maria_spend_may_total',
    personaId: 'maria_seattle_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'How much did I spend in May 2026, and what were the biggest categories?',
    intent:
      'Test transaction querying, date scoping, signs, category grouping, and concise explanation.',
    opportunityIds: [],
    relevantSignalIds: [
      'txn_rent_2026_05',
      'txn_costco_2026_05_04',
      'txn_avis_2026_05_07',
      'txn_netflix_2026_05'
    ],
    scoreDimensions: dataRetrievalRubric,
    invalidOrHarmful: [
      'Includes income as spending.',
      'Mixes April rent/travel into May totals.',
      'Invents missing transaction categories.'
    ],
    openCreditPolicy,
    deterministicChecks: ['may_2026_spend_total', 'category_rollup', 'income_exclusion']
  },
  {
    id: 'maria_food_spend_may',
    personaId: 'maria_seattle_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt:
      'How much did I spend on food in May, including groceries, Costco food runs, and restaurants?',
    intent:
      'Test category/merchant interpretation where Costco may be grocery-like but not grocery-coded for rewards.',
    expectedAnswerNotes: [
      'This is a data-retrieval task, not a card strategy or Costco optimization task. Do not penalize an answer for omitting credit-card routing, Costco Executive breakeven math, or rewards advice unless it makes an incorrect rewards claim.',
      'Accept either $833.96 when Costco Gas is explicitly excluded as fuel, or $892.19 when the answer clearly labels the scope as food plus Costco Gas.',
      'The highest-quality answer separates budgeting category treatment from card-reward coding: Costco warehouse can be food-like for this query without being treated as supermarket/grocery reward coding.'
    ],
    opportunityIds: [],
    relevantSignalIds: [
      'txn_costco_2026_05_04',
      'txn_costco_2026_05_19',
      'txn_safeway_2026_05_10',
      'txn_dining_2026_05_08'
    ],
    scoreDimensions: dataRetrievalRubric,
    invalidOrHarmful: [
      'Treats Costco reward coding as supermarket coding.',
      'Drops dining or Costco without explaining scope.',
      'Uses the right total while giving an incorrect category interpretation.'
    ],
    openCreditPolicy,
    deterministicChecks: ['food_spend_total_may', 'merchant_category_boundary']
  },
  {
    id: 'maria_recurring_charges_audit',
    personaId: 'maria_seattle_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt:
      'Which May 2026 charges look recurring or subscription-like? Separate true subscriptions/fitness/software from recurring phone/internet utility bills, and give the monthly total for each bucket I should review. Exclude rent from both bucket totals; you can mention it separately if you notice it.',
    intent:
      'Test merchant detection for recurring charges without asking for broad savings advice.',
    expectedAnswerNotes: [
      'The intended subscription-like review set is Netflix $22.99, Adobe $59.99, and ClassPass $89.00, totaling $171.98.',
      'Xfinity $89.00 and AT&T Wireless $72.00 should be presented as recurring phone/internet utility bills totaling $161.00, not mixed into the true subscription/fitness/software bucket.',
      'Rent must not be included in either requested bucket total for this task, though it can be mentioned separately as an excluded recurring obligation.',
      'Do not infer Netflix or Adobe product tiers from price alone.'
    ],
    opportunityIds: ['subscription_fitness_employer_reimbursement'],
    relevantSignalIds: ['txn_netflix_2026_05', 'txn_adobe_2026_05', 'txn_classpass_2026_05'],
    scoreDimensions: dataRetrievalRubric,
    invalidOrHarmful: [
      'Invents subscription tiers from charge amounts.',
      'Includes rent, payroll, or one-time travel in either requested bucket total.',
      'Gives only one combined subscriptions-plus-utilities total after the prompt asks for separate buckets.',
      'Misses obvious Netflix, Adobe, or ClassPass recurring-like charges.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'recurring_charge_detection',
      'recurring_total_may',
      'maria_subscription_review_scope',
      'no_invalid_recurring_total_inclusions',
      'no_subscription_tier_fabrication'
    ]
  },
  {
    id: 'maria_where_wasting_money',
    personaId: 'maria_seattle_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt:
      'Based on my transactions and balances, identify up to 3 easy savings I can verify this week. For each one, cite the exact transaction or account signal and estimate the monthly or annual impact.',
    intent:
      'Test bounded easy-savings discovery with evidence citations across recurring charges, idle cash, rent, employer benefits, and rewards.',
    opportunityIds: [
      'subscription_fitness_employer_reimbursement',
      'rent_seattle_mfte',
      'cash_idle_hysa_tbills',
      'card_csp_category_routing'
    ],
    relevantSignalIds: [
      'txn_adobe_2026_05',
      'txn_classpass_2026_05',
      'acct_chase_checking',
      'txn_rent_2026_05'
    ],
    scoreDimensions: discoveryRubric,
    invalidOrHarmful: [
      'Only gives generic budgeting tips.',
      'Lists more than a few unfocused ideas instead of evidence-backed easy savings.',
      'Suggests canceling reimbursable benefits without checking employer context.',
      'Claims to see account or subscription details that are not in balances/transactions/memories.'
    ],
    openCreditPolicy,
    deterministicChecks: ['subscription_identification', 'idle_cash_amount', 'rent_amount']
  },
  {
    id: 'maria_save_on_rent',
    personaId: 'maria_seattle_v0',
    domain: 'housing_rent',
    type: 'insight_discovery',
    prompt:
      'My rent is $2,350/month in Seattle. Are there Seattle-specific programs, lease tactics, or payment strategies I should check before renewing? Show the eligibility/data checks and estimated savings.',
    intent:
      'Test whether the assistant finds Seattle rent-specific opportunities from natural language and grounds them in rent, income, household, and fee math.',
    expectedAnswerNotes: [
      'MFTE/MHA or similar Seattle income-restricted housing should be treated as a high-power local play, not guaranteed eligibility.',
      'A strong answer uses gross income, household size, current rent, building availability, current AMI/rent tables, and documentation steps before estimating savings.',
      'Rent rewards are secondary to local-program savings and must include no-fee or fee-vs-reward caveats.'
    ],
    opportunityIds: ['rent_seattle_mfte', 'card_bilt_rent'],
    relevantSignalIds: ['txn_rent_2026_05', 'mem_location_household', 'txn_payroll_2026_05_15'],
    scoreDimensions: discoveryRubric,
    invalidOrHarmful: [
      'Stops at cheaper-neighborhood advice.',
      'Does not separate local-program eligibility checks from negotiation/payment tactics.',
      'Guarantees MFTE eligibility without current AMI/building caveats.',
      'Uses take-home pay as gross income.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'rent_annualized',
      'income_household_location',
      'mfte_caveat_presence',
      'mfte_savings_estimate',
      'rent_exact_next_steps',
      'rent_secondary_rewards'
    ]
  },
  {
    id: 'maria_mfte_eligibility_check',
    personaId: 'maria_seattle_v0',
    domain: 'housing_rent',
    type: 'domain_advice',
    prompt:
      'Based on my Seattle rent, household size, and visible income, how should I check whether an income-restricted apartment could save me money?',
    intent:
      'Test local housing-program discovery and eligibility reasoning without asking for a broad rent manifesto.',
    expectedAnswerNotes: [
      'The answer should not guarantee MFTE/MHA eligibility. It should provide an eligibility workflow and savings comparison against $2,350/month rent.',
      'Use gross income signals, household size, current Seattle program limits/rent caps, unit availability, and required documentation.',
      'RSU/freelance income should be handled as eligibility-sensitive income, not ignored or treated as ordinary monthly payroll without caveats.'
    ],
    opportunityIds: ['rent_seattle_mfte'],
    relevantSignalIds: ['txn_rent_2026_05', 'mem_location_household', 'txn_payroll_2026_05_15'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Guarantees MFTE/MHA eligibility.',
      'Uses take-home pay as gross income.',
      'Stops at generic cheaper-neighborhood advice.',
      'Does not explain what data Maria needs to verify.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'rent_annualized',
      'income_household_location',
      'mfte_caveat_presence',
      'mfte_savings_estimate',
      'rent_exact_next_steps'
    ]
  },
  {
    id: 'maria_credit_card_strategy',
    personaId: 'maria_seattle_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt:
      'Given my current credit card strategy, which cards should I use for which purchases, and where could I earn more?',
    intent: 'Test rewards optimization from transactions plus external card knowledge.',
    opportunityIds: ['card_bilt_rent', 'card_costco_citi_executive', 'card_csp_category_routing'],
    relevantSignalIds: [
      'acct_csp',
      'txn_rent_2026_05',
      'txn_costco_2026_05_04',
      'txn_dining_2026_05_08',
      'txn_alaska_2026_05_06'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Treats Costco as ordinary grocery rewards.',
      'Recommends cards without annual-fee or simplicity caveats.',
      'Overvalues points without assumptions.',
      'Gives a card map without tying categories to Maria’s transactions.',
      'Mixes one-time welcome bonuses into annual rewards or gives a large headline points estimate without line-item math.',
      'Uses obsolete Bilt Mastercard assumptions instead of current Bilt 2.0 terms.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'category_routing_map',
      'rent_rewards_math',
      'costco_incremental_math',
      'card_strategy_value_quantified',
      'card_strategy_fee_caveats',
      'card_strategy_priority_order',
      'no_unbacked_rewards_headline'
    ]
  },
  {
    id: 'maria_costco_optimization',
    personaId: 'maria_seattle_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Is there anything smarter I should be doing with Costco?',
    intent:
      'Test whether the model distinguishes warehouse spend, gas, membership tier, and hidden services.',
    opportunityIds: ['card_costco_citi_executive'],
    relevantSignalIds: [
      'txn_costco_2026_05_04',
      'txn_costco_2026_05_19',
      'txn_costco_gas_2026_05_21',
      'acct_csp'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Assumes Costco is coded as supermarket.',
      'Double-counts Executive Membership and card rewards incorrectly.',
      'Recommends Executive Membership without checking breakeven math.',
      'Presents May-only Costco spend as a stable annual run-rate without labeling it as an assumption or scenario.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'costco_monthly_spend',
      'executive_membership_breakeven',
      'gas_vs_warehouse_split'
    ]
  },
  {
    id: 'maria_rent_rewards',
    personaId: 'maria_seattle_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Can I earn anything back on rent without paying dumb fees?',
    intent: 'Test rent-reward knowledge and fee-aware math.',
    expectedAnswerNotes: [
      'Annualize Maria’s $2,350/month rent to $28,200/year and compare expected rewards against any processing or card fees.',
      'Current Bilt 2.0 terms should be used where product details matter; legacy Bilt Mastercard assumptions should not drive the answer.',
      'A strong answer says to avoid fee-based card payments unless rewards value clearly exceeds fees and the payment route is allowed by the landlord/platform.'
    ],
    opportunityIds: ['card_bilt_rent'],
    relevantSignalIds: ['txn_rent_2026_05', 'acct_csp'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Recommends paying a card processing fee that exceeds expected rewards.',
      'Fails to annualize rent.'
    ],
    openCreditPolicy,
    deterministicChecks: ['annual_rent', 'fee_vs_rewards']
  },
  {
    id: 'maria_alaska_microsoft',
    personaId: 'maria_seattle_v0',
    domain: 'employer_benefits_perks',
    type: 'insight_discovery',
    prompt:
      'I have recent Alaska SEA-SFO flights and work at Microsoft. What airline or employer travel perks should I verify before my next trip, and what should I not assume?',
    intent:
      'Test linking employer, route, airline transactions, and travel loyalty knowledge while requiring verification/caveats for program mechanics.',
    opportunityIds: ['msft_alaska_status'],
    relevantSignalIds: ['mem_employer', 'txn_alaska_2026_05_06', 'txn_alaska_2026_04_12'],
    scoreDimensions: discoveryRubric,
    invalidOrHarmful: [
      'Invents guaranteed permanent elite status.',
      'Ignores Microsoft employer context.',
      'Does not verify current program availability or challenge terms.',
      'Mentions generic airline loyalty without tying it to Alaska/SEA-SFO transactions.',
      'Marks current Atmos naming or Microsoft-linked Alaska/Atmos corporate challenge language as invalid despite locked benchmark facts.'
    ],
    openCreditPolicy,
    deterministicChecks: ['alaska_transaction_detection', 'employer_linkage', 'program_caveat']
  },
  {
    id: 'maria_rental_car_trip',
    personaId: 'maria_seattle_v0',
    domain: 'employer_benefits_perks',
    type: 'domain_advice',
    prompt: 'Was there a better way to book my recent rental car?',
    intent: 'Test employer discount, hidden fees, and card rental coverage reasoning.',
    opportunityIds: ['rental_car_msft_csp'],
    relevantSignalIds: ['txn_avis_2026_05_07', 'mem_employer', 'acct_csp'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Guarantees card coverage without exclusions.',
      'Tells user to misuse a corporate code.',
      'Mentions coverage without explaining card/rental terms and excluded vehicle/trip situations.'
    ],
    openCreditPolicy,
    deterministicChecks: ['avis_transaction_detection', 'coverage_caveats']
  },
  {
    id: 'maria_idle_cash',
    personaId: 'maria_seattle_v0',
    domain: 'cashflow_budgeting',
    type: 'insight_discovery',
    prompt: 'Do I have too much cash sitting around, or not enough?',
    intent: 'Test emergency fund sizing and idle-cash yield opportunity.',
    opportunityIds: ['cash_idle_hysa_tbills'],
    relevantSignalIds: [
      'acct_chase_checking',
      'acct_ally_savings',
      'txn_rent_2026_05',
      'txn_payroll_2026_05_31'
    ],
    scoreDimensions: discoveryRubric,
    invalidOrHarmful: [
      'Says to invest all cash without emergency fund.',
      'Ignores rent/monthly spending when sizing buffer.',
      'Claims exact emergency-fund adequacy without acknowledging unseen expenses.'
    ],
    openCreditPolicy,
    deterministicChecks: ['cash_balance_total', 'monthly_burn_estimate', 'idle_cash_estimate']
  },
  {
    id: 'maria_checking_buffer',
    personaId: 'maria_seattle_v0',
    domain: 'cashflow_budgeting',
    type: 'domain_advice',
    prompt:
      'How much should I keep in checking for near-term bills, and how much could I move to savings or T-bills?',
    intent:
      'Test bill-buffer sizing, liquidity tiers, and idle-cash movement using account balances and May spending.',
    opportunityIds: ['cash_idle_hysa_tbills'],
    relevantSignalIds: [
      'acct_chase_checking',
      'acct_ally_savings',
      'txn_rent_2026_05',
      'txn_payroll_2026_05_31'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Says to move all checking cash without a bill buffer.',
      'Invests emergency money in volatile assets.',
      'Ignores settlement/liquidity caveats for T-bills or money markets.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'cash_balance_total',
      'monthly_burn_estimate',
      'idle_cash_estimate',
      'cash_buffer_before_long_term_lockup'
    ]
  },
  {
    id: 'maria_extra_10000',
    personaId: 'maria_seattle_v0',
    domain: 'life_planning_major_decisions',
    type: 'prioritization',
    prompt:
      'I have an extra $10,000 after normal bills. Compare cash reserves, credit-card payoff, retirement/HSA/Roth options, and investing, then recommend the first move with assumptions.',
    intent:
      'Test a bounded allocation decision among cash buffer, debt, 401(k), HSA, Roth, mega backdoor, and investing with explicit assumptions.',
    opportunityIds: [
      'cash_idle_hysa_tbills',
      'retirement_401k_match_gap',
      'tax_hsa_triple_advantage',
      'tax_backdoor_roth',
      'retirement_mega_backdoor_roth'
    ],
    relevantSignalIds: ['acct_chase_checking', 'acct_ally_savings', 'acct_csp', 'acct_msft_401k'],
    scoreDimensions: planningRubric,
    invalidOrHarmful: [
      'Suggests taxable investing before emergency fund/match without justification.',
      'Ignores credit-card balance context.',
      'Assumes the credit-card balance is revolving debt without evidence.',
      'Uses stale retirement/tax limits while ranking tax-advantaged moves.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'priority_ordering',
      'cash_buffer_before_long_term_lockup',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_credit_card_balance_check',
    personaId: 'maria_seattle_v0',
    domain: 'debt_credit_health',
    type: 'domain_advice',
    prompt:
      'My Chase Sapphire Preferred shows a $1,840 balance. Should I pay it off immediately, set autopay, or treat it as normal monthly float? What should I verify first?',
    intent:
      'Test whether the assistant handles credit-card balances prudently without assuming revolving debt from a current balance.',
    opportunityIds: ['credit_card_autopay_interest_check'],
    relevantSignalIds: ['acct_csp', 'acct_chase_checking'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Assumes the balance is definitely revolving debt.',
      'Ignores APR/interest and statement-balance verification.',
      'Recommends investing before confirmed high-interest card debt payoff.',
      'Focuses only on utilization hacks.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'credit_card_balance_amount',
      'autopay_statement_balance',
      'no_revolving_debt_assumption',
      'high_interest_debt_priority'
    ]
  },
  {
    id: 'maria_mega_backdoor',
    personaId: 'maria_seattle_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Should I do a mega backdoor Roth or not?',
    intent: 'Test plan eligibility, contribution room, sequencing, and cashflow caveats.',
    opportunityIds: [
      'retirement_mega_backdoor_roth',
      'retirement_401k_match_gap',
      'tax_hsa_triple_advantage'
    ],
    relevantSignalIds: [
      'mem_employer',
      'txn_payroll_2026_05_15',
      'txn_401k_employee_deferral_2026_05_15',
      'acct_msft_401k',
      'acct_chase_checking'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Confuses backdoor Roth IRA with mega backdoor Roth.',
      'Guarantees plan availability without verification.',
      'Ignores employer match and emergency fund sequencing.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'mega_backdoor_definition',
      '415c_limit_caveat',
      'contribution_room_estimate',
      'mega_current_limits_no_stale',
      'mega_sequence_before_after_tax',
      'mega_plan_feature_caveat',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_401k_contribution',
    personaId: 'maria_seattle_v0',
    domain: 'retirement_tax_advantaged',
    type: 'what_if',
    prompt: 'Am I contributing enough to my 401(k)?',
    intent:
      'Test match capture, annual limit knowledge, paycheck math, and contribution-order advice.',
    expectedAnswerNotes: [
      'Visible payroll shows $2,500 semi-monthly gross pay and $200 employee 401(k) deferral, implying an 8% current deferral and about $4,800/year if stable across 24 pay periods.',
      'The 2026 employee elective deferral limit is $24,500. A 41% deferral on a $60,000 annualized base is approximately $24,600, so it is arithmetically capable of reaching the annual employee limit across a full year.',
      'Do not mark a 41% contribution rate as mathematically impossible solely because it is high. It is fair to ding prudence, cashflow realism, or midyear catch-up assumptions if the answer presents it as easy, ignores take-home-pay impact, or fails to explain timing.',
      'A strong answer should say Maria is not currently on pace to max the employee limit or capture the full available Microsoft match based on visible deferrals, while acknowledging that increasing deferrals may be constrained by cashflow.'
    ],
    opportunityIds: ['retirement_401k_match_gap', 'retirement_mega_backdoor_roth'],
    relevantSignalIds: [
      'txn_payroll_2026_05_15',
      'txn_401k_employee_deferral_2026_05_15',
      'mem_employer'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Uses stale IRS contribution limits.',
      'Misses employer match.',
      'Ignores cashflow.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'current_401k_annual_contribution',
      'irs_limit_currentness',
      'match_context',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_401k_percent_to_limit',
    personaId: 'maria_seattle_v0',
    domain: 'retirement_tax_advantaged',
    type: 'what_if',
    prompt:
      'What 401(k) contribution percentage would put me on pace for the 2026 employee limit, and how should I think about the Microsoft match?',
    intent:
      'Test payroll math, contribution-rate calculation, current limit awareness, and match sequencing.',
    opportunityIds: ['retirement_401k_match_gap'],
    relevantSignalIds: [
      'txn_payroll_2026_05_15',
      'txn_401k_employee_deferral_2026_05_15',
      'mem_employer'
    ],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Says Maria is already maxing based on visible deferrals.',
      'Uses stale 401(k) limits.',
      'Ignores cashflow or match context.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'current_401k_annual_contribution',
      'irs_limit_currentness',
      'match_context',
      'not_on_pace_401k_max',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_backdoor_roth',
    personaId: 'maria_seattle_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Should I do a Roth IRA, backdoor Roth, or skip it?',
    intent: 'Test current Roth limits, MAGI reasoning, and pro-rata caveat.',
    opportunityIds: ['tax_backdoor_roth'],
    relevantSignalIds: ['txn_payroll_2026_05_15', 'acct_traditional_ira'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Uses stale IRA contribution or phaseout figures.',
      'Misses pro-rata rule.',
      'Assumes stock comp without noting MAGI uncertainty.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'roth_income_phaseout_currentness',
      'ira_limit_currentness',
      'pro_rata_caveat',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_hsa',
    personaId: 'maria_seattle_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Should I be using an HSA?',
    intent:
      'Test HSA eligibility caution, payroll advantage, employer benefits, and contribution limits.',
    opportunityIds: ['tax_hsa_triple_advantage'],
    relevantSignalIds: ['mem_employer'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Recommends HSA contribution without HDHP eligibility.',
      'Uses stale HSA limits.',
      'Misses payroll/FICA advantage.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'hdhp_caveat',
      'hsa_limit_currentness',
      'employer_seed_caveat',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_tax_optimization',
    personaId: 'maria_seattle_v0',
    domain: 'tax_strategy',
    type: 'insight_discovery',
    prompt:
      'I have W-2 Microsoft income, 401(k) contributions, and a freelance payment this month. Which 2026 tax moves should I check, and what exact limits or caveats matter?',
    intent:
      'Test bounded tax opportunity discovery across W-2 benefits, retirement accounts, HSA/backdoor Roth eligibility, and freelance estimated-tax handling.',
    opportunityIds: [
      'retirement_401k_match_gap',
      'tax_hsa_triple_advantage',
      'tax_backdoor_roth',
      'side_income_estimated_taxes'
    ],
    relevantSignalIds: [
      'txn_payroll_2026_05_15',
      'txn_401k_employee_deferral_2026_05_15',
      'txn_freelance_2026_05'
    ],
    scoreDimensions: planningRubric,
    invalidOrHarmful: [
      'Gives generic deduction list unrelated to W-2/freelance context.',
      'Recommends ineligible deductions.',
      'Assumes HSA eligibility, Roth eligibility, or estimated-tax penalties without caveats.',
      'Uses stale limits.'
    ],
    openCreditPolicy,
    deterministicChecks: ['tax_opportunity_coverage', 'current_limit_checks', 'no_stale_irs_limits']
  },
  {
    id: 'maria_msft_stock_risk',
    personaId: 'maria_seattle_v0',
    domain: 'investing_equity_comp',
    type: 'domain_advice',
    prompt: 'I had an RSU vest hit my brokerage this month. What should I do with it?',
    intent:
      'Test whether the assistant finds the RSU vest transaction, connects employer-stock concentration and taxes, and avoids claiming current holdings it cannot see.',
    opportunityIds: ['equity_msft_concentration'],
    relevantSignalIds: ['acct_robinhood', 'txn_msft_rsu_vest_2026_05', 'mem_employer'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Only says MSFT is a good/bad stock.',
      'Ignores employment income correlation.',
      'Claims current MSFT holdings without evidence.',
      'Treats an account name or balance as proof of Microsoft stock holdings.',
      'Recommends selling without tax/trading-window caveats.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'rsu_vest_amount',
      'human_capital_linkage',
      'tax_caveats',
      'no_account_balance_as_holdings',
      'no_stale_irs_limits'
    ]
  },
  {
    id: 'maria_rsu_tax_withholding',
    personaId: 'maria_seattle_v0',
    domain: 'investing_equity_comp',
    type: 'domain_advice',
    prompt:
      'After a $42,000 Microsoft RSU vest, what tax-withholding and trading-window checks should I make before deciding what to sell?',
    intent:
      'Test equity-comp tax mechanics and employer trading-window caveats without requiring holdings data.',
    opportunityIds: ['equity_msft_concentration'],
    relevantSignalIds: ['txn_msft_rsu_vest_2026_05', 'mem_employer', 'acct_robinhood'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Claims current share holdings or exact concentration without holdings data.',
      'Ignores withholding/tax lot mechanics.',
      'Ignores Microsoft trading-window or insider restrictions.',
      'Gives a pure stock-price opinion.'
    ],
    openCreditPolicy,
    deterministicChecks: [
      'rsu_vest_amount',
      'tax_caveats',
      'no_account_balance_as_holdings',
      'human_capital_linkage'
    ]
  },
  {
    id: 'maria_insurance_review',
    personaId: 'maria_seattle_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt:
      'I am a single renter with no dependents and Microsoft paychecks. Which insurance gaps should I check first: disability, renters/liability, umbrella, or life insurance?',
    intent:
      'Test bounded protection prioritization for a single renter with income dependency and no dependents.',
    opportunityIds: ['insurance_disability_gap'],
    relevantSignalIds: ['mem_location_household', 'txn_payroll_2026_05_15'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Pushes life insurance as top priority despite no dependents.',
      'Ignores disability-income risk.',
      'Overstates umbrella need without asset/liability facts.'
    ],
    openCreditPolicy,
    deterministicChecks: ['disability_before_life', 'dependents_check', 'income_replacement_math']
  },
  {
    id: 'maria_life_insurance_need',
    personaId: 'maria_seattle_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt:
      'Do I need life insurance right now as a single renter with no dependents, or should I prioritize another coverage check?',
    intent:
      'Test protection prioritization and no-dependents reasoning in a focused insurance question.',
    opportunityIds: ['insurance_disability_gap'],
    relevantSignalIds: ['mem_location_household', 'txn_payroll_2026_05_15'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Pushes life insurance as urgent without dependents or debt obligations.',
      'Ignores disability-income risk.',
      'Claims exact employer coverage without verification.'
    ],
    openCreditPolicy,
    deterministicChecks: ['disability_before_life', 'dependents_check', 'income_replacement_math']
  },
  {
    id: 'maria_side_income_tax',
    personaId: 'maria_seattle_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt:
      'I got some freelance income this month. What should I do so it does not bite me later?',
    intent:
      'Test self-employment tax, estimated payments, bookkeeping, and retirement expansion awareness.',
    opportunityIds: ['side_income_estimated_taxes'],
    relevantSignalIds: ['txn_freelance_2026_05'],
    scoreDimensions: adviceRubric,
    invalidOrHarmful: [
      'Treats freelance income like tax-free cash.',
      'Invents deductions.',
      'Misses self-employment tax.',
      'Says estimated payments are definitely required without considering withholding/safe-harbor context.'
    ],
    openCreditPolicy,
    deterministicChecks: ['freelance_income_amount', 'tax_reserve_range', 'estimated_tax_caveat']
  },
  {
    id: 'maria_subscriptions_benefits',
    personaId: 'maria_seattle_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt: 'Are any of my subscriptions or recurring charges worth changing?',
    intent: 'Test recurring charge detection and employer reimbursement linkage.',
    opportunityIds: ['subscription_fitness_employer_reimbursement'],
    relevantSignalIds: [
      'txn_netflix_2026_05',
      'txn_adobe_2026_05',
      'txn_classpass_2026_05',
      'mem_employer'
    ],
    scoreDimensions: discoveryRubric,
    invalidOrHarmful: [
      'Only says cancel everything.',
      'Misses employer reimbursement possibility.',
      'Double-counts reimbursement and cancellation savings.',
      'Claims Maria already submitted or has remaining reimbursement balance without evidence.',
      'Treats ClassPass as ineligible for Microsoft wellness reimbursement.'
    ],
    openCreditPolicy,
    deterministicChecks: ['recurring_charge_detection', 'employer_reimbursement_linkage']
  }
];
const patelTasks: Task[] = [
  newTask({
    id: 'patel_spend_may_total',
    personaId: 'patel_denver_family_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'How much did we spend in May 2026, and what were the biggest categories?',
    intent: 'Test household spend retrieval with income/contribution exclusions and family-category rollups.',
    expectedAnswerNotes: [
      'Exclude payroll and other income from spending.',
      'Do not treat 401(k) contribution transactions as household spending.',
      'A strong answer separates mortgage, childcare, groceries/household, insurance, utilities, subscriptions, and medical.'
    ],
    relevantSignalIds: ['patel_txn_mortgage_2026_05', 'patel_txn_daycare_2026_05', 'patel_txn_costco_2026_05_04'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'consumption_spend_total_scope', 'no_income_as_spend', 'no_savings_contribution_as_consumption', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Includes payroll as spending.',
      'Misses mortgage or daycare as top categories.',
      'Gives broad budget advice instead of answering the total and category question.'
    ]
  }),
  newTask({
    id: 'patel_childcare_family_spend_may',
    personaId: 'patel_denver_family_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'How much did we spend on childcare and kid-related expenses in May, and what should I double-check?',
    intent: 'Test exact child-related retrieval plus scope caveats for daycare, backup care, 529, and family subscriptions.',
    expectedAnswerNotes: [
      'Bright Horizons daycare and Care.com backup care are direct childcare.',
      'The 529 contribution is kid-related savings, not childcare expense.',
      'Disney/Spotify may be family/kid-adjacent but should not be mixed into the core childcare total without labeling scope.'
    ],
    relevantSignalIds: ['patel_txn_daycare_2026_05', 'patel_txn_backup_care_2026_05', 'patel_txn_529_2026_05'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'no_savings_contribution_as_consumption', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Combines 529 savings with daycare as if they are the same category.',
      'Misses backup childcare.',
      'Does not define the scope of kid-related expenses.'
    ]
  }),
  newTask({
    id: 'patel_recurring_charges_audit',
    personaId: 'patel_denver_family_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'Which recurring charges or subscriptions should we review, and what is the monthly amount for each?',
    intent: 'Test recurring-charge detection without overreaching from charge names.',
    expectedAnswerNotes: [
      'Recurring candidates include Disney Plus, Spotify Family, Peloton, Xfinity, insurance, mortgage, daycare, and possibly HealthCare/HSA only if scope is labeled.',
      'A strong answer separates subscriptions from bills, insurance, debt/mortgage, and savings contributions.',
      'Do not infer premium tiers or plan details from price alone.'
    ],
    relevantSignalIds: ['patel_txn_disney_2026_05', 'patel_txn_spotify_2026_05', 'patel_txn_peloton_2026_05', 'patel_txn_comcast_2026_05'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'recurring_scope_boundary', 'recurring_review_scope_strict', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Calls mortgage or daycare a cancellable subscription.',
      'Invents plan tiers.',
      'Misses obvious subscription charges.'
    ]
  }),
  newTask({
    id: 'patel_where_wasting_money',
    personaId: 'patel_denver_family_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt: 'Where are we most likely wasting money, based on our accounts and May transactions?',
    intent: 'Test bounded opportunity discovery across family expenses, recurring charges, card routing, cash, and insurance.',
    expectedAnswerNotes: [
      'High-value candidates include childcare tax/FSA treatment, Peloton/fitness benefit check, excess checking vs savings, insurance bundling/deductibles, card routing, and mortgage/escrow review.',
      'Rank by likely dollar impact and confidence.',
      'Do not make generic cancel-everything recommendations without considering family utility and tax/benefit offsets.'
    ],
    relevantSignalIds: ['patel_txn_daycare_2026_05', 'patel_txn_peloton_2026_05', 'patel_acct_checking', 'patel_acct_savings'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'no_unsupported_employer_benefit_overclaim', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Only gives generic budgeting tips.',
      'Misses childcare tax/FSA and cash-yield angles.',
      'Overstates savings without showing confidence or caveats.'
    ]
  }),
  newTask({
    id: 'patel_subscriptions_benefits',
    personaId: 'patel_denver_family_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt: 'Are any of our subscriptions or recurring charges worth changing or routing through benefits?',
    intent: 'Test subscription review plus employer-benefit linkage without assuming participation.',
    expectedAnswerNotes: [
      'Peloton is a fitness/wellness candidate to check against employer benefits, not guaranteed reimbursed.',
      'Backup care should trigger checking Salesforce backup-care benefit rules if the charge was not run through the benefit.',
      'The answer should separate cancel/keep/reroute/reimburse decisions.'
    ],
    relevantSignalIds: ['patel_txn_peloton_2026_05', 'patel_txn_backup_care_2026_05', 'patel_mem_employers'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'recurring_scope_boundary', 'recurring_review_scope_strict', 'plan_participation_caveat', 'no_unsupported_employer_benefit_overclaim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Claims a reimbursement was already available or unused without evidence.',
      'Treats every recurring charge as waste.',
      'Misses benefit-routing as different from cancellation.'
    ]
  }),
  newTask({
    id: 'patel_mortgage_escrow_review',
    personaId: 'patel_denver_family_v0',
    domain: 'housing_rent',
    type: 'domain_advice',
    prompt: 'Our mortgage payment is big. What should we check to reduce housing cost without making a risky move?',
    intent: 'Test homeowner housing-cost advice grounded in mortgage payment, loan balance, insurance, taxes, and liquidity.',
    expectedAnswerNotes: [
      'Use the $3,850 mortgage payment and mortgage balance.',
      'Consider escrow/property-tax/insurance review, refinance only if rates/fees make sense, and avoid raiding emergency cash.',
      'Do not recommend moving or refinancing as automatic wins without rate, term, and closing-cost caveats.'
    ],
    relevantSignalIds: ['patel_txn_mortgage_2026_05', 'patel_acct_mortgage', 'patel_txn_home_insurance_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'salt_standard_deduction_currentness', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Says refinance without break-even math.',
      'Ignores escrow, property tax, or insurance review.',
      'Recommends using emergency cash imprudently.'
    ]
  }),
  newTask({
    id: 'patel_property_insurance_review',
    personaId: 'patel_denver_family_v0',
    domain: 'housing_rent',
    type: 'domain_advice',
    prompt: 'Should we review our homeowners and auto insurance, and what exactly should we compare?',
    intent: 'Test concrete insurance-cost review tied to visible State Farm home/auto payments and household risks.',
    expectedAnswerNotes: [
      'Use State Farm auto and home insurance charges.',
      'Recommend comparing deductibles, liability limits, bundle discounts, replacement-cost coverage, and umbrella fit.',
      'Avoid reducing essential liability or dwelling coverage just to cut premiums.'
    ],
    relevantSignalIds: ['patel_txn_auto_insurance_2026_05', 'patel_txn_home_insurance_2026_05', 'patel_mem_household'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Only says shop around.',
      'Suggests dropping important coverage without caveats.',
      'Fails to mention family/homeowner liability risk.'
    ]
  }),
  newTask({
    id: 'patel_credit_card_strategy',
    personaId: 'patel_denver_family_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Given our current cards and May spending, which card should we use for groceries, dining, daycare, Costco, and utilities?',
    intent: 'Test category routing using visible cards and merchant categories, with optional new-card suggestions clearly labeled.',
    expectedAnswerNotes: [
      'Use visible Amex Gold and Chase Freedom Unlimited cards.',
      'Amex Gold should be considered for supermarket/dining where accepted; Costco generally does not accept Amex in-store.',
      'Daycare/utilities may be flat-rate or fee-sensitive; do not assume credit cards are accepted without fees.'
    ],
    relevantSignalIds: ['patel_acct_cfu', 'patel_acct_amex_gold', 'patel_txn_daycare_2026_05', 'patel_txn_costco_2026_05_04'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'card_rate_currentness', 'card_fee_or_interest_priority', 'no_unsupported_employer_benefit_overclaim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Routes Costco to Amex Gold without acceptance caveat.',
      'Recommends paying daycare by card without fee math.',
      'Claims they have cards not visible unless framed as optional.'
    ]
  }),
  newTask({
    id: 'patel_costco_target_optimization',
    personaId: 'patel_denver_family_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'We spent at Costco and Target this month. Are there better card or membership moves for those merchants?',
    intent: 'Test merchant-specific rewards advice without bad annualization or unsupported card ownership.',
    expectedAnswerNotes: [
      'Costco in-store acceptance and category coding matter.',
      'Target may have a merchant-specific RedCard style option but should be weighed against simplicity and visible spend.',
      'Annualization should be labeled as if May is typical, not asserted as a stable run-rate.'
    ],
    relevantSignalIds: ['patel_txn_costco_2026_05_04', 'patel_txn_costco_2026_05_18', 'patel_txn_target_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'card_rate_currentness', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Overstates annual savings from a single month.',
      'Ignores Costco acceptance limits.',
      'Treats a new card as automatically worth opening without dollar math.'
    ]
  }),
  newTask({
    id: 'patel_daycare_rewards',
    personaId: 'patel_denver_family_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Is there a smart way to earn rewards on daycare without giving back the value in fees?',
    intent: 'Test fee-aware rewards math on large childcare spend.',
    expectedAnswerNotes: [
      'Use the $1,650 Bright Horizons charge and $220 backup care charge.',
      'The right answer should compare card rewards against any processing fee and consider dependent care FSA first because tax savings may dominate points.',
      'Do not assume daycare accepts fee-free credit-card payments.'
    ],
    relevantSignalIds: ['patel_txn_daycare_2026_05', 'patel_txn_backup_care_2026_05', 'patel_mem_employers'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'dependent_care_fsa_2026_limit', 'card_fee_or_interest_priority', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Optimizes points while ignoring processing fees.',
      'Misses dependent care FSA/tax angle.',
      'Assumes fee-free card acceptance.'
    ]
  }),
  newTask({
    id: 'patel_dependent_care_fsa',
    personaId: 'patel_denver_family_v0',
    domain: 'employer_benefits_perks',
    type: 'domain_advice',
    prompt: 'Should we use a dependent care FSA for daycare, and how much could it matter?',
    intent: 'Test childcare-tax benefit knowledge, family context, and benefit-participation caveats.',
    expectedAnswerNotes: [
      'They have one child age 3 and visible daycare/backup-care expenses.',
      'A dependent care FSA is employer-plan dependent and should not be assumed already elected.',
      'A strong answer estimates tax savings on the annual election limit and explains use-it-or-lose-it and qualifying-care caveats.'
    ],
    relevantSignalIds: ['patel_mem_household', 'patel_mem_employers', 'patel_txn_daycare_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'dependent_care_fsa_2026_limit', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Claims they are enrolled without evidence.',
      'Ignores use-it-or-lose-it risk.',
      'Misses tax savings or qualifying-care mechanics.'
    ]
  }),
  newTask({
    id: 'patel_employer_family_benefits',
    personaId: 'patel_denver_family_v0',
    domain: 'employer_benefits_perks',
    type: 'insight_discovery',
    prompt: 'Which employer benefits should we check first given our family spending this month?',
    intent: 'Test benefit discovery tied to daycare, backup care, HSA, insurance, and family needs.',
    expectedAnswerNotes: [
      'Relevant checks include dependent care FSA, backup care, HSA/HDHP, disability/life insurance, and possibly wellness benefits.',
      'The answer should distinguish plan-level availability from user-specific enrollment or remaining balances.',
      'Prioritize by likely dollar impact and risk protection.'
    ],
    relevantSignalIds: ['patel_mem_employers', 'patel_txn_backup_care_2026_05', 'patel_txn_hsa_2026_05', 'patel_mem_household'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'dependent_care_fsa_2026_limit', 'hsa_family_limit_currentness', 'plan_participation_caveat', 'no_unsupported_employer_benefit_overclaim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes participation or remaining reimbursement balances.',
      'Gives an employer-benefit checklist not tied to spending.',
      'Misses dependent care or HSA.'
    ]
  }),
  newTask({
    id: 'patel_idle_cash',
    personaId: 'patel_denver_family_v0',
    domain: 'cashflow_budgeting',
    type: 'domain_advice',
    prompt: 'Do we have too much idle cash in checking, and what should we move?',
    intent: 'Test family cash-buffer sizing against mortgage, daycare, checking, and savings balances.',
    expectedAnswerNotes: [
      'Use checking and savings balances plus large fixed bills like mortgage and daycare.',
      'Recommend a bill-pay buffer and emergency reserve before investing.',
      'Any transfer amount should preserve near-term liquidity and avoid over-precision.'
    ],
    relevantSignalIds: ['patel_acct_checking', 'patel_acct_savings', 'patel_txn_mortgage_2026_05', 'patel_txn_daycare_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'no_savings_contribution_as_consumption', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Invests emergency cash without caveats.',
      'Ignores family fixed expenses.',
      'Says all checking cash is idle.'
    ]
  }),
  newTask({
    id: 'patel_checking_buffer',
    personaId: 'patel_denver_family_v0',
    domain: 'cashflow_budgeting',
    type: 'what_if',
    prompt: 'What checking-account buffer should we keep before moving extra cash to savings or investments?',
    intent: 'Test exact buffer planning based on recurring bills and family volatility.',
    expectedAnswerNotes: [
      'A strong answer anchors on mortgage, daycare, utilities/insurance, and upcoming card payments.',
      'It should separate checking buffer from emergency fund.',
      'Do not use a one-size-fits-all one-month rule without considering bill timing.'
    ],
    relevantSignalIds: ['patel_acct_checking', 'patel_txn_mortgage_2026_05', 'patel_txn_daycare_2026_05', 'patel_acct_cfu'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'no_savings_contribution_as_consumption', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Conflates checking buffer and emergency fund.',
      'Ignores card balances and bill timing.',
      'Recommends a dangerously low buffer for a family with mortgage/daycare.'
    ]
  }),
  newTask({
    id: 'patel_extra_15000',
    personaId: 'patel_denver_family_v0',
    domain: 'life_planning_major_decisions',
    type: 'prioritization',
    prompt: 'If we freed up $15,000 this year, where should it go first?',
    intent: 'Test prioritization across emergency cash, high-interest debt checks, HSA/401(k), 529, insurance, mortgage, and taxable investing.',
    expectedAnswerNotes: [
      'First verify whether credit-card balances are statement float or revolving debt.',
      'Family protection and emergency reserves should be considered before low-priority taxable investing.',
      'HSA/401(k)/529 can all be valid depending on enrollment, matching, tax rate, and goal timing.'
    ],
    relevantSignalIds: ['patel_acct_checking', 'patel_acct_savings', 'patel_acct_cfu', 'patel_acct_hsa', 'patel_acct_529'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'card_fee_or_interest_priority', 'dependent_care_fsa_2026_limit', 'hsa_family_limit_currentness', 'priority_ordering', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Puts 529 or taxable investing first while ignoring revolving debt and protection checks.',
      'Assumes card balances are revolving without saying to verify.',
      'Gives a single answer without priority order or caveats.'
    ]
  }),
  newTask({
    id: 'patel_credit_card_balance_check',
    personaId: 'patel_denver_family_v0',
    domain: 'debt_credit_health',
    type: 'domain_advice',
    prompt: 'Do our credit-card balances look like a problem, and what should we verify before optimizing anything else?',
    intent: 'Test statement-float vs revolving-debt reasoning for family card balances.',
    expectedAnswerNotes: [
      'Use the Chase Freedom Unlimited and Amex Gold balances.',
      'A current card balance is not proof of revolving debt; verify statement balance, due date, APR, and full-statement autopay.',
      'Confirmed revolving high-interest debt should outrank rewards and investing.'
    ],
    relevantSignalIds: ['patel_acct_cfu', 'patel_acct_amex_gold', 'patel_acct_checking'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes they are in credit-card debt without evidence.',
      'Optimizes rewards while ignoring possible interest.',
      'Ignores autopay/full-statement payment.'
    ]
  }),
  newTask({
    id: 'patel_401k_contribution',
    personaId: 'patel_denver_family_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Are our current 401(k) contributions on pace, and what should we change if cashflow allows?',
    intent: 'Test contribution synthesis for two W-2 earners without claiming they are maxing.',
    expectedAnswerNotes: [
      'Use visible May deferrals: Priya $1,400 and Daniel $600 for the month.',
      'Annualize carefully and compare to current IRS employee limits per person.',
      'Mention employer-match verification and cashflow constraints without assuming exact match terms beyond memory context.'
    ],
    relevantSignalIds: ['patel_txn_priya_401k_2026_05_15', 'patel_txn_priya_401k_2026_05_31', 'patel_txn_daniel_401k_2026_05_15', 'patel_txn_daniel_401k_2026_05_31'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'irs_limit_currentness', 'plan_participation_caveat', 'no_unsupported_employer_benefit_overclaim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Says they are maxing when visible deferrals show they are not.',
      'Uses stale 401(k) limits.',
      'Ignores cashflow with mortgage/daycare.'
    ]
  }),
  newTask({
    id: 'patel_401k_percent_to_limit',
    personaId: 'patel_denver_family_v0',
    domain: 'retirement_tax_advantaged',
    type: 'what_if',
    prompt: 'What percent of pay would Priya and Daniel each need to contribute to hit the 2026 employee 401(k) limit?',
    intent: 'Test calculator-backed contribution-rate math for two earners.',
    expectedAnswerNotes: [
      'Use gross pay from payroll notes: Priya $8,750 semi-monthly and Daniel $5,000 semi-monthly.',
      'Use the 2026 employee deferral limit per person.',
      'Distinguish mathematical possibility from cashflow aggressiveness.'
    ],
    relevantSignalIds: ['patel_txn_priya_payroll_2026_05_15', 'patel_txn_daniel_payroll_2026_05_15'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'irs_limit_currentness', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Uses net pay instead of gross pay without caveat.',
      'Calls a mathematically possible percentage impossible.',
      'Uses stale 401(k) limits.'
    ]
  }),
  newTask({
    id: 'patel_hsa_family',
    personaId: 'patel_denver_family_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Should we prioritize HSA contributions this year, and what limit/enrollment caveats matter?',
    intent: 'Test family HSA prioritization with enrollment caveats and current limits.',
    expectedAnswerNotes: [
      'They have an HSA account and a visible HSA contribution, but should still confirm HDHP coverage and family vs self-only coverage.',
      'Use the current 2026 HSA family limit if advising family coverage.',
      'Explain payroll/FICA advantage if available and medical-liquidity tradeoffs.'
    ],
    relevantSignalIds: ['patel_acct_hsa', 'patel_txn_hsa_2026_05', 'patel_mem_household', 'patel_mem_employers'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'hsa_family_limit_currentness', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Uses self-only HSA limit for a family without explaining coverage assumption.',
      'Claims HDHP enrollment beyond visible evidence.',
      'Misses payroll/FICA advantage.'
    ]
  }),
  newTask({
    id: 'patel_529_tax_strategy',
    personaId: 'patel_denver_family_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Are we using the 529 well for our child, and what tax or flexibility caveats should we know?',
    intent: 'Test 529 advice tied to visible contribution, Colorado context, and family goals.',
    expectedAnswerNotes: [
      'Use the Colorado 529 account and $300 May contribution.',
      'Consider state tax benefit if applicable, investment horizon, gift-tax limits only if large gifts are discussed, and qualified-expense caveats.',
      'Do not over-prioritize 529 ahead of emergency fund, high-interest debt, HSA/401(k), or insurance gaps without reasoning.'
    ],
    relevantSignalIds: ['patel_acct_529', 'patel_txn_529_2026_05', 'patel_mem_household'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'salt_standard_deduction_currentness', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Treats 529 as always first priority.',
      'Ignores state-tax/flexibility caveats.',
      'Claims specific future college costs without basis.'
    ]
  }),
  newTask({
    id: 'patel_backdoor_roth',
    personaId: 'patel_denver_family_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Should we consider backdoor Roth IRAs, or are there better tax-advantaged moves first?',
    intent: 'Test Roth/backdoor reasoning for married high-income household with other tax-advantaged accounts.',
    expectedAnswerNotes: [
      'Use household gross pay implied by payroll notes to reason about possible Roth income limits.',
      'Mention pro-rata rule and existing traditional IRA balances if known; do not invent IRA balances.',
      'Sequence against 401(k), HSA, dependent care FSA, emergency fund, and debt checks.'
    ],
    relevantSignalIds: ['patel_txn_priya_payroll_2026_05_15', 'patel_txn_daniel_payroll_2026_05_15', 'patel_acct_hsa'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'roth_mfj_phaseout_currentness', 'ira_limit_currentness', 'pro_rata_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Uses single-filer Roth limits for a married household.',
      'Ignores pro-rata rule.',
      'Recommends Roth before higher-priority family cashflow/protection checks without rationale.'
    ]
  }),
  newTask({
    id: 'patel_tax_optimization',
    personaId: 'patel_denver_family_v0',
    domain: 'tax_strategy',
    type: 'insight_discovery',
    prompt: 'What 2026 tax moves should we check based on our family transactions and accounts?',
    intent: 'Test broad but bounded family tax-opportunity discovery.',
    expectedAnswerNotes: [
      'Strong candidates include dependent care FSA, HSA, 401(k) increases, 529 state-tax angle, mortgage/escrow tax context, and childcare credits where applicable.',
      'Avoid guaranteeing eligibility without AGI, plan, filing, and enrollment details.',
      'Prioritize by dollar impact and confidence.'
    ],
    relevantSignalIds: ['patel_mem_household', 'patel_txn_daycare_2026_05', 'patel_txn_hsa_2026_05', 'patel_txn_mortgage_2026_05'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'dependent_care_fsa_2026_limit', 'hsa_family_limit_currentness', 'salt_standard_deduction_currentness', 'plan_participation_caveat', 'no_unsupported_employer_benefit_overclaim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Gives generic deduction list.',
      'Misses childcare and HSA.',
      'Uses stale limits or wrong filing status.'
    ]
  }),
  newTask({
    id: 'patel_childcare_tax_credits',
    personaId: 'patel_denver_family_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'How should we think about childcare tax breaks for our daycare spending?',
    intent: 'Test dependent care FSA vs child/dependent care credit mechanics and scope.',
    expectedAnswerNotes: [
      'Use daycare and backup-care transactions as qualifying-care candidates.',
      'Discuss dependent care FSA and child/dependent care credit interaction; do not double count the same expenses.',
      'Explain that exact benefit depends on AGI, filing status, qualifying care, and employer plan election.'
    ],
    relevantSignalIds: ['patel_txn_daycare_2026_05', 'patel_txn_backup_care_2026_05', 'patel_mem_household', 'patel_mem_employers'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'dependent_care_fsa_2026_limit', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Double-counts FSA and credit on the same dollars.',
      'Guarantees eligibility or benefit amount without AGI details.',
      'Misses employer-plan election timing.'
    ]
  }),
  newTask({
    id: 'patel_college_savings_allocation',
    personaId: 'patel_denver_family_v0',
    domain: 'investing_equity_comp',
    type: 'domain_advice',
    prompt: 'Is our 529 contribution level reasonable compared with our other goals?',
    intent: 'Test investment-goal prioritization and contribution sizing for college savings.',
    expectedAnswerNotes: [
      'Use $12,400 529 balance and $300 monthly contribution.',
      'Compare against emergency cash, debt-interest verification, HSA/401(k), and insurance needs.',
      'Avoid promising college-cost coverage; frame scenarios and flexibility.'
    ],
    relevantSignalIds: ['patel_acct_529', 'patel_txn_529_2026_05', 'patel_acct_savings', 'patel_acct_cfu'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'hsa_family_limit_currentness', 'dependent_care_fsa_2026_limit', 'priority_ordering', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Ignores higher-priority protection/cashflow needs.',
      'Gives investment allocation advice without age/time-horizon caveats.',
      'Claims exact future college funding sufficiency.'
    ]
  }),
  newTask({
    id: 'patel_taxable_investing_priority',
    personaId: 'patel_denver_family_v0',
    domain: 'investing_equity_comp',
    type: 'prioritization',
    prompt: 'Should we invest more in taxable brokerage, or are there better next dollars first?',
    intent: 'Test taxable-investing prioritization against tax shelters, debt, emergency cash, and family insurance.',
    expectedAnswerNotes: [
      'Use taxable brokerage, savings, HSA, 529, card balances, and mortgage/family context.',
      'Taxable investing is reasonable only after emergency fund, revolving-debt check, retirement/HSA priorities, and protection gaps.',
      'Do not assume credit-card balances are revolving.'
    ],
    relevantSignalIds: ['patel_acct_brokerage', 'patel_acct_savings', 'patel_acct_hsa', 'patel_acct_cfu'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'pro_rata_caveat', 'dependent_care_fsa_2026_limit', 'priority_ordering', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Recommends taxable investing first without checking debt/protection.',
      'Ignores family insurance and childcare cashflow.',
      'Treats mortgage prepayment as automatically superior or inferior without rate/tax details.'
    ]
  }),
  newTask({
    id: 'patel_insurance_review',
    personaId: 'patel_denver_family_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt: 'What insurance gaps should we review first as homeowners with a young child?',
    intent: 'Test family protection prioritization across life, disability, liability/umbrella, home/auto, and health.',
    expectedAnswerNotes: [
      'Because they have a young child and mortgage, life and disability coverage deserve more attention than for a single renter without dependents.',
      'Umbrella liability may be relevant given homeownership, auto, child, and assets, but exact need depends on liability limits/assets.',
      'Do not claim exact employer coverage amounts without evidence.'
    ],
    relevantSignalIds: ['patel_mem_household', 'patel_acct_mortgage', 'patel_txn_auto_insurance_2026_05', 'patel_txn_home_insurance_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Downplays life insurance despite dependent/mortgage context.',
      'Ignores disability-income risk.',
      'Claims exact employer coverage without verification.'
    ]
  }),
  newTask({
    id: 'patel_life_insurance_need',
    personaId: 'patel_denver_family_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt: 'Do we likely need more term life insurance, and how should we estimate the amount?',
    intent: 'Test term-life need framing for married parents with mortgage and childcare.',
    expectedAnswerNotes: [
      'Use child age, mortgage balance, income dependency, childcare, and savings/investment balances.',
      'Recommend needs-based term coverage estimate, not whole life as default.',
      'Mention verifying employer group life and disability before buying individual coverage.'
    ],
    relevantSignalIds: ['patel_mem_household', 'patel_acct_mortgage', 'patel_acct_savings', 'patel_acct_brokerage'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Says no life insurance needed despite dependent and mortgage.',
      'Pushes whole life without need analysis.',
      'Gives an exact coverage number without assumptions.'
    ]
  })
];

const jordanTasks: Task[] = [
  newTask({
    id: 'jordan_spend_may_total',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'How much did I spend in May 2026, and what were the biggest categories?',
    intent: 'Test spend retrieval for mixed personal/business accounts and income exclusion.',
    expectedAnswerNotes: [
      'Exclude client income from spending.',
      'Separate personal spending, business expenses, tax/savings movements, and card payments where scope matters.',
      'A strong answer flags that business expenses and personal spend should not be collapsed blindly.'
    ],
    relevantSignalIds: ['jordan_txn_rent_2026_05', 'jordan_txn_coworking_2026_05', 'jordan_txn_delta_2026_05'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'consumption_spend_total_scope', 'no_income_as_spend', 'no_card_payment_as_spend', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Includes client deposits as spending.',
      'Treats card payment as new consumption without caveat.',
      'Does not separate business vs personal.'
    ]
  }),
  newTask({
    id: 'jordan_business_expenses_may',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'How much did I spend on business expenses in May, and which items should I categorize carefully?',
    intent: 'Test business-expense retrieval and tax-category caution.',
    expectedAnswerNotes: [
      'Business expenses include coworking, software, business travel, office supplies, and possibly a business-use share of internet/phone if substantiated.',
      'Do not include rent/medical/groceries as business expenses without evidence.',
      'Flag travel substantiation and mixed-use internet/phone as careful categories.'
    ],
    relevantSignalIds: ['jordan_txn_coworking_2026_05', 'jordan_txn_adobe_2026_05', 'jordan_txn_delta_2026_05', 'jordan_txn_office_depot_2026_05'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'business_personal_separation', 'no_income_as_spend', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Classifies personal rent or groceries as business deductions without evidence.',
      'Misses software or travel.',
      'Gives tax advice without substantiation caveats.'
    ]
  }),
  newTask({
    id: 'jordan_recurring_charges_audit',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'transaction_intelligence',
    type: 'data_retrieval',
    prompt: 'Which recurring personal or business charges should I review, and what are their monthly amounts?',
    intent: 'Test recurring SaaS/bills audit for freelancer context.',
    expectedAnswerNotes: [
      'Recurring candidates include WeWork, marketplace health premium, Adobe, Figma, Webflow, AWS, Google Workspace, Spectrum, Visible, and rent.',
      'Separate business SaaS from personal bills and housing.',
      'Do not infer exact plan tiers from charge amounts or cite current public promo/plan prices unless verified.'
    ],
    relevantSignalIds: ['jordan_txn_coworking_2026_05', 'jordan_txn_marketplace_health_2026_05', 'jordan_txn_adobe_2026_05', 'jordan_txn_spectrum_2026_05'],
    rubric: dataRetrievalRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_period_scope_may_2026', 'exact_amount_grounding', 'recurring_scope_boundary', 'recurring_review_scope_strict', 'no_subscription_tier_fabrication', 'no_unverified_public_subscription_pricing', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Misses obvious software subscriptions.',
      'Calls rent a cancellable subscription without labeling it separately.',
      'Invents plan tiers or cites exact public promo/plan prices without verification.'
    ]
  }),
  newTask({
    id: 'jordan_where_wasting_money',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt: 'Where am I most likely wasting money or leaking value based on my transactions and balances?',
    intent: 'Test freelancer opportunity discovery across tax reserve, card interest, SaaS stack, cash buckets, and business deductions.',
    expectedAnswerNotes: [
      'High-value candidates include credit-card balance/interest verification, tax-reserve discipline, business expense categorization, SaaS/coworking review, HSA, and rewards on business travel/software.',
      'Rank by likely dollar impact and risk.',
      'Do not imply cutting business tools that may generate income without asking utility/value.'
    ],
    relevantSignalIds: ['jordan_acct_ink', 'jordan_acct_tax_savings', 'jordan_txn_coworking_2026_05', 'jordan_txn_adobe_2026_05'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Only suggests generic budgeting.',
      'Misses tax reserve and card-interest checks.',
      'Treats all business expenses as waste.'
    ]
  }),
  newTask({
    id: 'jordan_subscriptions_benefits',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'savings_expense_reduction',
    type: 'insight_discovery',
    prompt: 'Are any of my subscriptions or recurring business tools worth changing?',
    intent: 'Test SaaS consolidation advice without overclaiming plan details.',
    expectedAnswerNotes: [
      'Relevant observed May charges include Adobe $59.99, Figma $15.00, Webflow $39.00, AWS $82.44, Google Workspace $14.40, WeWork $350.00, Spectrum $79.99, Visible Wireless $35.00, and marketplace health insurance $415.00 if discussing recurring bills beyond business tools.',
      'Only May is observed for these charges. A strong answer uses exact May amounts and annualizes conditionally if they repeat monthly; it does not halve or average the charges because a 60-day lookback was requested.',
      'A strong answer separates cancel, downgrade, annual-plan discount, client-reimbursable, and tax-deductible from true savings.',
      'Tax deductibility reduces after-tax cost but does not make waste free.',
      'Do not infer exact plan tiers from charge amounts or cite current public promo/plan prices unless verified.'
    ],
    relevantSignalIds: ['jordan_txn_adobe_2026_05', 'jordan_txn_figma_software_2026_05', 'jordan_txn_webflow_2026_05', 'jordan_txn_coworking_2026_05'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'recurring_scope_boundary', 'recurring_review_scope_strict', 'no_subscription_tier_fabrication', 'no_unverified_public_subscription_pricing', 'business_personal_separation', 'hsa_limit_currentness', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes plan tiers or cites exact public promo/plan prices without verification.',
      'Says business deductions make costs irrelevant.',
      'Misses duplicate design/web/software stack review.'
    ]
  }),
  newTask({
    id: 'jordan_rent_affordability',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'housing_rent',
    type: 'domain_advice',
    prompt: 'Is my Austin rent reasonable for my irregular freelance income, and what would you check before I move?',
    intent: 'Test rent affordability for volatile income using transactions and cash reserves.',
    expectedAnswerNotes: [
      'Use $2,100 rent, irregular May client income, and cash/tax reserve balances.',
      'A strong answer avoids annualizing one strong month as stable income.',
      'Before moving, compare emergency fund, tax reserve, lease costs, commute/client needs, and roommate/negotiation options.'
    ],
    relevantSignalIds: ['jordan_txn_rent_2026_05', 'jordan_txn_client_figma_2026_05', 'jordan_acct_tax_savings', 'jordan_mem_work'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'tax_reserve_protection', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Annualizes one month of freelance income as guaranteed.',
      'Ignores tax reserve.',
      'Tells Jordan to move without comparing transaction costs and income volatility.'
    ]
  }),
  newTask({
    id: 'jordan_home_office_rent',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'housing_rent',
    type: 'domain_advice',
    prompt: 'Can any of my rent or home internet be treated as a business expense?',
    intent: 'Test home-office/mixed-use deduction prudence.',
    expectedAnswerNotes: [
      'Home-office deduction requires exclusive and regular business use; do not treat all rent as deductible.',
      'Internet/phone may require a reasonable business-use allocation and records.',
      'WeWork may reduce or complicate the home-office story, depending on actual work pattern.'
    ],
    relevantSignalIds: ['jordan_txn_rent_2026_05', 'jordan_txn_spectrum_2026_05', 'jordan_txn_cell_2026_05', 'jordan_txn_coworking_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Says all rent is deductible.',
      'Ignores exclusive-use requirement.',
      'Misses mixed-use allocation/records.'
    ]
  }),
  newTask({
    id: 'jordan_credit_card_strategy',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Given my current cards, how should I route software, business travel, groceries, dining, and office-supply spend?',
    intent: 'Test freelancer card routing using visible Ink Business Preferred and Blue Business Plus.',
    expectedAnswerNotes: [
      'Use visible Chase Ink Business Preferred and Amex Blue Business Plus.',
      'Business travel/software/office categories may favor Ink depending on terms; flat non-bonus spend may favor Blue Business Plus.',
      'Do not suggest unlinked cards except as optional candidates with pros/cons.'
    ],
    relevantSignalIds: ['jordan_acct_ink', 'jordan_acct_bbp', 'jordan_txn_adobe_2026_05', 'jordan_txn_delta_2026_05', 'jordan_txn_heb_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'card_rate_currentness', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Claims Jordan has cards not visible.',
      'Ignores business/personal separation.',
      'Recommends rewards before checking possible interest-bearing balances.'
    ]
  }),
  newTask({
    id: 'jordan_office_supplies_rewards',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'Is my office-supply and software spend being routed well, or should I consider a different setup?',
    intent: 'Test narrow rewards/business card optimization with fee and complexity caveats.',
    expectedAnswerNotes: [
      'Use Office Depot, Adobe, Figma, Webflow, AWS, and Google Workspace transactions.',
      'Visible cards should be evaluated first; optional new card suggestions must be framed as optional and justified by spend.',
      'Do not overstate savings from one month unless labeled as if typical.'
    ],
    relevantSignalIds: ['jordan_txn_office_depot_2026_05', 'jordan_txn_adobe_2026_05', 'jordan_txn_aws_2026_05', 'jordan_acct_ink'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'card_rate_currentness', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Opens a new card for tiny spend without math.',
      'Ignores current cards.',
      'Annualizes one month without caveat.'
    ]
  }),
  newTask({
    id: 'jordan_travel_rewards',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'credit_cards_rewards',
    type: 'domain_advice',
    prompt: 'I had a client trip this month. How should I think about travel rewards, reimbursements, and tax records?',
    intent: 'Test travel spend synthesis across rewards, client reimbursement, and Schedule C substantiation.',
    expectedAnswerNotes: [
      'Use Delta, Marriott, and Uber client-trip transactions.',
      'Separate rewards optimization from whether expenses are client-reimbursable and deductible.',
      'Flag receipts, business purpose, travel dates, and reimbursement treatment.'
    ],
    relevantSignalIds: ['jordan_txn_delta_2026_05', 'jordan_txn_hotel_2026_05', 'jordan_txn_uber_2026_05', 'jordan_acct_ink'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'card_rate_currentness', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Optimizes points while missing reimbursement/tax records.',
      'Treats reimbursed expenses as net deduction without caveat.',
      'Invents elite status or travel benefits.'
    ]
  }),
  newTask({
    id: 'jordan_health_insurance_marketplace',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'employer_benefits_perks',
    type: 'domain_advice',
    prompt: 'Without employer benefits, what should I check about health insurance and HSA eligibility?',
    intent: 'Test benefits replacement for self-employed user: marketplace premium, HDHP/HSA eligibility, and deduction caveats.',
    expectedAnswerNotes: [
      'Use marketplace premium and HSA contribution/account.',
      'HSA eligibility requires qualifying HDHP and no disqualifying coverage; account existence alone is not enough.',
      'Self-employed health insurance deduction and premium tax credit interactions may matter.'
    ],
    relevantSignalIds: ['jordan_mem_work', 'jordan_txn_marketplace_health_2026_05', 'jordan_acct_hsa', 'jordan_txn_hsa_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'hsa_limit_currentness', 'plan_participation_caveat', 'business_personal_separation', 'no_health_insurance_reduces_se_tax_claim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes HSA eligibility without verifying HDHP.',
      'Ignores premium tax credit/AGI interactions.',
      'Uses employer-benefit advice for a user with no employer benefits.'
    ]
  }),
  newTask({
    id: 'jordan_business_banking_perks',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'employer_benefits_perks',
    type: 'insight_discovery',
    prompt: 'What freelancer-specific perks or systems should replace the employer benefits I do not have?',
    intent: 'Test self-employed benefit-system discovery without forcing employee-style benefits.',
    expectedAnswerNotes: [
      'Relevant systems include tax reserve automation, solo retirement plan, health/HSA, disability insurance, liability/E&O insurance, bookkeeping, and business banking/card separation.',
      'Tie recommendations to visible business checking, tax reserve, card balances, health premium, and business income.',
      'Do not suggest employer-only benefits.'
    ],
    relevantSignalIds: ['jordan_mem_work', 'jordan_acct_business_checking', 'jordan_acct_tax_savings', 'jordan_txn_marketplace_health_2026_05'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Suggests employer benefits Jordan cannot access.',
      'Misses tax reserve and disability/liability protection.',
      'Gives generic freelancer advice not tied to accounts.'
    ]
  }),
  newTask({
    id: 'jordan_idle_cash',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'cashflow_budgeting',
    type: 'domain_advice',
    prompt: 'Do I have idle cash, or should I keep this much because freelance income is uneven?',
    intent: 'Test cash-bucket advice for irregular income and tax reserves.',
    expectedAnswerNotes: [
      'Use personal checking, business checking, and tax savings separately.',
      'Tax reserve should not be treated as idle spendable cash.',
      'A strong answer defines operating buffer, personal emergency fund, tax reserve, and investable excess.'
    ],
    relevantSignalIds: ['jordan_acct_personal_checking', 'jordan_acct_business_checking', 'jordan_acct_tax_savings', 'jordan_mem_work'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Treats tax reserve as excess cash.',
      'Ignores irregular income.',
      'Invests all cash without operating/emergency buffer.'
    ]
  }),
  newTask({
    id: 'jordan_checking_buffer',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'cashflow_budgeting',
    type: 'what_if',
    prompt: 'What personal and business checking buffers should I keep before moving money to tax savings or investments?',
    intent: 'Test multi-bucket buffer planning.',
    expectedAnswerNotes: [
      'Separate personal bills, business operating expenses, tax reserve, and emergency reserve.',
      'Use rent, health premium, coworking/software, and credit-card balances as anchors.',
      'Do not recommend a single combined buffer without explaining buckets.'
    ],
    relevantSignalIds: ['jordan_acct_personal_checking', 'jordan_acct_business_checking', 'jordan_txn_rent_2026_05', 'jordan_txn_coworking_2026_05'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Conflates business and personal cash.',
      'Ignores tax reserve.',
      'Fails to account for irregular income.'
    ]
  }),
  newTask({
    id: 'jordan_extra_8000',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'life_planning_major_decisions',
    type: 'prioritization',
    prompt: 'If I have an extra $8,000 after bills this quarter, what should I do with it first?',
    intent: 'Test prioritization for self-employed cash: taxes, debt, emergency, retirement, HSA, investing.',
    expectedAnswerNotes: [
      'First verify tax reserve adequacy and whether card balances are revolving.',
      'Then consider emergency fund, HSA/IRA/solo 401(k), and taxable investing.',
      'Do not invest money that may be needed for quarterly taxes.'
    ],
    relevantSignalIds: ['jordan_acct_tax_savings', 'jordan_acct_ink', 'jordan_acct_hsa', 'jordan_acct_ira'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'card_fee_or_interest_priority', 'priority_ordering', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Invests before checking taxes and card interest.',
      'Treats all extra cash as personal cash.',
      'Ignores self-employed retirement options.'
    ]
  }),
  newTask({
    id: 'jordan_credit_card_balance_check',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'debt_credit_health',
    type: 'domain_advice',
    prompt: 'Do my business credit-card balances look risky, and what should I verify before chasing rewards?',
    intent: 'Test card-balance prudence for business cards.',
    expectedAnswerNotes: [
      'Use Chase Ink and Amex Blue Business Plus balances plus $2,000 payment.',
      'A current balance is not necessarily revolving debt; verify statement balance, APR, due date, and full-statement autopay.',
      'If revolving, payoff outranks rewards and most investing.'
    ],
    relevantSignalIds: ['jordan_acct_ink', 'jordan_acct_bbp', 'jordan_txn_card_payment_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes debt is revolving without verification.',
      'Optimizes rewards while ignoring possible APR.',
      'Ignores business/personal separation.'
    ]
  }),
  newTask({
    id: 'jordan_solo401k_or_sep',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Should I open a solo 401(k) or SEP IRA for my consulting income this year?',
    intent: 'Test self-employed retirement-plan advice and tax planning.',
    expectedAnswerNotes: [
      'Use Schedule C/self-employed memory and May business income but avoid annualizing one month as guaranteed.',
      'Compare solo 401(k) employee + employer contribution flexibility against SEP IRA simplicity and pro-rata/backdoor Roth implications.',
      'Mention setup deadlines, bookkeeping/net profit, and tax-reserve sequencing.'
    ],
    relevantSignalIds: ['jordan_mem_household', 'jordan_txn_client_figma_2026_05', 'jordan_txn_client_notion_2026_05', 'jordan_acct_ira'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'self_employed_tax_coverage', 'pro_rata_caveat', 'irs_limit_currentness', 'no_solo401k_reduces_se_tax_claim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Annualizes one month as certain full-year income.',
      'Ignores net profit and self-employment tax.',
      'Misses pro-rata/backdoor Roth implications of SEP/traditional IRA balances.'
    ]
  }),
  newTask({
    id: 'jordan_roth_or_traditional_ira',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Should my next IRA dollars be Roth, traditional, or backdoor Roth?',
    intent: 'Test IRA decision under variable income and existing traditional IRA balance.',
    expectedAnswerNotes: [
      'Existing traditional IRA balance matters for backdoor Roth pro-rata treatment.',
      'Income volatility means Roth vs traditional depends on expected full-year taxable income and deductions.',
      'Use current IRA limits and avoid stale values.'
    ],
    relevantSignalIds: ['jordan_acct_ira', 'jordan_txn_client_figma_2026_05', 'jordan_mem_work'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'ira_limit_currentness', 'roth_income_phaseout_currentness', 'pro_rata_caveat', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Ignores pro-rata rule.',
      'Uses stale IRA limits.',
      'Pretends May income determines annual eligibility.'
    ]
  }),
  newTask({
    id: 'jordan_hsa',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'retirement_tax_advantaged',
    type: 'domain_advice',
    prompt: 'Should I keep funding my HSA, and what limit or eligibility checks matter?',
    intent: 'Test self-only HSA advice with HDHP verification.',
    expectedAnswerNotes: [
      'Use HSA account and $300 May HSA contribution.',
      'HSA eligibility requires qualifying HDHP and no disqualifying coverage; marketplace premium alone does not prove HDHP.',
      'Use current self-only HSA limit if self-only coverage is assumed and label assumption.'
    ],
    relevantSignalIds: ['jordan_acct_hsa', 'jordan_txn_hsa_2026_05', 'jordan_txn_marketplace_health_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'hsa_limit_currentness', 'plan_participation_caveat', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Assumes HDHP eligibility without checking.',
      'Uses family HSA limit for single/no-dependents context without caveat.',
      'Uses stale HSA limit.'
    ]
  }),
  newTask({
    id: 'jordan_quarterly_estimated_taxes',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Based on my consulting income and tax reserve, what should I do about quarterly estimated taxes?',
    intent: 'Test estimated-tax planning with income, reserve, prior payment, and safe-harbor caveats.',
    expectedAnswerNotes: [
      'Use May client income, tax reserve balance, and April 15 estimated payment.',
      'Discuss federal income tax, self-employment tax, possible state tax context for Texas, and safe-harbor rules.',
      'Do not compute a final required payment without full-year income, deductions, and prior-year tax.'
    ],
    relevantSignalIds: ['jordan_txn_client_figma_2026_05', 'jordan_txn_client_notion_2026_05', 'jordan_txn_stripe_2026_05', 'jordan_txn_estimated_tax_2026_04'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'self_employed_tax_coverage', 'no_solo401k_reduces_se_tax_claim', 'no_health_insurance_reduces_se_tax_claim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Ignores self-employment tax.',
      'Treats one month as annual income.',
      'Gives false precision without prior-year tax or full-year forecast.'
    ]
  }),
  newTask({
    id: 'jordan_home_office_deduction',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'What business deductions should I track from this month, and which ones are risky?',
    intent: 'Test grounded Schedule C deduction discovery and risk control.',
    expectedAnswerNotes: [
      'Clearly support software, coworking, business travel, office supplies, and possibly business-use portions of internet/phone.',
      'Flag rent/home office, meals, travel, and mixed-use expenses as needing records/business purpose.',
      'Do not invent deductions or treat personal medical/groceries as business expenses.'
    ],
    relevantSignalIds: ['jordan_txn_coworking_2026_05', 'jordan_txn_adobe_2026_05', 'jordan_txn_hotel_2026_05', 'jordan_txn_spectrum_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'self_employed_tax_coverage', 'no_health_insurance_reduces_se_tax_claim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Claims all rent or meals are deductible.',
      'Misses recordkeeping requirements.',
      'Includes personal expenses as business deductions.'
    ]
  }),
  newTask({
    id: 'jordan_tax_optimization',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'tax_strategy',
    type: 'insight_discovery',
    prompt: 'What are the highest-value 2026 tax moves I should check as a self-employed consultant?',
    intent: 'Test broad freelancer tax strategy across estimates, retirement, HSA, deductions, and entity planning.',
    expectedAnswerNotes: [
      'Strong candidates include estimated-tax system, solo 401(k)/SEP, HSA, self-employed health insurance deduction, accountable reimbursement/client invoicing records, and business deductions.',
      'S-corp/LLC discussion can be valid only with profit/payroll/admin caveats.',
      'Prioritize by confidence and dollar impact.'
    ],
    relevantSignalIds: ['jordan_mem_work', 'jordan_acct_tax_savings', 'jordan_txn_marketplace_health_2026_05', 'jordan_txn_client_figma_2026_05'],
    rubric: discoveryRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'self_employed_tax_coverage', 'hsa_limit_currentness', 'no_health_insurance_reduces_se_tax_claim', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Gives generic W-2 tax tips.',
      'Misses estimated taxes and self-employment tax.',
      'Recommends S-corp as automatic without profit/admin caveats.'
    ]
  }),
  newTask({
    id: 'jordan_scorp_or_llc',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'tax_strategy',
    type: 'domain_advice',
    prompt: 'Do my transactions suggest I should look into an LLC or S-corp election?',
    intent: 'Test entity-choice advice grounded in visible business income but not overfit to one month.',
    expectedAnswerNotes: [
      'May income is strong but one month is not enough to prove annual net profit.',
      'LLC can be liability/admin; S-corp is tax/payroll/admin and depends on net profit after reasonable salary.',
      'A strong answer recommends a CPA calculation once trailing profit is known.'
    ],
    relevantSignalIds: ['jordan_txn_client_figma_2026_05', 'jordan_txn_client_notion_2026_05', 'jordan_acct_business_checking', 'jordan_mem_work'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'self_employed_tax_coverage', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Recommends S-corp automatically from one good month.',
      'Ignores payroll/admin costs.',
      'Confuses LLC liability treatment with tax savings.'
    ]
  }),
  newTask({
    id: 'jordan_taxable_investing_after_tax_reserve',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'investing_equity_comp',
    type: 'prioritization',
    prompt: 'Should I invest more in taxable brokerage right now, or hold cash for taxes and volatility?',
    intent: 'Test investing priority under tax reserve and irregular income constraints.',
    expectedAnswerNotes: [
      'Use brokerage, tax savings, checking, business checking, client income, and card balances.',
      'Tax reserve and confirmed revolving debt should be resolved before extra taxable investing.',
      'Emergency/operating reserves matter more for self-employed volatility.'
    ],
    relevantSignalIds: ['jordan_acct_brokerage', 'jordan_acct_tax_savings', 'jordan_acct_ink', 'jordan_mem_work'],
    rubric: planningRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'hsa_limit_currentness', 'card_fee_or_interest_priority', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Invests tax reserve cash.',
      'Ignores credit-card APR check.',
      'Annualizes May income as stable.'
    ]
  }),
  newTask({
    id: 'jordan_crypto_concentration',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'investing_equity_comp',
    type: 'domain_advice',
    prompt: 'Is my crypto balance a concentration risk given the rest of my finances?',
    intent: 'Test investment-risk advice using account balances and volatile-income context.',
    expectedAnswerNotes: [
      'Use Coinbase, brokerage, cash, IRA, HSA, and card balances.',
      'Risk should be framed as portfolio/liquidity concentration, not a crypto price prediction.',
      'Recommend sizing policy, rebalancing, and tax-lot caveats if selling.'
    ],
    relevantSignalIds: ['jordan_acct_crypto', 'jordan_acct_brokerage', 'jordan_acct_tax_savings', 'jordan_mem_work'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'tax_reserve_protection', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Gives a crypto price call.',
      'Ignores taxes and liquidity.',
      'Misses irregular income context.'
    ]
  }),
  newTask({
    id: 'jordan_insurance_review',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt: 'What insurance gaps should I check as a self-employed consultant with no dependents?',
    intent: 'Test self-employed protection prioritization.',
    expectedAnswerNotes: [
      'Priorities include health coverage/HDHP fit, disability insurance, professional liability/E&O, general liability, renter liability, and cyber/data risk if relevant.',
      'Life insurance is lower priority without dependents unless debts/estate goals exist.',
      'Tie to visible marketplace premium, business work, and no employer benefits.'
    ],
    relevantSignalIds: ['jordan_mem_work', 'jordan_mem_household', 'jordan_txn_marketplace_health_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'plan_participation_caveat', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Pushes life insurance first despite no dependents.',
      'Misses disability and professional liability.',
      'Assumes employer disability coverage exists.'
    ]
  }),
  newTask({
    id: 'jordan_disability_liability_need',
    personaId: 'jordan_austin_freelancer_v0',
    domain: 'insurance_risk_protection',
    type: 'domain_advice',
    prompt: 'Should disability insurance or professional liability insurance come first for me?',
    intent: 'Test risk-prioritization for a solo consultant.',
    expectedAnswerNotes: [
      'Disability protects income; professional liability protects against client-work claims.',
      'Both can be important; priority depends on emergency fund, client contracts, savings, and income reliance.',
      'Do not claim exact premiums or coverage amounts without quoting.'
    ],
    relevantSignalIds: ['jordan_mem_work', 'jordan_acct_personal_checking', 'jordan_acct_business_checking', 'jordan_txn_client_figma_2026_05'],
    rubric: adviceRubric,
    deterministicChecks: ['relevant_signal_grounding', 'exact_amount_grounding', 'business_personal_separation', 'no_raw_tool_or_stream_output'],
    invalidOrHarmful: [
      'Ignores disability income risk.',
      'Ignores professional/client liability.',
      'Invents exact policy terms or premiums.'
    ]
  })
];

export const tasks: Task[] = [...mariaTasks, ...patelTasks, ...jordanTasks];
