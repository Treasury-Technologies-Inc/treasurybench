import { buildPrompt } from '../lib/format';
import { getPersona, getTask } from '../lib/lookup';
import type { ProviderMode } from '../schema';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const taskId = argValue('task', 'maria_save_on_rent');
const mode = argValue('mode', 'full_context_baseline') as ProviderMode;

if (!taskId) throw new Error('Missing --task=<task_id>.');

const task = getTask(taskId);
const persona = getPersona(task.personaId);
const prompt = buildPrompt(persona, task, mode);

if (argValue('json') === 'true') {
  console.log(JSON.stringify(prompt, null, 2));
} else {
  console.log(prompt.prompt);
}
