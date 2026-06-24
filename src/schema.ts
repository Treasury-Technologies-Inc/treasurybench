export type Domain =
  | 'transaction_intelligence'
  | 'cashflow_budgeting'
  | 'savings_expense_reduction'
  | 'credit_cards_rewards'
  | 'housing_rent'
  | 'employer_benefits_perks'
  | 'tax_strategy'
  | 'retirement_tax_advantaged'
  | 'investing_equity_comp'
  | 'insurance_risk_protection'
  | 'debt_credit_health'
  | 'life_planning_major_decisions';

export type TaskType =
  | 'data_retrieval'
  | 'insight_discovery'
  | 'domain_advice'
  | 'prioritization'
  | 'what_if';

export type SignalKind = 'transaction' | 'account' | 'memory' | 'external_knowledge';

export type FactSourceKind =
  | 'visible_data'
  | 'seeded_memory'
  | 'locked_benchmark_fact'
  | 'dynamic_external_fact'
  | 'unsupported';

export interface PersonaSignal {
  kind: SignalKind;
  id: string;
  description: string;
}

export interface Memory {
  id: string;
  text: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'brokerage' | '401k' | 'ira' | 'hsa' | 'loan';
  subtype?: string;
  institution: string;
  mask?: string;
  balance: number;
  availableBalance?: number;
  currency: 'USD';
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  accountId: string;
  category: string;
  originalStatement?: string;
  notes?: string;
  tags?: string;
  owner?: string;
}

export interface Persona {
  id: string;
  displayName: string;
  summary: string;
  asOfDate: string;
  memories: Memory[];
  accounts: Account[];
  transactions: Transaction[];
}

export interface OpportunityTier {
  basic: string[];
  personalized: string[];
  advanced: string[];
  expert: string[];
}

export interface Opportunity {
  id: string;
  domain: Domain;
  title: string;
  sourceArticles: string[];
  requiredSignals: PersonaSignal[];
  expectedAction: string;
  eligibilityCaveats: string[];
  valueModel: string;
  tiers: OpportunityTier;
}

export interface ScoreDimension {
  id: string;
  label: string;
  points: number;
  guidance: string;
}

export interface Task {
  id: string;
  personaId: string;
  domain: Domain;
  type: TaskType;
  prompt: string;
  intent: string;
  expectedAnswerNotes?: string[];
  opportunityIds: string[];
  relevantSignalIds: string[];
  scoreDimensions: ScoreDimension[];
  invalidOrHarmful: string[];
  openCreditPolicy: string;
  deterministicChecks: string[];
}

export type PublicProviderMode = 'product_capture' | 'full_context_baseline' | 'fixture';
export type ProviderMode = PublicProviderMode;

export interface BenchmarkPrompt {
  taskId: string;
  personaId: string;
  mode: ProviderMode;
  prompt: string;
  metadata: {
    generatedAt: string;
    personaAsOfDate: string;
    transactionCount: number;
    accountCount: number;
    memoryCount: number;
  };
}

export interface CapturedResponse {
  taskId: string;
  personaId: string;
  provider: string;
  mode: ProviderMode;
  response: string;
  latencyMs?: number;
  capturedAt: string;
  notes?: string;
  usage?: ProviderUsage;
}

export interface ProviderRunRequest {
  task: Task;
  persona: Persona;
  prompt: BenchmarkPrompt;
}

export interface ProviderRunResult {
  response: string;
  latencyMs: number;
  notes?: string;
  usage?: ProviderUsage;
}

export interface ProviderUsage {
  provider?: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
  };
}

export type DeterministicCheckStatus = 'pass' | 'partial' | 'fail' | 'not_implemented';

export interface DeterministicCheckResult {
  id: string;
  status: DeterministicCheckStatus;
  score: number;
  maxScore: number;
  expected: string;
  evidence: string;
}

export interface DeterministicEvaluation {
  taskId: string;
  personaId: string;
  provider: string;
  mode: ProviderMode;
  domain: Domain;
  deterministicScore: number;
  latencyMs?: number;
  checks: DeterministicCheckResult[];
  currentFactIssues?: CurrentFactIssue[];
}

