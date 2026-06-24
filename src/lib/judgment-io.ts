import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { FactualClaim, FactualClaimState, JudgeEvaluation } from '../schema';
import { hasLockedFact, lockedFactCurrentValues, lockedFactTable } from '../data/locked-facts';
import { judgeKey } from './final-score';

const CLAIM_STATES: FactualClaimState[] = ['verified_correct', 'verified_incorrect', 'unverified'];

// Reverse index of distinctive current-value strings -> locked-fact id, used to
// auto-match claims the judge left unverified even though they state a known fact.
// Only values unique to a single fact are indexed, to avoid ambiguous matches.
const VALUE_TO_FACT: Map<string, string> = (() => {
  const counts = new Map<string, Set<string>>();
  for (const fact of lockedFactTable) {
    for (const value of fact.currentValues ?? []) {
      if (!counts.has(value)) counts.set(value, new Set());
      counts.get(value)!.add(fact.id);
    }
  }
  const index = new Map<string, string>();
  for (const [value, ids] of counts) {
    // Skip short/ambiguous numbers; only auto-match distinctive grouped amounts.
    if (ids.size === 1 && value.includes(',')) index.set(value, [...ids][0]);
  }
  return index;
})();

function autoMatchFact(claim: string): string | undefined {
  for (const [value, factId] of VALUE_TO_FACT) {
    if (claim.includes(value)) return factId;
  }
  return undefined;
}

/**
 * Deterministic guarantee that the judge cannot mark a claim wrong from its own
 * (possibly stale) memory: a `verified_*` verdict is only honored when its
 * `tableKey` resolves to a real locked fact. A missing/unknown tableKey, or an
 * unrecognized state, is demoted to `unverified` — so it flows to the
 * unknown-facts ledger and has no score impact.
 */
function groundFactualClaims(raw: unknown): FactualClaim[] {
  if (!Array.isArray(raw)) return [];
  const claims: FactualClaim[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const claim = typeof record.claim === 'string' ? record.claim.trim() : '';
    if (!claim) continue;
    const rawKey =
      typeof record.tableKey === 'string' && record.tableKey !== 'null' && record.tableKey.length > 0
        ? record.tableKey
        : null;
    const grounded = rawKey !== null && hasLockedFact(rawKey);
    let state: FactualClaimState = CLAIM_STATES.includes(record.state as FactualClaimState)
      ? (record.state as FactualClaimState)
      : 'unverified';
    if ((state === 'verified_incorrect' || state === 'verified_correct') && !grounded) {
      state = 'unverified';
    }
    let tableKey = grounded ? (rawKey as string) : null;
    // Verdict-direction guard: if the judge flagged a contradiction but the claim
    // actually states the fact's current value, the verdict is wrong — the answer
    // is correct. Demote so a mislabel can't apply a (potentially harsh) cap.
    if (state === 'verified_incorrect' && tableKey) {
      if (lockedFactCurrentValues(tableKey).some((value) => claim.includes(value))) {
        state = 'verified_correct';
      }
    }
    // Recall guard: the judge often leaves a claim "unverified" even though it
    // states a known fact's current value (sometimes even after naming the
    // tableKey). If the claim contains that fact's current value, it is correct —
    // promote it so the unknown-facts ledger only holds genuinely-unknown facts.
    if (state === 'unverified') {
      const candidate = tableKey ?? autoMatchFact(claim);
      if (candidate && lockedFactCurrentValues(candidate).some((value) => claim.includes(value))) {
        tableKey = candidate;
        state = 'verified_correct';
      }
    }
    claims.push({ claim, tableKey, state });
  }
  return claims;
}

export function parseJudgeEvaluation(json: string): JudgeEvaluation {
  const parsed = JSON.parse(json) as Partial<JudgeEvaluation> & { factualClaims?: unknown };
  const requiredKeys = ['taskId', 'provider', 'totalScore', 'dimensions', 'summary'] as const;
  for (const key of requiredKeys) {
    if (parsed[key] === undefined || parsed[key] === null) {
      throw new Error(`Judge evaluation is missing ${key}.`);
    }
  }
  return {
    taskId: parsed.taskId,
    provider: parsed.provider,
    totalScore: parsed.totalScore,
    dimensions: parsed.dimensions,
    factualClaims: groundFactualClaims(parsed.factualClaims),
    factualIssues: parsed.factualIssues ?? [],
    missedOpportunities: parsed.missedOpportunities ?? [],
    unexpectedValidInsights: parsed.unexpectedValidInsights ?? [],
    safetyIssues: parsed.safetyIssues ?? [],
    summary: parsed.summary
  } as JudgeEvaluation;
}

export function readJudgeEvaluations(judgmentsDir: string): Map<string, JudgeEvaluation> {
  const judgments = new Map<string, JudgeEvaluation>();
  for (const entry of readdirSync(judgmentsDir)) {
    if (!entry.endsWith('.json')) continue;
    const path = join(judgmentsDir, entry);
    if (!statSync(path).isFile()) continue;

    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const judgment = parseJudgeEvaluation(JSON.stringify(item));
      judgments.set(judgeKey(judgment.provider, judgment.taskId), judgment);
    }
  }
  return judgments;
}
