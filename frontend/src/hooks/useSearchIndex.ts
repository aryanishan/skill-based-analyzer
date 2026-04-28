import { useEffect, useMemo, useState } from 'react';
import { getCareerPaths, getSkills } from '../api';
import { useAuth } from '../context/AuthContext';
import { CareerPath, Skill } from '../types';
import { buildSearchIndex, SearchItem } from '../utils/search';

interface SearchIndexState {
  items: SearchItem[];
  paths: CareerPath[];
  skills: Skill[];
  loading: boolean;
}

let cachedPaths: CareerPath[] | null = null;
let cachedSkills: Skill[] | null = null;

export function useSearchIndex(): SearchIndexState {
  const { user } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>(cachedPaths || []);
  const [skills, setSkills] = useState<Skill[]>(cachedSkills || []);
  const [loading, setLoading] = useState(!cachedPaths || !cachedSkills);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (cachedPaths && cachedSkills) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [pathsRes, skillsRes] = await Promise.all([getCareerPaths(), getSkills()]);
        if (!alive) return;

        cachedPaths = pathsRes.data;
        cachedSkills = skillsRes.data;
        setPaths(pathsRes.data);
        setSkills(skillsRes.data);
      } catch {
        if (!alive) return;
        setPaths(cachedPaths || []);
        setSkills(cachedSkills || []);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => buildSearchIndex({ paths, skills, user }), [paths, skills, user]);

  return { items, paths, skills, loading };
}
