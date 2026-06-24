import type { DeterministicCheckResult, Persona, Task, Transaction } from '../schema';
import { accountBalance, roundMoney, spendingByCategory, spendingTotal, sumTransactions, transactionsInMonth } from './math';

type CheckEvaluator = (context: CheckContext) => DeterministicCheckResult;

interface CheckContext {
  task: Task;
  persona: Persona;
  response: string;
  normalized: string;
}

const CHECK_SCORE = 1;

function result(id: string, status: DeterministicCheckResult['status'], expected: string, evidence: string): DeterministicCheckResult {
  return {
    id,
    status,
    score: status === 'pass' ? CHECK_SCORE : status === 'partial' ? CHECK_SCORE / 2 : 0,
    maxScore: CHECK_SCORE,
    expected,
    evidence
  };
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

// Boundary-aware: "7,000" must not match inside "$27,000", and a stale value is
// not flagged when the correct current value also appears (old-vs-new contrast).
function hasBoundedValue(text: string, value: string): boolean {
  return new RegExp(`(?<![\\d,])\\$?${escapeRegExp(value)}(?![\\d])`).test(text);
}

const STALE_IRS_VALUES: Array<{ stale: string; correct: string }> = [
  { stale: '23,000', correct: '24,500' },
  { stale: '23,500', correct: '24,500' },
  { stale: '7,000', correct: '7,500' },
  { stale: '4,300', correct: '4,400' }
];

function hasStaleIrsLimit(text: string): boolean {
  return STALE_IRS_VALUES.some(
    ({ stale, correct }) => hasBoundedValue(text, stale) && !hasBoundedValue(text, correct)
  );
}

function hasWrongIrsLimit(text: string): boolean {
  return hasBoundedValue(text, '74,500');
}

function hasStaleOrWrongIrsLimit(text: string): boolean {
  return hasStaleIrsLimit(text) || hasWrongIrsLimit(text);
}

function claimsRetirementContributionReducesSelfEmploymentTax(text: string): boolean {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter(Boolean);

  return sentences.some((sentence) => {
    const mentionsRetirement = /\b(?:solo\s*401\s*\(?k\)?|sep\s*ira|retirement contribution|retirement plan contribution)\b/i.test(sentence);
    const mentionsSeTax = /\b(?:self-employment tax|self employment tax|schedule se|se tax)\b/i.test(sentence);
    const claimsReduction = /\b(?:reduce|reduces|reduced|lower|lowers|lowering|shelter|shelters|avoid|avoids)\b/i.test(sentence);
    const negatesReduction = /\b(?:do not|does not|doesn't|don't|not|cannot|can't|will not|won't)\b[^.!?\n]{0,60}\b(?:reduce|lower|shelter|avoid)\b/i.test(sentence);

    return mentionsRetirement && mentionsSeTax && claimsReduction && !negatesReduction;
  });
}

function claimsHealthInsuranceReducesSelfEmploymentTax(text: string): boolean {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter(Boolean);

  return sentences.some((sentence) => {
    const mentionsHealthInsurance = /\b(?:health insurance|marketplace premium|marketplace health|self-employed health insurance|self employed health insurance|medical premium|health premium)\b/i.test(
      sentence
    );
    const mentionsSeTax = /\b(?:self-employment tax|self employment tax|schedule se|se tax|15\.3%)\b/i.test(sentence);
    const claimsReduction = /\b(?:reduce|reduces|reduced|lower|lowers|lowering|shelter|shelters|avoid|avoids)\b/i.test(sentence);
    const negatesReduction = /\b(?:do not|does not|doesn't|don't|not|cannot|can't|will not|won't)\b[^.!?\n]{0,80}\b(?:reduce|lower|shelter|avoid)\b/i.test(
      sentence
    );
    const distinguishesIncomeTaxOnly =
      /\b(?:income tax|agi|above-the-line|schedule 1)\b/i.test(sentence) &&
      /\b(?:not|does not|doesn't|but not|not.*schedule se)\b/i.test(sentence);

    return mentionsHealthInsurance && mentionsSeTax && claimsReduction && !negatesReduction && !distinguishesIncomeTaxOnly;
  });
}

function hasUnbackedHighRewardsHeadline(text: string): boolean {
  const highAnnualRange =
    /(5[0-9]|[6-9][0-9]|[1-9][0-9]{2,})[,\s]?\d{3}\s*(?:-|to|–|—)\s*(?:[6-9][0-9]|[1-9][0-9]{2,})[,\s]?\d{3}[^.\n]*(?:points|miles)[^.\n]*(?:per year|annual|annually|\/yr)/i;
  const highAnnualSingle =
    /(?:[6-9][0-9]|[1-9][0-9]{2,})[,\s]?\d{3}[^.\n]*(?:additional\s+)?(?:points|miles)[^.\n]*(?:per year|annual|annually|\/yr)/i;
  const hasHighHeadline = highAnnualRange.test(text) || highAnnualSingle.test(text);
  const labelsOneTimeBonus = includesAny(text, ['welcome bonus', 'sign-up bonus', 'signup bonus', 'one-time']);
  return hasHighHeadline && !labelsOneTimeBonus && !hasRewardsComponentMath(text);
}

function hasRewardsComponentMath(text: string): boolean {
  const formulaLike =
    /(\$?\d[\d,]*(?:\.\d+)?\s*(?:\/mo|per month|monthly)[^.\n]{0,120}(?:\d(?:\.\d+)?x|\d(?:\.\d+)?%)[^.\n]{0,120}(?:points|miles|cash back|value)[^.\n]{0,120}(?:per year|annual|annually|\/yr|year)|(?:\d(?:\.\d+)?x|\d(?:\.\d+)?%)[^.\n]{0,120}\$?\d[\d,]*(?:\.\d+)?\s*(?:\/mo|per month|monthly)[^.\n]{0,120}(?:points|miles|cash back|value)[^.\n]{0,120}(?:per year|annual|annually|\/yr|year))/i.test(
      text
    );
  if (formulaLike) return true;

  const lower = text.toLowerCase();
  const componentCategories = ['rent', 'dining', 'restaurant', 'costco', 'warehouse', 'gas', 'grocery', 'travel', 'flight', 'food'].filter(
    (term) => lower.includes(term)
  ).length;
  const hasEarnRate = /(?:\d(?:\.\d+)?x|\d(?:\.\d+)?\s?%|points per dollar|miles per dollar|cash back)/i.test(text);
  const hasDollarOrPointBasis = /\$?\d[\d,]*(?:\.\d+)?/.test(text) && /(?:points|miles|cash back|value|annual|per year|\/yr)/i.test(text);
  const labelsScope = /(?:may|observed|if .*typical|assuming|based on|line[- ]item|component|breakdown)/i.test(text);

  return componentCategories >= 2 && hasEarnRate && hasDollarOrPointBasis && labelsScope;
}

function hasUnverifiedPublicSubscriptionPricing(text: string): boolean {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.some((sentence) => {
    const lower = sentence.toLowerCase();
    const mentionsExternalPricingContext = includesAny(lower, [
      'new customer',
      'promo',
      'promotional',
      'retention',
      'competitor',
      't-mobile',
      'verizon',
      'single-app',
      'single app',
      'photography plan',
      'basic plan',
      'annual billing',
      'annual versions',
      'discount',
      'often has'
    ]);
    const hasPriceOrDiscount = /\$?\d[\d,]*(?:\.\d+)?(?:\s*(?:-|to|–)\s*\$?\d[\d,]*(?:\.\d+)?)?\s*(?:\/mo|per month|monthly|%|percent|\/year|per year|annual|year)?/i.test(
      sentence
    );
    const labelsAsUnverifiedCheck = includesAny(lower, [
      'check for',
      'check whether',
      'verify',
      'compare',
      'ask whether',
      'look for',
      'if available',
      'if they offer',
      'if you find'
    ]);
    const claimsVerification = includesAny(lower, ['according to', 'verified', 'current public price', 'published price']);

    return mentionsExternalPricingContext && hasPriceOrDiscount && !labelsAsUnverifiedCheck && !claimsVerification;
  });
}

function numberPatterns(value: number): string[] {
  const rounded = Math.round(value);
  const fixed = value.toFixed(2);
  const commaRounded = rounded.toLocaleString('en-US');
  const commaFixed = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return [
    String(rounded),
    fixed,
    commaRounded,
    commaFixed,
    `$${rounded}`,
    `$${fixed}`,
    `$${commaRounded}`,
    `$${commaFixed}`
  ].map((pattern) => pattern.toLowerCase());
}

function mentionsNumber(text: string, value: number): boolean {
  // Boundary-aware so "1,200" does not match inside "$11,200" or "211200".
  const alternation = numberPatterns(value).map(escapeRegExp).join('|');
  return new RegExp(`(?<![\\d,])(?:${alternation})(?![\\d])`, 'i').test(text);
}

function signalMentionCount(task: Task, persona: Persona, normalized: string): { hits: number; total: number; evidence: string } {
  const labels: string[] = [];
  for (const signalId of task.relevantSignalIds) {
    const transaction = persona.transactions.find((candidate) => candidate.id === signalId);
    if (transaction) {
      const merchantTerms = transaction.merchant.toLowerCase().split(/\s+/).filter((term) => term.length >= 4);
      const merchantMentioned = includesAny(normalized, merchantTerms) || mentionsNumber(normalized, Math.abs(transaction.amount));
      labels.push(`${transaction.id}:${merchantMentioned ? 'hit' : 'miss'}`);
      continue;
    }

    const account = persona.accounts.find((candidate) => candidate.id === signalId);
    if (account) {
      const accountTerms = [account.name, account.institution, account.subtype ?? account.type]
        .join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length >= 4);
      const accountMentioned = includesAny(normalized, accountTerms) || mentionsNumber(normalized, Math.abs(account.balance));
      labels.push(`${account.id}:${accountMentioned ? 'hit' : 'miss'}`);
      continue;
    }

    const memory = persona.memories.find((candidate) => candidate.id === signalId);
    if (memory) {
      const memoryTerms = memory.text
        .toLowerCase()
        .split(/[^a-z0-9$]+/)
        .filter((term) => term.length >= 5 && !['their', 'works', 'wants', 'filing', 'benefits'].includes(term));
      const memoryMentioned = includesAny(normalized, memoryTerms.slice(0, 8));
      labels.push(`${memory.id}:${memoryMentioned ? 'hit' : 'miss'}`);
    }
  }

  const hits = labels.filter((label) => label.endsWith(':hit')).length;
  return { hits, total: labels.length, evidence: labels.join(', ') || 'No relevant signals listed.' };
}

function exactSignalAmountHits(task: Task, persona: Persona, normalized: string): { hits: number; total: number; evidence: string } {
  const amountSignals: Array<{ id: string; amount: number }> = [];
  for (const signalId of task.relevantSignalIds) {
    const transaction = persona.transactions.find((candidate) => candidate.id === signalId);
    if (transaction) {
      amountSignals.push({ id: transaction.id, amount: Math.abs(transaction.amount) });
      continue;
    }

    const account = persona.accounts.find((candidate) => candidate.id === signalId);
    if (account) {
      amountSignals.push({ id: account.id, amount: Math.abs(account.balance) });
    }
  }
  const hits = amountSignals.filter((signal) => mentionsNumber(normalized, signal.amount)).map((signal) => signal.id);
  return {
    hits: hits.length,
    total: amountSignals.length,
    evidence: hits.length > 0 ? `Amounts mentioned for ${hits.join(', ')}.` : 'No exact relevant signal amounts detected.'
  };
}

function hasNear(text: string, left: string, right: string, maxChars = 120): boolean {
  const leftEscaped = escapeRegExp(left.toLowerCase());
  const rightEscaped = escapeRegExp(right.toLowerCase());
  return new RegExp(`${leftEscaped}[^\\n.]{0,${maxChars}}${rightEscaped}|${rightEscaped}[^\\n.]{0,${maxChars}}${leftEscaped}`, 'i').test(text);
}

function explicitlyExcludes(text: string, terms: string[]): boolean {
  const target = terms.map(escapeRegExp).join('|');
  const exclusionVerb = 'exclud(?:e|es|ed|ing)|omit(?:s|ted|ting)?|does\\s+not\\s+include|do\\s+not\\s+include|not\\s+include(?:d)?|is\\s+not\\s+included|was\\s+not\\s+included';
  const excludeBefore = new RegExp(`(?:${exclusionVerb})[^\\n]{0,120}(?:${target})`, 'i');
  const excludeAfter = new RegExp(`(?:${target})[^\\n]{0,120}(?:${exclusionVerb})`, 'i');
  return excludeBefore.test(text) || excludeAfter.test(text);
}

function mentionsAsIncludedTotal(text: string, value: number): boolean {
  if (!mentionsNumber(text, value)) return false;
  const patterns = numberPatterns(value).map(escapeRegExp).join('|');
  const totalPattern = new RegExp(`(?:total|adds? up to|sum|monthly total|review total)[^.\\n]{0,80}(?:${patterns})|(?:${patterns})[^.\\n]{0,80}(?:total|per month|monthly|review)`, 'i');
  return totalPattern.test(text);
}

function hasNearAny(text: string, left: string, rights: string[], maxChars = 120): boolean {
  return rights.some((right) => hasNear(text, left, right, maxChars));
}

function mentionsMerchantSet(normalized: string, merchants: string[]): number {
  return merchants.filter((merchant) => normalized.includes(merchant.toLowerCase())).length;
}

function merchantInSubscriptionTotal(normalized: string, merchant: string): boolean {
  return hasNearAny(normalized, merchant.toLowerCase(), ['subscription total', 'subscription-like total', 'review total', 'monthly total'], 120);
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n+/).map((sentence) => sentence.trim()).filter(Boolean);
}

