import { DOMAIN_LABELS, type DeterministicEvaluation, type FinalEvaluation } from '../schema';
import type { EvaluationSummary } from './evaluate';
import { csvEscape } from './io';

export function evaluationsCsv(evaluations: DeterministicEvaluation[]): string {
  const header = ['provider', 'mode', 'persona_id', 'task_id', 'domain', 'deterministic_score', 'latency_ms', 'checks_passed', 'checks_total'];
  const rows = evaluations.map((evaluation) => {
    const implemented = evaluation.checks.filter((check) => check.status !== 'not_implemented');
    const passed = implemented.filter((check) => check.status === 'pass').length;
    return [
      evaluation.provider,
      evaluation.mode,
      evaluation.personaId,
      evaluation.taskId,
      evaluation.domain,
      evaluation.deterministicScore,
      evaluation.latencyMs ?? '',
      passed,
      implemented.length
    ]
      .map(csvEscape)
      .join(',');
  });
  return [header.join(','), ...rows].join('\n') + '\n';
}

export function summaryMarkdown(summary: EvaluationSummary[], evaluations: DeterministicEvaluation[]): string {
  const lines: string[] = [];
  lines.push('# TreasuryBench Run Summary');
  lines.push('');
  lines.push(`Captures evaluated: ${evaluations.length}`);
  lines.push('');
  lines.push('## Provider Leaderboard');
  lines.push('');
  lines.push('| Provider | Tasks | Deterministic | Median Latency |');
  lines.push('| --- | ---: | ---: | ---: |');
  for (const provider of summary) {
    lines.push(
      `| ${provider.provider} | ${provider.taskCount} | ${provider.avgDeterministicScore} | ${
        provider.medianLatencyMs === undefined ? '' : `${provider.medianLatencyMs}ms`
      } |`
    );
  }
  lines.push('');
  lines.push('## Domain Scores');
  lines.push('');
  lines.push('| Provider | Domain | Tasks | Deterministic |');
  lines.push('| --- | --- | ---: | ---: |');
  for (const provider of summary) {
    for (const domain of provider.domainScores) {
      lines.push(`| ${provider.provider} | ${DOMAIN_LABELS[domain.domain as keyof typeof DOMAIN_LABELS] ?? domain.domain} | ${domain.taskCount} | ${domain.avgDeterministicScore} |`);
    }
  }
  lines.push('');
  lines.push('## Task Scores');
  lines.push('');
  lines.push('| Provider | Task | Domain | Deterministic | Latency |');
  lines.push('| --- | --- | --- | ---: | ---: |');
  for (const evaluation of [...evaluations].sort((a, b) => `${a.provider}:${a.taskId}`.localeCompare(`${b.provider}:${b.taskId}`))) {
    lines.push(
      `| ${evaluation.provider} | ${evaluation.taskId} | ${DOMAIN_LABELS[evaluation.domain]} | ${evaluation.deterministicScore} | ${
        evaluation.latencyMs === undefined ? '' : `${evaluation.latencyMs}ms`
      } |`
    );
  }
  lines.push('');
  lines.push('Note: deterministic scores measure exact data use, planted-signal discovery, arithmetic hooks, and factual/safety markers. They are not the final holistic benchmark score.');
  lines.push('');
  return lines.join('\n');
}

