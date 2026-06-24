import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isCompleteCapturedResponse } from '../lib/capture';
import type { CapturedResponse } from '../schema';

function argValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const captureDir = argValue('captures', 'fixtures/captures');
if (!captureDir) throw new Error('Missing --captures=<capture_directory>.');

let complete = 0;
let incomplete = 0;
const incompleteFiles: string[] = [];

for (const entry of readdirSync(captureDir)) {
  if (!entry.endsWith('.json')) continue;
  const path = join(captureDir, entry);
  if (!statSync(path).isFile()) continue;

  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<CapturedResponse> | Array<Partial<CapturedResponse>>;
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    if (isCompleteCapturedResponse(item)) {
      complete += 1;
    } else {
      incomplete += 1;
      incompleteFiles.push(entry);
    }
  }
}

console.log(`Capture status for ${captureDir}`);
console.log(`- complete: ${complete}`);
console.log(`- incomplete: ${incomplete}`);
if (incompleteFiles.length > 0) {
  console.log('');
  console.log('Incomplete files:');
  for (const file of incompleteFiles) {
    console.log(`- ${file}`);
  }
}
