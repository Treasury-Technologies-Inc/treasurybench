import type { Persona, ProviderUsageComponent, RuntimeManifest, TokenUsage } from '../schema';

export interface RuntimeManifestInput {
  personaIds: string[];
  profile: string;
  orchestrator: RuntimeManifest['orchestrator'];
  auxiliaries?: RuntimeManifest['auxiliaries'];
  configuration?: RuntimeManifest['configuration'];
  capturedAt?: string;
}

export function buildRuntimeManifest(input: RuntimeManifestInput): RuntimeManifest {
  return {
    schemaVersion: 1,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    personaIds: [...new Set(input.personaIds)].sort(),
    profile: input.profile,
    orchestrator: input.orchestrator,
    auxiliaries: input.auxiliaries ?? [],
    configuration: input.configuration ?? {}
  };
}

export function validateRuntimeManifest(manifest: RuntimeManifest): string[] {
  const issues: string[] = [];
  if (manifest.schemaVersion !== 1)
    issues.push(`Unsupported schemaVersion: ${manifest.schemaVersion}`);
  if (!manifest.capturedAt || Number.isNaN(Date.parse(manifest.capturedAt))) {
    issues.push('capturedAt must be an ISO timestamp');
  }
  if (manifest.personaIds.length === 0) issues.push('At least one personaId is required');
  if (!manifest.profile.trim()) issues.push('profile is required');
  if (!manifest.orchestrator.provider.trim()) issues.push('orchestrator.provider is required');
  if (!manifest.orchestrator.model.trim()) issues.push('orchestrator.model is required');
  for (const auxiliary of manifest.auxiliaries) {
    if (!auxiliary.provider.trim() || !auxiliary.model.trim()) {
      issues.push(`Auxiliary ${auxiliary.role} requires provider and model`);
    }
  }
  return issues;
}

export function aggregateTokenUsage(components: ProviderUsageComponent[]): TokenUsage {
  const sum = (field: keyof Omit<TokenUsage, 'totalTokens'>): number | undefined => {
    const values = components
      .map((component) => component.usage[field])
      .filter((value): value is number => typeof value === 'number');
    return values.length > 0 ? values.reduce((total, value) => total + value, 0) : undefined;
  };
  return {
    inputTokens: sum('inputTokens'),
    outputTokens: sum('outputTokens'),
    totalTokens: components.reduce((total, component) => total + component.usage.totalTokens, 0),
    reasoningTokens: sum('reasoningTokens'),
    cachedInputTokens: sum('cachedInputTokens')
  };
}

export interface LeakageSource {
  path: string;
  content: string;
}

export interface LeakageFinding {
  path: string;
  personaId: string;
  kind: 'memory' | 'account' | 'merchant' | 'amount';
  fingerprint: string;
}

/**
 * Detect persona-fixture literals copied into runtime code. The caller chooses
 * the files to scan, so benchmark data/capture harnesses can remain outside the
 * runtime boundary. Numeric scanning is opt-in because round financial values
 * can legitimately occur in unrelated code.
 */
export function findBenchmarkLeakage(
  sources: LeakageSource[],
  personas: Persona[],
  options: { includeNumeric?: boolean } = {}
): LeakageFinding[] {
  const findings: LeakageFinding[] = [];
  for (const persona of personas) {
    const fingerprints: Array<{
      kind: LeakageFinding['kind'];
      value: string;
    }> = [
      ...persona.memories.map((memory) => ({ kind: 'memory' as const, value: memory.text })),
      ...persona.accounts.map((account) => ({ kind: 'account' as const, value: account.name })),
      ...persona.transactions.map((transaction) => ({
        kind: 'merchant' as const,
        value: transaction.merchant
      }))
    ];
    if (options.includeNumeric) {
      fingerprints.push(
        ...persona.transactions
          .filter((transaction) => !Number.isInteger(Math.abs(transaction.amount)))
          .map((transaction) => ({
            kind: 'amount' as const,
            value: Math.abs(transaction.amount).toFixed(2)
          }))
      );
    }

    const seen = new Set<string>();
    for (const fingerprint of fingerprints) {
      const normalized = fingerprint.value.trim().toLocaleLowerCase('en-US');
      if (normalized.length < 8 || seen.has(`${fingerprint.kind}:${normalized}`)) continue;
      seen.add(`${fingerprint.kind}:${normalized}`);
      for (const source of sources) {
        if (source.content.toLocaleLowerCase('en-US').includes(normalized)) {
          findings.push({
            path: source.path,
            personaId: persona.id,
            kind: fingerprint.kind,
            fingerprint: fingerprint.value
          });
        }
      }
    }
  }
  return findings;
}
