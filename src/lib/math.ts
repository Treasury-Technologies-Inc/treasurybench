import type { Persona, Transaction } from '../schema';

export function transactionsInMonth(persona: Persona, year: number, month: number): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  return persona.transactions.filter((transaction) => transaction.date.startsWith(prefix));
}

export function spendingTotal(transactions: Transaction[]): number {
  return roundMoney(
    transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  );
}

export function incomeTotal(transactions: Transaction[]): number {
  return roundMoney(
    transactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );
}

export function spendingByCategory(transactions: Transaction[]): Map<string, number> {
  const byCategory = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue;
    byCategory.set(transaction.category, roundMoney((byCategory.get(transaction.category) ?? 0) + Math.abs(transaction.amount)));
  }
  return byCategory;
}

export function sumTransactions(transactions: Transaction[], predicate: (transaction: Transaction) => boolean): number {
  return roundMoney(
    transactions
      .filter(predicate)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  );
}

export function accountBalance(persona: Persona, accountId: string): number {
  const account = persona.accounts.find((candidate) => candidate.id === accountId);
  if (!account) throw new Error(`Unknown account: ${accountId}`);
  return account.balance;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
