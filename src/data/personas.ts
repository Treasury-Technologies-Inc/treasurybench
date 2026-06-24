import type { Persona } from '../schema';

export const mariaSeattle: Persona = {
  id: 'maria_seattle_v0',
  displayName: 'Maria Chen',
  asOfDate: '2026-05-31',
  summary: 'Seattle renter with linked checking, savings, credit card, 401(k), and brokerage data.',
  memories: [
    {
      id: 'mem_location_household',
      text: 'Maria lives alone in Seattle, WA.'
    },
    {
      id: 'mem_employer',
      text: 'Maria works at Microsoft.'
    },
    {
      id: 'mem_preferences',
      text: 'Maria prefers practical recommendations with clear dollar impact and exact next steps.'
    }
  ],
  accounts: [
    {
      id: 'acct_chase_checking',
      name: 'Chase Total Checking',
      type: 'checking',
      subtype: 'checking',
      institution: 'Chase',
      mask: '8511',
      balance: 18450,
      availableBalance: 18425,
      currency: 'USD'
    },
    {
      id: 'acct_ally_savings',
      name: 'Ally Online Savings',
      type: 'savings',
      subtype: 'savings',
      institution: 'Ally',
      mask: '3382',
      balance: 5250,
      availableBalance: 5250,
      currency: 'USD'
    },
    {
      id: 'acct_csp',
      name: 'Chase Sapphire Preferred',
      type: 'credit_card',
      subtype: 'credit card',
      institution: 'Chase',
      mask: '8600',
      balance: 1840,
      availableBalance: 8160,
      currency: 'USD'
    },
    {
      id: 'acct_msft_401k',
      name: 'MICROSOFT CORPORATION 401K',
      type: '401k',
      subtype: '401k',
      institution: 'Fidelity',
      mask: '8216',
      balance: 48500,
      currency: 'USD'
    },
    {
      id: 'acct_traditional_ira',
      name: 'Fidelity Traditional IRA',
      type: 'ira',
      subtype: 'traditional ira',
      institution: 'Fidelity',
      mask: '4401',
      balance: 0,
      currency: 'USD'
    },
    {
      id: 'acct_robinhood',
      name: 'Robinhood Individual Brokerage',
      type: 'brokerage',
      subtype: 'taxable brokerage',
      institution: 'Robinhood',
      mask: '7238',
      balance: 62300,
      currency: 'USD'
    }
  ],
  transactions: [
    {
      id: 'txn_ally_interest_2026_05',
      date: '2026-05-31',
      merchant: 'Ally Bank Interest',
      amount: 17.06,
      accountId: 'acct_ally_savings',
      category: 'Interest Income',
      notes: 'Monthly savings interest deposit'
    },
    {
      id: 'txn_payroll_2026_05_15',
      date: '2026-05-15',
      merchant: 'Microsoft Payroll',
      amount: 1840,
      accountId: 'acct_chase_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $2,500; 401(k) employee deferral 8%'
    },
    {
      id: 'txn_payroll_2026_05_31',
      date: '2026-05-31',
      merchant: 'Microsoft Payroll',
      amount: 1840,
      accountId: 'acct_chase_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $2,500; 401(k) employee deferral 8%'
    },
    {
      id: 'txn_401k_employee_deferral_2026_05_15',
      date: '2026-05-15',
      merchant: 'Microsoft 401k Employee Deferral',
      amount: 200,
      accountId: 'acct_msft_401k',
      category: 'Retirement Contribution',
      notes: 'Employee 401(k) contribution from 8% of $2,500 semi-monthly gross pay'
    },
    {
      id: 'txn_401k_employee_deferral_2026_05_31',
      date: '2026-05-31',
      merchant: 'Microsoft 401k Employee Deferral',
      amount: 200,
      accountId: 'acct_msft_401k',
      category: 'Retirement Contribution',
      notes: 'Employee 401(k) contribution from 8% of $2,500 semi-monthly gross pay'
    },
    {
      id: 'txn_msft_rsu_vest_2026_05',
      date: '2026-05-10',
      merchant: 'Microsoft RSU Vest',
      amount: 42000,
      accountId: 'acct_robinhood',
      category: 'Investment Income',
      notes: 'Vested Microsoft RSUs deposited to taxable brokerage'
    },
    {
      id: 'txn_rent_2026_05',
      date: '2026-05-01',
      merchant: 'Cascade Apartments',
      amount: -2350,
      accountId: 'acct_chase_checking',
      category: 'Rent',
      notes: '1 bedroom apartment in Seattle'
    },
    {
      id: 'txn_rent_2026_04',
      date: '2026-04-01',
      merchant: 'Cascade Apartments',
      amount: -2350,
      accountId: 'acct_chase_checking',
      category: 'Rent'
    },
    {
      id: 'txn_rent_2026_03',
      date: '2026-03-01',
      merchant: 'Cascade Apartments',
      amount: -2350,
      accountId: 'acct_chase_checking',
      category: 'Rent'
    },
    {
      id: 'txn_costco_2026_05_04',
      date: '2026-05-04',
      merchant: 'Costco Wholesale',
      amount: -286.41,
      accountId: 'acct_csp',
      category: 'Groceries'
    },
    {
      id: 'txn_costco_2026_05_19',
      date: '2026-05-19',
      merchant: 'Costco Wholesale',
      amount: -214.82,
      accountId: 'acct_csp',
      category: 'Groceries'
    },
    {
      id: 'txn_costco_gas_2026_05_21',
      date: '2026-05-21',
      merchant: 'Costco Gas',
      amount: -58.23,
      accountId: 'acct_csp',
      category: 'Gas'
    },
    {
      id: 'txn_safeway_2026_05_10',
      date: '2026-05-10',
      merchant: 'Safeway',
      amount: -94.18,
      accountId: 'acct_csp',
      category: 'Groceries'
    },
    {
      id: 'txn_trader_joes_2026_05_17',
      date: '2026-05-17',
      merchant: "Trader Joe's",
      amount: -76.44,
      accountId: 'acct_csp',
      category: 'Groceries'
    },
    {
      id: 'txn_dining_2026_05_03',
      date: '2026-05-03',
      merchant: 'Oddfellows Cafe',
      amount: -42.16,
      accountId: 'acct_csp',
      category: 'Dining'
    },
    {
      id: 'txn_dining_2026_05_08',
      date: '2026-05-08',
      merchant: 'Tavolata',
      amount: -88.7,
      accountId: 'acct_csp',
      category: 'Dining'
    },
    {
      id: 'txn_dining_2026_05_24',
      date: '2026-05-24',
      merchant: 'Ramen Danbo',
      amount: -31.25,
      accountId: 'acct_csp',
      category: 'Dining'
    },
    {
      id: 'txn_alaska_2026_05_06',
      date: '2026-05-06',
      merchant: 'Alaska Airlines',
      amount: -248.2,
      accountId: 'acct_csp',
      category: 'Travel',
      notes: 'SEA to SFO'
    },
    {
      id: 'txn_alaska_2026_04_12',
      date: '2026-04-12',
      merchant: 'Alaska Airlines',
      amount: -231.1,
      accountId: 'acct_csp',
      category: 'Travel',
      notes: 'SFO to SEA'
    },
    {
      id: 'txn_avis_2026_05_07',
      date: '2026-05-07',
      merchant: 'Avis Rent A Car',
      amount: -312.44,
      accountId: 'acct_csp',
      category: 'Travel',
      notes: 'SFO work trip rental car'
    },
    {
      id: 'txn_lyft_2026_05_11',
      date: '2026-05-11',
      merchant: 'Lyft',
      amount: -27.8,
      accountId: 'acct_csp',
      category: 'Transportation'
    },
    {
      id: 'txn_uber_2026_05_22',
      date: '2026-05-22',
      merchant: 'Uber',
      amount: -34.1,
      accountId: 'acct_csp',
      category: 'Transportation'
    },
    {
      id: 'txn_comcast_2026_05',
      date: '2026-05-05',
      merchant: 'Xfinity',
      amount: -89,
      accountId: 'acct_csp',
      category: 'Utilities'
    },
    {
      id: 'txn_att_2026_05',
      date: '2026-05-09',
      merchant: 'AT&T Wireless',
      amount: -72,
      accountId: 'acct_csp',
      category: 'Phone'
    },
    {
      id: 'txn_netflix_2026_05',
      date: '2026-05-13',
      merchant: 'Netflix',
      amount: -22.99,
      accountId: 'acct_csp',
      category: 'Subscriptions'
    },
    {
      id: 'txn_adobe_2026_05',
      date: '2026-05-14',
      merchant: 'Adobe',
      amount: -59.99,
      accountId: 'acct_csp',
      category: 'Subscriptions'
    },
    {
      id: 'txn_classpass_2026_05',
      date: '2026-05-16',
      merchant: 'ClassPass',
      amount: -89,
      accountId: 'acct_csp',
      category: 'Fitness'
    },
    {
      id: 'txn_freelance_2026_05',
      date: '2026-05-20',
      merchant: 'Figma Consulting Client',
      amount: 1200,
      accountId: 'acct_chase_checking',
      category: 'Freelance Income'
    }
  ]
};

