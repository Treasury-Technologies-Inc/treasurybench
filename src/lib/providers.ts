import type { CapturedResponse, ProviderMode, ProviderRunRequest, ProviderRunResult, ProviderUsage } from '../schema';
import { buildPrompt } from './format';

export interface BenchmarkProvider {
  name: string;
  mode: ProviderMode;
  run(request: ProviderRunRequest): Promise<ProviderRunResult>;
}

export async function runProviderTask(provider: BenchmarkProvider, request: Omit<ProviderRunRequest, 'prompt'>): Promise<CapturedResponse> {
  const prompt = buildPrompt(request.persona, request.task, provider.mode);
  const result = await provider.run({ ...request, prompt });
  return {
    taskId: request.task.id,
    personaId: request.persona.id,
    provider: provider.name,
    mode: provider.mode,
    capturedAt: new Date().toISOString(),
    latencyMs: result.latencyMs,
    response: result.response,
    notes: result.notes,
    usage: result.usage
  };
}

export function createFixtureProvider(name = 'fixture_provider'): BenchmarkProvider {
  return {
    name,
    mode: 'product_capture',
    async run(request) {
      const started = Date.now();
      return {
        response: fixtureResponseForTask(request.task.id),
        latencyMs: Math.max(1, Date.now() - started),
        notes: 'Deterministic fixture provider for no-cost harness testing.'
      };
    }
  };
}

interface OpenAIProviderOptions {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
}

export function createOpenAIFullContextProvider(options: OpenAIProviderOptions): BenchmarkProvider {
  return {
    name: `openai:${options.model}`,
    mode: 'full_context_baseline',
    async run(request) {
      const started = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
      let response: Response;
      try {
        response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: options.model,
            instructions:
              'Answer as a careful personal-finance assistant. Use the provided user context, be factual and current, quantify impact, state assumptions, and avoid inventing user data.',
            input: request.prompt.prompt,
            max_output_tokens: options.maxOutputTokens,
            ...(options.reasoningEffort ? { reasoning: { effort: options.reasoningEffort } } : {})
          })
        });
      } finally {
        clearTimeout(timeout);
      }

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`OpenAI Responses API error ${response.status}: ${text.slice(0, 1000)}`);
      }

      const body = JSON.parse(text) as OpenAIResponseBody;
      return {
        response: extractOpenAIOutputText(body),
        latencyMs: Date.now() - started,
        notes: `OpenAI Responses API model=${options.model}`,
        usage: normalizeOpenAIUsage(body, options.model)
      };
    }
  };
}

interface OpenAIResponseBody {
  output_text?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    input_tokens_details?: {
      cached_tokens?: number;
    };
    output_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

function normalizeOpenAIUsage(body: OpenAIResponseBody, model: string): ProviderUsage | undefined {
  if (!body.usage) return undefined;
  return {
    provider: 'openai',
    model,
    usage: {
      inputTokens: body.usage.input_tokens,
      outputTokens: body.usage.output_tokens,
      totalTokens: body.usage.total_tokens ?? 0,
      reasoningTokens: body.usage.output_tokens_details?.reasoning_tokens,
      cachedInputTokens: body.usage.input_tokens_details?.cached_tokens
    }
  };
}

function extractOpenAIOutputText(body: OpenAIResponseBody): string {
  if (typeof body.output_text === 'string' && body.output_text.trim().length > 0) {
    return body.output_text;
  }

  const parts: string[] = [];
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if ((content.type === 'output_text' || content.type === 'text') && content.text) {
        parts.push(content.text);
      }
    }
  }

  const text = parts.join('\n').trim();
  if (!text) throw new Error('OpenAI response did not contain output_text.');
  return text;
}

function fixtureResponseForTask(taskId: string): string {
  if (taskId === 'maria_save_on_rent') {
    return [
      'Your rent is $2,350/month, or $28,200/year, for a single-person household in Seattle with about $60,000 gross income.',
      'The non-obvious thing to check first is Seattle MFTE/MHA housing. Verify current AMI limits, participating buildings, unit availability, and exact eligibility before relying on it.',
      'This likely matters more than generic neighborhood shopping. Also evaluate Bilt/no-fee rent rewards and avoid any processing fee that exceeds the point value.'
    ].join(' ');
  }

  if (taskId === 'maria_spend_may_total') {
    return 'May 2026 spending was $4,159.61 excluding income. Biggest categories include Rent, Travel, Groceries, Dining, Subscriptions, Transportation, Utilities, Phone, Fitness, and Gas.';
  }

  return 'Fixture response intentionally generic. This provider is for harness testing, not benchmark-quality scoring.';
}
