import { join } from 'node:path';
import { personas } from '../data/personas';
import { memoriesJson, uploadBalancesCsv, uploadTransactionsCsv } from '../lib/format';
import { getPersona } from '../lib/lookup';
import { ensureDir, writeText } from '../lib/io';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const equalsMatch = process.argv.find((arg) => arg.startsWith(prefix));
  if (equalsMatch) return equalsMatch.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];

  return fallback;
}

const outDir = argValue('out', '.treasurybench-tmp/persona-data');

if (!outDir) throw new Error('Missing --out=<directory>.');

const personaId = argValue('persona');
const selectedPersonas = personaId ? [getPersona(personaId)] : personas;

for (const persona of selectedPersonas) {
  const personaOutDir = personaId ? outDir : join(outDir, persona.id);
  ensureDir(personaOutDir);

  writeText(join(personaOutDir, 'balances.csv'), `${uploadBalancesCsv(persona)}\n`);
  writeText(join(personaOutDir, 'transactions.csv'), `${uploadTransactionsCsv(persona)}\n`);
  writeText(join(personaOutDir, 'memories.json'), `${memoriesJson(persona.memories)}\n`);

  console.log(`Exported ${persona.id} persona data to ${personaOutDir}`);
}
