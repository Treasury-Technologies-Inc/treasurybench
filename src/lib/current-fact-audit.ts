import type { Persona, Task } from '../schema';

export type CurrentFactIssueSeverity = 'warning' | 'stale_or_wrong' | 'critical';

export interface CurrentFactIssue {
  id: string;
  severity: CurrentFactIssueSeverity;
  factType: 'irs_limit' | 'product_terms' | 'completion';
  expected: string;
  observed: string;
  evidence: string;
}

interface PatternRule {
  id: string;
  severity: CurrentFactIssueSeverity;
  factType: CurrentFactIssue['factType'];
  expected: string;
  observed: string;
  valuePattern: RegExp;
  requiredContext: RegExp;
  excludeContext?: RegExp;
  coreContext?: RegExp;
  /**
   * If the current/correct value also appears in the same window, the stale
   * value is almost certainly a deliberate old-vs-new contrast ("the new 2026
   * limit is $7,500, up from the old $5,000"), not a stale citation. Suppress
   * the issue so the scanner does not penalize the most nuanced answers.
   */
  correctValue?: RegExp;
}

const WINDOW = 260;

const RULES: PatternRule[] = [
  {
    id: 'stale_401k_23500',
    severity: 'critical',
    factType: 'irs_limit',
    expected: '2026 401(k)/403(b)/457/TSP employee elective deferral limit is $24,500.',
    observed: '$23,500 used as the current or 2026 401(k) employee deferral limit.',
    valuePattern: /(?<![\d,])\$?23,500\b/g,
    requiredContext: /(401\(?k\)?|403\(b\)|457|TSP|elective deferral|employee deferral|IRS limit|contribution limit)/i,
    coreContext: /(limit|deferral|employee contribution|elective)/i,
    correctValue: /(?<![\d,])\$?24,500\b/
  },
  {
    id: 'stale_401k_23000',
    severity: 'critical',
    factType: 'irs_limit',
    expected: '2026 401(k)/403(b)/457/TSP employee elective deferral limit is $24,500.',
    observed: '$23,000 used as the current or 2026 401(k) employee deferral limit.',
    valuePattern: /(?<![\d,])\$?23,000\b/g,
    requiredContext: /(401\(?k\)?|403\(b\)|457|TSP|elective deferral|employee deferral|IRS limit|contribution limit)/i,
    coreContext: /(limit|deferral|employee contribution|elective)/i,
    correctValue: /(?<![\d,])\$?24,500\b/
  },
  {
    id: 'wrong_401k_24000_limit',
    severity: 'stale_or_wrong',
    factType: 'irs_limit',
    expected: '2026 401(k)/403(b)/457/TSP employee elective deferral limit is $24,500.',
    observed: '$24,000 used as the 2026 employee deferral limit.',
    valuePattern: /(?<![\d,])\$?24,000\b/g,
    requiredContext: /(401\(?k\)?|403\(b\)|457|TSP|employee 401\(k\) deferral limit|standard 2026 employee|IRS limit)/i,
    excludeContext:
      /(annual 401\(k\) employee contributions|combined employee retirement savings pace|total employee 401\(k\) contributions|monthly deferral|annual pace|total annual pace|current pace|target cash|minimum cash|buffer|expense|spending|on pace.{0,80}\$?24,000|\$?24,000.{0,80}combined|\$?24,000.{0,80}(annual pace|current pace|total)|combined.{0,80}\$?24,000|pace.{0,80}\$?24,000)/i,
    coreContext: /(limit|deferral limit|standard 2026 employee)/i,
    correctValue: /(?<![\d,])\$?24,500\b/
  },
  {
    id: 'stale_ira_7000_limit',
    severity: 'stale_or_wrong',
    factType: 'irs_limit',
    expected: '2026 traditional/Roth IRA contribution limit is $7,500 before catch-up.',
    observed: '$7,000 used as the 2026 IRA contribution limit or full current-year IRA contribution.',
    valuePattern: /(?<![\d,])\$?7,000\b/g,
    requiredContext: /(IRA|Roth|backdoor|pro-rata|nondeductible).*?(limit|contribution|full)|(?:limit|contribution|full).*?(IRA|Roth|backdoor|pro-rata|nondeductible)/is,
    excludeContext: /(cash|buffer|checking|business operating|minimum|floor|target|expense)/i,
    coreContext: /(IRA|Roth|backdoor|pro-rata|nondeductible)/i,
    correctValue: /(?<![\d,])\$?7,500\b/
  },
  {
    id: 'stale_415c_69000_limit',
    severity: 'stale_or_wrong',
    factType: 'irs_limit',
    expected: '2026 section 415(c) defined-contribution annual additions limit is $72,000 before catch-up contributions.',
    observed: '$69,000 used as the current total defined-contribution, Solo 401(k), or mega-backdoor annual additions limit.',
    valuePattern: /(?<![\d,])\$?69,000\b/g,
    requiredContext:
      /(415\(c\)|annual additions|defined-contribution|defined contribution|Solo 401\(k\)|solo 401k|mega backdoor|total contribution|total limit)/i,
    excludeContext: /(cash|buffer|spending|expense|salary|income)/i,
    coreContext: /(limit|total|annual additions|Solo 401\(k\)|mega backdoor|defined contribution)/i,
    correctValue: /(?<![\d,])\$?72,000\b/
  },
  {
    id: 'stale_415c_70000_limit',
    severity: 'stale_or_wrong',
    factType: 'irs_limit',
    expected: '2026 section 415(c) defined-contribution annual additions limit is $72,000 before catch-up contributions.',
    observed: '$70,000 used as the current total defined-contribution, Solo 401(k), or mega-backdoor annual additions limit.',
    valuePattern: /(?<![\d,])\$?70,000\b/g,
    requiredContext:
      /(415\(c\)|annual additions|defined-contribution|defined contribution|Solo 401\(k\)|solo 401k|mega backdoor|total contribution|total limit)/i,
    excludeContext: /(cash|buffer|spending|expense|salary|income)/i,
    coreContext: /(limit|total|annual additions|Solo 401\(k\)|mega backdoor|defined contribution)/i,
    correctValue: /(?<![\d,])\$?72,000\b/
  },
  {
    id: 'stale_dependent_care_fsa_5000',
    severity: 'critical',
    factType: 'irs_limit',
    expected: '2026 dependent care assistance/DCAP/FSA exclusion limit is $7,500 for MFJ or single filers and $3,750 for MFS.',
    observed: '$5,000 used as the 2026 dependent care FSA/DCAP household limit.',
    valuePattern: /(?<![\d,])\$?5,000\b/g,
    requiredContext: /(dependent care|DCFSA|DCAP|childcare FSA|child care FSA|care FSA)/i,
    excludeContext: /(cash|buffer|checking|business operating|minimum|floor|target|deductible|home insured|liability|credit limit|salary|gross pay|old limit|former|formerly|previously|prior limit|up from|increased from|raised from|rose from|used to be|was \$?5,000|no longer)/i,
    coreContext: /(limit|household max|max|cap|contribute|elect|election|pre-tax|tax savings)/i,
    correctValue: /(?<![\d,])\$?7,500\b/
  },
  {
    id: 'stale_529_k12_10000_limit',
    severity: 'stale_or_wrong',
    factType: 'irs_limit',
    expected: '2026 federal K-12 529 qualified expense distribution limit is $20,000 per beneficiary.',
    observed: '$10,000 used as the current or 2026 K-12 529 limit.',
    valuePattern: /(?<![\d,])\$?10,000\b/g,
    requiredContext: /(529|qualified tuition plan).*?(K-12|elementary|secondary|private school|tuition).*?(limit|cap|distribution|withdrawal)|(?:K-12|elementary|secondary|private school|tuition).*?(529|qualified tuition plan).*?(limit|cap|distribution|withdrawal)/is,
    excludeContext: /(extra|windfall|cash|buffer|checking|expense|spending|savings goal|monthly|old limit|former|formerly|previously|prior limit|up from|increased from|raised from|used to be|no longer)/i,
    coreContext: /(limit|cap|distribution|withdrawal|qualified expense)/,
    correctValue: /(?<![\d,])\$?20,000\b/
  },
  {
    id: 'hsa_limit_vague_or_stale',
    severity: 'warning',
    factType: 'irs_limit',
    expected: '2026 HSA limit is $4,400 self-only or $8,750 family before catch-up.',
    observed: 'HSA limit discussed vaguely or relative to $3,600 without stating the applicable 2026 limit.',
    valuePattern: /(?<![\d,])\$?3,600\b/g,
    requiredContext: /(HSA|health savings).*?(limit|room|eligible|higher than|max)|(?:limit|room|eligible|higher than|max).*?(HSA|health savings)/is,
    excludeContext: /(529|rent|savings equals|expense|spending|tax-reserve|tax reserve)/i,
    coreContext: /(limit|room|higher than|max)/i,
    correctValue: /(?<![\d,])\$?4,400\b|(?<![\d,])\$?8,750\b/
  },
  {
    id: 'irs_limit_not_announced',
    severity: 'critical',
    factType: 'irs_limit',
    expected: 'Benchmark year 2026 IRS limits are locked and should be used.',
    observed: 'Response says a 2026 IRS limit has not been announced.',
    valuePattern: /not (?:yet )?(?:officially )?announced|hasn.?t been (?:officially )?announced/gim,
    requiredContext: /(2026|IRS|limit|401\(?k\)?|IRA|HSA|deferral)/i,
    coreContext: /(2026|IRS|limit)/i
  }
];

