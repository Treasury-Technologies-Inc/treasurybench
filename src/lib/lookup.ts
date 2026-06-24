import { opportunities } from '../data/opportunities';
import { personas } from '../data/personas';
import { tasks } from '../data/tasks';

export function getPersona(personaId: string) {
  const persona = personas.find((candidate) => candidate.id === personaId);
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);
  return persona;
}

export function getTask(taskId: string) {
  const task = tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown task: ${taskId}`);
  return task;
}

export function getOpportunity(opportunityId: string) {
  const opportunity = opportunities.find((candidate) => candidate.id === opportunityId);
  if (!opportunity) throw new Error(`Unknown opportunity: ${opportunityId}`);
  return opportunity;
}
