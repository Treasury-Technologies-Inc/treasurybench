import { readFileSync } from 'node:fs';
import { parseCapturedResponse } from '../lib/capture';
import { deterministicScore, evaluateDeterministicChecks } from '../lib/deterministic';
import { getPersona, getTask } from '../lib/lookup';

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const file = argValue('file');
if (!file) throw new Error('Missing --file=<capture.json>.');

const capture = parseCapturedResponse(readFileSync(file, 'utf8'));
const task = getTask(capture.taskId);
const persona = getPersona(capture.personaId);
const results = evaluateDeterministicChecks(task, persona, capture.response);

console.log(
  JSON.stringify(
    {
      taskId: capture.taskId,
      personaId: capture.personaId,
      provider: capture.provider,
      mode: capture.mode,
      latencyMs: capture.latencyMs,
      deterministicScore: deterministicScore(results),
      checks: results
    },
    null,
    2
  )
);
