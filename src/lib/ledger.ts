import type { JudgeEvaluation } from '../schema';

export interface UnknownFactEntry {
  /** Representative phrasing of the claim. */
  claim: string;
  /** How many times this claim (normalized) was logged across the run. */
  occurrences: number;
  /** Providers whose answers asserted it. */
  providers: string[];
  /** Tasks where it appeared. */
  tasks: string[];
}

export interface UnknownFactsLedger {
  unverifiedClaimCount: number;
  uniqueClaimCount: number;
  entries: UnknownFactEntry[];
}

/** Normalize claim text so paraphrase-ish duplicates collapse into one worklist row. */
function normalizeClaim(claim: string): string {
  return claim
    .toLowerCase()
    .replace(/[^a-z0-9%$./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the unknown-facts worklist from a run's judgments: every `unverified`
 * factual claim, deduplicated, with provenance. These are the facts the benchmark
 * could not adjudicate against the locked-fact table — to be verified offline and
 * (once confirmed) added to the table, after which the run can be re-scored.
 */
export function buildUnknownFactsLedger(judgments: JudgeEvaluation[]): UnknownFactsLedger {
  const byKey = new Map<
    string,
    { claim: string; occurrences: number; providers: Set<string>; tasks: Set<string> }
  >();
  let total = 0;
  for (const judgment of judgments) {
    for (const claim of judgment.factualClaims) {
      // Only genuinely-unknown facts belong on the worklist: state unverified AND
      // not matched to any locked fact. (A judge-assigned tableKey means the fact
      // is already in the table, just lacking a committed verdict.)
      if (claim.state !== 'unverified' || claim.tableKey) continue;
      total += 1;
      const key = normalizeClaim(claim.claim);
      if (!key) continue;
      const existing = byKey.get(key);
      if (existing) {
        existing.occurrences += 1;
        existing.providers.add(judgment.provider);
        existing.tasks.add(judgment.taskId);
      } else {
        byKey.set(key, {
          claim: claim.claim.trim(),
          occurrences: 1,
          providers: new Set([judgment.provider]),
          tasks: new Set([judgment.taskId])
        });
      }
    }
  }
  const entries: UnknownFactEntry[] = [...byKey.values()]
    .map((entry) => ({
      claim: entry.claim,
      occurrences: entry.occurrences,
      providers: [...entry.providers].sort(),
      tasks: [...entry.tasks].sort()
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.claim.localeCompare(b.claim));
  return { unverifiedClaimCount: total, uniqueClaimCount: entries.length, entries };
}
