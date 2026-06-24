import { join } from 'node:path';
import { evaluateCapture } from '../lib/evaluate';
import { buildJudgePrompt } from '../lib/judge';
import { getPersona, getTask } from '../lib/lookup';
import { ensureDir, readCaptures, writeJson, writeText } from '../lib/io';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const captureDir = argValue('captures');
const outDir = argValue('out', '.treasurybench-tmp/judge-prompts');

if (!captureDir) throw new Error('Missing --captures=<capture_directory>.');
if (!outDir) throw new Error('Missing --out=<directory>.');

ensureDir(outDir);

const captures = readCaptures(captureDir, { skipIncomplete: true });
for (const capture of captures) {
  const task = getTask(capture.taskId);
  const persona = getPersona(capture.personaId);
  const deterministic = evaluateCapture(capture);
  const prompt = buildJudgePrompt(task, persona, capture, deterministic.checks);
  writeText(join(outDir, `${capture.provider}.${capture.taskId}.judge.txt`), `${prompt}\n`);
}

writeJson(join(outDir, 'manifest.json'), {
  kind: 'treasurybench_judge_prompts',
  exportedAt: new Date().toISOString(),
  captureCount: captures.length,
  captures: captures.map((capture) => ({
    provider: capture.provider,
    taskId: capture.taskId,
    personaId: capture.personaId,
    promptFile: `${capture.provider}.${capture.taskId}.judge.txt`
  }))
});

console.log(`Exported ${captures.length} judge prompt(s) to ${outDir}`);
