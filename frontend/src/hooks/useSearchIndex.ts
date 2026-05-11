import { useEffect, useMemo, useState } from 'react';
import { getCareerPaths, getResources, getRoadmaps, getSkills } from '../api';
import { useAuth } from '../context/AuthContext';
import { CareerPath, CommunityRoadmap, LearningResource, Skill } from '../types';
import { buildSearchIndex, SearchItem } from '../utils/search';

interface SearchIndexState {
  items: SearchItem[];
  paths: CareerPath[];
  skills: Skill[];
  roadmaps: CommunityRoadmap[];
  resources: LearningResource[];
  loading: boolean;
}

let cachedPaths: CareerPath[] | null = null;
let cachedSkills: Skill[] | null = null;
let cachedRoadmaps: CommunityRoadmap[] | null = null;
let cachedResources: LearningResource[] | null = null;

export function useSearchIndex(): SearchIndexState {
  const { user } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>(cachedPaths || []);
  const [skills, setSkills] = useState<Skill[]>(cachedSkills || []);
  const [roadmaps, setRoadmaps] = useState<CommunityRoadmap[]>(cachedRoadmaps || []);
  const [resources, setResources] = useState<LearningResource[]>(cachedResources || []);
  const [loading, setLoading] = useState(!cachedPaths || !cachedSkills || !cachedRoadmaps || !cachedResources);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (cachedPaths && cachedSkills && cachedRoadmaps && cachedResources) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [pathsRes, skillsRes, roadmapsRes, resourcesRes] = await Promise.all([
          getCareerPaths(),
          getSkills(),
          getRoadmaps({ limit: 50 }),
          getResources({ limit: 50 }),
        ]);
        if (!alive) return;

        cachedPaths = pathsRes.data;
        cachedSkills = skillsRes.data;
        const roadmapsData = roadmapsRes.data.data || [];
        const resourcesData = resourcesRes.data.data || [];
        cachedRoadmaps = roadmapsData;
        cachedResources = resourcesData;
        setPaths(pathsRes.data);
        setSkills(skillsRes.data);
        setRoadmaps(roadmapsData);
        setResources(resourcesData);
      } catch {
        if (!alive) return;
        setPaths(cachedPaths || []);
        setSkills(cachedSkills || []);
        setRoadmaps(cachedRoadmaps || []);
        setResources(cachedResources || []);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => buildSearchIndex({ paths, skills, user, roadmaps, resources }), [paths, skills, user, roadmaps, resources]);

  return { items, paths, skills, roadmaps, resources, loading };
}
