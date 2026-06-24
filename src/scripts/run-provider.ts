import { join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { tasks } from '../data/tasks';
import {
  createFixtureProvider,
  createOpenAIFullContextProvider,
  runProviderTask
} from '../lib/providers';
import { getPersona } from '../lib/lookup';
import { ensureDir, writeJson, writeText } from '../lib/io';
import { buildPrompt } from '../lib/format';
import type { CapturedResponse } from '../schema';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const providerName = argValue('provider', 'fixture_provider');
  const outDir = argValue('out', '.treasurybench-tmp/provider-run');
  const onlyTask = argValue('task');
  const taskListArg = argValue('tasks');
  const maxTasksArg = argValue('max-tasks');
  const live = argValue('live') === 'true';
  const envFile = argValue('env-file');
  loadSelectedEnvFile(envFile);

  const model = argValue('model', process.env.TREASURYBENCH_OPENAI_MODEL ?? 'chat-latest') ?? 'chat-latest';
  const maxOutputTokens = Number(argValue('max-output-tokens', '2500'));
  const timeoutMs = Number(argValue('timeout-ms', '120000'));
  const reasoningEffortArg = argValue('reasoning-effort', 'low');
  const reasoningEffort =
    reasoningEffortArg === 'none' || reasoningEffortArg === 'off' || reasoningEffortArg === ''
      ? undefined
      : (reasoningEffortArg as 'minimal' | 'low' | 'medium' | 'high');

  if (!providerName) throw new Error('Missing --provider=<provider_name>.');
  if (!outDir) throw new Error('Missing --out=<run_directory>.');

  const captureDir = join(outDir, 'captures');
  const promptDir = join(outDir, 'prompts');
  ensureDir(captureDir);
  ensureDir(promptDir);

  const providerKind = normalizeProviderName(providerName);
  const maxTasks = maxTasksArg ? Number(maxTasksArg) : undefined;
  const selectedTasks = selectTasks(onlyTask, taskListArg).slice(0, maxTasks);
  if (selectedTasks.length === 0) throw new Error(`No task matched ${onlyTask ?? taskListArg ?? 'all tasks'}.`);

  if (providerKind === 'openai' && !live) {
    for (const task of selectedTasks) {
      const persona = getPersona(task.personaId);
      const prompt = buildPrompt(persona, task, 'full_context_baseline');
      const template: CapturedResponse = {
        taskId: task.id,
        personaId: persona.id,
        provider: `openai:${model}`,
        mode: 'full_context_baseline',
        capturedAt: '',
        latencyMs: undefined,
        response: '',
        notes: `Dry run. Prompt written to prompts/${task.id}.txt. Re-run with --live=true to call OpenAI.`
      };
      writeText(join(promptDir, `${task.id}.txt`), `${prompt.prompt}\n`);
      writeJson(join(captureDir, `openai.${model}.${task.id}.json`), template);
    }

    console.log(`Dry run: wrote ${selectedTasks.length} OpenAI prompt(s) to ${promptDir}`);
    console.log(`Dry run: wrote ${selectedTasks.length} capture template(s) to ${captureDir}`);
    console.log('No API calls were made. Pass --live=true to run the OpenAI provider.');
  } else {
    const provider =
      providerKind === 'fixture'
        ? createFixtureProvider(providerName)
        : createOpenAIFullContextProvider({
            apiKey: readOpenAIKey(),
            model,
            maxOutputTokens,
            timeoutMs,
            reasoningEffort
          });

    for (const task of selectedTasks) {
      const persona = getPersona(task.personaId);
      const prompt = buildPrompt(persona, task, provider.mode);
      writeText(join(promptDir, `${task.id}.txt`), `${prompt.prompt}\n`);
      let capture: CapturedResponse;
      try {
        capture = await runProviderTask(provider, { task, persona });
      } catch (error) {
        capture = {
          taskId: task.id,
          personaId: persona.id,
          provider: provider.name,
          mode: provider.mode,
          capturedAt: new Date().toISOString(),
          response: `[PROVIDER_ERROR]\n${error instanceof Error ? error.stack ?? error.message : String(error)}`,
          notes: 'Provider task failed; captured as an error so the rest of the run can continue.'
        };
        console.error(`Provider task failed for ${task.id}:`, error instanceof Error ? error.message : error);
      }
      writeJson(join(captureDir, `${safeFilePart(provider.name)}.${task.id}.json`), capture);
    }

    console.log(`Ran provider ${provider.name} for ${selectedTasks.length} task(s).`);
    console.log(`Wrote captures to ${captureDir}`);
  }
}

function normalizeProviderName(name: string): 'fixture' | 'openai' {
  if (name === 'fixture_provider' || name === 'fixture') return 'fixture';
  if (name === 'openai' || name === 'full_context_baseline') return 'openai';
  throw new Error(`Provider ${name} is not implemented in the public harness. Available: fixture_provider, openai.`);
}

function selectTasks(taskId: string | undefined, taskIds: string | undefined) {
  if (taskId && taskIds) {
    throw new Error('Use either --task=<task_id> or --tasks=<task_a,task_b>, not both.');
  }
  if (taskId) return tasks.filter((task) => task.id === taskId);
  if (taskIds) {
    const ids = new Set(taskIds.split(',').map((id) => id.trim()).filter(Boolean));
    const selected = tasks.filter((task) => ids.has(task.id));
    const missing = [...ids].filter((id) => !selected.some((task) => task.id === id));
    if (missing.length > 0) throw new Error(`Unknown task id(s): ${missing.join(', ')}`);
    return selected;
  }
  return tasks;
}

function readOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for --provider=openai --live=true.');
  }
  return apiKey;
}

function safeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

function loadSelectedEnvFile(path: string | undefined): void {
  if (!path) return;
  const resolvedPath = resolveEnvFilePath(path);
  if (!resolvedPath) {
    throw new Error(`Env file not found: ${path}`);
  }

  const allowedKeys = new Set([
    'OPENAI_API_KEY',
    'TREASURYBENCH_OPENAI_MODEL'
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
