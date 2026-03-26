import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCareerPath } from '../api';
import { CareerPath, Skill, KnownSkill } from '../types';
import toast from 'react-hot-toast';
import LogoBadge from '../components/LogoBadge';

const PROFICIENCY_CYCLE: Array<KnownSkill['proficiency'] | null> = [null, 'basic', 'intermediate', 'advanced'];
const PROFICIENCY_LABEL: Record<string, string> = { basic: 'Basic', intermediate: 'Mid', advanced: 'Expert' };
const PROFICIENCY_COLOR: Record<string, string> = {
  basic: 'border-accent-amber/70 bg-accent-amber/10 text-accent-amber',
  intermediate: 'border-primary-500/70 bg-primary-500/10 text-primary-400',
  advanced: 'border-accent-green/70 bg-accent-green/10 text-accent-green',
};
const CATEGORY_ORDER = ['Foundation', 'Core', 'Advanced'];
const CATEGORY_COLOR: Record<string, string> = {
  Foundation: 'text-accent-amber border-accent-amber/30',
  Core: 'text-primary-400 border-primary-500/30',
  Advanced: 'text-accent-green border-accent-green/30',
};
const IMPORTANCE_COLOR: Record<string, string> = {
  critical: 'text-rose-400',
  recommended: 'text-primary-400',
  optional: 'text-gray-500',
};