export function finalEvaluationsCsv(evaluations: FinalEvaluation[]): string {
  const header = [
    'provider',
    'mode',
    'persona_id',
    'task_id',
    'domain',
    'final_score',
    'deterministic_score',
    'judge_score',
    'score_source',
    'deterministic_weight',
    'judge_weight',
    'judge_deterministic_delta',
    'final_judge_delta',
    'scoring_mode',
    'latency_ms',
    'scoring_warnings'
  ];
  const rows = evaluations.map((evaluation) =>
    [
      evaluation.provider,
      evaluation.mode,
      evaluation.personaId,
      evaluation.taskId,
      evaluation.domain,
      evaluation.finalScore,
      evaluation.deterministicScore,
      evaluation.judgeScore ?? '',
      evaluation.scoreSource,
      evaluation.deterministicWeight,
      evaluation.judgeWeight,
      evaluation.judgeDeterministicDelta ?? '',
      evaluation.finalJudgeDelta ?? '',
      evaluation.scoringMode,
      evaluation.latencyMs ?? '',
      evaluation.scoringWarnings.join(' | ')
    ]
      .map(csvEscape)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n') + '\n';
}

export function finalSummaryMarkdown(evaluations: FinalEvaluation[]): string {
  const providers = Array.from(new Set(evaluations.map((evaluation) => evaluation.provider))).sort();
  const lines: string[] = [];
  lines.push('# TreasuryBench Final Scores');
  lines.push('');
  lines.push(`Captures scored: ${evaluations.length}`);
  lines.push('');
  lines.push('| Provider | Tasks | Final | Judge | Deterministic | Judge Coverage | Overrides | Warnings | Median Latency |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const provider of providers) {
    const providerEvaluations = evaluations.filter((evaluation) => evaluation.provider === provider);
    const judgeCoverage = Math.round((providerEvaluations.filter((evaluation) => evaluation.scoringMode === 'deterministic_plus_judge').length / providerEvaluations.length) * 100);
    const judged = providerEvaluations.filter((evaluation) => typeof evaluation.judgeScore === 'number');
    const overrides = providerEvaluations.filter((evaluation) => evaluation.scoreSource === 'judge_override').length;
    const warnings = providerEvaluations.filter((evaluation) => evaluation.scoringWarnings.length > 0).length;
    lines.push(
      `| ${provider} | ${providerEvaluations.length} | ${avg(providerEvaluations.map((evaluation) => evaluation.finalScore))} | ${avg(
        judged.map((evaluation) => evaluation.judgeScore ?? 0)
      )} | ${avg(
        providerEvaluations.map((evaluation) => evaluation.deterministicScore)
      )} | ${judgeCoverage}% | ${overrides} | ${warnings} | ${formatLatency(median(providerEvaluations.map((evaluation) => evaluation.latencyMs).filter((latency): latency is number => typeof latency === 'number')))} |`
    );
  }
  lines.push('');
  lines.push('## Factual Integrity');
  lines.push('');
  lines.push(
    'Share of answers with no locked-fact contradiction. Material/Dangerous = tasks whose worst contradiction is material vs. financially harmful. Unverified Claims = count of factual-claim instances not yet in the locked-fact table (deduped to fewer unique entries in `unknown-facts.json`); not scored.'
  );
  lines.push('');
  lines.push('| Provider | Tasks | Factually Clean | Material | Dangerous | Unverified Claims |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const provider of providers) {
    const providerEvaluations = evaluations.filter((evaluation) => evaluation.provider === provider);
    const total = providerEvaluations.length;
    const clean = providerEvaluations.filter((evaluation) => (evaluation.factualContradictions ?? 0) === 0).length;
    const material = providerEvaluations.filter((evaluation) => evaluation.factualWorstSeverity === 'material').length;
    const dangerous = providerEvaluations.filter((evaluation) => evaluation.factualWorstSeverity === 'dangerous').length;
    const unverified = providerEvaluations.reduce((sum, evaluation) => sum + (evaluation.unverifiedFactCount ?? 0), 0);
    const cleanPct = total > 0 ? Math.round((clean / total) * 100) : 0;
    lines.push(`| ${provider} | ${total} | ${cleanPct}% (${clean}/${total}) | ${material} | ${dangerous} | ${unverified} |`);
  }
  lines.push('');
  lines.push('## Domains');
  lines.push('');
  lines.push('| Provider | Domain | Tasks | Final | Judge | Deterministic |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |');
  for (const provider of providers) {
    const providerEvaluations = evaluations.filter((evaluation) => evaluation.provider === provider);
    const domains = Array.from(new Set(providerEvaluations.map((evaluation) => evaluation.domain))).sort();
    for (const domain of domains) {
      const domainEvaluations = providerEvaluations.filter((evaluation) => evaluation.domain === domain);
      const judged = domainEvaluations.filter((evaluation) => typeof evaluation.judgeScore === 'number');
      lines.push(
        `| ${provider} | ${DOMAIN_LABELS[domain]} | ${domainEvaluations.length} | ${avg(domainEvaluations.map((evaluation) => evaluation.finalScore))} | ${avg(
          judged.map((evaluation) => evaluation.judgeScore ?? 0)
        )} | ${avg(domainEvaluations.map((evaluation) => evaluation.deterministicScore))} |`
      );
    }
  }
  lines.push('');
  const warnings = divergenceRows(evaluations);
  if (warnings.length > 0) {
    lines.push('## Divergence Warnings');
    lines.push('');
    lines.push('| Provider | Task | Final | Judge | Deterministic | Source | Warning |');
    lines.push('| --- | --- | ---: | ---: | ---: | --- | --- |');
    for (const evaluation of warnings) {
      lines.push(
        `| ${evaluation.provider} | ${evaluation.taskId} | ${evaluation.finalScore} | ${evaluation.judgeScore ?? ''} | ${evaluation.deterministicScore} | ${evaluation.scoreSource} | ${evaluation.scoringWarnings.join(
          ' '
        )} |`
      );
    }
    lines.push('');
  }
  lines.push('Final score is judge-primary when judge output is available. Exact deterministic checks remain visible diagnostics and can influence the score, but large deterministic/judge divergences are flagged and can trigger judge override. Missing judge output falls back to deterministic-only scoring for development loops.');
  lines.push('');
  return lines.join('\n');
}

export function divergenceReportMarkdown(evaluations: FinalEvaluation[]): string {
  const warnings = divergenceRows(evaluations);
  const lines: string[] = [];
  lines.push('# TreasuryBench Divergence Report');
  lines.push('');
  lines.push(`Rows with scoring warnings: ${warnings.length}`);
  lines.push('');
  if (warnings.length === 0) {
    lines.push('No deterministic/judge or final/judge divergences crossed warning thresholds.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('| Provider | Task | Domain | Final | Judge | Deterministic | Det/Judge Delta | Final/Judge Delta | Source | Warning |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |');
  for (const evaluation of warnings) {
    lines.push(
      `| ${evaluation.provider} | ${evaluation.taskId} | ${DOMAIN_LABELS[evaluation.domain]} | ${evaluation.finalScore} | ${evaluation.judgeScore ?? ''} | ${
        evaluation.deterministicScore
      } | ${evaluation.judgeDeterministicDelta ?? ''} | ${evaluation.finalJudgeDelta ?? ''} | ${evaluation.scoreSource} | ${evaluation.scoringWarnings.join(' ')} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

export function divergenceReportCsv(evaluations: FinalEvaluation[]): string {
  const header = [
    'provider',
    'task_id',
    'domain',
    'final_score',
    'judge_score',
    'deterministic_score',
    'judge_deterministic_delta',
    'final_judge_delta',
    'score_source',
    'scoring_warnings'
  ];
  const rows = divergenceRows(evaluations).map((evaluation) =>
    [
      evaluation.provider,
      evaluation.taskId,
      evaluation.domain,
      evaluation.finalScore,
      evaluation.judgeScore ?? '',
      evaluation.deterministicScore,
      evaluation.judgeDeterministicDelta ?? '',
      evaluation.finalJudgeDelta ?? '',
      evaluation.scoreSource,
      evaluation.scoringWarnings.join(' | ')
    ]
      .map(csvEscape)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n') + '\n';
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[midpoint];
  return Math.round(((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2);
}

function formatLatency(value: number | undefined): string {
  return value === undefined ? '' : `${value}ms`;
}

function divergenceRows(evaluations: FinalEvaluation[]): FinalEvaluation[] {
  return [...evaluations]
    .filter((evaluation) => evaluation.scoringWarnings.length > 0)
    .sort((a, b) => `${a.provider}:${a.taskId}`.localeCompare(`${b.provider}:${b.taskId}`));
}