function isTransferOrSavingsMovement(transaction: Transaction): boolean {
  const text = `${transaction.merchant} ${transaction.category} ${transaction.notes ?? ''}`.toLowerCase();
  return /credit card payment|card payment|hsa contribution|529|education savings|401k|401\(k\)|employee deferral|tax reserve transfer|transfer to savings/.test(text);
}

function consumptionSpendTotal(transactions: Transaction[]): number {
  return roundMoney(
    transactions
      .filter((transaction) => transaction.amount < 0 && !isTransferOrSavingsMovement(transaction))
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  );
}

function transferInclusiveSpendTotal(transactions: Transaction[]): number {
  return spendingTotal(transactions);
}

function mayTransactions(persona: Persona) {
  return transactionsInMonth(persona, 2026, 5);
}

function rentAmount(persona: Persona): number {
  const rent = persona.transactions.find((transaction) => transaction.id === 'txn_rent_2026_05');
  if (!rent) throw new Error('Missing rent transaction.');
  return Math.abs(rent.amount);
}

function costcoSpend(persona: Persona): number {
  return sumTransactions(mayTransactions(persona), (transaction) => transaction.merchant.toLowerCase().includes('costco'));
}

function costcoFuelSpend(persona: Persona): number {
  return sumTransactions(mayTransactions(persona), (transaction) => {
    const merchant = transaction.merchant.toLowerCase();
    const category = transaction.category.toLowerCase();
    return merchant.includes('costco') && (merchant.includes('gas') || category === 'gas');
  });
}

function foodSpendIncludingCostcoRuns(persona: Persona): number {
  return sumTransactions(mayTransactions(persona), (transaction) => {
    const merchant = transaction.merchant.toLowerCase();
    return transaction.category === 'Dining' || transaction.category === 'Groceries' || merchant.includes('costco');
  });
}

function foodSpendExcludingCostcoFuel(persona: Persona): number {
  return foodSpendIncludingCostcoRuns(persona) - costcoFuelSpend(persona);
}