export function auditCurrentFacts(response: string, task?: Task, persona?: Persona): CurrentFactIssue[] {
  const issues: CurrentFactIssue[] = [];
  for (const rule of RULES) {
    for (const context of matchingWindows(response, rule.valuePattern)) {
      if (!rule.requiredContext.test(context)) continue;
      if (rule.excludeContext?.test(context)) continue;
      // If the correct current value also appears nearby, the stale number is a
      // deliberate old-vs-new contrast, not a stale citation — do not penalize.
      if (rule.correctValue?.test(context)) continue;
      const severity = isCoreIssue(context, rule, task, persona) ? rule.severity : soften(rule.severity);
      issues.push({
        id: rule.id,
        severity,
        factType: rule.factType,
        expected: rule.expected,
        observed: rule.observed,
        evidence: compactEvidence(context)
      });
      break;
    }
  }

  return issues;
}

export function formatCurrentFactIssues(issues: CurrentFactIssue[]): string {
  if (issues.length === 0) return '- None detected by heuristic scanner.';
  return issues
    .map(
      (issue) =>
        `- ${issue.id} [${issue.severity}; ${issue.factType}]: observed ${issue.observed} Expected: ${issue.expected} Evidence: "${issue.evidence}"`
    )
    .join('\n');
}

function matchingWindows(text: string, pattern: RegExp): string[] {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  const windows: string[] = [];
  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    windows.push(text.slice(Math.max(0, index - WINDOW), Math.min(text.length, index + WINDOW)));
  }
  return windows;
}

function isCoreIssue(context: string, rule: PatternRule, task?: Task, persona?: Persona): boolean {
  if (rule.severity === 'critical') return true;
  const taskText = `${task?.id ?? ''} ${task?.domain ?? ''} ${task?.prompt ?? ''} ${task?.intent ?? ''} ${task?.expectedAnswerNotes?.join(' ') ?? ''}`;
  const personaText = `${persona?.summary ?? ''} ${persona?.memories.map((memory) => memory.text).join(' ') ?? ''}`;
  const combined = `${context} ${taskText} ${personaText}`;
  return rule.coreContext?.test(combined) ?? false;
}

function soften(severity: CurrentFactIssueSeverity): CurrentFactIssueSeverity {
  if (severity === 'critical') return 'stale_or_wrong';
  return severity;
}

function compactEvidence(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 420);
}
