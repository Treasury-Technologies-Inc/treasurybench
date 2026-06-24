import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { evaluateCapture } from '../lib/evaluate';
import { buildJudgePrompt } from '../lib/judge';
import { parseJudgeEvaluation } from '../lib/judgment-io';
import { getPersona, getTask } from '../lib/lookup';
import { ensureDir, readCaptures, writeJson, writeText } from '../lib/io';

interface OpenAIResponseBody {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface GeminiResponseBody {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

type JudgeProvider = 'gemini' | 'openai';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const runDir = argValue('run');
const captureDir = argValue('captures', runDir ? join(runDir, 'captures') : undefined);
const outDir = argValue('out', runDir ? join(runDir, 'judgments') : '.treasurybench-tmp/judgments');
const promptOutDir = argValue('prompt-out', runDir ? join(runDir, 'judge-prompts') : undefined);
const envFile = argValue('env-file');
loadSelectedEnvFile(envFile);

const onlyTask = argValue('task');
const taskListArg = argValue('tasks');
const judgeProvider = parseJudgeProvider(argValue('judge-provider', process.env.TREASURYBENCH_JUDGE_PROVIDER ?? 'gemini'));
const model =
  argValue(
    'model',
    judgeProvider === 'gemini'
      ? (process.env.TREASURYBENCH_GEMINI_MODEL ?? 'gemini-3.1-flash-lite')
      : (process.env.TREASURYBENCH_OPENAI_MODEL ?? 'chat-latest')
  ) ?? (judgeProvider === 'gemini' ? 'gemini-3.1-flash-lite' : 'chat-latest');
const maxOutputTokens = Number(argValue('max-output-tokens', '3000'));
const timeoutMs = Number(argValue('timeout-ms', '120000'));
const reasoningEffort = argValue('reasoning-effort', 'low') as 'minimal' | 'low' | 'medium' | 'high';

if (!captureDir) throw new Error('Missing --run=<run_directory> or --captures=<capture_directory>.');
if (!outDir) throw new Error('Missing --out=<judgments_directory>.');

ensureDir(outDir);
if (promptOutDir) ensureDir(promptOutDir);

const captures = selectCaptures(readCaptures(captureDir, { skipIncomplete: true }), onlyTask, taskListArg);
if (captures.length === 0) throw new Error(`No complete captures found in ${captureDir}.`);

const MAX_JUDGE_ATTEMPTS = 3;
const failed: string[] = [];

for (const capture of captures) {
  const task = getTask(capture.taskId);
  const persona = getPersona(capture.personaId);
  const deterministic = evaluateCapture(capture);
  const prompt = buildJudgePrompt(task, persona, capture, deterministic.checks);
  if (promptOutDir) {
    writeText(join(promptOutDir, `${safeFilePart(capture.provider)}.${capture.taskId}.judge.txt`), `${prompt}\n`);
  }

  // A single malformed judge JSON response must not abort the whole batch. Retry
  // (LLM output is non-deterministic, so a re-roll usually parses), then skip and
  // record the failure so the prior judgment is left intact and can be re-run.
  let parsedJudgment: ReturnType<typeof parseJudgeEvaluation> | undefined;
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_JUDGE_ATTEMPTS; attempt += 1) {
    try {
      const rawJudgment = judgeProvider === 'gemini' ? await runGeminiJudge(prompt) : await runOpenAIJudge(prompt);
      parsedJudgment = parseJudgeEvaluation(extractJson(rawJudgment));
      break;
    } catch (error) {
      lastError = error;
      console.warn(`Judge attempt ${attempt}/${MAX_JUDGE_ATTEMPTS} failed for ${capture.provider}/${capture.taskId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (!parsedJudgment) {
    failed.push(capture.taskId);
    console.warn(`Skipping ${capture.provider}/${capture.taskId} after ${MAX_JUDGE_ATTEMPTS} failed attempts (prior judgment left intact). Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
    continue;
  }
  const judgment = {
    ...parsedJudgment,
    taskId: capture.taskId,
    provider: capture.provider
  };
  writeJson(join(outDir, `${safeFilePart(capture.provider)}.${capture.taskId}.json`), judgment);
}

console.log(`Judged ${captures.length - failed.length}/${captures.length} capture(s) with ${judgeProvider}:${model}.`);
console.log(`Wrote judgments to ${outDir}`);
if (failed.length > 0) {
  console.error(`FAILED to judge ${failed.length} task(s): ${failed.join(', ')}. Re-run with --tasks=${failed.join(',')}.`);
  process.exitCode = 1;
}

async function runGeminiJudge(prompt: string): Promise<string> {
  const apiKey = readGeminiKey();
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'You are a strict benchmark evaluator. Return valid JSON only. Penalize stale facts, invented user data, weak personalization, and unsafe financial claims.'
              }
            ]
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens,
            responseMimeType: 'application/json'
          }
        })
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${text.slice(0, 1000)}`);
  }

  const body = JSON.parse(text) as GeminiResponseBody;
  const output = extractGeminiOutputText(body);
  const elapsed = Date.now() - started;
  console.log(`Judge call returned in ${elapsed}ms.`);
  return output;
}

async function runOpenAIJudge(prompt: string): Promise<string> {
  const apiKey = readOpenAIKey();
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        instructions:
          'You are a strict benchmark evaluator. Return valid JSON only. Penalize stale facts, invented user data, weak personalization, and unsafe financial claims.',
        input: prompt,
        max_output_tokens: maxOutputTokens,
        reasoning: { effort: reasoningEffort }
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
  const output = extractOpenAIOutputText(body);
  const elapsed = Date.now() - started;
  console.log(`Judge call returned in ${elapsed}ms.`);
  return output;
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
  if (!text) throw new Error('OpenAI judge response did not contain output_text.');
  return text;
}

function extractGeminiOutputText(body: GeminiResponseBody): string {
  const parts: string[] = [];
  for (const candidate of body.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.text) parts.push(part.text);
    }
  }

  const text = parts.join('\n').trim();
  if (!text) throw new Error('Gemini judge response did not contain text output.');
  return text;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const balanced = firstBalancedJsonObject(trimmed);
  if (balanced) return balanced;

  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(trimmed);
  if (fenced?.[1]) {
    const fencedJson = firstBalancedJsonObject(fenced[1].trim());
    if (fencedJson) return fencedJson;
  }

  throw new Error(`Judge response did not contain JSON: ${text.slice(0, 500)}`);
}

function firstBalancedJsonObject(text: string): string | undefined {
  const start = text.indexOf('{');
  if (start < 0) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return text.slice(start, index + 1);
  }

  return undefined;
}

function parseJudgeProvider(value: string | undefined): JudgeProvider {
  if (value === 'gemini' || value === 'openai') return value;
  throw new Error(`Unsupported --judge-provider=${value}. Expected gemini or openai.`);
}

function readOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for run-judge.');
  }
  return apiKey;
}

function readGeminiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY, GOOGLE_API_KEY, or GEMINI_API_KEY is required for Gemini run-judge.');
  }
  return apiKey;
}

function safeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

function selectCaptures(
  captures: ReturnType<typeof readCaptures>,
  taskId: string | undefined,
  taskIds: string | undefined
): ReturnType<typeof readCaptures> {
  if (taskId && taskIds) {
    throw new Error('Use either --task=<task_id> or --tasks=<task_a,task_b>, not both.');
  }
  if (!taskId && !taskIds) return captures;

  const wanted = new Set(
    (taskId ? [taskId] : taskIds!.split(',')).map((id) => id.trim()).filter(Boolean)
  );
  const selected = captures.filter((capture) => wanted.has(capture.taskId));
  const found = new Set(selected.map((capture) => capture.taskId));
  const missing = [...wanted].filter((id) => !found.has(id));
  if (missing.length > 0) throw new Error(`No capture found for task id(s): ${missing.join(', ')}`);
  return selected;
}

function loadSelectedEnvFile(path: string | undefined): void {
  if (!path) return;
  const resolvedPath = resolveEnvFilePath(path);
  if (!resolvedPath) {
    throw new Error(`Env file not found: ${path}`);
  }

  const allowedKeys = new Set([
    'OPENAI_API_KEY',
    'TREASURYBENCH_OPENAI_MODEL',
    'TREASURYBENCH_JUDGE_PROVIDER',
    'TREASURYBENCH_GEMINI_MODEL',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'GOOGLE_API_KEY',
    'GEMINI_API_KEY'
  ]);
  for (const line of readFileSync(resolvedPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const key = match[1];
    const rawValue = match[2];
    if (!key || rawValue === undefined) continue;
    if (!allowedKeys.has(key)) continue;
    if (process.env[key]) continue;
    process.env[key] = unquoteEnvValue(rawValue);
  }
}

function resolveEnvFilePath(path: string): string | undefined {
  const candidates = [
    path,
    resolve(process.cwd(), path),
    resolve(process.cwd(), '../..', path)
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