export interface CurrentFactIssue {
  id: string;
  severity: 'warning' | 'stale_or_wrong' | 'critical';
  factType: 'irs_limit' | 'product_terms' | 'completion';
  expected: string;
  observed: string;
  evidence: string;
}

export interface JudgeDimensionScore {
  id: string;
  score: number;
  maxScore: number;
  rationale: string;
}

/**
 * A single checkable factual claim the graded answer made, assessed ONLY against
 * the locked-fact table. The judge may mark a claim `verified_incorrect` only by
 * citing the locked fact (`tableKey`) it contradicts; any claim not covered by the
 * table must be `unverified` (logged to the unknown-facts ledger, never guessed).
 */
export type FactualClaimState = 'verified_correct' | 'verified_incorrect' | 'unverified';

export interface FactualClaim {
  /** The factual assertion the answer made, quoted or tightly paraphrased. */
  claim: string;
  /** The locked-fact id this claim corresponds to, or null if not in the table. */
  tableKey: string | null;
  state: FactualClaimState;
}

export interface JudgeEvaluation {
  taskId: string;
  provider: string;
  totalScore: number;
  dimensions: JudgeDimensionScore[];
  /**
   * Structured, table-grounded factual assessment — the scored factual signal.
   * `verified_incorrect` entries (with a valid tableKey) drive factual score caps;
   * `unverified` entries feed the unknown-facts ledger and do not affect the score.
   */
  factualClaims: FactualClaim[];
  /** Free-text factual notes. Advisory only — shown in artifacts, NOT scored. */
  factualIssues: string[];
  missedOpportunities: string[];
  unexpectedValidInsights: string[];
  safetyIssues: string[];
  summary: string;
}

export interface PairwisePreferenceEvaluation {
  taskId: string;
  personaId: string;
  providerA: string;
  providerB: string;
  winner: 'A' | 'B' | 'tie';
  confidence: number;
  usefulnessScoreA: number;
  usefulnessScoreB: number;
  trustworthinessScoreA: number;
  trustworthinessScoreB: number;
  rationale: string;
  flagsA: string[];
  flagsB: string[];
}

export interface FinalEvaluation {
  taskId: string;
  personaId: string;
  provider: string;
  mode: ProviderMode;
  domain: Domain;
  deterministicScore: number;
  judgeScore?: number;
  finalScore: number;
  latencyMs?: number;
  scoringMode: 'deterministic_only' | 'deterministic_plus_judge';
  scoreSource: 'deterministic_cap' | 'weighted_blend' | 'judge_override';
  deterministicWeight: number;
  judgeWeight: number;
  judgeDeterministicDelta?: number;
  finalJudgeDelta?: number;
  scoringWarnings: string[];
  /** Count of table-grounded `verified_incorrect` factual claims (drives caps). */
  factualContradictions?: number;
  /** Worst contradiction severity among them, or null if factually clean. */
  factualWorstSeverity?: FactConflictSeverity | null;
  /** Count of `unverified` claims logged to the unknown-facts ledger this task. */
  unverifiedFactCount?: number;
}

/** How harmful it is to contradict a given locked fact. */
export type FactConflictSeverity = 'material' | 'dangerous';

export const DOMAIN_LABELS: Record<Domain, string> = {
  transaction_intelligence: 'Transaction Intelligence',
  cashflow_budgeting: 'Cashflow & Budgeting',
  savings_expense_reduction: 'Savings & Expense Reduction',
  credit_cards_rewards: 'Credit Cards & Rewards',
  housing_rent: 'Housing & Rent',
  employer_benefits_perks: 'Employer Benefits & Workplace Perks',
  tax_strategy: 'Tax Strategy',
  retirement_tax_advantaged: 'Retirement & Tax-Advantaged Accounts',
  investing_equity_comp: 'Investing & Equity Compensation',
  insurance_risk_protection: 'Insurance & Risk Protection',
  debt_credit_health: 'Debt & Credit Health',
  life_planning_major_decisions: 'Life Planning & Major Decisions'
};
