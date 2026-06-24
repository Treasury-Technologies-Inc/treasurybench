import type { CapturedResponse, ProviderMode, ProviderUsage } from '../schema';

interface BuildCapturedResponseInput {
  taskId: string;
  personaId: string;
  provider: string;
  mode: ProviderMode;
  response: string;
  latencyMs?: number;
  notes?: string;
  usage?: ProviderUsage;
}

export function buildCapturedResponse(input: BuildCapturedResponseInput): CapturedResponse {
  return {
    ...input,
    capturedAt: new Date().toISOString()
  };
}

export function parseCapturedResponse(json: string): CapturedResponse {
  const parsed = JSON.parse(json) as Partial<CapturedResponse>;
  const requiredKeys = ['taskId', 'personaId', 'provider', 'mode', 'response', 'capturedAt'] as const;
  for (const key of requiredKeys) {
    if (!parsed[key]) throw new Error(`Captured response is missing ${key}.`);
  }
  return parsed as CapturedResponse;
}

export function isCompleteCapturedResponse(value: Partial<CapturedResponse>): value is CapturedResponse {
  return Boolean(value.taskId && value.personaId && value.provider && value.mode && value.response && value.capturedAt);
}
