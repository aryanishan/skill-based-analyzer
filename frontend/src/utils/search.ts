import { CareerPath, Skill, User } from '../types';

export type SearchItemType = 'user' | 'skill' | 'career_path' | 'roadmap' | 'domain' | 'course';

export interface SearchItem {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle: string;
  description?: string;
  href: string;
  keywords: string[];
  meta?: string;
}

export const SEARCH_HISTORY_KEY = 'career_global_recent_searches';
export const DASHBOARD_HISTORY_KEY = 'career_dashboard_history';

const TYPE_PRIORITY: Record<SearchItemType, number> = {
  career_path: 6,
  skill: 5,
  roadmap: 4,
  domain: 3,
  course: 2,
  user: 1,
};

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function getTypeLabel(type: SearchItemType) {
  const labels: Record<SearchItemType, string> = {
    user: 'User',
    skill: 'Skill',
    career_path: 'Path',
    roadmap: 'Roadmap',
    domain: 'Domain',
    course: 'Course',
  };

  return labels[type];
}

export function buildSearchIndex({
  paths,
  skills,
  user,
}: {
  paths: CareerPath[];
  skills: Skill[];
  user: User | null;
}): SearchItem[] {
  const items: SearchItem[] = [];
  const pathForSkill = new Map<string, CareerPath>();

  paths.forEach(path => {
    path.roadmap?.forEach(skill => {
      if (!pathForSkill.has(skill._id)) {
        pathForSkill.set(skill._id, path);
      }
    });
  });

  if (user) {
    items.push({
      id: `user-${user.id}`,
      type: 'user',
      title: user.name,
      subtitle: user.email,
      description: 'Signed-in workspace profile',
      href: '/dashboard',
      keywords: [user.name, user.email, 'profile', 'user', 'account'],
      meta: 'Workspace user',
    });
  }

  const domains = new Map<string, { count: number; broadDomain?: string }>();
  paths.forEach(path => {
    domains.set(path.domain, {
      count: (domains.get(path.domain)?.count || 0) + 1,
      broadDomain: path.domain,
    });
    if (path.subdomain) {
      domains.set(path.subdomain, {
        count: (domains.get(path.subdomain)?.count || 0) + 1,
        broadDomain: path.domain,
      });
    }
  });
  skills.forEach(skill => {
    const previous = domains.get(skill.domain);
    domains.set(skill.domain, {
      count: (previous?.count || 0) + 1,
      broadDomain: previous?.broadDomain,
    });
  });

  domains.forEach((domain, name) => {
    const params = domain.broadDomain
      ? `domain=${encodeURIComponent(domain.broadDomain)}&q=${encodeURIComponent(name)}`
      : `q=${encodeURIComponent(name)}`;

    items.push({
      id: `domain-${name}`,
      type: 'domain',
      title: name,
      subtitle: `${domain.count} indexed items`,
      description: 'Domain coverage across paths, skills, and roadmaps',
      href: `/career-paths?${params}`,
      keywords: [name, domain.broadDomain || '', 'domain', 'library'],
      meta: 'Domain',
    });
  });

  paths.forEach(path => {
    items.push({
      id: `path-${path._id}`,
      type: 'career_path',
      title: path.name,
      subtitle: `${path.domain}${path.subdomain ? ` / ${path.subdomain}` : ''}`,
      description: path.description,
      href: `/skills/${path._id}`,
      keywords: [path.name, path.domain, path.subdomain || '', ...(path.tags || []), 'career path', 'role'],
      meta: path.estimatedMonths ? `${path.estimatedMonths} month plan` : 'Path',
    });

    items.push({
      id: `roadmap-${path._id}`,
      type: 'roadmap',
      title: `${path.name} roadmap`,
      subtitle: `${path.roadmap?.length || 0} milestones`,
      description: path.description,
      href: `/roadmap/${path._id}`,
      keywords: [path.name, path.domain, path.subdomain || '', ...(path.tags || []), 'roadmap', 'learning plan'],
      meta: 'Roadmap',
    });
  });

  skills.forEach(skill => {
    const relatedPath = pathForSkill.get(skill._id);
    const href = relatedPath ? `/skills/${relatedPath._id}?skill=${encodeURIComponent(skill._id)}` : '/career-paths';

    items.push({
      id: `skill-${skill._id}`,
      type: 'skill',
      title: skill.name,
      subtitle: `${skill.category} ${skill.type} / ${skill.domain}`,
      description: skill.tooltip?.whyItMatters || skill.tooltip?.whereUsed,
      href,
      keywords: [
        skill.name,
        skill.domain,
        skill.subdomain || '',
        skill.category,
        skill.type,
        skill.importanceLevel,
        ...(skill.tags || []),
        relatedPath?.name || '',
      ],
      meta: skill.importanceLevel,
    });

    items.push({
      id: `course-${skill._id}`,
      type: 'course',
      title: `${skill.name} course`,
      subtitle: `${skill.category} module / ${skill.domain}`,
      description: skill.tooltip?.whereUsed || `Guided learning module for ${skill.name}`,
      href,
      keywords: [
        skill.name,
        skill.domain,
        skill.category,
        skill.type,
        ...(skill.tags || []),
        'course',
        'module',
        'lesson',
      ],
      meta: relatedPath?.name || 'Course',
    });
  });

  return items;
}

export function searchItems(items: SearchItem[], query: string, limit?: number) {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  const scored = items
    .map(item => {
      const title = normalizeSearch(item.title);
      const subtitle = normalizeSearch(item.subtitle);
      const description = normalizeSearch(item.description || '');
      const keywords = item.keywords.map(normalizeSearch);
      const haystack = [title, subtitle, description, ...keywords].join(' ');

      if (!terms.every(term => haystack.includes(term))) {
        return null;
      }

      let score = TYPE_PRIORITY[item.type] * 4;
      terms.forEach(term => {
        if (title === term) score += 80;
        if (title.startsWith(term)) score += 50;
        if (title.includes(term)) score += 34;
        if (subtitle.includes(term)) score += 18;
        if (keywords.some(keyword => keyword === term || keyword.startsWith(term))) score += 24;
        if (keywords.some(keyword => keyword.includes(term))) score += 12;
        if (description.includes(term)) score += 5;
      });

      return { item, score };
    })
    .filter(Boolean) as Array<{ item: SearchItem; score: number }>;

  const results = scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(entry => entry.item);

  return typeof limit === 'number' ? results.slice(0, limit) : results;
}

export function loadRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function recordRecentSearch(query: string) {
  const normalized = query.trim();
  if (!normalized) return;

  const updated = [normalized, ...loadRecentSearches().filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}
