import { opportunities } from '../data/opportunities';
import { personas } from '../data/personas';
import { tasks } from '../data/tasks';
import { implementedDeterministicCheckIds } from '../lib/deterministic';

interface ValidationIssue {
  severity: 'error' | 'warning';
  subject: string;
  message: string;
}

const issues: ValidationIssue[] = [];

function addIssue(severity: ValidationIssue['severity'], subject: string, message: string) {
  issues.push({ severity, subject, message });
}

function assertUnique(ids: string[], subject: string) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      addIssue('error', subject, `Duplicate id: ${id}`);
    }
    seen.add(id);
  }
}

const personaIds = new Set(personas.map((persona) => persona.id));
const opportunityIds = new Set(opportunities.map((opportunity) => opportunity.id));
const implementedCheckIds = new Set(implementedDeterministicCheckIds());
const signalIdsByPersona = new Map<string, Set<string>>();

assertUnique(
  personas.map((persona) => persona.id),
  'personas'
);
assertUnique(
  opportunities.map((opportunity) => opportunity.id),
  'opportunities'
);
assertUnique(
  tasks.map((task) => task.id),
  'tasks'
);

for (const persona of personas) {
  const signalIds = new Set<string>();
  for (const memory of persona.memories) signalIds.add(memory.id);
  for (const account of persona.accounts) signalIds.add(account.id);
  for (const transaction of persona.transactions) signalIds.add(transaction.id);
  signalIdsByPersona.set(persona.id, signalIds);
}

for (const opportunity of opportunities) {
  if (opportunity.sourceArticles.length === 0) {
    addIssue('warning', opportunity.id, 'Opportunity has no source articles.');
  }

  for (const sourceArticle of opportunity.sourceArticles) {
    if (!sourceArticle.startsWith('benchmark-reference/')) {
      addIssue('warning', opportunity.id, `Source reference should use benchmark-reference/... form: ${sourceArticle}`);
    }
  }

  const tierCounts = Object.values(opportunity.tiers).map((tier) => tier.length);
  if (tierCounts.some((count) => count === 0)) {
    addIssue('warning', opportunity.id, 'Each opportunity should define basic, personalized, advanced, and expert tier examples.');
  }
}

for (const task of tasks) {
  if (!personaIds.has(task.personaId)) {
    addIssue('error', task.id, `Unknown persona: ${task.personaId}`);
  }

  const scoreTotal = task.scoreDimensions.reduce((sum, dimension) => sum + dimension.points, 0);
  if (scoreTotal !== 100) {
    addIssue('error', task.id, `Score dimensions sum to ${scoreTotal}, expected 100.`);
  }

  for (const opportunityId of task.opportunityIds) {
    if (!opportunityIds.has(opportunityId)) {
      addIssue('error', task.id, `Unknown opportunity: ${opportunityId}`);
    }
  }

  const signalIds = signalIdsByPersona.get(task.personaId);
  if (!signalIds) continue;

  for (const signalId of task.relevantSignalIds) {
    if (!signalIds.has(signalId)) {
      addIssue('error', task.id, `Unknown relevant signal for ${task.personaId}: ${signalId}`);
    }
  }

  for (const opportunityId of task.opportunityIds) {
    const opportunity = opportunities.find((candidate) => candidate.id === opportunityId);
    if (!opportunity) continue;

    for (const signal of opportunity.requiredSignals) {
      if (signal.kind === 'external_knowledge') continue;
      if (!signalIds.has(signal.id)) {
        addIssue('error', task.id, `Opportunity ${opportunityId} references unknown signal: ${signal.id}`);
      }
    }
  }

  if (!task.openCreditPolicy.includes('unexpected')) {
    addIssue('warning', task.id, 'Open credit policy should explicitly allow unexpected valid insights.');
  }

  for (const checkId of task.deterministicChecks) {
    if (!implementedCheckIds.has(checkId)) {
      addIssue('warning', task.id, `Deterministic check has no evaluator yet: ${checkId}`);
    }
  }
}

const errorCount = issues.filter((issue) => issue.severity === 'error').length;
const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

if (issues.length > 0) {
  for (const issue of issues) {
    console.log(`[${issue.severity.toUpperCase()}] ${issue.subject}: ${issue.message}`);
  }
}

console.log(
  `TreasuryBench validation: ${personas.length} persona(s), ${opportunities.length} opportunities, ${tasks.length} tasks, ${errorCount} error(s), ${warningCount} warning(s).`
);

if (errorCount > 0) {
  process.exit(1);
}