export const patelDenverFamily: Persona = {
  id: 'patel_denver_family_v0',
  displayName: 'Priya and Daniel Patel',
  asOfDate: '2026-05-31',
  summary:
    'Denver married homeowners with a toddler, daycare costs, mortgage, dual W-2 income, HSA access, 529 savings, and family protection needs.',
  memories: [
    {
      id: 'patel_mem_household',
      text: 'Priya and Daniel are married filing jointly, live in Denver, CO, and have one child age 3.'
    },
    {
      id: 'patel_mem_employers',
      text:
        'Priya works at Salesforce with a 401(k), HDHP/HSA option, dependent care FSA, and backup-care benefit. Daniel works at UCHealth with a 401(k) and group life/disability benefits.'
    },
    {
      id: 'patel_mem_preferences',
      text:
        'They want recommendations that protect family cashflow first, then optimize taxes, childcare, rewards, and college savings without creating too much admin.'
    }
  ],
  accounts: [
    {
      id: 'patel_acct_checking',
      name: 'Chase Premier Plus Checking',
      type: 'checking',
      subtype: 'checking',
      institution: 'Chase',
      mask: '4412',
      balance: 14680,
      availableBalance: 14640,
      currency: 'USD'
    },
    {
      id: 'patel_acct_savings',
      name: 'Marcus Online Savings',
      type: 'savings',
      subtype: 'high yield savings',
      institution: 'Marcus',
      mask: '1188',
      balance: 28750,
      availableBalance: 28750,
      currency: 'USD'
    },
    {
      id: 'patel_acct_cfu',
      name: 'Chase Freedom Unlimited',
      type: 'credit_card',
      subtype: 'credit card',
      institution: 'Chase',
      mask: '2094',
      balance: 3120,
      availableBalance: 16880,
      currency: 'USD'
    },
    {
      id: 'patel_acct_amex_gold',
      name: 'American Express Gold Card',
      type: 'credit_card',
      subtype: 'credit card',
      institution: 'American Express',
      mask: '1005',
      balance: 1850,
      availableBalance: 9150,
      currency: 'USD'
    },
    {
      id: 'patel_acct_mortgage',
      name: 'Rocket Mortgage Home Loan',
      type: 'loan',
      subtype: 'mortgage',
      institution: 'Rocket Mortgage',
      mask: '7781',
      balance: -462000,
      currency: 'USD'
    },
    {
      id: 'patel_acct_priya_401k',
      name: 'Salesforce 401K Plan',
      type: '401k',
      subtype: '401k',
      institution: 'Fidelity',
      mask: '5519',
      balance: 142000,
      currency: 'USD'
    },
    {
      id: 'patel_acct_daniel_401k',
      name: 'UCHealth 401K Plan',
      type: '401k',
      subtype: '401k',
      institution: 'Empower',
      mask: '6621',
      balance: 98000,
      currency: 'USD'
    },
    {
      id: 'patel_acct_hsa',
      name: 'HealthEquity HSA',
      type: 'hsa',
      subtype: 'family hsa',
      institution: 'HealthEquity',
      mask: '2323',
      balance: 6800,
      currency: 'USD'
    },
    {
      id: 'patel_acct_529',
      name: 'Colorado 529 CollegeInvest',
      type: 'brokerage',
      subtype: '529 plan',
      institution: 'CollegeInvest',
      mask: '9150',
      balance: 12400,
      currency: 'USD'
    },
    {
      id: 'patel_acct_brokerage',
      name: 'Vanguard Taxable Brokerage',
      type: 'brokerage',
      subtype: 'taxable brokerage',
      institution: 'Vanguard',
      mask: '3902',
      balance: 54000,
      currency: 'USD'
    }
  ],
  transactions: [
    {
      id: 'patel_txn_priya_payroll_2026_05_15',
      date: '2026-05-15',
      merchant: 'Salesforce Payroll',
      amount: 5200,
      accountId: 'patel_acct_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $8,750; 401(k) employee deferral 8%'
    },
    {
      id: 'patel_txn_priya_payroll_2026_05_31',
      date: '2026-05-31',
      merchant: 'Salesforce Payroll',
      amount: 5200,
      accountId: 'patel_acct_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $8,750; 401(k) employee deferral 8%'
    },
    {
      id: 'patel_txn_daniel_payroll_2026_05_15',
      date: '2026-05-15',
      merchant: 'UCHealth Payroll',
      amount: 3125,
      accountId: 'patel_acct_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $5,000; 401(k) employee deferral 6%'
    },
    {
      id: 'patel_txn_daniel_payroll_2026_05_31',
      date: '2026-05-31',
      merchant: 'UCHealth Payroll',
      amount: 3125,
      accountId: 'patel_acct_checking',
      category: 'Income',
      notes: 'Semi-monthly net payroll deposit; paystub gross base pay $5,000; 401(k) employee deferral 6%'
    },
    {
      id: 'patel_txn_priya_401k_2026_05_15',
      date: '2026-05-15',
      merchant: 'Salesforce 401k Employee Deferral',
      amount: 700,
      accountId: 'patel_acct_priya_401k',
      category: 'Retirement Contribution',
      notes: '8% of $8,750 semi-monthly gross pay'
    },
    {
      id: 'patel_txn_priya_401k_2026_05_31',
      date: '2026-05-31',
      merchant: 'Salesforce 401k Employee Deferral',
      amount: 700,
      accountId: 'patel_acct_priya_401k',
      category: 'Retirement Contribution',
      notes: '8% of $8,750 semi-monthly gross pay'
    },
    {
      id: 'patel_txn_daniel_401k_2026_05_15',
      date: '2026-05-15',
      merchant: 'UCHealth 401k Employee Deferral',
      amount: 300,
      accountId: 'patel_acct_daniel_401k',
      category: 'Retirement Contribution',
      notes: '6% of $5,000 semi-monthly gross pay'
    },
    {
      id: 'patel_txn_daniel_401k_2026_05_31',
      date: '2026-05-31',
      merchant: 'UCHealth 401k Employee Deferral',
      amount: 300,
      accountId: 'patel_acct_daniel_401k',
      category: 'Retirement Contribution',
      notes: '6% of $5,000 semi-monthly gross pay'
    },
    {
      id: 'patel_txn_mortgage_2026_05',
      date: '2026-05-01',
      merchant: 'Rocket Mortgage',
      amount: -3850,
      accountId: 'patel_acct_checking',
      category: 'Mortgage',
      notes: 'Principal, interest, taxes, and insurance for Denver home'
    },
    {
      id: 'patel_txn_daycare_2026_05',
      date: '2026-05-03',
      merchant: 'Bright Horizons Daycare',
      amount: -1650,
      accountId: 'patel_acct_cfu',
      category: 'Childcare'
    },
    {
      id: 'patel_txn_backup_care_2026_05',
      date: '2026-05-17',
      merchant: 'Care.com Backup Care',
      amount: -220,
      accountId: 'patel_acct_cfu',
      category: 'Childcare',
      notes: 'One day of backup childcare'
    },
    {
      id: 'patel_txn_529_2026_05',
      date: '2026-05-06',
      merchant: 'Colorado 529 CollegeInvest',
      amount: -300,
      accountId: 'patel_acct_checking',
      category: 'Education Savings'
    },
    {
      id: 'patel_txn_hsa_2026_05',
      date: '2026-05-08',
      merchant: 'HealthEquity HSA Contribution',
      amount: -400,
      accountId: 'patel_acct_checking',
      category: 'HSA Contribution'
    },
    {
      id: 'patel_txn_costco_2026_05_04',
      date: '2026-05-04',
      merchant: 'Costco Wholesale',
      amount: -424.18,
      accountId: 'patel_acct_cfu',
      category: 'Groceries'
    },
    {
      id: 'patel_txn_costco_2026_05_18',
      date: '2026-05-18',
      merchant: 'Costco Wholesale',
      amount: -312.62,
      accountId: 'patel_acct_cfu',
      category: 'Groceries'
    },
    {
      id: 'patel_txn_king_soopers_2026_05',
      date: '2026-05-11',
      merchant: 'King Soopers',
      amount: -286.74,
      accountId: 'patel_acct_amex_gold',
      category: 'Groceries'
    },
    {
      id: 'patel_txn_target_2026_05',
      date: '2026-05-21',
      merchant: 'Target',
      amount: -242.19,
      accountId: 'patel_acct_cfu',
      category: 'Household'
    },
    {
      id: 'patel_txn_dining_2026_05_10',
      date: '2026-05-10',
      merchant: 'Snooze AM Eatery',
      amount: -86.4,
      accountId: 'patel_acct_amex_gold',
      category: 'Dining'
    },
    {
      id: 'patel_txn_dining_2026_05_24',
      date: '2026-05-24',
      merchant: 'Blue Pan Pizza',
      amount: -78.35,
      accountId: 'patel_acct_amex_gold',
      category: 'Dining'
    },
    {
      id: 'patel_txn_xcel_2026_05',
      date: '2026-05-12',
      merchant: 'Xcel Energy',
      amount: -164.22,
      accountId: 'patel_acct_checking',
      category: 'Utilities'
    },
    {
      id: 'patel_txn_comcast_2026_05',
      date: '2026-05-13',
      merchant: 'Xfinity',
      amount: -119,
      accountId: 'patel_acct_checking',
      category: 'Internet'
    },
    {
      id: 'patel_txn_auto_insurance_2026_05',
      date: '2026-05-15',
      merchant: 'State Farm Auto Insurance',
      amount: -218,
      accountId: 'patel_acct_checking',
      category: 'Insurance'
    },
    {
      id: 'patel_txn_home_insurance_2026_05',
      date: '2026-05-16',
      merchant: 'State Farm Home Insurance',
      amount: -154,
      accountId: 'patel_acct_checking',
      category: 'Insurance'
    },
    {
      id: 'patel_txn_disney_2026_05',
      date: '2026-05-09',
      merchant: 'Disney Plus',
      amount: -15.99,
      accountId: 'patel_acct_cfu',
      category: 'Subscriptions'
    },
    {
      id: 'patel_txn_spotify_2026_05',
      date: '2026-05-14',
      merchant: 'Spotify Family',
      amount: -19.99,
      accountId: 'patel_acct_cfu',
      category: 'Subscriptions'
    },
    {
      id: 'patel_txn_peloton_2026_05',
      date: '2026-05-23',
      merchant: 'Peloton',
      amount: -44,
      accountId: 'patel_acct_cfu',
      category: 'Fitness'
    },
    {
      id: 'patel_txn_car_payment_2026_05',
      date: '2026-05-26',
      merchant: 'Toyota Financial',
      amount: -485,
      accountId: 'patel_acct_checking',
      category: 'Auto Loan'
    },
    {
      id: 'patel_txn_medical_2026_05',
      date: '2026-05-27',
      merchant: 'Kaiser Permanente',
      amount: -185.4,
      accountId: 'patel_acct_hsa',
      category: 'Medical'
    }
  ]
};

