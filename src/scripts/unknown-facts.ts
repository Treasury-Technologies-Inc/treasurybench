import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { writeJson } from '../lib/io';
import type { UnknownFactEntry, UnknownFactsLedger } from '../lib/ledger';

/**
 * Merge every run's results/unknown-facts.json into one worklist of facts the
 * benchmark could not adjudicate against the locked-fact table. Verify these
 * offline, add the confirmed ones to src/data/locked-facts.ts, then re-judge —
 * the ledger shrinks toward empty as coverage becomes complete.
 *
 * Usage: pnpm unknown-facts [--artifacts=artifacts] [--out=artifacts/unknown-facts.json]
 */
function argValue(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const artifactsDir = argValue('artifacts', 'artifacts');
const outPath = argValue('out', join(artifactsDir, 'unknown-facts.json'));

function normalize(claim: string): string {
  return claim
    .toLowerCase()
    .replace(/[^a-z0-9%$./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const merged = new Map<
  string,
  { claim: string; occurrences: number; providers: Set<string>; tasks: Set<string>; runs: Set<string> }
>();

const runDirs = readdirSync(artifactsDir).filter((entry) => {
  const full = join(artifactsDir, entry);
  return statSync(full).isDirectory() && existsSync(join(full, 'results', 'unknown-facts.json'));
});

for (const run of runDirs) {
  const ledger = JSON.parse(
    readFileSync(join(artifactsDir, run, 'results', 'unknown-facts.json'), 'utf8')
  ) as UnknownFactsLedger;
  for (const entry of ledger.entries) {
    const key = normalize(entry.claim);
    if (!key) continue;
    const existing = merged.get(key);
    if (existing) {
      existing.occurrences += entry.occurrences;
      entry.providers.forEach((p) => existing.providers.add(p));
      entry.tasks.forEach((t) => existing.tasks.add(t));
      existing.runs.add(run);
    } else {
      merged.set(key, {
        claim: entry.claim,
        occurrences: entry.occurrences,
        providers: new Set(entry.providers),
        tasks: new Set(entry.tasks),
        runs: new Set([run])
      });
    }
  }
}

const entries: (UnknownFactEntry & { runs: string[] })[] = [...merged.values()]
  .map((entry) => ({
    claim: entry.claim,
    occurrences: entry.occurrences,
    providers: [...entry.providers].sort(),
    tasks: [...entry.tasks].sort(),
    runs: [...entry.runs].sort()
  }))
  .sort((a, b) => b.occurrences - a.occurrences || a.claim.localeCompare(b.claim));

writeJson(outPath, {
  runs: runDirs.sort(),
  uniqueClaimCount: entries.length,
  totalOccurrences: entries.reduce((sum, entry) => sum + entry.occurrences, 0),
  entries
});

console.log(`Merged ${runDirs.length} run(s) into ${outPath}.`);
console.log(`${entries.length} unique unverified claims to verify and (if confirmed) lock.`);
