import type {
  CurrentFactIssue,
  DeterministicEvaluation,
  FactConflictSeverity,
  FinalEvaluation,
  JudgeEvaluation,
  TaskType
} from '../schema';
import { lockedFactSeverity } from '../data/locked-facts';
import { getTask } from './lookup';

interface ScoreWeights {
  deterministic: number;
  judge: number;
}

// Factual score caps applied when an answer contradicts a locked fact. The
// contradiction is table-grounded (see judgment-io.groundFactualClaims), so these
// fire only on verifiable errors — which is why they can be this harsh.
export const DANGEROUS_FACT_CAP = 40;
export const MULTI_MATERIAL_FACT_CAP = 55;
export const MATERIAL_FACT_CAP = 65;

interface FactualVerdict {
  contradictions: number;
  materialCount: number;
  dangerousCount: number;
  worstSeverity: FactConflictSeverity | null;
  unverifiedCount: number;
}

function factualVerdict(judgeEvaluation: JudgeEvaluation): FactualVerdict {
  let materialCount = 0;
  let dangerousCount = 0;
  let unverifiedCount = 0;
  for (const claim of judgeEvaluation.factualClaims) {
    if (claim.state === 'unverified') {
      unverifiedCount += 1;
    } else if (claim.state === 'verified_incorrect' && claim.tableKey) {
      // tableKey is guaranteed to resolve to a locked fact by groundFactualClaims.
      if (lockedFactSeverity(claim.tableKey) === 'dangerous') dangerousCount += 1;
      else materialCount += 1;
    }
  }
  return {
    contradictions: materialCount + dangerousCount,
    materialCount,
    dangerousCount,
    worstSeverity: dangerousCount > 0 ? 'dangerous' : materialCount > 0 ? 'material' : null,
    unverifiedCount
  };
}

const WEIGHTS_BY_TASK_TYPE: Record<TaskType, ScoreWeights> = {
  data_retrieval: { deterministic: 0.5, judge: 0.5 },
  insight_discovery: { deterministic: 0.15, judge: 0.85 },
  domain_advice: { deterministic: 0.2, judge: 0.8 },
  prioritization: { deterministic: 0.15, judge: 0.85 },
  what_if: { deterministic: 0.25, judge: 0.75 }
};

export const DIVERGENCE_WARNING_THRESHOLD = 25;
export const FINAL_JUDGE_WARNING_THRESHOLD = 20;
export const JUDGE_OVERRIDE_THRESHOLD = 30;

export function combineFinalEvaluation(
  deterministicEvaluation: DeterministicEvaluation,
  judgeEvaluation?: JudgeEvaluation
): FinalEvaluation {
  const task = getTask(deterministicEvaluation.taskId);

  if (!judgeEvaluation) {
    const finalScore = deterministicOnlyScore(task.type, deterministicEvaluation.deterministicScore);
    const deterministicCapApplied = finalScore !== deterministicEvaluation.deterministicScore;
    return {
      taskId: deterministicEvaluation.taskId,
      personaId: deterministicEvaluation.personaId,
      provider: deterministicEvaluation.provider,
      mode: deterministicEvaluation.mode,
      domain: deterministicEvaluation.domain,
      deterministicScore: deterministicEvaluation.deterministicScore,
      finalScore,
      latencyMs: deterministicEvaluation.latencyMs,
      scoringMode: 'deterministic_only',
      scoreSource: 'deterministic_cap',
      deterministicWeight: 1,
      judgeWeight: 0,
      scoringWarnings: deterministicCapApplied
        ? [`Deterministic-only score capped from ${deterministicEvaluation.deterministicScore} to ${finalScore} for ${task.type}.`]
        : ['No judge score available; final score is deterministic-only development fallback.'],
      factualContradictions: 0,
      factualWorstSeverity: null,
      unverifiedFactCount: 0
    };
  }

  const verdict = factualVerdict(judgeEvaluation);

  const weights = WEIGHTS_BY_TASK_TYPE[task.type];
  const weightedScore = Math.round(deterministicEvaluation.deterministicScore * weights.deterministic + judgeEvaluation.totalScore * weights.judge);
  const judgeDeterministicDelta = Math.abs(deterministicEvaluation.deterministicScore - judgeEvaluation.totalScore);
  const scoreSource =
    deterministicEvaluation.deterministicScore - judgeEvaluation.totalScore >= JUDGE_OVERRIDE_THRESHOLD
      ? 'judge_override'
      : 'weighted_blend';
  const uncappedFinalScore = scoreSource === 'judge_override' ? judgeEvaluation.totalScore : weightedScore;
  const caps = scoreCapsFor(deterministicEvaluation.currentFactIssues ?? [], judgeEvaluation);
  const finalScore = applyScoreCaps(uncappedFinalScore, caps);
  const finalJudgeDelta = Math.abs(finalScore - judgeEvaluation.totalScore);
  const scoringWarnings = scoringWarningsFor({
    deterministicScore: deterministicEvaluation.deterministicScore,
    judgeScore: judgeEvaluation.totalScore,
    uncappedFinalScore,
    finalScore,
    scoreSource,
    caps
  });

  return {
    taskId: deterministicEvaluation.taskId,
    personaId: deterministicEvaluation.personaId,
    provider: deterministicEvaluation.provider,
    mode: deterministicEvaluation.mode,
    domain: deterministicEvaluation.domain,
    deterministicScore: deterministicEvaluation.deterministicScore,
    judgeScore: judgeEvaluation.totalScore,
    finalScore,
    latencyMs: deterministicEvaluation.latencyMs,
    scoringMode: 'deterministic_plus_judge',
    scoreSource,
    deterministicWeight: scoreSource === 'judge_override' ? 0 : weights.deterministic,
    judgeWeight: scoreSource === 'judge_override' ? 1 : weights.judge,
    judgeDeterministicDelta,
    finalJudgeDelta,
    scoringWarnings,
    factualContradictions: verdict.contradictions,
    factualWorstSeverity: verdict.worstSeverity,
    unverifiedFactCount: verdict.unverifiedCount
  };
}

