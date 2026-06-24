import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getPersona, getTask } from '../lib/lookup';
import { buildPairwisePreferencePrompt, parsePairwisePreferenceEvaluation } from '../lib/pairwise';
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

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const runA = argValue('run-a');
const runB = argValue('run-b');
const captureDirA = argValue('captures-a', runA ? join(runA, 'captures') : undefined);
const captureDirB = argValue('captures-b', runB ? join(runB, 'captures') : undefined);
const outDir = argValue('out', runA ? join(runA, 'pairwise') : '.treasurybench-tmp/pairwise');
const promptOutDir = argValue('prompt-out', outDir ? join(outDir, 'prompts') : undefined);
const envFile = argValue('env-file');
const onlyTask = argValue('task');
const taskListArg = argValue('tasks');
const model = argValue('model', process.env.TREASURYBENCH_OPENAI_MODEL ?? 'chat-latest') ?? 'chat-latest';
const maxOutputTokens = Number(argValue('max-output-tokens', '2000'));
const timeoutMs = Number(argValue('timeout-ms', '120000'));
const reasoningEffort = argValue('reasoning-effort', 'low') as 'minimal' | 'low' | 'medium' | 'high';

loadSelectedEnvFile(envFile);

if (!captureDirA || !captureDirB) throw new Error('Missing --run-a/--run-b or --captures-a/--captures-b.');
if (!outDir) throw new Error('Missing --out=<directory>.');

ensureDir(outDir);
if (promptOutDir) ensureDir(promptOutDir);

const capturesA = selectCaptures(readCaptures(captureDirA, { skipIncomplete: true }), onlyTask, taskListArg);
const capturesB = readCaptures(captureDirB, { skipIncomplete: true });
const capturesBByTask = new Map(capturesB.map((capture) => [`${capture.personaId}:${capture.taskId}`, capture]));

const judgments = [];
for (const captureA of capturesA) {
  const captureB = capturesBByTask.get(`${captureA.personaId}:${captureA.taskId}`);
  if (!captureB) throw new Error(`No matching B capture for ${captureA.personaId}:${captureA.taskId}.`);

  const task = getTask(captureA.taskId);
  const persona = getPersona(captureA.personaId);
  const prompt = buildPairwisePreferencePrompt(task, persona, captureA, captureB);
  if (promptOutDir) {
    writeText(join(promptOutDir, `${safeFilePart(captureA.provider)}__vs__${safeFilePart(captureB.provider)}.${captureA.taskId}.pairwise.txt`), `${prompt}\n`);
  }

  const rawJudgment = await runOpenAIJudge(prompt);
  const judgment = parsePairwisePreferenceEvaluation(extractJson(rawJudgment));
  judgments.push(judgment);
  writeJson(join(outDir, `${safeFilePart(captureA.provider)}__vs__${safeFilePart(captureB.provider)}.${captureA.taskId}.json`), judgment);
}

writeJson(join(outDir, 'pairwise-summary.json'), {
  model,
  comparedAt: new Date().toISOString(),
  captureDirA,
  captureDirB,
  count: judgments.length,
  winsA: judgments.filter((judgment) => judgment.winner === 'A').length,
  winsB: judgments.filter((judgment) => judgment.winner === 'B').length,
  ties: judgments.filter((judgment) => judgment.winner === 'tie').length,
  judgments
});

console.log(`Pairwise-judged ${judgments.length} task(s) with openai:${model}.`);
console.log(`Wrote pairwise judgments to ${outDir}`);

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
        instructions: 'You are a strict benchmark pairwise evaluator. Return valid JSON only.',
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
  console.log(`Pairwise judge call returned in ${elapsed}ms.`);
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
  if (!text) throw new Error('OpenAI pairwise judge response did not contain output_text.');
  return text;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(trimmed);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  throw new Error(`Pairwise judge response did not contain JSON: ${text.slice(0, 500)}`);
}

function readOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for run-pairwise.');
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
  if (missing.length > 0) throw new Error(`No A capture found for task id(s): ${missing.join(', ')}`);
  return selected;
}

function loadSelectedEnvFile(path: string | undefined): void {
  if (!path) return;
  const resolvedPath = resolveEnvFilePath(path);
  if (!resolvedPath) {
    throw new Error(`Env file not found: ${path}`);
  }

  const allowedKeys = new Set(['OPENAI_API_KEY', 'TREASURYBENCH_OPENAI_MODEL']);
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
