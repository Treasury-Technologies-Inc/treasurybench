import { join } from 'node:path';
import { tasks } from '../data/tasks';
import { buildPrompt } from '../lib/format';
import { getPersona } from '../lib/lookup';
import { ensureDir, writeJson, writeText } from '../lib/io';
import type { ProviderMode } from '../schema';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const outDir = argValue('out', '.treasurybench-tmp/prompts');
const mode = (argValue('mode', 'full_context_baseline') ?? 'full_context_baseline') as ProviderMode;
const json = argValue('json') === 'true';
const onlyTask = argValue('task');
const taskListArg = argValue('tasks');

if (!outDir) throw new Error('Missing --out=<directory>.');

ensureDir(outDir);

const selectedTasks = selectTasks(onlyTask, taskListArg);
if (selectedTasks.length === 0) throw new Error(`No task matched ${onlyTask ?? taskListArg ?? 'all tasks'}.`);

for (const task of selectedTasks) {
  const persona = getPersona(task.personaId);
  const prompt = buildPrompt(persona, task, mode);
  if (json) {
    writeJson(join(outDir, `${task.id}.json`), prompt);
  } else {
    writeText(join(outDir, `${task.id}.txt`), `${prompt.prompt}\n`);
  }
}

writeJson(join(outDir, 'manifest.json'), {
  kind: 'treasurybench_prompts',
  mode,
  exportedAt: new Date().toISOString(),
  taskCount: selectedTasks.length,
  tasks: selectedTasks.map((task) => ({
    id: task.id,
    personaId: task.personaId,
    domain: task.domain,
    type: task.type,
    promptFile: json ? `${task.id}.json` : `${task.id}.txt`
  }))
});

console.log(`Exported ${selectedTasks.length} ${mode} prompt(s) to ${outDir}`);

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
