import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerPaths } from '../api';
import { CareerPath } from '../types';
import toast from 'react-hot-toast';
import LogoBadge from '../components/LogoBadge';

const DOMAINS = ['All', 'Software/IT', 'Core Engineering', 'Government Exams', 'General'];
const DOMAIN_COLORS: Record<string, string> = {
  'Software/IT': 'from-primary-600 to-accent-cyan',
  'Core Engineering': 'from-amber-500 to-orange-600',
  'Government Exams': 'from-accent-purple to-pink-600',
  General: 'from-accent-green to-teal-600',
};
const DOMAIN_BG: Record<string, string> = {
  'Software/IT': 'border-primary-500/30 hover:border-primary-400/60 hover:shadow-primary-500/10',
  'Core Engineering': 'border-amber-500/30 hover:border-amber-400/60 hover:shadow-amber-500/10',
  'Government Exams': 'border-accent-purple/30 hover:border-accent-purple/60 hover:shadow-purple-500/10',
  General: 'border-accent-green/30 hover:border-accent-green/60 hover:shadow-green-500/10',
};

export default function CareerSelectPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await getCareerPaths();
      setPaths(res.data);
    } catch {
      toast.error('Failed to load career paths');
    } finally {
      setLoading(false);
    }
  };

  const filtered = paths.filter(p => {
    const matchDomain = selectedDomain === 'All' || p.domain === selectedDomain;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDomain && matchSearch;
  });

  const grouped = DOMAINS.filter(d => d !== 'All').reduce((acc, domain) => {
    const domainPaths = filtered.filter(p => p.domain === domain);
    if (domainPaths.length) acc[domain] = domainPaths;
    return acc;
  }, {} as Record<string, CareerPath[]>);

  const handleSelect = (path: CareerPath) => {
    navigate(`/skills/${path._id}`, { state: { careerPath: path } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary-400 border border-primary-500/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Career Intelligence Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-white">Choose Your </span>
          <span className="gradient-text">Career Path</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto text-balance">
          Select a path to analyze your readiness with our AI-powered evaluation engine. Get personalized insights, gap analysis, and a study roadmap.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">SR</span>
          <input
            type="text"
            placeholder="Search paths or skills..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedDomain === d
                  ? 'bg-gradient-to-r from-primary-600 to-accent-purple text-white shadow-lg shadow-primary-600/20'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Career Paths', value: paths.length, icon: 'CP' },
          { label: 'Domains', value: 4, icon: 'DM' },
          { label: 'Skills Tracked', value: '100+', icon: 'SK' },
          { label: 'Smart Insights', value: 'AI', icon: 'AI' },
        ].map(stat => (
          <div key={stat.label} className="card text-center py-4">
            <div className="mb-2 flex justify-center">
              <LogoBadge label={stat.icon} className="w-10 h-10 text-[10px]" />
            </div>
            <div className="text-2xl font-bold gradient-text">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-surface-800/50" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([domain, domainPaths]) => (
          <div key={domain} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${DOMAIN_COLORS[domain]}`} />
              <h2 className="text-lg font-bold text-white">{domain}</h2>
              <span className="badge bg-surface-700 text-gray-400">{domainPaths.length} paths</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {domainPaths.map(path => (
                <PathCard
                  key={path._id}
                  path={path}
                  borderClass={DOMAIN_BG[domain]}
                  onSelect={() => handleSelect(path)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="mb-4 flex justify-center">
            <LogoBadge label="SR" className="w-14 h-14 text-sm" />
          </div>
          <p className="text-gray-400">No career paths match your search.</p>
        </div>
      )}
    </div>
  );
}

function PathCard({
  path, borderClass, onSelect
}: {
  path: CareerPath;
  borderClass: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group card text-left hover:shadow-xl w-full glass-hover border animate-fade-in ${borderClass} cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <LogoBadge label={path.icon || 'CR'} className="w-12 h-12 text-[11px] shadow-lg transition-transform group-hover:scale-110" />
        <span className="badge bg-surface-700/80 text-gray-400 text-[10px] uppercase tracking-wider">
          {path.subdomain || path.domain}
        </span>
      </div>

      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-primary-400 transition-colors leading-tight">
        {path.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{path.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {path.tags.slice(0, 4).map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-surface-700/80 text-gray-400 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {path.estimatedMonths && (
          <span className="text-xs text-gray-500">ETA ~{path.estimatedMonths} months</span>
        )}
        <span className="ml-auto text-sm font-semibold gradient-text group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Analyze {'->'}
        </span>
      </div>
    </button>
  );
}