export function judgeKey(provider: string, taskId: string): string {
  return `${provider}::${taskId}`;
}

function deterministicOnlyScore(taskType: TaskType, score: number): number {
  const caps: Record<TaskType, number> = {
    data_retrieval: 90,
    insight_discovery: 70,
    domain_advice: 70,
    prioritization: 65,
    what_if: 70
  };
  return Math.min(score, caps[taskType]);
}

interface ScoringWarningInput {
  deterministicScore: number;
  judgeScore: number;
  uncappedFinalScore: number;
  finalScore: number;
  scoreSource: FinalEvaluation['scoreSource'];
  caps?: ScoreCap[];
}

function scoringWarningsFor(input: ScoringWarningInput): string[] {
  const warnings: string[] = [];
  const judgeDeterministicDelta = Math.abs(input.deterministicScore - input.judgeScore);
  const finalJudgeDelta = Math.abs(input.finalScore - input.judgeScore);

  if (judgeDeterministicDelta >= DIVERGENCE_WARNING_THRESHOLD) {
    warnings.push(`Deterministic/judge divergence ${judgeDeterministicDelta} points; inspect validator brittleness or judge reasoning.`);
  }

  if (finalJudgeDelta >= FINAL_JUDGE_WARNING_THRESHOLD) {
    warnings.push(`Final/judge divergence ${finalJudgeDelta} points; public score may not match judged response quality.`);
  }

  if (input.scoreSource === 'judge_override') {
    warnings.push(
      `Judge override applied because deterministic exceeded judge by at least ${JUDGE_OVERRIDE_THRESHOLD} points; deterministic checks likely over-passed response quality.`
    );
  }

  for (const cap of input.caps ?? []) {
    if (input.uncappedFinalScore > cap.maxScore && input.finalScore <= cap.maxScore) {
      warnings.push(`Score cap ${cap.maxScore} applied: ${cap.reason}`);
    } else if (input.finalScore <= cap.maxScore) {
      warnings.push(`Score cap ${cap.maxScore} checked: ${cap.reason}; uncapped score was already at or below the cap.`);
    }
  }

  return warnings;
}

interface ScoreCap {
  maxScore: number;
  reason: string;
}

function scoreCapsFor(currentFactIssues: CurrentFactIssue[], judgeEvaluation: JudgeEvaluation): ScoreCap[] {
  const caps: ScoreCap[] = [];
  const hardFactIssues = currentFactIssues.filter((issue) => issue.severity === 'critical' || issue.severity === 'stale_or_wrong');
  const criticalIssues = hardFactIssues.filter((issue) => issue.severity === 'critical');

  if (hardFactIssues.length >= 2) {
    caps.push({
      maxScore: 70,
      reason: `multiple stale/wrong locked current facts detected (${hardFactIssues.map((issue) => issue.id).join(', ')})`
    });
  } else if (criticalIssues.some((issue) => issue.id === 'irs_limit_not_announced')) {
    caps.push({
      maxScore: 70,
      reason: 'response said a locked 2026 IRS limit was not announced'
    });
  } else if (criticalIssues.length > 0) {
    caps.push({
      maxScore: 75,
      reason: `critical stale/wrong locked current fact detected (${criticalIssues.map((issue) => issue.id).join(', ')})`
    });
  } else if (hardFactIssues.length > 0) {
    caps.push({
      maxScore: 80,
      reason: `stale/wrong locked current fact detected (${hardFactIssues.map((issue) => issue.id).join(', ')})`
    });
  }

  // Table-grounded factual contradictions (the scored factual signal). A
  // verified_incorrect claim always cites a real locked fact, so these caps are
  // safe to apply hard. Severity comes from the contradicted fact.
  const verdict = factualVerdict(judgeEvaluation);
  if (verdict.dangerousCount > 0) {
    caps.push({
      maxScore: DANGEROUS_FACT_CAP,
      reason: `answer contradicts a locked fact whose error could cause financial harm (${verdict.dangerousCount} dangerous)`
    });
  } else if (verdict.materialCount >= 2) {
    caps.push({
      maxScore: MULTI_MATERIAL_FACT_CAP,
      reason: `answer contradicts multiple locked facts (${verdict.materialCount} material)`
    });
  } else if (verdict.materialCount === 1) {
    caps.push({
      maxScore: MATERIAL_FACT_CAP,
      reason: 'answer contradicts a locked fact (1 material)'
    });
  }

  if (mentionsTruncation(judgeEvaluation)) {
    caps.push({
      maxScore: 85,
      reason: 'judge found the user-visible answer was truncated, cut off, or incomplete'
    });
  }

  return caps;
}

function applyScoreCaps(score: number, caps: ScoreCap[]): number {
  return caps.reduce((current, cap) => Math.min(current, cap.maxScore), score);
}

function mentionsTruncation(judgment: JudgeEvaluation): boolean {
  const text = [
    judgment.summary,
    ...judgment.factualIssues,
    ...judgment.safetyIssues,
    ...judgment.missedOpportunities
  ].join(' ');
  return /\b(cut off|cuts off|truncated|incomplete|mid-sentence)\b/i.test(text);
}

