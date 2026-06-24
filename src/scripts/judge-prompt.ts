import { readFileSync } from 'node:fs';
import { parseCapturedResponse } from '../lib/capture';
import { evaluateDeterministicChecks } from '../lib/deterministic';
import { buildJudgePrompt } from '../lib/judge';
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
const deterministicResults = evaluateDeterministicChecks(task, persona, capture.response);

console.log(buildJudgePrompt(task, persona, capture, deterministicResults));
