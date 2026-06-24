import { join } from 'node:path';
import { tasks } from '../data/tasks';
import { getPersona } from '../lib/lookup';
import { ensureDir, writeJson, writeText } from '../lib/io';
import { buildPrompt } from '../lib/format';
import type { CapturedResponse, ProviderMode } from '../schema';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const outDir = argValue('out', 'runs/manual-dev');
const provider = argValue('provider', 'manual-product');
const mode = (argValue('mode', 'product_capture') ?? 'product_capture') as ProviderMode;
const onlyTask = argValue('task');
const taskListArg = argValue('tasks');
const maxTasksArg = argValue('max-tasks');

if (!outDir) throw new Error('Missing --out=<run_directory>.');
if (!provider) throw new Error('Missing --provider=<provider_name>.');

const captureDir = join(outDir, 'captures');
const promptDir = join(outDir, 'prompts');
ensureDir(captureDir);
ensureDir(promptDir);

const maxTasks = maxTasksArg ? Number(maxTasksArg) : undefined;
const selectedTasks = selectTasks(onlyTask, taskListArg).slice(0, maxTasks);
if (selectedTasks.length === 0) throw new Error(`No task matched ${onlyTask ?? taskListArg ?? 'all tasks'}.`);

for (const task of selectedTasks) {
  const persona = getPersona(task.personaId);
  const prompt = buildPrompt(persona, task, mode);
  const template: CapturedResponse = {
    taskId: task.id,
    personaId: task.personaId,
    provider,
    mode,
    capturedAt: '',
    latencyMs: undefined,
    response: '',
    notes: `Prompt: ${task.prompt}`
  };

  writeJson(join(captureDir, `${provider}.${task.id}.json`), template);
  writeText(join(promptDir, `${task.id}.txt`), `${prompt.prompt}\n`);
}

console.log(`Wrote ${selectedTasks.length} capture template(s) to ${captureDir}`);
console.log(`Wrote ${selectedTasks.length} prompt file(s) to ${promptDir}`);

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
