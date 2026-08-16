import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { personas } from '../data/personas';
import { findBenchmarkLeakage, type LeakageSource } from '../lib/run-integrity';

const roots = process.argv.slice(2).filter((argument) => argument !== '--');
if (roots.length === 0) {
  console.error(
    'Usage: pnpm check-runtime-leakage -- <runtime-file-or-directory> [...]\n' +
      'Example: pnpm check-runtime-leakage -- path/to/your/assistant/source'
  );
  process.exit(2);
}

const sources: LeakageSource[] = [];
for (const root of roots) collectSources(resolve(root), sources);
const findings = findBenchmarkLeakage(sources, personas, { includeNumeric: true });

for (const finding of findings) {
  console.error(
    `[LEAK] ${finding.path}: ${finding.personaId} ${finding.kind} literal ${JSON.stringify(finding.fingerprint)}`
  );
}
console.log(
  `TreasuryBench runtime leakage check: ${sources.length} file(s), ${findings.length} finding(s).`
);
if (findings.length > 0) process.exit(1);

function collectSources(path: string, output: LeakageSource[]): void {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      collectSources(join(path, entry), output);
    }
    return;
  }
  if (!['.ts', '.tsx', '.js', '.mjs', '.cjs'].includes(extname(path))) return;
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)) return;
  output.push({ path, content: readFileSync(path, 'utf8') });
}
