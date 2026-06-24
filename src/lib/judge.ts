import type { CapturedResponse, DeterministicCheckResult, Opportunity, Persona, Task } from '../schema';
import { lockedFactsText } from '../data/locked-facts';
import { auditCurrentFacts, formatCurrentFactIssues } from './current-fact-audit';
import { uploadBalancesCsv, uploadTransactionsCsv } from './format';
import { getOpportunity } from './lookup';

export function buildJudgePrompt(
  task: Task,
  persona: Persona,
  capture: CapturedResponse,
  deterministicResults: DeterministicCheckResult[]
): string {
  const taskOpportunities = task.opportunityIds.map(getOpportunity);
  const currentFactIssues = auditCurrentFacts(capture.response, task, persona);
  const toolEvidenceBlock = `\nProvider-private tool traces are intentionally hidden for public scoring. Grade only the user-visible response against visible data, locked benchmark facts, the rubric, and independently verifiable financial knowledge.\n`;

  return `You are a strict but fair TreasuryBench judge evaluating a personal-finance assistant response.

Core principle:
Do not give full credit for generic correct advice when this persona contains enough signal for a higher-leverage personalized play. Do give credit for unexpected ideas when they are factual, grounded in the user's data, materially useful, conservatively valued, actionable, and safe.

Benchmark date: ${persona.asOfDate}
Provider: ${capture.provider}
Task id: ${task.id}
Domain: ${task.domain}
Task type: ${task.type}
User question: ${task.prompt}
Task intent: ${task.intent}
${task.expectedAnswerNotes && task.expectedAnswerNotes.length > 0 ? `\nExpected answer scope notes:\n${task.expectedAnswerNotes.map((note) => `- ${note}`).join('\n')}\n` : ''}

Persona summary:
${persona.summary}

Relevant seeded memories:
${persona.memories.map((memory) => `- ${memory.id}: ${memory.text}`).join('\n')}

Visible account balances CSV:
${uploadBalancesCsv(persona)}

Visible transactions CSV:
${uploadTransactionsCsv(persona)}

Locked benchmark facts for factual-currentness grading:
${lockedFactsText()}

Fact-source taxonomy for grading:
- visible_data: transactions, balances, account names/types, and dates visible in the CSVs.
- seeded_memory: persona memories listed above.
- locked_benchmark_fact: benchmark facts listed in the locked-facts table; treat them as authoritative for this benchmark date.
- dynamic_external_fact: current product, program, tax, card, local housing, or employer facts not listed as locked; give credit only when correct and appropriately caveated, and penalize stale or unsupported claims.
- unsupported: claims not supported by visible data, seeded memories, locked facts, or independently verifiable current knowledge. Penalize especially when a plan-level fact is overextended into user-specific participation.

Expected opportunities:
${formatOpportunities(taskOpportunities)}

Rubric dimensions:
${task.scoreDimensions.map((dimension) => `- ${dimension.id} (${dimension.points} pts): ${dimension.guidance}`).join('\n')}

Invalid or harmful patterns:
${task.invalidOrHarmful.map((item) => `- ${item}`).join('\n')}

Open credit policy:
${task.openCreditPolicy}

Deterministic evidence:
${deterministicResults
  .map((check) => `- ${check.id}: ${check.status} (${check.score}/${check.maxScore}) | expected: ${check.expected} | evidence: ${check.evidence}`)
  .join('\n')}

Current-fact scanner evidence:
${formatCurrentFactIssues(currentFactIssues)}

Scanner grading instruction:
- Treat scanner hits as leads, not automatic verdicts. Verify the quote against the full response and locked facts.
- If the number is merely a cash buffer, spending total, salary, insurance deductible, credit limit example, or other unrelated value, ignore the hit.

Factual claim assessment (THE source of truth is the locked-fact table above — NOT your own memory):
- List, under "factualClaims", every CHECKABLE EXTERNAL fact the answer asserts: current-year tax limits/thresholds/brackets, IRS or program rules, card/product terms, employer-plan facts, and local-program facts. Do NOT list the user's own visible data, arithmetic/derived figures, or opinions/recommendations.
- For each claim set "tableKey" to the id of the locked fact it corresponds to, or null if no locked fact covers it. Set "state" to exactly one of:
  - "verified_correct": the claim matches the locked fact named by tableKey.
  - "verified_incorrect": the claim contradicts the locked fact named by tableKey. You may use this ONLY when tableKey is a real locked-fact id from the table above and the claim genuinely conflicts with it.
  - "unverified": no locked fact covers this claim (tableKey null). You MUST use this for any external fact not in the table.
- CRITICAL: never mark a claim "verified_incorrect" from your own knowledge. Your training may be out of date (this benchmark's facts are 2026). If a fact is not in the locked-fact table, it is "unverified" — log it, do not judge its accuracy. Unverified claims are sent for independent verification later; they neither help nor hurt the score.
- "factualIssues" is free-text and advisory only (human-readable notes); it does NOT affect the score. The scored factual signal is "factualClaims".
${toolEvidenceBlock}

Assistant response to grade:
"""
${capture.response}
"""

Grade the response as JSON only. Use this exact shape:
{
  "taskId": "${task.id}",
  "provider": "${capture.provider}",
  "totalScore": 0,
  "dimensions": [
    { "id": "dimension_id", "score": 0, "maxScore": 0, "rationale": "short reason" }
  ],
  "factualClaims": [
    { "claim": "the external fact the answer asserted", "tableKey": "locked_fact_id_or_null", "state": "verified_correct | verified_incorrect | unverified" }
  ],
  "factualIssues": ["advisory free-text notes only; not scored"],
  "missedOpportunities": ["important planted opportunities the answer missed"],
  "unexpectedValidInsights": ["valid extra insights not in the expected opportunity list"],
  "safetyIssues": ["unsafe or overconfident advice"],
  "summary": "one-sentence verdict"
}

Scoring guidance:
- Dimension scores must sum to totalScore and must not exceed each dimension's max points.
- Treat expected answer scope notes as binding. If a note says a task is narrow data retrieval, do not require broader optimization, card strategy, breakeven math, or unrelated advanced plays for full credit.
- Expected opportunities help identify relevant planted plays, but they must not override the user's question, task intent, or expected answer scope notes.
- Reward specificity, correct math, current external knowledge, and eligibility caveats.
- Do not penalize confident claims solely because they are confident. Confidence is good when the claim is correct and grounded in visible user data, locked facts, or independently verifiable financial knowledge.
- Do not require timid hedging for exact values from visible data or locked benchmark facts.
- Treat locked employer-plan facts as verified external knowledge. Do not mark them fabricated merely because they are not derivable from transactions or balances.
- Treat locked current product/program facts as authoritative even if they differ from older model memory. In particular, do not penalize Bilt Blue/Obsidian/Palladium, Bilt-to-Atmos/Alaska transfer language, Atmos naming, Microsoft Prime, Microsoft HSA seed, Salesforce benefits/perks in the locked-facts table, or Microsoft-linked Alaska/Atmos corporate-status challenge language when the answer uses them accurately and with appropriate user-specific caveats.
- Distinguish plan-level facts from user-specific participation: it is valid to say Microsoft or Salesforce offers a benefit, but unsupported to say the user is enrolled, contributing enough, eligible for a specific merchant reimbursement, has submitted a claim, or has remaining balance unless visible data, memories, or the task context show that.
- Penalize claims that contradict visible user data, locked benchmark facts, or well-established product/program facts; also penalize overextending a general fact into an unsupported user-specific claim. This applies even when the contradictory claim is volunteered as an adjacent aside rather than required by the task.
- Treat the locked benchmark facts above as authoritative when grading factual-currentness. Penalize contradictory or stale values even when the answer says to verify them.
- For example, the locked 2026 self-only HSA contribution limit is $4,400; if the response cites $4,300 as the 2026 self-only HSA limit, record a factualClaims entry with tableKey "irs_2026_hsa_self_only" and state "verified_incorrect".
- Penalize vague references to limits/programs when a useful answer should commit to a current number or explain how to verify it.
- Penalize stale IRS/card/program facts more heavily than tiny rounding differences.
- Penalize fabricated user data or fabricated product benefits.
- Penalize raw product/tool leakage in the user-visible answer, such as literal tool/function calls, JSON payloads, stream/debug artifacts, or internal display-card syntax. This is a resolution/correctness defect even if the surrounding advice is useful, because a user-facing assistant should call tools invisibly or present the resulting card/prose cleanly.
- For merchant/category spend trends, grade the stated time scope. Do not automatically prefer annualizing one observed month. Reward responses that use the exact requested period, a representative multi-month average, or explicitly labeled "if this month is typical" scenario math. Penalize presenting a one-off travel, Costco, or subscription spike as normal monthly spend without saying so.
- For prioritization dimensions, do not require one canonical ordering when multiple high-value plays are plausible. Reward ordering that explains impact, evidence quality, certainty, effort, and reversibility; penalize only if small/uncertain tweaks are ranked above clearly larger visible opportunities without justification.
- Give credit for unexpected, out-of-rubric ideas when they are factual, relevant to this persona, conservatively valued, and actionable.
- A basic generic answer can receive some rubric credit, but it should not score high if it misses the advanced/expert plays planted in the data.`;
}

function formatOpportunities(opportunities: Opportunity[]): string {
  if (opportunities.length === 0) return '- None. This task is primarily deterministic data retrieval.';
  return opportunities
    .map(
      (opportunity) => `- ${opportunity.id}: ${opportunity.title}
  Expected action: ${opportunity.expectedAction}
  Value model: ${opportunity.valueModel}
  Caveats: ${opportunity.eligibilityCaveats.join(' ')}
  Basic tier: ${opportunity.tiers.basic.join(' ')}
  Personalized tier: ${opportunity.tiers.personalized.join(' ')}
  Advanced tier: ${opportunity.tiers.advanced.join(' ')}
  Expert tier: ${opportunity.tiers.expert.join(' ')}`
    )
    .join('\n');
}
