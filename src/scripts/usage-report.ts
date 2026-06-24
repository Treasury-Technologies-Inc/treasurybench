import { readCaptures } from '../lib/io';
import type { CapturedResponse } from '../schema';

const captureDir = process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.CAPTURE_DIR;
if (!captureDir) {
  console.error('Usage: pnpm usage-report -- <capture-dir>');
  process.exit(1);
}

const captures = readCaptures(captureDir, { skipIncomplete: true });
const capturesWithUsage = captures.filter((capture) => capture.usage?.usage?.totalTokens !== undefined);

console.log(`# TreasuryBench Usage Report`);
console.log(`Capture dir: ${captureDir}`);
console.log(`Captures: ${captures.length}`);
console.log(`Captures with usage: ${capturesWithUsage.length}`);

if (capturesWithUsage.length === 0) {
  console.log('\nNo structured usage metadata found. Re-run captures after the benchmark usage instrumentation landed.');
  process.exit(0);
}

const total = capturesWithUsage.reduce(
  (acc, capture) => {
    const usage = capture.usage?.usage;
    acc.inputTokens += usage?.inputTokens ?? 0;
    acc.outputTokens += usage?.outputTokens ?? 0;
    acc.totalTokens += usage?.totalTokens ?? 0;
    acc.reasoningTokens += usage?.reasoningTokens ?? 0;
    acc.cachedInputTokens += usage?.cachedInputTokens ?? 0;
    return acc;
  },
  {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    reasoningTokens: 0,
    cachedInputTokens: 0
  }
);

console.log('\n## Totals');
printTable(
  ['metric', 'value'],
  [
    ['total_tokens', formatNumber(total.totalTokens)],
    ['input_tokens', formatNumber(total.inputTokens)],
    ['output_tokens', formatNumber(total.outputTokens)],
    ['reasoning_tokens', formatNumber(total.reasoningTokens)],
    ['cached_input_tokens', formatNumber(total.cachedInputTokens)]
  ]
);

console.log('\n## By Provider');
printTable(
  ['provider', 'model', 'captures', 'total_tokens', 'avg_tokens'],
  aggregateByProvider(capturesWithUsage).map((row) => [
    row.provider,
    row.model,
    formatNumber(row.captures),
    formatNumber(row.totalTokens),
    formatNumber(Math.round(row.totalTokens / row.captures))
  ])
);

console.log('\n## Top Tasks By Tokens');
printTable(
  ['task', 'provider', 'model', 'total_tokens', 'input', 'output', 'reasoning', 'cached_input'],
  capturesWithUsage
    .slice()
    .sort((a, b) => ((b.usage?.usage?.totalTokens ?? 0) - (a.usage?.usage?.totalTokens ?? 0)))
    .slice(0, 20)
    .map((capture) => {
      const usage = capture.usage?.usage;
      return [
        capture.taskId,
        capture.provider,
        capture.usage?.model ?? '',
        formatNumber(usage?.totalTokens ?? 0),
        formatNumber(usage?.inputTokens ?? 0),
        formatNumber(usage?.outputTokens ?? 0),
        formatNumber(usage?.reasoningTokens ?? 0),
        formatNumber(usage?.cachedInputTokens ?? 0)
      ];
    })
);

function aggregateByProvider(captures: CapturedResponse[]) {
  const byKey = new Map<
    string,
    {
      provider: string;
      model: string;
      captures: number;
      totalTokens: number;
    }
  >();
  for (const capture of captures) {
    const provider = capture.usage?.provider ?? capture.provider;
    const model = capture.usage?.model ?? '';
    const key = `${provider}\t${model}`;
    const row =
      byKey.get(key) ??
      {
        provider,
        model,
        captures: 0,
        totalTokens: 0
      };
    row.captures += 1;
    row.totalTokens += capture.usage?.usage?.totalTokens ?? 0;
    byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) => b.totalTokens - a.totalTokens);
}

function printTable(headers: string[], rows: Array<Array<string | number>>) {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => String(row[index] ?? '').length))
  );
  console.log(`| ${headers.map((header, index) => header.padEnd(widths[index])).join(' | ')} |`);
  console.log(`| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`);
  for (const row of rows) {
    console.log(`| ${row.map((cell, index) => String(cell).padEnd(widths[index])).join(' | ')} |`);
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