export default function SkillInputPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>(
    (location.state as any)?.careerPath || null
  );
  const [loading, setLoading] = useState(!careerPath);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [knownSkills, setKnownSkills] = useState<Map<string, KnownSkill['proficiency']>>(new Map());
  const [filter, setFilter] = useState<string>('All');
  const [tooltip, setTooltip] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pathId) fetchPath(pathId);
  }, [pathId]);

  const fetchPath = async (id: string) => {
    try {
      const res = await getCareerPath(id);
      setCareerPath(res.data);
      setSkills(res.data.roadmap || []);
    } catch {
      toast.error('Failed to load career path');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = useCallback((skillId: string) => {
    setKnownSkills(prev => {
      const next = new Map(prev);
      const current = next.get(skillId);
      const idx = PROFICIENCY_CYCLE.indexOf(current || null);
      const nextVal = PROFICIENCY_CYCLE[(idx + 1) % PROFICIENCY_CYCLE.length];
      if (nextVal === null) next.delete(skillId);
      else next.set(skillId, nextVal);
      return next;
    });
  }, []);

  const skillsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const filtered = skills.filter(s => s.category === cat);
    if (filter !== 'All' && filter !== cat) return acc;
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, Skill[]>);

  const selectedCount = knownSkills.size;
  const totalCount = skills.length;
  const completionPct = totalCount ? Math.round((selectedCount / totalCount) * 100) : 0;

  const handleAnalyze = () => {
    if (knownSkills.size === 0) {
      toast.error('Please select at least one skill to analyze.');
      return;
    }
    const knownSkillsArr = Array.from(knownSkills.entries()).map(([skillId, proficiency]) => ({
      skillId, proficiency
    }));
    navigate('/dashboard', {
      state: { careerPathId: pathId, knownSkills: knownSkillsArr, careerPath }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
        >
          {'<-'} Back to Career Paths
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <LogoBadge label={careerPath?.icon || 'CR'} className="w-14 h-14 text-sm shadow-xl shadow-primary-600/20" />
            <div>
              <h1 className="text-2xl font-bold text-white">{careerPath?.name}</h1>
              <p className="text-gray-400 text-sm">{careerPath?.description}</p>
            </div>
          </div>
          <div className="sm:ml-auto card py-3 px-5 text-center min-w-[160px]">
            <div className="text-2xl font-bold gradient-text">{selectedCount} / {totalCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Skills Selected</div>
            <div className="progress-bar mt-2">
              <div className="progress-fill bg-gradient-to-r from-primary-500 to-accent-purple" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass border border-primary-500/20 rounded-xl p-4 mb-6 text-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          <span className="text-gray-300"><strong className="text-white">Click once</strong> = Basic</span>
          <span className="text-gray-300"><strong className="text-white">Click twice</strong> = Intermediate</span>
          <span className="text-gray-300"><strong className="text-white">Click three times</strong> = Expert</span>
          <span className="text-gray-300"><strong className="text-white">Click again</strong> = Deselect</span>
          <span className="text-gray-300"><strong className="text-white">Hover</strong> = Details</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', ...CATEGORY_ORDER].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-primary-600 to-accent-purple text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {Object.entries(skillsByCategory).map(([category, catSkills]) => (
            <div key={category} className="mb-8 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-bold border rounded-lg px-3 py-1 ${CATEGORY_COLOR[category]}`}>
                  {category}
                </span>
                <span className="text-xs text-gray-500">
                  {catSkills.filter(s => knownSkills.has(s._id)).length} / {catSkills.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {catSkills.map(skill => {
                  const proficiency = knownSkills.get(skill._id);
                  const isSelected = !!proficiency;
                  return (
                    <div key={skill._id} className="relative group">
                      <button
                        onMouseEnter={() => setTooltip(skill)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => toggleSkill(skill._id)}
                        className={`tag-skill transition-all duration-200 ${
                          isSelected
                            ? PROFICIENCY_COLOR[proficiency!]
                            : 'border-surface-600 bg-surface-800/60 text-gray-400 hover:border-surface-500 hover:text-gray-200 hover:bg-surface-700/60'
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${IMPORTANCE_COLOR[skill.importanceLevel]}`}>
                          {skill.importanceLevel === 'critical' ? 'CR' : skill.importanceLevel === 'recommended' ? 'RC' : 'OP'}
                        </span>
                        <span>{skill.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold opacity-80">
                            {PROFICIENCY_LABEL[proficiency!]}
                          </span>
                        )}
                      </button>
                      {tooltip?._id === skill._id && skill.tooltip && (
                        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 glass rounded-xl p-3 shadow-2xl border border-white/15 animate-fade-in pointer-events-none">
                          <p className="font-semibold text-white text-sm mb-1">{skill.name}</p>
                          {skill.tooltip.whyItMatters && (
                            <p className="text-xs text-gray-300 mb-1">
                              <span className="text-primary-400">Why:</span> {skill.tooltip.whyItMatters}
                            </p>
                          )}
                          {skill.tooltip.whereUsed && (
                            <p className="text-xs text-gray-300">
                              <span className="text-accent-green">Used in:</span> {skill.tooltip.whereUsed}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/8">
                            <span className={`text-[10px] font-bold ${IMPORTANCE_COLOR[skill.importanceLevel]}`}>
                              {skill.importanceLevel.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-[10px]">Weight: {skill.weight}/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="card">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Importance</p>
              <div className="space-y-2">
                {[
                  { key: 'critical', label: 'Critical', icon: 'CR', color: 'text-rose-400' },
                  { key: 'recommended', label: 'Recommended', icon: 'RC', color: 'text-primary-400' },
                  { key: 'optional', label: 'Optional', icon: 'OP', color: 'text-gray-500' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${item.color}`}>{item.icon}</span>
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 mt-4 pt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Proficiency</p>
                <div className="space-y-2">
                  {Object.entries(PROFICIENCY_COLOR).map(([key, colorClass]) => (
                    <div key={key} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 border ${colorClass}`}>
                      <span className="font-semibold capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Selection</p>
              {CATEGORY_ORDER.map(cat => {
                const catSkills = skills.filter(s => s.category === cat);
                const selectedInCat = catSkills.filter(s => knownSkills.has(s._id)).length;
                const pct = catSkills.length ? Math.round((selectedInCat / catSkills.length) * 100) : 0;
                return (
                  <div key={cat} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{cat}</span>
                      <span className="text-gray-300">{selectedInCat}/{catSkills.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-gradient-to-r from-primary-500 to-accent-purple" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={selectedCount === 0 || submitting}
              className="btn-primary w-full text-center text-base py-4 shadow-xl shadow-primary-600/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                `Analyze Readiness (${selectedCount})`
              )}
            </button>
            {selectedCount === 0 && (
              <p className="text-xs text-gray-500 text-center">Select at least one skill to proceed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
