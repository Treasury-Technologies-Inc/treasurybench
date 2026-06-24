import { DOMAIN_LABELS, type Domain } from '../schema';
import { opportunities } from '../data/opportunities';
import { personas } from '../data/personas';
import { tasks } from '../data/tasks';

const domains = Array.from(new Set(tasks.map((task) => task.domain))).sort();

console.log('TreasuryBench v1');
console.log('');
console.log(`Personas: ${personas.length}`);
for (const persona of personas) {
  console.log(`- ${persona.displayName} (${persona.id}): ${persona.accounts.length} accounts, ${persona.transactions.length} transactions, ${persona.memories.length} memories`);
}

console.log('');
console.log(`Tasks: ${tasks.length}`);
for (const domain of domains as Domain[]) {
  const domainTasks = tasks.filter((task) => task.domain === domain);
  console.log(`- ${DOMAIN_LABELS[domain]}: ${domainTasks.length}`);
}

console.log('');
console.log(`Opportunities: ${opportunities.length}`);
for (const domain of Array.from(new Set(opportunities.map((opportunity) => opportunity.domain))).sort() as Domain[]) {
  const domainOpportunities = opportunities.filter((opportunity) => opportunity.domain === domain);
  console.log(`- ${DOMAIN_LABELS[domain]}: ${domainOpportunities.length}`);
}

console.log('');
console.log('Public quality dimensions:');
console.log('- Grounding');
console.log('- Correctness');
console.log('- Resolution');
console.log('- Prudence');
console.log('- Speed');

console.log('');
console.log('Domain maturity:');
for (const domain of domains as Domain[]) {
  const domainTasks = tasks.filter((task) => task.domain === domain);
  const maturity = domainTasks.length >= 3 ? 'mature' : 'pilot';
  console.log(`- ${DOMAIN_LABELS[domain]}: ${maturity}`);
}
