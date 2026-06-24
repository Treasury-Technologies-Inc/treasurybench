import type { Account, BenchmarkPrompt, Memory, Persona, ProviderMode, Task, Transaction } from '../schema';

function csvEscape(value: string | number | boolean | undefined): string {
  if (value === undefined) return '';
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function accountLabel(account: Account): string {
  return account.mask ? `${account.name} ${account.mask}` : account.name;
}

export function uploadBalancesCsv(persona: Persona): string {
  const rows = persona.accounts.map((account) =>
    [
      persona.asOfDate,
      account.balance.toFixed(2),
      accountLabel(account),
    ]
      .map(csvEscape)
      .join(',')
  );
  return ['Date,Balance,Account', ...rows].join('\n');
}

export function transactionsCsv(transactions: Transaction[]): string {
  const rows = transactions.map((transaction) =>
    [
      transaction.id,
      transaction.date,
      transaction.merchant,
      transaction.amount.toFixed(2),
      transaction.accountId,
      transaction.category,
      transaction.originalStatement ?? '',
      transaction.notes ?? ''
    ]
      .map(csvEscape)
      .join(',')
  );
  return ['id,date,merchant,amount,account_id,category,original_statement,notes', ...rows].join('\n');
}

export function uploadTransactionsCsv(persona: Persona): string {
  const accountNames = new Map(persona.accounts.map((account) => [account.id, accountLabel(account)]));
  const rows = persona.transactions.map((transaction) =>
    [
      transaction.date,
      transaction.merchant,
      transaction.category,
      accountNames.get(transaction.accountId) ?? transaction.accountId,
      transaction.originalStatement ?? transaction.merchant,
      transaction.notes ?? '',
      transaction.amount.toFixed(2),
      transaction.tags ?? '',
      transaction.owner ?? 'Shared'
    ]
      .map(csvEscape)
      .join(',')
  );
  return ['Date,Merchant,Category,Account,Original Statement,Notes,Amount,Tags,Owner', ...rows].join('\n');
}

export function memoriesJson(memories: Memory[]): string {
  return JSON.stringify(memories, null, 2);
}

export function buildFullContextPrompt(persona: Persona, task: Task): BenchmarkPrompt {
  const prompt = `You are a personal finance assistant being evaluated on TreasuryBench.

Benchmark date: ${persona.asOfDate}
Persona: ${persona.displayName}
Summary: ${persona.summary}

Use only the persona memories, account balances, and transactions below as the user's financial context. You may rely on your own current personal-finance knowledge for public rules, IRS limits, benefit concepts, card rewards, local programs, and product terms, but you must be factual, current, relevant, and appropriately caveated. Do not invent user data.

Strong answers:
- search the data mentally before answering;
- connect transactions, balances, memories, and finance knowledge;
- quantify dollar impact when possible;
- prioritize higher-value opportunities over generic tips;
- state assumptions and eligibility caveats;
- give exact next steps.

Memories:
${memoriesJson(persona.memories)}

Balances CSV:
${uploadBalancesCsv(persona)}

Transactions CSV:
${uploadTransactionsCsv(persona)}

User question:
${task.prompt}`;

  return buildPromptEnvelope(persona, task, 'full_context_baseline', prompt);
}

export function buildProductCapturePrompt(persona: Persona, task: Task): BenchmarkPrompt {
  const prompt = task.prompt;
  return buildPromptEnvelope(persona, task, 'product_capture', prompt);
}

export function buildPrompt(persona: Persona, task: Task, mode: ProviderMode): BenchmarkPrompt {
  if (mode === 'full_context_baseline') return buildFullContextPrompt(persona, task);
  return buildProductCapturePrompt(persona, task);
}

function buildPromptEnvelope(persona: Persona, task: Task, mode: ProviderMode, prompt: string): BenchmarkPrompt {
  return {
    taskId: task.id,
    personaId: persona.id,
    mode,
    prompt,
    metadata: {
      generatedAt: new Date().toISOString(),
      personaAsOfDate: persona.asOfDate,
      transactionCount: persona.transactions.length,
      accountCount: persona.accounts.length,
      memoryCount: persona.memories.length
    }
  };
}
