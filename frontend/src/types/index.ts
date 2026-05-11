// Type definitions for Career Readiness Analyzer

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  skillsLearning?: Array<{ skillId?: Skill; title?: string; startedAt?: string }>;
  completedRoadmaps?: Array<{ roadmapId?: CommunityRoadmap; title?: string; completedAt?: string }>;
  followersCount?: number;
  followingCount?: number;
  publicRoadmapCount?: number;
  privateRoadmapCount?: number;
  preferences?: {
    profileVisibility?: 'public' | 'private';
    learningGoal?: string;
  };
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

export interface RoadmapNode {
  _id?: string;
  skill?: string | Skill;
  title: string;
  description?: string;
  prerequisites?: string[];
  learningResources?: LearningResource[];
  estimatedCompletionTime?: string;
  order?: number;
}

export interface CommunityRoadmap {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  estimatedDuration?: string;
  thumbnail?: string;
  tags: string[];
  visibility: 'public' | 'private';
  author?: Pick<User, 'id' | '_id' | 'name' | 'username' | 'profileImage'>;
  nodes: RoadmapNode[];
  stats: {
    likes: number;
    saves: number;
    comments: number;
    forks: number;
    completions: number;
    views: number;
  };
  liked?: boolean;
  saved?: boolean;
  isOwner?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningResource {
  _id: string;
  skill?: Skill;
  skillSlug?: string;
  title: string;
  type: 'youtube' | 'documentation' | 'article' | 'course' | 'github' | 'practice';
  thumbnail?: string;
  creatorName?: string;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  tags: string[];
  sourceUrl: string;
  updateDate?: string;
  averageRating: number;
  ratingCount: number;
  reviewCount: number;
  completionCount: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  bookmarkCount: number;
  viewCount: number;
  rankingScore: number;
  badges?: string[];
}

export interface ResourceReview {
  _id: string;
  user: Pick<User, 'id' | '_id' | 'name' | 'username' | 'profileImage'>;
  resource: string | LearningResource;
  rating: number;
  review?: string;
  completed?: boolean;
  helpfulVotes?: string[];
  createdAt?: string;
}

export interface ActivityItem {
  _id: string;
  user: Pick<User, 'id' | '_id' | 'name' | 'username' | 'profileImage'>;
  type: 'completed_roadmap' | 'created_roadmap' | 'liked_resource' | 'started_skill' | 'followed_user' | 'reviewed_resource';
  entityType: 'roadmap' | 'resource' | 'skill' | 'user';
  entity?: string;
  metadata?: Record<string, any>;
  visibility: 'public' | 'private';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SkillHub {
  skill: Skill;
  roadmaps: CommunityRoadmap[];
  resources: LearningResource[];
  relatedSkills: Skill[];
  projects: string[];
  interviewQuestions: string[];
  estimatedLearningTime: string;
}
