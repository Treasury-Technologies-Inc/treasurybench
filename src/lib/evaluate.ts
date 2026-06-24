import type { CapturedResponse, DeterministicEvaluation } from '../schema';
import { auditCurrentFacts } from './current-fact-audit';
import { evaluateDeterministicChecks, deterministicScore } from './deterministic';
import { getPersona, getTask } from './lookup';

export function evaluateCapture(capture: CapturedResponse): DeterministicEvaluation {
  const task = getTask(capture.taskId);
  const persona = getPersona(capture.personaId);
  const checks = evaluateDeterministicChecks(task, persona, capture.response);
  const currentFactIssues = auditCurrentFacts(capture.response, task, persona);

  return {
    taskId: capture.taskId,
    personaId: capture.personaId,
    provider: capture.provider,
    mode: capture.mode,
    domain: task.domain,
    deterministicScore: deterministicScore(checks),
    latencyMs: capture.latencyMs,
    checks,
    currentFactIssues
  };
}

export interface EvaluationSummary {
  provider: string;
  taskCount: number;
  avgDeterministicScore: number;
  medianLatencyMs?: number;
  domainScores: Array<{
    domain: string;
    taskCount: number;
    avgDeterministicScore: number;
  }>;
}

export function summarizeEvaluations(evaluations: DeterministicEvaluation[]): EvaluationSummary[] {
  const providers = Array.from(new Set(evaluations.map((evaluation) => evaluation.provider))).sort();
  return providers.map((provider) => {
    const providerEvaluations = evaluations.filter((evaluation) => evaluation.provider === provider);
    const latencies = providerEvaluations
      .map((evaluation) => evaluation.latencyMs)
      .filter((latency): latency is number => typeof latency === 'number')
      .sort((a, b) => a - b);
    const domains = Array.from(new Set(providerEvaluations.map((evaluation) => evaluation.domain))).sort();

    return {
      provider,
      taskCount: providerEvaluations.length,
      avgDeterministicScore: average(providerEvaluations.map((evaluation) => evaluation.deterministicScore)),
      medianLatencyMs: latencies.length > 0 ? median(latencies) : undefined,
      domainScores: domains.map((domain) => {
        const domainEvaluations = providerEvaluations.filter((evaluation) => evaluation.domain === domain);
        return {
          domain,
          taskCount: domainEvaluations.length,
          avgDeterministicScore: average(domainEvaluations.map((evaluation) => evaluation.deterministicScore))
        };
      })
    };
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const midpoint = Math.floor(values.length / 2);
  if (values.length % 2 === 1) return values[midpoint] ?? 0;
  return Math.round(((values[midpoint - 1] ?? 0) + (values[midpoint] ?? 0)) / 2);
}
