// Type definitions for Career Readiness Analyzer

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Skill {
  _id: string;
  name: string;
  type: 'skill' | 'subject' | 'topic';
  domain: string;
  subdomain?: string;
  category: 'Foundation' | 'Core' | 'Advanced';
  weight: number;
  importanceLevel: 'critical' | 'recommended' | 'optional';
  dependencies?: Skill[];
  substitutes?: Skill[];
  recommendations?: Skill[];
  tooltip?: {
    whyItMatters?: string;
    whereUsed?: string;
  };
  tags?: string[];
}

export interface KnownSkill {
  skillId: string;
  proficiency: 'basic' | 'intermediate' | 'advanced';
}

export interface CareerPath {
  _id: string;
  name: string;
  domain: string;
  subdomain?: string;
  description: string;
  icon?: string;
  tags: string[];
  estimatedMonths?: number;
  roadmap: Skill[];
}

export interface ReadinessLevel {
  label: string;
  color: string;
  emoji: string;
}

export interface CategoryBreakdown {
  [key: string]: {
    score: number;
    earned: number;
    total: number;
  };
}

export interface Warning {
  skill: string;
  message: string;
  type: string;
  missingDep: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Insight {
  type: 'strength' | 'weakness' | 'warning';
  message: string;
}

export interface Recommendation {
  _id: string;
  name: string;
  category: string;
  importanceLevel: string;
  type: string;
  tooltip?: { whyItMatters?: string; whereUsed?: string };
  reason: string;
}

export interface CrossDomainHint {
  message: string;
  targetDomains: string[];
}

export interface EvaluationResult {
  careerPath: { _id: string; name: string; domain: string };
  score: number;
  level: ReadinessLevel;
  categoryBreakdown: CategoryBreakdown;
  missingSkills: Skill[];
  warnings: Warning[];
  estimatedWeeks: number;
  totalSkills: number;
  knownCount: number;
  insights: Insight[];
  categoryProfile: { foundationalPct: number; corePct: number; advancedPct: number };
  recommendations: Recommendation[];
  crossDomainHints: CrossDomainHint[];
}
