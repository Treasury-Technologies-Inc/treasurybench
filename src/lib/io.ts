import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { isCompleteCapturedResponse, parseCapturedResponse } from './capture';
import type { CapturedResponse } from '../schema';

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function writeJson(path: string, value: unknown): void {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeText(path: string, value: string): void {
  ensureDir(dirname(path));
  writeFileSync(path, value);
}

interface ReadCapturesOptions {
  skipIncomplete?: boolean;
}

export function readCaptures(captureDir: string, options: ReadCapturesOptions = {}): CapturedResponse[] {
  const captures: CapturedResponse[] = [];
  for (const entry of readdirSync(captureDir)) {
    if (!entry.endsWith('.json')) continue;
    const path = join(captureDir, entry);
    if (!statSync(path).isFile()) continue;

    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (options.skipIncomplete && !isCompleteCapturedResponse(item as Partial<CapturedResponse>)) continue;
        captures.push(parseCapturedResponse(JSON.stringify(item)));
      }
    } else if (options.skipIncomplete && !isCompleteCapturedResponse(parsed as Partial<CapturedResponse>)) {
      continue;
    } else {
      captures.push(parseCapturedResponse(raw));
    }
  }
  return captures;
}

export function csvEscape(value: string | number | boolean | undefined): string {
  if (value === undefined) return '';
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}
