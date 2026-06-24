import assert from 'node:assert/strict';
import { buildFullContextPrompt } from '../lib/format';
import { deterministicScore, evaluateDeterministicChecks } from '../lib/deterministic';
import { buildJudgePrompt } from '../lib/judge';
import { auditCurrentFacts } from '../lib/current-fact-audit';
import { parseJudgeEvaluation } from '../lib/judgment-io';
import { getPersona, getTask } from '../lib/lookup';
import { tasks } from '../data/tasks';

const rentTask = getTask('maria_save_on_rent');
const persona = getPersona(rentTask.personaId);
const prompt = buildFullContextPrompt(persona, rentTask);

assert.equal(prompt.prompt.includes('Synced account context CSV:'), false, 'full-context prompt should not include a separate account-context surface');
assert.equal(prompt.prompt.includes('Type,Subtype,Institution,Account,Mask,Current Balance,Available Balance'), false, 'full-context prompt should not include account-context attributes');
assert.ok(prompt.prompt.includes('Balances CSV:'), 'full-context prompt should include balances');
assert.ok(prompt.prompt.includes('Date,Balance,Account'), 'full-context prompt should use upload-shaped balance CSV');
assert.equal(prompt.prompt.includes('Investment holdings CSV:'), false, 'full-context prompt should not use a holdings surface Treasury does not store');
assert.ok(prompt.prompt.includes('Transactions CSV:'), 'full-context prompt should include transactions');
assert.ok(prompt.prompt.includes('Date,Merchant,Category,Account,Original Statement,Notes,Amount,Tags,Owner'), 'full-context prompt should use upload-shaped transaction CSV');
assert.ok(prompt.prompt.includes('Cascade Apartments'), 'full-context prompt should include rent transaction');
assert.equal(prompt.prompt.includes('Benchmark Signal'), false, 'full-context prompt should not expose benchmark-only marker rows');
assert.ok(prompt.prompt.includes('My rent is $2,350/month in Seattle.'), 'full-context prompt should include user question');

const expertRentResponse = `
Your rent is $2,350/month, or $28,200/year, for a single-person household in Seattle on about $60,000 gross income.
The non-obvious thing to check first is Seattle MFTE/MHA housing. You should verify the current AMI table and participating buildings,
because eligibility and availability change, but this could beat generic advice like moving farther out. Compare current rent to eligible MFTE 1BR units and frame savings as a conservative monthly range; hundreds per month would matter.
Exact next steps: search the Seattle Office of Housing MFTE apartment list, ask leasing offices for current availability and documentation, and apply to waitlists. Secondary play: evaluate Bilt/no-fee rent rewards, but avoid processing fees.
`;

const genericRentResponse = `
You can save money on rent by looking in cheaper neighborhoods, negotiating with your landlord, or getting a roommate.
`;

const expertResults = evaluateDeterministicChecks(rentTask, persona, expertRentResponse);
const genericResults = evaluateDeterministicChecks(rentTask, persona, genericRentResponse);

assert.equal(expertResults.some((check) => check.status === 'not_implemented'), false, 'rent task checks should all be implemented');
assert.ok(deterministicScore(expertResults) >= 90, `expert rent response should score high, got ${deterministicScore(expertResults)}`);
assert.ok(deterministicScore(genericResults) <= 20, `generic rent response should score low, got ${deterministicScore(genericResults)}`);

const foodTask = getTask('maria_food_spend_may');
const foodResponse = `
In May, food-like spending was $833.96 when excluding the $58.23 Costco Gas purchase as fuel.
That includes Costco warehouse food runs, Safeway, Trader Joe's, and restaurants; Costco should be separated from ordinary supermarket coding.
`;
const foodResults = evaluateDeterministicChecks(foodTask, persona, foodResponse);
assert.equal(deterministicScore(foodResults), 100, `reasonable food gas-exclusion response should score 100, got ${deterministicScore(foodResults)}`);

const stockTask = getTask('maria_msft_stock_risk');
const stockResponse = `
The $42,000 Microsoft RSU vest is taxed at vest and then becomes an investment decision. Because your job, future RSUs, and Microsoft 401(k) match all come from the same employer, avoid adding unnecessary single-company risk.
Before selling, confirm you still hold the shares, check cost basis and withholding, and make sure you are inside an open trading window.
`;
const stockResults = evaluateDeterministicChecks(stockTask, persona, stockResponse);
const noHoldingsCheck = stockResults.find((check) => check.id === 'no_account_balance_as_holdings');
assert.equal(noHoldingsCheck?.status, 'pass', '401(k) match / employer-risk wording should not be treated as account-balance-as-holdings fabrication');

