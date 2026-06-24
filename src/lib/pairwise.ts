import type { CapturedResponse, PairwisePreferenceEvaluation, Persona, Task } from '../schema';
import { lockedFactsText } from '../data/locked-facts';
import { uploadBalancesCsv, uploadTransactionsCsv } from './format';

export function buildPairwisePreferencePrompt(task: Task, persona: Persona, captureA: CapturedResponse, captureB: CapturedResponse): string {
  return `You are a strict but fair TreasuryBench pairwise judge.

Question: Which answer would be more useful and trustworthy to this user?

Do not use provider identity as evidence. Grade only the two user-visible answers against the user data, benchmark facts, task scope, factual accuracy, personalization, actionability, and prudence.

Benchmark date: ${persona.asOfDate}
Task id: ${task.id}
Task domain: ${task.domain}
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

Locked benchmark facts:
${lockedFactsText()}

Rubric dimensions for context:
${task.scoreDimensions.map((dimension) => `- ${dimension.id} (${dimension.points} pts): ${dimension.guidance}`).join('\n')}

Invalid or harmful patterns:
${task.invalidOrHarmful.map((item) => `- ${item}`).join('\n')}

Answer A:
"""
${captureA.response}
"""

Answer B:
"""
${captureB.response}
"""

Return JSON only in this exact shape:
{
  "taskId": "${task.id}",
  "personaId": "${persona.id}",
  "providerA": "${captureA.provider}",
  "providerB": "${captureB.provider}",
  "winner": "A",
  "confidence": 0,
  "usefulnessScoreA": 0,
  "usefulnessScoreB": 0,
  "trustworthinessScoreA": 0,
  "trustworthinessScoreB": 0,
  "rationale": "short explanation of why the winner is more useful and trustworthy",
  "flagsA": ["important factual, grounding, omission, or prudence issues in A"],
  "flagsB": ["important factual, grounding, omission, or prudence issues in B"]
}

Scoring rules:
- winner must be "A", "B", or "tie".
- confidence is 0-100.
- usefulness/trustworthiness scores are 0-100 and should reflect the answer text, not benchmark provider identity.
- Treat expected answer scope notes as binding. For narrow data-retrieval tasks, do not prefer an answer solely because it adds broader optimization, card strategy, breakeven math, or unrelated advanced plays.
- Prefer the answer that is more useful and trustworthy for the actual user, not merely longer or more polished.
- Reward correct confidence. Do not penalize a precise confident statement when it is grounded in visible data or locked benchmark facts.
- Penalize unsupported user-specific participation claims, stale facts, wrong math, vague dodges, fabricated cards/benefits, and missed high-value opportunities.
- Give credit for unexpected recommendations when factual, personally relevant, conservatively valued, actionable, and prudent.`;
}

export function parsePairwisePreferenceEvaluation(json: string): PairwisePreferenceEvaluation {
  const parsed = JSON.parse(json) as Partial<PairwisePreferenceEvaluation>;
  const requiredKeys = [
    'taskId',
    'personaId',
    'providerA',
    'providerB',
    'winner',
    'confidence',
    'usefulnessScoreA',
    'usefulnessScoreB',
    'trustworthinessScoreA',
    'trustworthinessScoreB',
    'rationale'
  ] as const;
  for (const key of requiredKeys) {
    if (parsed[key] === undefined || parsed[key] === null) {
      throw new Error(`Pairwise preference evaluation is missing ${key}.`);
    }
  }
  if (parsed.winner !== 'A' && parsed.winner !== 'B' && parsed.winner !== 'tie') {
    throw new Error(`Pairwise preference winner must be A, B, or tie. Got: ${parsed.winner}`);
  }
  return {
    taskId: mustString(parsed.taskId, 'taskId'),
    personaId: mustString(parsed.personaId, 'personaId'),
    providerA: mustString(parsed.providerA, 'providerA'),
    providerB: mustString(parsed.providerB, 'providerB'),
    winner: parsed.winner,
    confidence: mustNumber(parsed.confidence, 'confidence'),
    usefulnessScoreA: mustNumber(parsed.usefulnessScoreA, 'usefulnessScoreA'),
    usefulnessScoreB: mustNumber(parsed.usefulnessScoreB, 'usefulnessScoreB'),
    trustworthinessScoreA: mustNumber(parsed.trustworthinessScoreA, 'trustworthinessScoreA'),
    trustworthinessScoreB: mustNumber(parsed.trustworthinessScoreB, 'trustworthinessScoreB'),
    rationale: mustString(parsed.rationale, 'rationale'),
    flagsA: parsed.flagsA ?? [],
    flagsB: parsed.flagsB ?? []
  };
}

function mustString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Pairwise preference evaluation field ${field} must be a string.`);
  return value;
}

function mustNumber(value: unknown, field: string): number {
  if (typeof value !== 'number') throw new Error(`Pairwise preference evaluation field ${field} must be a number.`);
  return value;
}