export const jordanAustinFreelancer: Persona = {
  id: 'jordan_austin_freelancer_v0',
  displayName: 'Jordan Rivera',
  asOfDate: '2026-05-31',
  summary:
    'Austin self-employed UX consultant with irregular 1099 income, business expenses, tax-reserve needs, marketplace health coverage, HSA, IRA, credit-card balances, and travel-heavy client work.',
  memories: [
    {
      id: 'jordan_mem_household',
      text: 'Jordan lives alone in Austin, TX, has no dependents, and is self-employed as a UX consultant filing Schedule C.'
    },
    {
      id: 'jordan_mem_work',
      text:
        'Jordan has no employer benefits and buys individual marketplace health insurance. Jordan wants tax-safe cashflow and low-admin financial systems because income arrives unevenly.'
    },
    {
      id: 'jordan_mem_preferences',
      text:
        'Jordan prefers advice that separates business, tax, emergency, and personal spending buckets before recommending investing or new cards.'
    }
  ],
  accounts: [
    {
      id: 'jordan_acct_personal_checking',
      name: 'Capital One 360 Checking',
      type: 'checking',
      subtype: 'checking',
      institution: 'Capital One',
      mask: '4470',
      balance: 9650,
      availableBalance: 9650,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_business_checking',
      name: 'Bluevine Business Checking',
      type: 'checking',
      subtype: 'business checking',
      institution: 'Bluevine',
      mask: '8810',
      balance: 7420,
      availableBalance: 7420,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_tax_savings',
      name: 'Ally Tax Reserve Savings',
      type: 'savings',
      subtype: 'tax reserve savings',
      institution: 'Ally',
      mask: '5391',
      balance: 18500,
      availableBalance: 18500,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_ink',
      name: 'Chase Ink Business Preferred',
      type: 'credit_card',
      subtype: 'business credit card',
      institution: 'Chase',
      mask: '4028',
      balance: 5210,
      availableBalance: 14790,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_bbp',
      name: 'American Express Blue Business Plus',
      type: 'credit_card',
      subtype: 'business credit card',
      institution: 'American Express',
      mask: '7721',
      balance: 1185,
      availableBalance: 8815,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_ira',
      name: 'Vanguard Traditional IRA',
      type: 'ira',
      subtype: 'traditional ira',
      institution: 'Vanguard',
      mask: '6104',
      balance: 22400,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_hsa',
      name: 'Fidelity HSA',
      type: 'hsa',
      subtype: 'self-only hsa',
      institution: 'Fidelity',
      mask: '3368',
      balance: 3100,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_brokerage',
      name: 'Fidelity Individual Brokerage',
      type: 'brokerage',
      subtype: 'taxable brokerage',
      institution: 'Fidelity',
      mask: '2207',
      balance: 48000,
      currency: 'USD'
    },
    {
      id: 'jordan_acct_crypto',
      name: 'Coinbase Crypto Portfolio',
      type: 'brokerage',
      subtype: 'crypto',
      institution: 'Coinbase',
      mask: '9012',
      balance: 12500,
      currency: 'USD'
    }
  ],
  transactions: [
    {
      id: 'jordan_txn_client_figma_2026_05',
      date: '2026-05-03',
      merchant: 'Figma Design Systems Client',
      amount: 8500,
      accountId: 'jordan_acct_business_checking',
      category: 'Business Income'
    },
    {
      id: 'jordan_txn_client_notion_2026_05',
      date: '2026-05-18',
      merchant: 'Notion UX Research Client',
      amount: 4200,
      accountId: 'jordan_acct_business_checking',
      category: 'Business Income'
    },
    {
      id: 'jordan_txn_stripe_2026_05',
      date: '2026-05-27',
      merchant: 'Stripe Client Payment',
      amount: 1260,
      accountId: 'jordan_acct_business_checking',
      category: 'Business Income'
    },
    {
      id: 'jordan_txn_estimated_tax_2026_04',
      date: '2026-04-15',
      merchant: 'IRS Estimated Tax Payment',
      amount: -4200,
      accountId: 'jordan_acct_tax_savings',
      category: 'Estimated Taxes'
    },
    {
      id: 'jordan_txn_rent_2026_05',
      date: '2026-05-01',
      merchant: 'Eastside Flats',
      amount: -2100,
      accountId: 'jordan_acct_personal_checking',
      category: 'Rent',
      notes: '1 bedroom apartment in Austin'
    },
    {
      id: 'jordan_txn_coworking_2026_05',
      date: '2026-05-02',
      merchant: 'WeWork Austin',
      amount: -350,
      accountId: 'jordan_acct_ink',
      category: 'Business Rent'
    },
    {
      id: 'jordan_txn_marketplace_health_2026_05',
      date: '2026-05-05',
      merchant: 'HealthCare.gov Marketplace Premium',
      amount: -415,
      accountId: 'jordan_acct_personal_checking',
      category: 'Health Insurance'
    },
    {
      id: 'jordan_txn_hsa_2026_05',
      date: '2026-05-08',
      merchant: 'Fidelity HSA Contribution',
      amount: -300,
      accountId: 'jordan_acct_personal_checking',
      category: 'HSA Contribution'
    },
    {
      id: 'jordan_txn_adobe_2026_05',
      date: '2026-05-07',
      merchant: 'Adobe Creative Cloud',
      amount: -59.99,
      accountId: 'jordan_acct_ink',
      category: 'Software'
    },
    {
      id: 'jordan_txn_figma_software_2026_05',
      date: '2026-05-08',
      merchant: 'Figma Professional',
      amount: -15,
      accountId: 'jordan_acct_ink',
      category: 'Software'
    },
    {
      id: 'jordan_txn_webflow_2026_05',
      date: '2026-05-09',
      merchant: 'Webflow',
      amount: -39,
      accountId: 'jordan_acct_ink',
      category: 'Software'
    },
    {
      id: 'jordan_txn_aws_2026_05',
      date: '2026-05-10',
      merchant: 'Amazon Web Services',
      amount: -82.44,
      accountId: 'jordan_acct_ink',
      category: 'Software'
    },
    {
      id: 'jordan_txn_google_workspace_2026_05',
      date: '2026-05-11',
      merchant: 'Google Workspace',
      amount: -14.4,
      accountId: 'jordan_acct_ink',
      category: 'Software'
    },
    {
      id: 'jordan_txn_heb_2026_05',
      date: '2026-05-12',
      merchant: 'H-E-B',
      amount: -126.85,
      accountId: 'jordan_acct_bbp',
      category: 'Groceries'
    },
    {
      id: 'jordan_txn_costco_2026_05',
      date: '2026-05-19',
      merchant: 'Costco Wholesale',
      amount: -238.62,
      accountId: 'jordan_acct_bbp',
      category: 'Groceries'
    },
    {
      id: 'jordan_txn_dining_2026_05_14',
      date: '2026-05-14',
      merchant: 'Uchi Austin',
      amount: -146.2,
      accountId: 'jordan_acct_bbp',
      category: 'Dining'
    },
    {
      id: 'jordan_txn_dining_2026_05_22',
      date: '2026-05-22',
      merchant: 'Torchys Tacos',
      amount: -38.75,
      accountId: 'jordan_acct_bbp',
      category: 'Dining'
    },
    {
      id: 'jordan_txn_delta_2026_05',
      date: '2026-05-16',
      merchant: 'Delta Air Lines',
      amount: -428.6,
      accountId: 'jordan_acct_ink',
      category: 'Business Travel',
      notes: 'Client onsite trip to Atlanta'
    },
    {
      id: 'jordan_txn_hotel_2026_05',
      date: '2026-05-18',
      merchant: 'Marriott Marquis Atlanta',
      amount: -612.3,
      accountId: 'jordan_acct_ink',
      category: 'Business Travel',
      notes: 'Client onsite trip hotel'
    },
    {
      id: 'jordan_txn_uber_2026_05',
      date: '2026-05-19',
      merchant: 'Uber Trip',
      amount: -74.18,
      accountId: 'jordan_acct_ink',
      category: 'Business Travel'
    },
    {
      id: 'jordan_txn_office_depot_2026_05',
      date: '2026-05-23',
      merchant: 'Office Depot',
      amount: -186.4,
      accountId: 'jordan_acct_ink',
      category: 'Office Supplies'
    },
    {
      id: 'jordan_txn_therapy_2026_05',
      date: '2026-05-24',
      merchant: 'Austin Therapy Group',
      amount: -160,
      accountId: 'jordan_acct_personal_checking',
      category: 'Medical'
    },
    {
      id: 'jordan_txn_spectrum_2026_05',
      date: '2026-05-25',
      merchant: 'Spectrum Internet',
      amount: -79.99,
      accountId: 'jordan_acct_personal_checking',
      category: 'Internet'
    },
    {
      id: 'jordan_txn_cell_2026_05',
      date: '2026-05-26',
      merchant: 'Visible Wireless',
      amount: -35,
      accountId: 'jordan_acct_personal_checking',
      category: 'Phone'
    },
    {
      id: 'jordan_txn_card_payment_2026_05',
      date: '2026-05-28',
      merchant: 'Chase Credit Card Payment',
      amount: -2000,
      accountId: 'jordan_acct_personal_checking',
      category: 'Credit Card Payment'
    }
  ]
};

export const personas: Persona[] = [mariaSeattle, patelDenverFamily, jordanAustinFreelancer];
