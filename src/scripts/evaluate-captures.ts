import { readCaptures } from '../lib/io';
import { evaluateCapture, summarizeEvaluations } from '../lib/evaluate';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const dir = argValue('dir', 'fixtures/captures');
const json = argValue('json') === 'true';
if (!dir) throw new Error('Missing --dir=<capture_directory>.');

const captures = readCaptures(dir);
const evaluations = captures.map(evaluateCapture);
const summary = summarizeEvaluations(evaluations);

if (json) {
  console.log(JSON.stringify({ summary, evaluations }, null, 2));
} else {
  console.log(`Evaluated ${evaluations.length} capture(s) from ${dir}`);
  for (const providerSummary of summary) {
    const latency = providerSummary.medianLatencyMs === undefined ? '' : `, median latency ${providerSummary.medianLatencyMs}ms`;
    console.log(`- ${providerSummary.provider}: ${providerSummary.avgDeterministicScore}/100 deterministic (${providerSummary.taskCount} task(s)${latency})`);
    for (const domain of providerSummary.domainScores) {
      console.log(`  - ${domain.domain}: ${domain.avgDeterministicScore}/100 (${domain.taskCount})`);
    }
  }
}
