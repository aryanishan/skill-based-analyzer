import { KnownSkill } from '../types';

const STORAGE_KEY = 'career_path_progress';

type StoredProgress = Record<string, KnownSkill[]>;

function readStore(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getPathProgress(pathId: string): KnownSkill[] {
  const store = readStore();
  return Array.isArray(store[pathId]) ? store[pathId] : [];
}

export function savePathProgress(pathId: string, knownSkills: KnownSkill[]) {
  const store = readStore();
  store[pathId] = knownSkills;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