const costcoTask = getTask('maria_costco_optimization');
const costcoResponse = `
You spent $501.23 at Costco warehouse in May plus $58.23 at Costco Gas. Stick with Gold Star for now: Executive earns 2%, but you need about $3,250/year or $270/month for the $65 upgrade to be worth it. Separate warehouse purchases from gas when choosing the Costco Visa.
`;
const costcoResults = evaluateDeterministicChecks(costcoTask, persona, costcoResponse);
assert.equal(deterministicScore(costcoResults), 100, `Costco warehouse/gas split plus Executive threshold should score 100, got ${deterministicScore(costcoResults)}`);

const judgePrompt = buildJudgePrompt(
  rentTask,
  persona,
  {
    taskId: rentTask.id,
    personaId: persona.id,
    provider: 'fixture_expert',
    mode: 'product_capture',
    capturedAt: '2026-05-31T00:00:00.000Z',
    response: expertRentResponse
  },
  expertResults
);

assert.ok(judgePrompt.includes('Expected opportunities:'), 'judge prompt should include expected opportunities');
assert.ok(judgePrompt.includes('rent_seattle_mfte'), 'judge prompt should include planted MFTE opportunity');
assert.ok(judgePrompt.includes('unexpected ideas'), 'judge prompt should preserve open-credit policy');
assert.ok(judgePrompt.includes('"totalScore"'), 'judge prompt should require structured JSON output');

for (const task of tasks) {
  const taskPersona = getPersona(task.personaId);
  const results = evaluateDeterministicChecks(task, taskPersona, '');
  assert.equal(results.some((check) => check.status === 'not_implemented'), false, `${task.id} has an unimplemented deterministic check`);
}

// Current-fact scanner must not false-fire: stale values need a digit boundary,
// and an old-vs-new contrast (correct value present nearby) is not a stale citation.
const dcapContrast =
  'The 2026 dependent care FSA household limit is $7,500. If you are only contributing the old limit of $5,000, you are leaving tax-free room on the table.';
assert.equal(
  auditCurrentFacts(dcapContrast).some((issue) => issue.id === 'stale_dependent_care_fsa_5000'),
  false,
  'scanner must not flag a correct old-vs-new DCAP contrast as a stale fact'
);
assert.equal(
  auditCurrentFacts('You have $45,000 set aside in your dependent care planning bucket.').length,
  0,
  'scanner must not match $5,000 inside $45,000'
);
assert.ok(
  auditCurrentFacts('For 2026 the dependent care FSA limit is $5,000, so elect up to that.').some(
    (issue) => issue.id === 'stale_dependent_care_fsa_5000'
  ),
  'scanner must still catch a genuine stale DCAP citation'
);

// Factual-claim grounding guarantee: the judge can never sustain a
// verified verdict without a real locked-fact tableKey.
const judgeWithClaims = parseJudgeEvaluation(
  JSON.stringify({
    taskId: 'maria_save_on_rent',
    provider: 'test',
    totalScore: 90,
    dimensions: [{ id: 'correctness', score: 27, maxScore: 30, rationale: 'ok' }],
    summary: 'test',
    factualClaims: [
      { claim: 'real contradiction', tableKey: 'irs_2026_hsa_self_only', state: 'verified_incorrect' },
      { claim: 'made-up correction from memory', tableKey: 'no_such_fact', state: 'verified_incorrect' },
      { claim: 'asserted wrong with no key', tableKey: null, state: 'verified_incorrect' },
      { claim: 'a fact not in the table', tableKey: null, state: 'unverified' }
    ]
  })
);
const byState = judgeWithClaims.factualClaims;
assert.equal(
  byState.filter((c) => c.state === 'verified_incorrect').length,
  1,
  'only the claim citing a real locked fact stays verified_incorrect'
);
assert.equal(
  byState.filter((c) => c.state === 'unverified').length,
  3,
  'ungrounded verified verdicts are demoted to unverified (no score impact)'
);
assert.ok(
  byState.find((c) => c.claim === 'real contradiction')?.tableKey === 'irs_2026_hsa_self_only',
  'grounded contradiction keeps its tableKey'
);

console.log('TreasuryBench smoke tests passed.');