const registry: Record<string, CheckEvaluator> = {
  relevant_signal_grounding: ({ task, persona, normalized }) => {
    const signals = signalMentionCount(task, persona, normalized);
    const passAt = Math.max(1, Math.min(3, Math.ceil(signals.total / 2)));
    const status = signals.hits >= passAt ? 'pass' : signals.hits > 0 ? 'partial' : 'fail';
    return result(
      'relevant_signal_grounding',
      status,
      'Mention or use several task-relevant visible signals from the persona data.',
      `${signals.hits}/${signals.total} relevant signals detected. ${signals.evidence}`
    );
  },
  exact_amount_grounding: ({ task, persona, normalized }) => {
    const amounts = exactSignalAmountHits(task, persona, normalized);
    const passAt = Math.max(1, Math.min(2, amounts.total));
    const status = amounts.hits >= passAt ? 'pass' : amounts.hits > 0 ? 'partial' : 'fail';
    return result(
      'exact_amount_grounding',
      status,
      'Use exact visible dollar amounts for the task-relevant transactions/accounts when the question depends on them.',
      `${amounts.hits}/${amounts.total} relevant amounts detected. ${amounts.evidence}`
    );
  },
  exact_period_scope_may_2026: ({ normalized }) =>
    result(
      'exact_period_scope_may_2026',
      includesAny(normalized, ['may 2026', 'in may', 'may spending', 'this month', '2026-05']) ? 'pass' : 'fail',
      'Respect the May 2026 requested period or clearly label the observed period.',
      'Looks for May/2026 period scoping.'
    ),
  no_income_as_spend: ({ normalized }) => {
    const incomeAsSpend =
      hasNear(normalized, 'payroll', 'spend') ||
      hasNear(normalized, 'income', 'spend') ||
      hasNear(normalized, 'client', 'spend') ||
      hasNear(normalized, 'deposit', 'spend');
    return result(
      'no_income_as_spend',
      incomeAsSpend ? 'fail' : 'pass',
      'Do not include payroll, client deposits, or other income as spending.',
      incomeAsSpend ? 'Detected possible income/deposit included in spending language.' : 'No income-as-spend language detected.'
    );
  },
  no_card_payment_as_spend: ({ normalized }) => {
    const cardPaymentExplicitlyExcluded =
      explicitlyExcludes(normalized, ['credit card payment', 'card payment']) ||
      hasNearAny(normalized, 'credit card payment', ['non-consumption', 'transfer', 'excluded', 'not spending'], 140) ||
      hasNearAny(normalized, 'card payment', ['non-consumption', 'transfer', 'excluded', 'not spending'], 140);
    const cardPaymentAsSpend =
      !cardPaymentExplicitlyExcluded &&
      includesAny(normalized, ['credit card payment']) &&
      (includesAny(normalized, ['biggest categories', 'spent a total', 'total spend', 'spending was']) || hasNear(normalized, 'credit card payment', 'category'));
    return result(
      'no_card_payment_as_spend',
      cardPaymentAsSpend ? 'fail' : 'pass',
      'Do not count credit-card payments as new consumption spending in spend totals.',
      cardPaymentAsSpend ? 'Detected credit-card payment treated as a spending category/total.' : 'No card-payment-as-spend language detected.'
    );
  },
  no_savings_contribution_as_consumption: ({ normalized }) => {
    const contributionAsConsumption =
      (includesAny(normalized, ['hsa contribution', '529 contribution', '401k contribution', '401(k) contribution']) &&
        includesAny(normalized, ['spending category', 'biggest categories', 'spent', 'expense'])) ||
      hasNear(normalized, 'contribution', 'spending category');
    return result(
      'no_savings_contribution_as_consumption',
      contributionAsConsumption ? 'fail' : 'pass',
      'Separate savings/investment contributions from consumption spending where scope matters.',
      contributionAsConsumption ? 'Detected contribution language treated as consumption spending.' : 'No contribution-as-consumption issue detected.'
    );
  },
  no_raw_tool_or_stream_output: ({ response }) => {
    const rawLeak =
      /\[NO_VISIBLE_PWA_RESPONSE\]|\btoolCallId\b|data:\s*\{"type"|\{"title":"|\[SHOW_[A-Z_]+\]\s*\{/.test(response) ||
      /\b[a-z][a-z0-9_]{2,}\s*\(\s*\{/.test(response) ||
      /\b(?:[a-z_]*slug|toolName|input|output|arguments)\s*:\s*["{\[]/.test(response) ||
      /"scope":\{[^}]*"requested_from"/.test(response);
    return result(
      'no_raw_tool_or_stream_output',
      rawLeak ? 'fail' : 'pass',
      'Final answer should not leak raw stream events, JSON tool payloads, or display artifacts.',
      rawLeak ? 'Detected raw stream/tool/display JSON leakage.' : 'No raw tool or stream output detected.'
    );
  },
  recurring_scope_boundary: ({ normalized }) => {
    const separatesBills = includesAny(normalized, ['subscription', 'subscriptions', 'software', 'saas']) && includesAny(normalized, ['bill', 'bills', 'utilities', 'insurance', 'mortgage', 'rent', 'housing']);
    const hasScopeLabels = includesAny(normalized, ['separate', 'separately', 'not a subscription', 'bill', 'utility', 'insurance', 'housing', 'mortgage', 'rent']);
    const invalidSubscriptionFraming =
      hasNearAny(normalized, 'mortgage', ['subscription', 'cancel', 'cancellable'], 100) ||
      hasNearAny(normalized, 'daycare', ['subscription', 'cancel', 'cancellable'], 100) ||
      hasNearAny(normalized, 'insurance', ['subscription', 'cancel', 'cancellable'], 100);
    const avoidCancelEverything = !includesAny(normalized, ['cancel everything', 'cancel all']) && !invalidSubscriptionFraming;
    return result(
      'recurring_scope_boundary',
      separatesBills && hasScopeLabels && avoidCancelEverything ? 'pass' : (separatesBills || hasScopeLabels) && avoidCancelEverything ? 'partial' : 'fail',
      'Separate subscriptions from recurring bills/insurance/housing and avoid treating every recurring charge as cancellable waste.',
      `Separates bills=${separatesBills}; scope labels=${hasScopeLabels}; avoids invalid cancellation framing=${avoidCancelEverything}.`
    );
  },
  plan_participation_caveat: ({ normalized }) =>
    result(
      'plan_participation_caveat',
      includesAny(normalized, ['verify', 'confirm', 'check', 'if enrolled', 'if you are enrolled', 'eligible', 'portal']) &&
        includesAny(normalized, ['plan', 'benefit', 'enrollment', 'eligible', 'hdhp', 'fsa'])
        ? 'pass'
        : 'fail',
      'Distinguish plan-level availability from user-specific enrollment, participation, or remaining balances.',
      'Looks for verify/check/eligible language tied to benefits or plans.'
    ),
  no_unsupported_employer_benefit_overclaim: ({ persona, normalized }) => {
    if (persona.id !== 'patel_denver_family_v0') {
      return result('no_unsupported_employer_benefit_overclaim', 'pass', 'Avoid unsupported employer-specific benefit overclaims.', 'Not a Patel employer-benefit scenario.');
    }
    const importsWrongEmployer = includesAny(normalized, ['microsoft']);
    const overclaimsParticipation =
      /(?:submit|claim|reimburse|covered|free|eligible|use your|your remaining|you have)[^.\n]{0,120}(?:peloton|wellness|employee credit|\$100\/month|\$1,200|100 per month|750 hsa|hsa seed)/i.test(
        normalized
      ) &&
      !includesAny(normalized, ['verify', 'confirm', 'check', 'if eligible', 'if covered', 'if enrolled', 'portal']);
    const overclaimingSentence = sentences(normalized).find((sentence) => {
      const claimsUserAction = includesAny(sentence, ['submit', 'claim', 'covered', 'free', 'eligible', 'you can use', 'you have', 'remaining']);
      const benefitTarget = includesAny(sentence, ['peloton', 'wellness', 'employee credit', '$100/month', '$1,200', '100 per month', '750 hsa', 'hsa seed']);
      const caveated = includesAny(sentence, ['verify', 'confirm', 'check', 'if eligible', 'if covered', 'if enrolled', 'portal', 'may', 'candidate']);
      return claimsUserAction && benefitTarget && !caveated;
    });
    const unsupported = importsWrongEmployer || overclaimsParticipation || !!overclaimingSentence;
    return result(
      'no_unsupported_employer_benefit_overclaim',
      unsupported ? 'fail' : 'pass',
      'For Patel, accept locked Salesforce plan-level facts but do not import Microsoft facts or overclaim user-specific benefit participation/claim status.',
      importsWrongEmployer
        ? 'Detected Microsoft benefit contamination in a Salesforce/UCHealth persona.'
        : overclaimsParticipation || overclaimingSentence
          ? `Detected user-specific benefit/reimbursement overclaim without adequate verification language${overclaimingSentence ? `: ${overclaimingSentence.slice(0, 160)}` : '.'}`
          : 'No unsupported employer-specific benefit overclaim detected.'
    );
  },
  dependent_care_fsa_2026_limit: ({ normalized }) => {
    const hasCurrent = includesAny(normalized, ['7,500', '$7,500']);
    const hasStale = /dependent care|dcfsa|dcap|fsa/.test(normalized) && includesAny(normalized, ['5,000', '$5,000']);
    return result(
      'dependent_care_fsa_2026_limit',
      hasCurrent && !hasStale ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use the benchmark 2026 dependent care FSA/DCAP limit of $7,500, with employer-plan adoption caveats.',
      hasStale ? 'Detected old $5,000 dependent-care limit language.' : 'Looks for $7,500 dependent-care limit.'
    );
  },
  hsa_family_limit_currentness: ({ normalized }) => {
    const hasCurrent = includesAny(normalized, ['8,750', '$8,750']);
    const hasWrong = includesAny(normalized, ['8,550', '$8,550', '8,300', '$8,300']);
    return result(
      'hsa_family_limit_currentness',
      hasCurrent && !hasWrong ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use the benchmark 2026 family HSA limit of $8,750.',
      hasWrong ? 'Detected stale/wrong family HSA limit.' : 'Looks for $8,750 family HSA limit.'
    );
  },
  roth_mfj_phaseout_currentness: ({ normalized }) => {
    const hasCurrent = includesAny(normalized, ['242,000', '$242,000', '252,000', '$252,000']);
    const hasWrong = includesAny(normalized, ['246,000', '$246,000', '256,000', '$256,000']);
    return result(
      'roth_mfj_phaseout_currentness',
      hasCurrent && !hasWrong ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use the benchmark 2026 Roth IRA MFJ phaseout of $242,000 to $252,000.',
      hasWrong ? 'Detected wrong MFJ Roth phaseout range.' : 'Looks for current MFJ Roth phaseout.'
    );
  },
  salt_standard_deduction_currentness: ({ normalized }) => {
    const hasStandardDeduction = includesAny(normalized, ['32,200', '$32,200']);
    const hasSalt = includesAny(normalized, ['40,400', '$40,400', '40,000', '$40,000']);
    const hasOldSalt = includesAny(normalized, ['10,000', '$10,000']) && includesAny(normalized, ['salt cap', 'salt deduction']);
    return result(
      'salt_standard_deduction_currentness',
      (hasStandardDeduction || hasSalt) && !hasOldSalt ? 'pass' : hasStandardDeduction || hasSalt ? 'partial' : 'fail',
      'Use 2026 standard deduction/SALT cap values where itemizing or homeownership tax strategy is discussed.',
      hasOldSalt ? 'Detected old SALT cap framing.' : `Standard deduction=${hasStandardDeduction}; SALT=${hasSalt}.`
    );
  },
  business_personal_separation: ({ normalized }) =>
    result(
      'business_personal_separation',
      includesAny(normalized, ['business']) && includesAny(normalized, ['personal']) && includesAny(normalized, ['separate', 'bucket', 'deduct', 'tax'])
        ? 'pass'
        : 'fail',
      'Separate business, personal, tax-reserve, and deductible-expense treatment for freelancer tasks.',
      'Looks for business/personal separation language.'
    ),
  tax_reserve_protection: ({ normalized }) =>
    result(
      'tax_reserve_protection',
      includesAny(normalized, ['tax reserve', 'estimated tax', 'quarterly tax', 'irs']) && includesAny(normalized, ['do not invest', 'before investing', 'set aside', 'reserve', 'safe harbor'])
        ? 'pass'
        : 'fail',
      'Protect tax-reserve cash before treating it as investable or spendable.',
      'Looks for tax-reserve protection language.'
    ),
  self_employed_tax_coverage: ({ normalized }) =>
    result(
      'self_employed_tax_coverage',
      includesAny(normalized, ['self-employment tax', 'self employment tax', 'schedule c']) && includesAny(normalized, ['estimated tax', 'quarterly', 'safe harbor'])
        ? 'pass'
        : 'fail',
      'Cover self-employment tax plus estimated-tax/safe-harbor handling for freelancer tax tasks.',
      'Looks for self-employment and estimated-tax language.'
    ),
  no_solo401k_reduces_se_tax_claim: ({ response }) => {
    const hasFalseClaim = claimsRetirementContributionReducesSelfEmploymentTax(response);
    return result(
      'no_solo401k_reduces_se_tax_claim',
      hasFalseClaim ? 'fail' : 'pass',
      'Do not claim Solo 401(k)/SEP/retirement contributions reduce the self-employment tax or Schedule SE base.',
      hasFalseClaim
        ? 'Detected a claim that retirement contributions reduce self-employment tax.'
        : 'No false retirement-contribution to SE-tax reduction claim detected.'
    );
  },
  no_health_insurance_reduces_se_tax_claim: ({ response }) => {
    const hasFalseClaim = claimsHealthInsuranceReducesSelfEmploymentTax(response);
    return result(
      'no_health_insurance_reduces_se_tax_claim',
      hasFalseClaim ? 'fail' : 'pass',
      'Do not claim self-employed health insurance or marketplace premiums reduce self-employment tax or the Schedule SE base.',
      hasFalseClaim
        ? 'Detected a claim that health insurance premiums reduce self-employment tax.'
        : 'No false health-insurance to SE-tax reduction claim detected.'
    );
  },
  card_rate_currentness: ({ normalized }) => {
    const wrongInkDining = /ink business preferred[^.\n]{0,160}(?:dining|restaurant)[^.\n]{0,80}3x|(?:dining|restaurant)[^.\n]{0,160}ink business preferred[^.\n]{0,80}3x/i.test(
      normalized
    );
    const hasCorrectInk = includesAny(normalized, ['travel', 'internet', 'phone', 'advertising', 'shipping']) && includesAny(normalized, ['ink', '3x']);
    const hasBbpFlatRate = includesAny(normalized, ['blue business plus', 'bbp', 'amex']) && includesAny(normalized, ['2x', 'flat', 'non-bonus', 'fallback']);
    return result(
      'card_rate_currentness',
      wrongInkDining ? 'fail' : hasCorrectInk || hasBbpFlatRate ? 'pass' : 'partial',
      'Use current card category mechanics: Ink Preferred 3x is not a dining category; Blue Business Plus is flat-rate fallback.',
      wrongInkDining ? 'Detected incorrect Ink Preferred dining 3x claim.' : `Ink current=${hasCorrectInk}; BBP flat-rate=${hasBbpFlatRate}.`
    );
  },
  card_fee_or_interest_priority: ({ normalized }) =>
    result(
      'card_fee_or_interest_priority',
      includesAny(normalized, ['fee', 'processing fee', 'annual fee', 'apr', 'interest', 'statement balance', 'autopay'])
        ? 'pass'
        : 'fail',
      'Handle card fees, processing fees, APR/interest, or statement-balance autopay before optimizing rewards.',
      'Looks for fee/APR/autopay prudence language.'
    ),
  may_2026_spend_total: ({ persona, normalized }) => {
    const total = spendingTotal(mayTransactions(persona));
    return result('may_2026_spend_total', mentionsNumber(normalized, total) ? 'pass' : 'fail', `May 2026 spending total ${total.toFixed(2)}`, 'Looks for the computed May spend total.');
  },
  consumption_spend_total_scope: ({ persona, normalized }) => {
    const may = mayTransactions(persona);
    const cleanTotal = consumptionSpendTotal(may);
    const transferInclusiveTotal = transferInclusiveSpendTotal(may);
    const hasCleanTotal = mentionsNumber(normalized, cleanTotal);
    const hasTransferInclusiveTotal = mentionsNumber(normalized, transferInclusiveTotal);
    const explicitlySeparatesTransfers =
      explicitlyExcludes(normalized, ['credit card payment', 'hsa contribution', '529', 'education savings']) ||
      includesAny(normalized, ['exclude transfers', 'excluding transfers', 'not consumption', 'not spending', 'savings contribution', 'double-count']);
    const status = hasCleanTotal || (hasTransferInclusiveTotal && explicitlySeparatesTransfers)
      ? 'pass'
      : explicitlySeparatesTransfers
        ? 'partial'
        : 'fail';
    return result(
      'consumption_spend_total_scope',
      status,
      `Consumption spend should exclude card payments and savings/investment movements; clean May total is ${cleanTotal.toFixed(2)} versus transfer-inclusive cash outflow ${transferInclusiveTotal.toFixed(2)}.`,
      hasTransferInclusiveTotal && !explicitlySeparatesTransfers
        ? 'Detected transfer-inclusive total without clear transfer/savings exclusion.'
        : `Clean total mentioned=${hasCleanTotal}; transfer boundary stated=${explicitlySeparatesTransfers}.`
    );
  },
  category_rollup: ({ persona, normalized }) => {
    const categories = spendingByCategory(mayTransactions(persona));
    const expectedCategories = Array.from(categories.keys());
    const hits = expectedCategories.filter((category) => normalized.includes(category.toLowerCase())).length;
    const status = hits >= 5 ? 'pass' : hits >= 3 ? 'partial' : 'fail';
    return result('category_rollup', status, 'Mentions several actual May spending categories.', `${hits}/${expectedCategories.length} categories mentioned.`);
  },
  income_exclusion: ({ persona, normalized }) => {
    const spend = spendingTotal(mayTransactions(persona));
    const incomeInclusive = mayTransactions(persona).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const status = mentionsNumber(normalized, spend) && !mentionsNumber(normalized, incomeInclusive) ? 'pass' : 'fail';
    return result('income_exclusion', status, 'Spending excludes payroll and freelance income.', `Income-inclusive absolute flow would be ${incomeInclusive.toFixed(2)}.`);
  },
  food_spend_total_may: ({ persona, normalized }) => {
    const includingFuel = foodSpendIncludingCostcoRuns(persona);
    const excludingFuel = foodSpendExcludingCostcoFuel(persona);
    const hasIncludingFuel = mentionsNumber(normalized, includingFuel);
    const hasExcludingFuel = mentionsNumber(normalized, excludingFuel);
    const explicitlyExcludesFuel = explicitlyExcludes(normalized, ['costco gas', 'gas', 'fuel']);
    const doesNotMentionCostcoFuel =
      !includesAny(normalized, ['costco gas']) && !mentionsNumber(normalized, 58.23);
    const usesWarehouseOnlyScope =
      includesAny(normalized, ['costco wholesale']) && !includesAny(normalized, ['costco gas']);
    const status =
      hasIncludingFuel ||
      (hasExcludingFuel && (explicitlyExcludesFuel || usesWarehouseOnlyScope || doesNotMentionCostcoFuel))
        ? 'pass'
        : hasExcludingFuel
          ? 'partial'
          : 'fail';
    return result(
      'food_spend_total_may',
      status,
      `May food-like spend ${includingFuel.toFixed(2)} if Costco Gas is included, or ${excludingFuel.toFixed(2)} if Costco Gas is explicitly excluded as fuel.`,
      'Accepts either scope when the response explains the Costco Gas boundary.'
    );
  },
  merchant_category_boundary: ({ normalized }) =>
    result(
      'merchant_category_boundary',
      includesAny(normalized, ['costco']) &&
        (includesAny(normalized, ['warehouse', 'not supermarket', 'not grocery', 'category coding', 'supermarket coding', 'reward coding', 'card coding']) ||
          explicitlyExcludes(normalized, ['costco gas', 'gas', 'fuel']) ||
          (mentionsNumber(normalized, 833.96) && !includesAny(normalized, ['costco gas']) && !mentionsNumber(normalized, 58.23)))
        ? 'pass'
        : 'fail',
      'Distinguish Costco warehouse/food spend from gas and ordinary grocery-card coding.',
      'Looks for Costco warehouse/category-coding caveat or explicit Costco Gas exclusion.'
    ),
  subscription_identification: ({ normalized }) =>
    namedHits('subscription_identification', normalized, ['netflix', 'adobe', 'classpass'], 2, 'Find recurring subscription/fitness charges.'),
  maria_subscription_review_scope: ({ normalized }) => {
    const coreHits = mentionsMerchantSet(normalized, ['netflix', 'adobe', 'classpass']);
    const hasCoreTotal = mentionsNumber(normalized, 171.98);
    const hasSeparateUtilityTotal = mentionsNumber(normalized, 161);
    const utilitiesInSubscriptionTotal = merchantInSubscriptionTotal(normalized, 'xfinity') || merchantInSubscriptionTotal(normalized, 'at&t') || merchantInSubscriptionTotal(normalized, 'att wireless');
    const status = coreHits === 3 && hasCoreTotal && !utilitiesInSubscriptionTotal
      ? 'pass'
      : coreHits >= 2 && hasCoreTotal && (hasSeparateUtilityTotal || !utilitiesInSubscriptionTotal)
        ? 'partial'
        : 'fail';
    return result(
      'maria_subscription_review_scope',
      status,
      'Maria subscription-like review total should include Netflix, Adobe, and ClassPass ($171.98), while utilities can only appear in a separate bills/utilities section.',
      utilitiesInSubscriptionTotal
        ? 'Detected utilities included in the subscription-like review total.'
        : `${coreHits}/3 core subscription-like merchants detected; core total mentioned=${hasCoreTotal}; separate utility total mentioned=${hasSeparateUtilityTotal}.`
    );
  },
  idle_cash_amount: ({ normalized }) =>
    result('idle_cash_amount', includesAny(normalized, ['18,450', '$18,450', '18450', 'checking']) ? 'pass' : 'fail', 'Use the $18,450 checking balance as idle-cash signal.', 'Looks for checking balance or idle checking mention.'),
  rent_amount: ({ persona, normalized }) =>
    result('rent_amount', mentionsNumber(normalized, rentAmount(persona)) ? 'pass' : 'fail', `Current rent ${rentAmount(persona).toFixed(2)}`, 'Looks for current rent.'),
  rent_annualized: ({ persona, normalized }) => {
    const annualRent = rentAmount(persona) * 12;
    const status = mentionsNumber(normalized, annualRent)
      ? 'pass'
      : mentionsNumber(normalized, rentAmount(persona)) && includesAny(normalized, ['/yr', 'per year', 'annual', '12-month', 'year'])
        ? 'partial'
        : 'fail';
    return result('rent_annualized', status, `Annual rent ${(annualRent).toFixed(2)} or equivalent annualized rent/savings framing.`, 'Looks for annualized rent or annual savings framing tied to current rent.');
  },
  income_household_location: ({ normalized }) =>
    namedHits('income_household_location', normalized, ['seattle', '60,000', '60000', 'household', 'single'], 3, 'Use income, household size, and location.'),
  mfte_caveat_presence: ({ normalized }) =>
    result('mfte_caveat_presence', includesAny(normalized, ['mfte', 'mha']) && includesAny(normalized, ['verify', 'eligib', 'ami', 'availability', 'current']) ? 'pass' : 'fail', 'Identify MFTE/MHA with eligibility/currentness caveat.', 'Looks for program plus caveat.'),
  mfte_savings_estimate: ({ normalized }) =>
    result(
      'mfte_savings_estimate',
      includesAny(normalized, ['mfte', 'mha']) && includesAny(normalized, ['save', 'savings', 'less per month', '/mo', 'per month', '/yr', 'per year']) && includesAny(normalized, ['range', 'estimate', 'hundreds', 'compare'])
        ? 'pass'
        : includesAny(normalized, ['mfte', 'mha']) && includesAny(normalized, ['save', 'savings'])
          ? 'partial'
          : 'fail',
      'Estimate or frame MFTE/MHA savings against current rent, preferably as a range.',
      'Looks for MFTE plus quantified or conservatively framed savings.'
    ),
  rent_exact_next_steps: ({ normalized }) =>
    result(
      'rent_exact_next_steps',
      includesAny(normalized, ['search', 'apply', 'call', 'ask', 'email']) && includesAny(normalized, ['office of housing', 'apartment list', 'leasing', 'building', 'waitlist', 'documentation'])
        ? 'pass'
        : includesAny(normalized, ['search', 'apply', 'call', 'ask', 'email'])
          ? 'partial'
          : 'fail',
      'Give exact rent-saving next steps, not just generic advice.',
      'Looks for action verbs plus concrete MFTE/lease workflow targets.'
    ),
  rent_secondary_rewards: ({ normalized }) =>
    result(
      'rent_secondary_rewards',
      includesAny(normalized, ['bilt', 'rent rewards']) && includesAny(normalized, ['fee', 'processing', 'no-fee', 'no fee'])
        ? 'pass'
        : includesAny(normalized, ['bilt', 'rent rewards'])
          ? 'partial'
          : 'fail',
      'Mention rent rewards as a secondary play with fee caveat.',
      'Looks for Bilt/rent rewards and fee-awareness.'
    ),
  category_routing_map: ({ normalized }) =>
    namedHits('category_routing_map', normalized, ['rent', 'costco', 'dining', 'travel', 'grocery', 'utilities'], 4, 'Map card choices across key categories.'),
  rent_rewards_math: ({ persona, normalized }) => {
    const hasBilt = includesAny(normalized, ['bilt']);
    const hasAnnualRent = mentionsNumber(normalized, rentAmount(persona) * 12);
    return result(
      'rent_rewards_math',
      hasBilt && hasAnnualRent ? 'pass' : hasBilt || hasAnnualRent ? 'partial' : 'fail',
      `Bilt/no-fee rent rewards on ${(rentAmount(persona) * 12).toFixed(2)} annual rent.`,
      'Requires Bilt/no-fee rent rewards plus annual rent math.'
    );
  },
  costco_incremental_math: ({ normalized }) => {
    const hasCostco = includesAny(normalized, ['costco']);
    const hasCardEconomics = includesAny(normalized, ['citi', 'costco visa', 'anywhere visa', '2%', '4%']);
    const hasExecutiveEconomics = includesAny(normalized, ['executive', 'breakeven', 'break even', 'upgrade cost']);
    const hasIncrementalFraming = includesAny(normalized, ['incremental', 'versus', 'vs ', 'instead of', 'compared with', 'current card', 'sapphire']);
    return result(
      'costco_incremental_math',
      hasCostco && hasCardEconomics && hasExecutiveEconomics && hasIncrementalFraming ? 'pass' : hasCostco && hasCardEconomics && hasIncrementalFraming ? 'partial' : 'fail',
      'Evaluate incremental Costco card and Executive Membership economics.',
      `Costco=${hasCostco}; card economics=${hasCardEconomics}; Executive/breakeven=${hasExecutiveEconomics}; incremental framing=${hasIncrementalFraming}.`
    );
  },
  card_strategy_value_quantified: ({ normalized }) =>
    result(
      'card_strategy_value_quantified',
      includesAny(normalized, ['$/yr', '/yr', 'per year', 'annual', 'value', 'points']) && includesAny(normalized, ['28,200', '$28,200', '365', '$365', 'incremental', '1.3'])
        ? 'pass'
        : includesAny(normalized, ['annual', 'per year', 'value', 'points'])
          ? 'partial'
          : 'fail',
      'Quantify annual rewards value or incremental upside, not just name cards.',
      'Looks for annual value math on rent/card rewards.'
    ),
  card_strategy_fee_caveats: ({ normalized }) =>
    result(
      'card_strategy_fee_caveats',
      includesAny(normalized, ['fee', 'annual fee', 'processing']) && includesAny(normalized, ['worth', 'exceed', 'offset', 'simplicity', 'confirm'])
        ? 'pass'
        : includesAny(normalized, ['fee', 'annual fee', 'processing'])
          ? 'partial'
          : 'fail',
      'Handle annual fees, processing fees, and complexity caveats.',
      'Looks for fee/complexity tradeoff language.'
    ),
  card_strategy_priority_order: ({ normalized }) =>
    result(
      'card_strategy_priority_order',
      includesAny(normalized, ['priority 1', 'first', 'highest', 'biggest', 'single biggest']) && includesAny(normalized, ['bilt', 'rent', 'costco'])
        ? 'pass'
        : includesAny(normalized, ['first', 'priority', 'highest'])
          ? 'partial'
          : 'fail',
      'Prioritize card changes by dollar impact rather than listing cards randomly.',
      'Looks for priority ordering tied to rent/Costco opportunities.'
    ),
  no_unbacked_rewards_headline: ({ response }) => {
    const unbacked = hasUnbackedHighRewardsHeadline(response);
    return result(
      'no_unbacked_rewards_headline',
      unbacked ? 'fail' : 'pass',
      'Do not claim a large annual points/miles upside without line-item math, and keep one-time welcome bonuses separate from annual run-rate value.',
      unbacked ? 'Detected a high annual points/miles headline without one-time bonus labeling.' : 'No unsupported high annual rewards headline detected.'
    );
  },
  costco_monthly_spend: ({ persona, normalized }) =>
    {
      const total = costcoSpend(persona);
      const fuel = costcoFuelSpend(persona);
      const warehouse = total - fuel;
      const hasTotal = mentionsNumber(normalized, total);
      const hasComponents = mentionsNumber(normalized, warehouse) && mentionsNumber(normalized, fuel);
      const hasWarehouseOnly = mentionsNumber(normalized, warehouse);
      return result(
        'costco_monthly_spend',
        hasTotal || hasComponents ? 'pass' : hasWarehouseOnly ? 'partial' : 'fail',
        `Observed May Costco spend ${total.toFixed(2)} total, or ${warehouse.toFixed(2)} warehouse plus ${fuel.toFixed(2)} gas split out.`,
        'Accepts observed-period Costco spend or explicit warehouse/gas components; annualization should be scoped separately.'
      );
    },
  executive_membership_breakeven: ({ normalized }) =>
    result(
      'executive_membership_breakeven',
      includesAny(normalized, ['executive']) &&
        includesAny(normalized, ['breakeven', 'break even', 'upgrade cost', '3,250', '$3,250', '270/month', '$270/month', '$271/month', 'worth it']) &&
        includesAny(normalized, ['2%'])
        ? 'pass'
        : 'fail',
      'Mention Costco Executive breakeven/2% upgrade logic.',
      'Requires Executive Membership, 2% rewards, and breakeven/upgrade-cost logic.'
    ),
  gas_vs_warehouse_split: ({ normalized }) =>
    result('gas_vs_warehouse_split', includesAny(normalized, ['gas']) && includesAny(normalized, ['warehouse', 'costco wholesale']) ? 'pass' : 'fail', 'Separate Costco gas from warehouse spend.', 'Looks for gas/warehouse split.'),
  annual_rent: ({ persona, normalized }) =>
    result('annual_rent', mentionsNumber(normalized, rentAmount(persona) * 12) ? 'pass' : 'fail', `Annual rent ${(rentAmount(persona) * 12).toFixed(2)}`, 'Looks for annual rent.'),
  fee_vs_rewards: ({ persona, normalized }) => {
    const hasFeeTradeoff = includesAny(normalized, ['fee', 'processing']) && includesAny(normalized, ['reward', 'points', 'value']);
    const hasRentMath = mentionsNumber(normalized, rentAmount(persona) * 12) || mentionsNumber(normalized, rentAmount(persona));
    return result(
      'fee_vs_rewards',
      hasFeeTradeoff && hasRentMath ? 'pass' : hasFeeTradeoff ? 'partial' : 'fail',
      'Compare rent processing fees against rewards value using Maria’s rent.',
      `Fee tradeoff=${hasFeeTradeoff}; rent math=${hasRentMath}.`
    );
  },
  alaska_transaction_detection: ({ normalized }) => namedHits('alaska_transaction_detection', normalized, ['alaska', 'sea', 'sfo'], 1, 'Detect Alaska/SEA-SFO travel pattern.'),
  employer_linkage: ({ normalized }) => result('employer_linkage', includesAny(normalized, ['microsoft']) ? 'pass' : 'fail', 'Use Microsoft employer context.', 'Looks for Microsoft.'),
  program_caveat: ({ normalized }) => {
    const hasProgram = includesAny(normalized, ['alaska', 'status', 'microsoft', 'portal', 'corporate', 'benefit']);
    const hasCaveat = includesAny(normalized, ['verify', 'current', 'terms', 'availability', 'portal']);
    return result(
      'program_caveat',
      hasProgram && hasCaveat ? 'pass' : hasProgram || hasCaveat ? 'partial' : 'fail',
      'Caveat employer/travel program availability in the context of the specific program.',
      `Program context=${hasProgram}; caveat=${hasCaveat}.`
    );
  },
  avis_transaction_detection: ({ normalized }) => result('avis_transaction_detection', includesAny(normalized, ['avis']) ? 'pass' : 'fail', 'Detect Avis rental transaction.', 'Looks for Avis.'),
  coverage_caveats: ({ normalized }) => {
    const hasCoverage = includesAny(normalized, ['coverage', 'insurance', 'cdw']);
    const hasTerms = includesAny(normalized, ['terms', 'exclusion', 'excluded', 'vehicle', 'primary', 'secondary']);
    const hasBookingContext = includesAny(normalized, ['card', 'sapphire', 'chase', 'avis', 'rental']);
    return result(
      'coverage_caveats',
      hasCoverage && hasTerms && hasBookingContext ? 'pass' : hasCoverage && hasTerms ? 'partial' : 'fail',
      'Mention rental coverage terms/exclusions in the card/rental booking context.',
      `Coverage=${hasCoverage}; terms=${hasTerms}; booking context=${hasBookingContext}.`
    );
  },
  cash_balance_total: ({ persona, normalized }) => {
    const total = accountBalance(persona, 'acct_chase_checking') + accountBalance(persona, 'acct_ally_savings');
    return result(
      'cash_balance_total',
      mentionsNumber(normalized, total) ? 'pass' : includesAny(normalized, ['checking', 'savings', 'cash']) ? 'partial' : 'fail',
      `Total cash ${total.toFixed(2)}`,
      'Requires the checking + savings total or at least a cash-balance discussion.'
    );
  },
  monthly_burn_estimate: ({ normalized }) => result('monthly_burn_estimate', includesAny(normalized, ['monthly burn', 'monthly spending', 'expenses', 'runway']) ? 'pass' : 'fail', 'Estimate monthly burn/expenses for cash sizing.', 'Looks for burn/spend framing.'),
  idle_cash_estimate: ({ normalized }) => result('idle_cash_estimate', includesAny(normalized, ['idle', 'excess', 'surplus']) && includesAny(normalized, ['cash', 'checking', 'hysa']) ? 'pass' : 'fail', 'Estimate idle/excess cash.', 'Looks for idle cash framing.'),
  priority_ordering: ({ normalized }) => result('priority_ordering', includesAny(normalized, ['first', 'priority', 'before', 'then', 'order']) ? 'pass' : 'fail', 'Provide ordered priorities.', 'Looks for ordering language.'),
  cash_buffer_before_long_term_lockup: ({ normalized }) => result('cash_buffer_before_long_term_lockup', includesAny(normalized, ['emergency fund', 'cash buffer']) && includesAny(normalized, ['before', 'then', 'after']) ? 'pass' : 'fail', 'Keep cash buffer before long-term lockups.', 'Looks for cash-before-lockup sequencing.'),
  mega_backdoor_definition: ({ normalized }) =>
    result(
      'mega_backdoor_definition',
      includesAny(normalized, [
        'after-tax contribution',
        'after tax contribution',
        'after-tax employee',
        'after-tax 401',
        'after tax 401',
        'after-tax dollars',
        'after tax dollars'
      ]) &&
        includesAny(normalized, [
          'roth conversion',
          'converted to roth',
          'convert to roth',
          'in-plan',
          'in service',
          'in-service',
          'roth ira'
        ])
        ? 'pass'
        : 'fail',
      'Define mega backdoor Roth as after-tax 401(k) contributions plus Roth conversion/distribution.',
      'Looks for after-tax contribution mechanics plus Roth conversion/distribution path.'
    ),
  '415c_limit_caveat': ({ normalized }) => result('415c_limit_caveat', includesAny(normalized, ['415(c)', 'total contribution', 'overall limit', '72,000', '$72,000', 'current limit']) ? 'pass' : 'fail', 'Use/caveat total defined-contribution limit.', 'Looks for 415(c)/overall limit.'),
  contribution_room_estimate: ({ normalized }) => result('contribution_room_estimate', includesAny(normalized, ['room', 'remaining', 'left', 'available']) && includesAny(normalized, ['72,000', '$72,000', '415']) ? 'pass' : 'partial', 'Estimate remaining mega backdoor contribution room.', 'Looks for room plus total limit.'),
  mega_current_limits_no_stale: ({ normalized }) => {
    const hasCurrent = includesAny(normalized, ['2026', '24,500', '$24,500', '72,000', '$72,000']);
    const hasStale = includesAny(normalized, ['2025', '23,500', '$23,500', '23,000', '$23,000']);
    const hasWrong = hasWrongIrsLimit(normalized);
    return result(
      'mega_current_limits_no_stale',
      hasCurrent && !hasStale && !hasWrong ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use current benchmark-year contribution limits and avoid stale or wrong limits.',
      hasStale || hasWrong ? 'Detected stale-year or wrong-limit language.' : 'Looks for current 2026 limit framing.'
    );
  },
  mega_sequence_before_after_tax: ({ normalized }) =>
    result(
      'mega_sequence_before_after_tax',
      includesAny(normalized, ['hsa']) && includesAny(normalized, ['match', 'regular 401', 'normal 401', 'employee deferral']) && includesAny(normalized, ['before', 'after', 'then', 'order', 'step'])
        ? 'pass'
        : includesAny(normalized, ['hsa']) || includesAny(normalized, ['match', 'regular 401', 'normal 401'])
          ? 'partial'
          : 'fail',
      'Sequence match/regular 401(k)/HSA before after-tax mega backdoor contributions.',
      'Requires HSA plus regular 401(k)/match ordering.'
    ),
  mega_plan_feature_caveat: ({ normalized }) =>
    result(
      'mega_plan_feature_caveat',
      includesAny(normalized, ['aftertaxenabled', 'after-tax contributions', 'after tax contributions', 'plan allows']) && includesAny(normalized, ['in-plan', 'in service', 'in-service', 'verify', 'confirm'])
        ? 'pass'
        : includesAny(normalized, ['after-tax', 'after tax'])
          ? 'partial'
          : 'fail',
      'Caveat that mega backdoor requires plan support for after-tax contributions and Roth conversion/distribution.',
      'Looks for plan-feature verification language.'
    ),
  current_401k_annual_contribution: ({ normalized }) => result('current_401k_annual_contribution', mentionsNumber(normalized, 4800) ? 'pass' : 'fail', '8% of $60,000 salary is $4,800/year.', 'Looks for current contribution math.'),
  irs_limit_currentness: ({ normalized }) => {
    const hasCurrent = includesAny(normalized, ['24,500', '$24,500', '2026']);
    const hasStale = hasStaleOrWrongIrsLimit(normalized);
    return result(
      'irs_limit_currentness',
      hasCurrent && !hasStale ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use current benchmark 2026 401(k) employee limit $24,500 where relevant and avoid stale or wrong limits.',
      hasStale ? 'Detected stale or wrong IRS limit language.' : 'Looks for 2026 401(k) limit.'
    );
  },
  match_context: ({ normalized }) => result('match_context', includesAny(normalized, ['match', 'employer contribution', 'microsoft contribution']) ? 'pass' : 'fail', 'Discuss employer match context.', 'Looks for match.'),
  roth_income_phaseout_currentness: ({ normalized }) => result('roth_income_phaseout_currentness', includesAny(normalized, ['153,000', '168,000', '$153,000', '$168,000', 'phaseout']) ? 'pass' : 'fail', 'Use current benchmark Roth IRA phaseout context for single filer.', 'Looks for phaseout figures or phaseout discussion.'),
  ira_limit_currentness: ({ normalized }) => result('ira_limit_currentness', includesAny(normalized, ['7,500', '$7,500', '2026']) ? 'pass' : 'fail', 'Use current benchmark 2026 IRA limit $7,500.', 'Looks for IRA limit.'),
  pro_rata_caveat: ({ normalized }) => result('pro_rata_caveat', includesAny(normalized, ['pro-rata', 'pro rata', 'pre-tax ira', 'sep ira', 'simple ira']) ? 'pass' : 'fail', 'Mention pro-rata rule/pre-tax IRA caveat.', 'Looks for pro-rata caveat.'),
  hdhp_caveat: ({ normalized }) => result('hdhp_caveat', includesAny(normalized, ['hdhp', 'high deductible', 'hsa-eligible', 'eligible plan']) ? 'pass' : 'fail', 'Do not recommend HSA without HDHP/HSA eligibility.', 'Looks for HDHP eligibility.'),
  hsa_limit_currentness: ({ normalized }) => {
    const mentionsHsaLimit = includesAny(normalized, ['hsa', 'health savings account']) && includesAny(normalized, ['limit', 'contribution']);
    const hasCurrent = includesAny(normalized, ['4,400', '$4,400']);
    const hasStale = hasStaleOrWrongIrsLimit(normalized);
    if (!mentionsHsaLimit && !hasStale) {
      return result(
        'hsa_limit_currentness',
        'pass',
        'Use current benchmark 2026 self-only HSA limit $4,400 when a self-only HSA limit is cited.',
        'No self-only HSA contribution limit was cited.'
      );
    }
    return result(
      'hsa_limit_currentness',
      hasCurrent && !hasStale ? 'pass' : hasCurrent ? 'partial' : 'fail',
      'Use current benchmark 2026 self-only HSA limit $4,400 and avoid stale or wrong limits.',
      hasStale ? 'Detected stale or wrong IRS limit language.' : 'Looks for HSA limit.'
    );
  },
  employer_seed_caveat: ({ normalized }) => result('employer_seed_caveat', includesAny(normalized, ['employer seed', 'microsoft contribution', 'employer contribution']) && includesAny(normalized, ['verify', 'plan', 'if eligible']) ? 'pass' : 'fail', 'Caveat employer HSA seed/plan eligibility.', 'Looks for employer seed caveat.'),
  tax_opportunity_coverage: ({ normalized }) => namedHits('tax_opportunity_coverage', normalized, ['401', 'hsa', 'roth', 'freelance', 'estimated tax'], 3, 'Cover the main planted tax opportunities.'),
  current_limit_checks: ({ normalized }) => {
    const hasCurrentFraming = includesAny(normalized, ['2026', 'current']) && includesAny(normalized, ['limit', 'phaseout']);
    const hasStale = hasStaleOrWrongIrsLimit(normalized);
    return result(
      'current_limit_checks',
      hasCurrentFraming && !hasStale ? 'pass' : hasCurrentFraming ? 'partial' : 'fail',
      'Signal current-year limit awareness and avoid stale or wrong IRS limits.',
      hasStale ? 'Detected stale or wrong IRS limit language.' : 'Looks for current-year limit framing.'
    );
  },
  no_stale_irs_limits: ({ normalized }) =>
    result(
      'no_stale_irs_limits',
      hasStaleOrWrongIrsLimit(normalized) ? 'fail' : 'pass',
      'Do not cite stale or wrong IRS contribution limits.',
      hasStaleOrWrongIrsLimit(normalized) ? 'Detected stale or wrong IRS limit language.' : 'No stale or wrong IRS limit language detected.'
    ),
  rsu_vest_amount: ({ normalized }) => result('rsu_vest_amount', mentionsNumber(normalized, 42000) && includesAny(normalized, ['rsu', 'restricted stock', 'vest']) ? 'pass' : 'fail', 'Use the $42,000 Microsoft RSU vest from transactions.', 'Looks for RSU vest amount.'),
  human_capital_linkage: ({ normalized }) => result('human_capital_linkage', includesAny(normalized, ['salary', 'job', 'employer', 'human capital', 'income']) && includesAny(normalized, ['microsoft', 'same company']) ? 'pass' : 'fail', 'Connect employment income and stock exposure.', 'Looks for human-capital linkage.'),
  tax_caveats: ({ normalized }) => {
    const hasTaxMechanics = includesAny(normalized, ['tax lot', 'capital gain', 'basis', 'cost basis', 'withholding']);
    const hasTradingRestriction = includesAny(normalized, ['trading window', 'blackout', 'insider', '10b5']);
    return result(
      'tax_caveats',
      hasTaxMechanics && hasTradingRestriction ? 'pass' : hasTaxMechanics || hasTradingRestriction ? 'partial' : 'fail',
      'Mention both tax mechanics and employer trading-window/insider-trading caveats for selling equity.',
      `Tax mechanics=${hasTaxMechanics}; trading restriction=${hasTradingRestriction}.`
    );
  },
  no_account_balance_as_holdings: ({ normalized }) => {
    const bad401kExposure =
      /(?:your|the)\s+(?:microsoft|msft)?\s*401\s*\(?k\)?[^.\n]*(?:is|holds?|contains?|invested in)[^.\n]*(?:microsoft|msft)\s+(?:stock|shares?)/.test(normalized) ||
      /(?:microsoft|msft)\s+(?:stock|shares?)[^.\n]*(?:in|inside|held by)[^.\n]*(?:your|the)\s+401\s*\(?k\)?/.test(normalized);
    const badBalanceExposure =
      /48,?500[^.\n]*(?:microsoft|msft)?[^.\n]*(stock|shares?|holdings?|exposure|concentration)/.test(normalized) ||
      /62,?300[^.\n]*(?:microsoft|msft)[^.\n]*(stock|shares?|holdings?|exposure|concentration)/.test(normalized);
    return result(
      'no_account_balance_as_holdings',
      bad401kExposure || badBalanceExposure ? 'fail' : 'pass',
      'Do not infer Microsoft stock holdings or single-stock exposure from account names or account balances.',
      bad401kExposure || badBalanceExposure
        ? 'Detected account-balance/account-name language treated as Microsoft holding exposure.'
        : 'No account-balance-as-holdings inference detected.'
    );
  },
  disability_before_life: ({ normalized }) => result('disability_before_life', includesAny(normalized, ['disability']) && includesAny(normalized, ['life insurance', 'dependents']) ? 'pass' : 'fail', 'Prioritize disability and deprioritize life insurance without dependents.', 'Looks for disability/life contrast.'),
  dependents_check: ({ normalized }) =>
    result(
      'dependents_check',
      includesAny(normalized, ['no dependents', 'without dependents', 'recorded dependents', 'no recorded dependents', 'live alone', 'lives alone', 'single'])
        ? 'pass'
        : 'fail',
      'Use no-dependents context.',
      'Looks for no-dependents, living-alone, or single-household context.'
    ),
  income_replacement_math: ({ normalized }) => {
    const hasSalary = includesAny(normalized, ['60,000', '$60,000']);
    const hasIncomeReplacement = includesAny(normalized, ['income replacement', 'monthly benefit', 'take-home pay', 'salary']);
    const hasDisabilityMath = includesAny(normalized, ['60%', '40-45%', '40%', '45%']) && includesAny(normalized, ['ltd', 'disability', 'benefit']);
    return result(
      'income_replacement_math',
      hasSalary && hasIncomeReplacement ? 'pass' : hasDisabilityMath ? 'partial' : 'fail',
      'Discuss income replacement from $60,000 salary.',
      'Looks for salary-specific math, with partial credit for LTD/disability replacement-rate math.'
    );
  },
  freelance_income_amount: ({ normalized }) => result('freelance_income_amount', mentionsNumber(normalized, 1200) ? 'pass' : 'fail', 'Use $1,200 freelance deposit.', 'Looks for freelance amount.'),
  tax_reserve_range: ({ normalized }) => result('tax_reserve_range', includesAny(normalized, ['25%', '30%', '35%', 'set aside', 'reserve']) ? 'pass' : 'fail', 'Suggest a conservative tax reserve range.', 'Looks for reserve percentage.'),
  estimated_tax_caveat: ({ normalized }) =>
    result(
      'estimated_tax_caveat',
      includesAny(normalized, ['estimated tax', 'quarterly']) && includesAny(normalized, ['safe harbor', 'underpayment', 'withholding'])
        ? 'pass'
        : includesAny(normalized, ['estimated tax', 'quarterly'])
          ? 'partial'
          : 'fail',
      'Mention estimated tax/quarterly payments plus safe-harbor/withholding/underpayment caveat.',
      'Requires estimated/quarterly tax language plus a penalty or safe-harbor framing.'
    ),
  recurring_charge_detection: ({ normalized }) => namedHits('recurring_charge_detection', normalized, ['netflix', 'adobe', 'classpass'], 3, 'Detect Netflix, Adobe, and ClassPass recurring/subscription-like charges.'),
  recurring_review_scope_strict: ({ task, normalized }) => {
    if (task.id === 'patel_recurring_charges_audit' || task.id === 'patel_subscriptions_benefits') {
      const subscriptionHits = mentionsMerchantSet(normalized, ['disney', 'spotify', 'peloton']);
      const billHits = mentionsMerchantSet(normalized, ['xfinity', 'state farm', 'mortgage', 'bright horizons']);
      const backupCareMentioned = includesAny(normalized, ['care.com', 'backup care', 'backup-care']);
      const invalidCancellable =
        hasNearAny(normalized, 'mortgage', ['subscription', 'cancel', 'downgrade'], 100) ||
        hasNearAny(normalized, 'bright horizons', ['subscription', 'cancel', 'downgrade'], 100) ||
        hasNearAny(normalized, 'state farm', ['subscription', 'cancel'], 100);
      const separated = includesAny(normalized, ['separate', 'bill', 'insurance', 'mortgage', 'daycare', 'not a subscription', 'benefit']);
      const hasRequiredBenefitSignal = task.id !== 'patel_subscriptions_benefits' || backupCareMentioned;
      const status = subscriptionHits >= 2 && separated && hasRequiredBenefitSignal && !invalidCancellable
        ? 'pass'
        : subscriptionHits >= 2 && !invalidCancellable
          ? 'partial'
          : 'fail';
      return result(
        'recurring_review_scope_strict',
        status,
        'For Patel, identify true subscriptions like Disney/Spotify/Peloton while labeling utilities, insurance, mortgage, and daycare separately; benefits-routing tasks should catch backup care.',
        `Subscriptions detected=${subscriptionHits}/3; recurring bills detected=${billHits}; backup care mentioned=${backupCareMentioned}; separated=${separated}; invalid cancellable framing=${invalidCancellable}.`
      );
    }

    if (task.id === 'jordan_recurring_charges_audit' || task.id === 'jordan_subscriptions_benefits') {
      const businessToolHits = mentionsMerchantSet(normalized, ['adobe', 'figma', 'webflow', 'aws', 'google workspace']);
      const personalBillHits = mentionsMerchantSet(normalized, ['spectrum', 'visible', 'marketplace health']);
      const separated = includesAny(normalized, ['business', 'personal']) && includesAny(normalized, ['software', 'bill', 'health', 'rent', 'coworking']);
      const inventedTiers =
        /adobe[^.\n]*(full creative cloud|creative cloud|all apps)|(?:full creative cloud|creative cloud|all apps)[^.\n]*adobe/.test(normalized) ||
        /figma[^.\n]*(professional|pro tier|standard pro)|(?:professional|pro tier|standard pro)[^.\n]*figma/.test(normalized);
      const unrelatedFinanceAdvice =
        includesAny(normalized, ['solo 401', 'sep ira', 'traditional ira', 'roth ira', 'hsa']) ||
        hasNearAny(normalized, 'estimated tax', ['subscription', 'business tool', 'recurring', 'software'], 180);
      const status = businessToolHits >= 4 && personalBillHits >= 2 && separated && !inventedTiers && !unrelatedFinanceAdvice
        ? 'pass'
        : businessToolHits >= 3 && separated && !inventedTiers && !unrelatedFinanceAdvice
          ? 'partial'
          : 'fail';
      return result(
        'recurring_review_scope_strict',
        status,
        'For Jordan, identify recurring business software/tools separately from personal bills/health/rent, without inferring plan tiers from price.',
        `Business tools detected=${businessToolHits}/5; personal bills detected=${personalBillHits}/3; separated=${separated}; invented tiers=${inventedTiers}; unrelated finance advice=${unrelatedFinanceAdvice}.`
      );
    }

    return result(
      'recurring_review_scope_strict',
      'partial',
      'Apply task-specific recurring/subscription scope validation.',
      'No task-specific recurring scope rule for this task.'
    );
  },
  recurring_total_may: ({ normalized }) => {
    const hasCoreTotal = mentionsNumber(normalized, 171.98);
    const hasAllCoreMerchants = ['netflix', 'adobe', 'classpass'].every((term) => normalized.includes(term));
    const rentExplicitlyExcluded =
      explicitlyExcludes(normalized, ['rent', 'cascade apartments']) ||
      hasNearAny(normalized, 'rent', ['excluded', 'exclude', 'not included', 'separately'], 120) ||
      hasNearAny(normalized, 'cascade apartments', ['excluded', 'exclude', 'not included', 'separately'], 120);
    const hasInvalidRentTotal =
      !rentExplicitlyExcluded &&
      (mentionsAsIncludedTotal(normalized, 2681.98) ||
        (mentionsAsIncludedTotal(normalized, 2350) &&
          includesAny(normalized, ['subscription', 'recurring total', 'review total'])));
    const status = hasCoreTotal && !hasInvalidRentTotal ? 'pass' : hasAllCoreMerchants && !hasInvalidRentTotal ? 'partial' : 'fail';
    return result(
      'recurring_total_may',
      status,
      'May subscription-like review total is $171.98 for Netflix, Adobe, and ClassPass; rent is not part of this subscription-audit total.',
      hasInvalidRentTotal
        ? 'Detected an invalid rent-inclusive recurring/subscription total.'
        : hasCoreTotal
          ? 'Detected the intended subscription-like total.'
          : 'Looks for the subscription-like monthly total or all underlying merchants.'
    );
  },
  no_invalid_recurring_total_inclusions: ({ normalized }) => {
    const rentExplicitlyExcluded =
      explicitlyExcludes(normalized, ['rent', 'cascade apartments']) ||
      hasNearAny(normalized, 'rent', ['not a subscription', 'rather than', 'housing bill', 'primary housing', 'excluded'], 140) ||
      hasNearAny(normalized, 'cascade apartments', ['not a subscription', 'rather than', 'housing bill', 'primary housing', 'excluded'], 140);
    const utilitiesExplicitlySeparate =
      explicitlyExcludes(normalized, ['xfinity', 'at&t', 'att wireless', 'utilities']) ||
      includesAny(normalized, [
        'separate utilities',
        'separate bills',
        'utilities section',
        'recurring bills/utilities',
        'phone, internet',
        'phone/internet',
        'utility bills',
        'utilities & bills',
        'phone, internet, & utilities'
      ]);
    const includesRentAsSubscription =
      !rentExplicitlyExcluded &&
      (/rent[^.\n]{0,80}(?:subscription|subscription-like|recurring total|monthly total|review total)/i.test(normalized) ||
        /(?:subscription|subscription-like|recurring total|monthly total|review total)[^.\n]{0,80}rent/i.test(normalized) ||
        mentionsAsIncludedTotal(normalized, 2681.98));
    const includesUtilitiesAsSubscriptionTotal =
      !utilitiesExplicitlySeparate &&
      (mentionsAsIncludedTotal(normalized, 250) ||
      (mentionsAsIncludedTotal(normalized, 332.98) && !mentionsNumber(normalized, 171.98)) ||
      merchantInSubscriptionTotal(normalized, 'xfinity') ||
      merchantInSubscriptionTotal(normalized, 'at&t') ||
      merchantInSubscriptionTotal(normalized, 'att wireless'));
    return result(
      'no_invalid_recurring_total_inclusions',
      includesRentAsSubscription || includesUtilitiesAsSubscriptionTotal ? 'fail' : 'pass',
      'Do not include rent, payroll, income, utilities, or one-time travel in the subscription-like review total unless they are clearly labeled as a separate recurring-bills total.',
      includesRentAsSubscription
        ? 'Detected rent included as subscription-like/recurring review total.'
        : includesUtilitiesAsSubscriptionTotal
          ? 'Detected utilities included in the subscription-like review total.'
          : 'No invalid rent/utility-inclusive subscription total detected.'
    );
  },
  no_subscription_tier_fabrication: ({ normalized }) => {
    const netflixTierAssertion =
      /netflix[^.\n]*(premium|4k|ultra hd)|(?:premium|4k|ultra hd)[^.\n]*netflix/.test(normalized);
    const adobeTierMention =
      /adobe[^.\n]*(full creative cloud|all apps|full suite)|(?:full creative cloud|all apps|full suite)[^.\n]*adobe/.test(normalized);
    const figmaTierAssertion =
      /figma[^.\n]*(professional tier|pro tier|standard pro)|(?:professional tier|pro tier|standard pro)[^.\n]*figma/.test(normalized);
    const adobeTierCaveated =
      hasNearAny(normalized, 'full creative cloud', ['if you', "if you aren't", 'check', 'audit', 'review', 'whether'], 140) ||
      hasNearAny(normalized, 'full suite', ['if you', "if you aren't", 'check', 'audit', 'review', 'whether'], 140) ||
      hasNearAny(normalized, 'all apps', ['if you', "if you aren't", 'check', 'audit', 'review', 'whether'], 140);
    const fabricatedTier = netflixTierAssertion || figmaTierAssertion || (adobeTierMention && !adobeTierCaveated);
    return result(
      'no_subscription_tier_fabrication',
      fabricatedTier ? 'fail' : 'pass',
      'Do not infer exact subscription tiers from charge amounts unless the tier is visible in the data.',
      fabricatedTier ? 'Detected inferred Netflix or Adobe tier language.' : 'No unsupported subscription-tier inference detected.'
    );
  },
  no_unverified_public_subscription_pricing: ({ response }) => {
    const hasFalseSpecificity = hasUnverifiedPublicSubscriptionPricing(response);
    return result(
      'no_unverified_public_subscription_pricing',
      hasFalseSpecificity ? 'fail' : 'pass',
      'Do not cite exact public plan prices, promo rates, competitor rates, or discount percentages unless verified or framed as an unverified check.',
      hasFalseSpecificity
        ? 'Detected exact public subscription/bill pricing or discount claims without verification framing.'
        : 'No unverified exact public pricing claim detected.'
    );
  },
  employer_reimbursement_linkage: ({ normalized }) => result('employer_reimbursement_linkage', includesAny(normalized, ['microsoft']) && includesAny(normalized, ['reimbursement', 'benefit', 'wellness', 'fitness']) ? 'pass' : 'fail', 'Connect recurring charges to employer reimbursement possibility.', 'Looks for reimbursement linkage.'),
  credit_card_balance_amount: ({ persona, normalized }) => {
    const balance = accountBalance(persona, 'acct_csp');
    return result(
      'credit_card_balance_amount',
      mentionsNumber(normalized, balance) ? 'pass' : includesAny(normalized, ['sapphire', 'card balance', 'credit card balance']) ? 'partial' : 'fail',
      `Use the visible Chase Sapphire Preferred balance ${balance.toFixed(2)}.`,
      'Looks for the linked credit-card balance.'
    );
  },
  autopay_statement_balance: ({ normalized }) =>
    result(
      'autopay_statement_balance',
      includesAny(normalized, ['autopay', 'auto-pay', 'automatic payment']) && includesAny(normalized, ['full statement balance', 'statement balance'])
        ? 'pass'
        : includesAny(normalized, ['autopay', 'auto-pay', 'automatic payment'])
          ? 'partial'
          : 'fail',
      'Recommend verifying or setting autopay to the full statement balance.',
      'Looks for full-statement autopay, not just minimum-payment automation.'
    ),
  no_revolving_debt_assumption: ({ normalized }) => {
    const assertsRevolving =
      /(?:you are|you're|you have|you currently have|your)\s+[^.\n]{0,40}(?:revolving|carrying|interest-bearing|high-interest)\s+(?:credit card\s+)?debt/.test(
        normalized
      ) ||
      /(?:pay off|eliminate)\s+[^.\n]{0,30}\$?1,?840[^.\n]{0,80}(?:immediately|first|before anything)/.test(normalized);
    const hasVerification = includesAny(normalized, ['if', 'verify', 'confirm', 'statement balance', 'current balance', 'revolving', 'interest']);
    return result(
      'no_revolving_debt_assumption',
      assertsRevolving && !hasVerification ? 'fail' : 'pass',
      'Do not assume a visible current card balance is revolving debt; require statement/APR/autopay verification.',
      assertsRevolving && !hasVerification ? 'Detected unsupported revolving-debt assertion.' : 'No unsupported revolving-debt assumption detected.'
    );
  },
  high_interest_debt_priority: ({ normalized }) =>
    result(
      'high_interest_debt_priority',
      includesAny(normalized, ['interest', 'apr', 'revolving']) && includesAny(normalized, ['before investing', 'before taxable investing', 'before long-term investing', 'first', 'priority'])
        ? 'pass'
        : includesAny(normalized, ['interest', 'apr', 'revolving'])
          ? 'partial'
          : 'fail',
      'If the balance is interest-bearing, pay it before lower-priority investing.',
      'Looks for conditional high-interest-debt priority.'
    ),
  not_on_pace_401k_max: ({ normalized }) => {
    const saysNotOnPace = includesAny(normalized, ['not on pace', 'not maxing', 'not currently maxing', 'short of', 'below the limit', 'need to increase']);
    const hasContributionMath = includesAny(normalized, ['4,800', '$4,800', '8%', '24,500', '$24,500']);
    return result(
      'not_on_pace_401k_max',
      saysNotOnPace && hasContributionMath ? 'pass' : saysNotOnPace || hasContributionMath ? 'partial' : 'fail',
      'Visible 8% deferrals imply about $4,800/year, which is not on pace for the 2026 $24,500 employee limit.',
      'Looks for not-on-pace conclusion plus contribution/limit math.'
    );
  },
  top5_contains_high_impact_plays: ({ normalized }) => namedHits('top5_contains_high_impact_plays', normalized, ['mfte', 'idle cash', 'hysa', '401', 'hsa', 'rsu', 'freelance'], 4, 'Top-five answer includes multiple high-impact planted plays.'),
  impact_ordering: ({ normalized }) => result('impact_ordering', includesAny(normalized, ['highest impact', 'dollar impact', 'priority', 'first', 'rank']) ? 'pass' : 'fail', 'Rank by impact/priority.', 'Looks for impact ordering language.'),
  action_specificity: ({ normalized }) => result('action_specificity', includesAny(normalized, ['call', 'open', 'change', 'apply', 'check', 'move', 'set']) ? 'pass' : 'fail', 'Give specific actions.', 'Looks for verbs/actions.'),
  time_bounded_plan: ({ normalized }) => result('time_bounded_plan', includesAny(normalized, ['one hour', '60 minutes', 'this weekend', 'minute']) ? 'pass' : 'fail', 'Respect one-hour time constraint.', 'Looks for time-bound plan.'),
  high_impact_first: ({ normalized }) => result('high_impact_first', includesAny(normalized, ['first']) && includesAny(normalized, ['rent', 'mfte', 'cash', '401', 'hsa']) ? 'pass' : 'fail', 'Put high-impact item first.', 'Looks for first high-impact action.'),
  hidden_signal_count: ({ normalized }) => namedHits('hidden_signal_count', normalized, ['mfte', 'alaska', 'avis', 'hsa', 'rsu', 'freelance'], 3, 'Find several non-obvious planted signals.'),
  cross_domain_synthesis: ({ normalized }) => namedHits('cross_domain_synthesis', normalized, ['rent', 'travel', 'tax', 'cash', 'stock', 'insurance', 'rewards'], 4, 'Synthesize across domains.'),
  fabrication_penalty: ({ normalized }) =>
    result(
      'fabrication_penalty',
      includesAny(normalized, ['guaranteed', 'definitely eligible', 'risk-free', 'i can see your holdings', 'you are eligible for'])
        ? 'fail'
        : 'pass',
      'Avoid overconfident fabricated guarantees or claims of seeing unavailable data.',
      'Looks for obvious overclaim/fabrication language.'
    )
};

export function implementedDeterministicCheckIds(): string[] {
  return Object.keys(registry).sort();
}

function namedHits(id: string, normalized: string, terms: string[], passAt: number, expected: string): DeterministicCheckResult {
  const hits = terms.filter((term) => normalized.includes(term.toLowerCase())).length;
  const status = hits >= passAt ? 'pass' : hits > 0 ? 'partial' : 'fail';
  return result(id, status, expected, `${hits}/${terms.length} terms matched.`);
}

export function evaluateDeterministicChecks(task: Task, persona: Persona, response: string): DeterministicCheckResult[] {
  const normalized = normalizeForChecks(response);
  return task.deterministicChecks.map((checkId) => {
    const evaluator = registry[checkId];
    if (!evaluator) {
      return result(checkId, 'not_implemented', 'No deterministic evaluator registered yet.', 'Add an evaluator before relying on this check.');
    }
    return evaluator({ task, persona, response, normalized });
  });
}

function normalizeForChecks(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[*_`~]/g, '')
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deterministicScore(results: DeterministicCheckResult[]): number {
  const implemented = results.filter((check) => check.status !== 'not_implemented');
  if (implemented.length === 0) return 0;
  const score = implemented.reduce((sum, check) => sum + check.score, 0);
  const maxScore = implemented.reduce((sum, check) => sum + check.maxScore, 0);
  return Math.round((score / maxScore) * 100);
}
