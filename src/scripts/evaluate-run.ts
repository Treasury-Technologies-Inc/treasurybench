import { join } from 'node:path';
import { evaluateCapture, summarizeEvaluations } from '../lib/evaluate';
import { evaluationsCsv, summaryMarkdown } from '../lib/artifacts';
import { readCaptures, writeJson, writeText } from '../lib/io';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const runDirArg = argValue('run');
if (!runDirArg) throw new Error('Missing --run=<run_directory>.');
const runDir = runDirArg;

const captureDir = argValue('captures', join(runDir, 'captures')) ?? join(runDir, 'captures');
const resultsDir = argValue('results', join(runDir, 'results')) ?? join(runDir, 'results');

const captures = readCaptures(captureDir, { skipIncomplete: true });
const evaluations = captures.map(evaluateCapture);
const summary = summarizeEvaluations(evaluations);

writeJson(join(resultsDir, 'evaluations.json'), evaluations);
writeJson(join(resultsDir, 'summary.json'), summary);
writeText(join(resultsDir, 'evaluations.csv'), evaluationsCsv(evaluations));
writeText(join(resultsDir, 'summary.md'), summaryMarkdown(summary, evaluations));

console.log(`Evaluated ${evaluations.length} capture(s).`);
console.log(`Wrote ${join(resultsDir, 'evaluations.json')}`);
console.log(`Wrote ${join(resultsDir, 'summary.json')}`);
console.log(`Wrote ${join(resultsDir, 'evaluations.csv')}`);
console.log(`Wrote ${join(resultsDir, 'summary.md')}`);
