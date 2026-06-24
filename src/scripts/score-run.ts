import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateCapture } from '../lib/evaluate';
import { combineFinalEvaluation, judgeKey } from '../lib/final-score';
import { divergenceReportCsv, divergenceReportMarkdown, finalEvaluationsCsv, finalSummaryMarkdown } from '../lib/artifacts';
import { readCaptures, writeJson, writeText } from '../lib/io';
import { readJudgeEvaluations } from '../lib/judgment-io';
import { buildUnknownFactsLedger } from '../lib/ledger';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const runDirArg = argValue('run');
if (!runDirArg) throw new Error('Missing --run=<run_directory>.');
const runDir = runDirArg;

const captureDir = argValue('captures', join(runDir, 'captures')) ?? join(runDir, 'captures');
const judgmentsDir = argValue('judgments', join(runDir, 'judgments')) ?? join(runDir, 'judgments');
const resultsDir = argValue('results', join(runDir, 'results')) ?? join(runDir, 'results');

const captures = readCaptures(captureDir, { skipIncomplete: true });
const deterministicEvaluations = captures.map(evaluateCapture);
const judgments = existsSync(judgmentsDir) ? readJudgeEvaluations(judgmentsDir) : new Map();
const finalEvaluations = deterministicEvaluations.map((evaluation) =>
  combineFinalEvaluation(evaluation, judgments.get(judgeKey(evaluation.provider, evaluation.taskId)))
);

writeJson(join(resultsDir, 'final-evaluations.json'), finalEvaluations);
writeText(join(resultsDir, 'final-evaluations.csv'), finalEvaluationsCsv(finalEvaluations));
writeText(join(resultsDir, 'final-summary.md'), finalSummaryMarkdown(finalEvaluations));
writeJson(
  join(resultsDir, 'divergence-report.json'),
  finalEvaluations.filter((evaluation) => evaluation.scoringWarnings.length > 0)
);
writeText(join(resultsDir, 'divergence-report.csv'), divergenceReportCsv(finalEvaluations));
writeText(join(resultsDir, 'divergence-report.md'), divergenceReportMarkdown(finalEvaluations));

const ledger = buildUnknownFactsLedger([...judgments.values()]);
writeJson(join(resultsDir, 'unknown-facts.json'), ledger);

console.log(`Scored ${finalEvaluations.length} capture(s).`);
console.log(
  `Unknown-facts ledger: ${ledger.uniqueClaimCount} unique unverified claims (${ledger.unverifiedClaimCount} total).`
);
console.log(`Judge coverage: ${finalEvaluations.filter((evaluation) => evaluation.scoringMode === 'deterministic_plus_judge').length}/${finalEvaluations.length}`);
console.log(`Wrote ${join(resultsDir, 'final-evaluations.json')}`);
console.log(`Wrote ${join(resultsDir, 'final-evaluations.csv')}`);
console.log(`Wrote ${join(resultsDir, 'final-summary.md')}`);
console.log(`Wrote ${join(resultsDir, 'divergence-report.md')}`);
