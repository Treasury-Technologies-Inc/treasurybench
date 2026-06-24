import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseJudgeEvaluation } from '../lib/judgment-io';
import { writeJson } from '../lib/io';

/**
 * Re-apply deterministic claim grounding (tableKey validation + current-value
 * verdict guard) to already-written judgment files, WITHOUT calling the judge.
 * Use after changing grounding logic or locked-fact current-values, so the stored
 * judgments stay consistent with how they are scored. (Adding brand-new facts the
 * judge never saw still requires a re-judge, since the judge assigns tableKeys.)
 *
 * Usage: pnpm reground --run=<run_dir>  (or --judgments=<dir>)
 */
function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const runDir = argValue('run');
const judgmentsDir = argValue('judgments') ?? (runDir ? join(runDir, 'judgments') : undefined);
if (!judgmentsDir) throw new Error('Missing --run=<run_dir> or --judgments=<dir>.');

let regrounded = 0;
let changed = 0;
for (const entry of readdirSync(judgmentsDir)) {
  if (!entry.endsWith('.json')) continue;
  const path = join(judgmentsDir, entry);
  if (!statSync(path).isFile()) continue;
  const before = readFileSync(path, 'utf8');
  const judgment = parseJudgeEvaluation(before);
  const after = `${JSON.stringify(judgment, null, 2)}\n`;
  // Compare on the grounded claims to report meaningful changes.
  const beforeClaims = JSON.stringify((JSON.parse(before).factualClaims ?? []));
  const afterClaims = JSON.stringify(judgment.factualClaims);
  if (beforeClaims !== afterClaims) changed += 1;
  writeJson(path, judgment);
  regrounded += 1;
}

console.log(`Regrounded ${regrounded} judgment(s) in ${judgmentsDir}; ${changed} had claim-state changes.`);
