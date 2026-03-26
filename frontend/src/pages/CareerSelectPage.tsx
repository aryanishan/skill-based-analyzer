import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const DOMAINS = ['All', 'Software/IT', 'Core Engineering', 'Government Exams', 'General'];

const DOMAIN_STYLES: Record<string, { band: string; badge: string; icon: string }> = {
  'Software/IT': {
    band: 'from-cyan-400 via-sky-500 to-violet-500',
    badge: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20',
    icon: 'IT',
  },
  'Core Engineering': {
    band: 'from-amber-400 via-orange-500 to-rose-500',
    badge: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/20',
    icon: 'CE',
  },
  'Government Exams': {
    band: 'from-fuchsia-500 via-pink-500 to-orange-400',
    badge: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/20',
    icon: 'GX',
  },
  General: {
    band: 'from-emerald-400 via-teal-500 to-cyan-500',
    badge: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
    icon: 'GN',
  },
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

  const filtered = paths.filter(path => {
    const matchDomain = selectedDomain === 'All' || path.domain === selectedDomain;
    const matchSearch = path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDomain && matchSearch;
  });

  const grouped = DOMAINS
    .filter(domain => domain !== 'All')
    .reduce((acc, domain) => {
      const domainPaths = filtered.filter(path => path.domain === domain);
      if (domainPaths.length) acc[domain] = domainPaths;
      return acc;
    }, {} as Record<string, CareerPath[]>);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="theme-chip">Career Discovery</div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-[color:var(--text-main)] sm:text-5xl">
              Pick a career track from a dashboard that feels fast, premium, and easier to scan.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-soft)]">
              Browse paths by domain, compare the tracks visually, and jump into analysis without losing context. Each area uses its own color family so the page feels more like a real workspace.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['Guided selection', 'Live skill mapping', 'Domain-based colors'].map(label => (
                <span key={label} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[color:var(--text-soft)]">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Career Paths', value: paths.length, icon: 'CP', tone: 'from-cyan-400 to-violet-500' },
              { label: 'Domains', value: 4, icon: 'DM', tone: 'from-amber-400 to-rose-500' },
              { label: 'Skills Tracked', value: '100+', icon: 'SK', tone: 'from-emerald-400 to-cyan-500' },
              { label: 'Insights', value: 'Live', icon: 'IN', tone: 'from-fuchsia-500 to-orange-400' },
            ].map(item => (
              <div key={item.label} className="rounded-[16px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <LogoBadge label={item.icon} className={`h-10 w-10 text-[10px] bg-gradient-to-br ${item.tone}`} />
                  <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.tone}`} />
                </div>
                <div className="mt-6 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="card flex items-center gap-3 p-4">
          <LogoBadge label="SR" className="h-11 w-11 text-[10px] bg-gradient-to-br from-fuchsia-500 to-violet-500" />
          <div className="flex-1">
            <div className="mb-2 text-sm font-medium text-[color:var(--text-soft)]">Search by career title or related skills</div>
            <input
              type="text"
              placeholder="Search paths or skills..."
              className="input-field"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card flex flex-wrap gap-2 p-4">
          {DOMAINS.map(domain => {
            const active = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_12px_28px_rgba(168,85,247,0.28)]'
                    : 'bg-black/20 text-[color:var(--text-muted)] hover:bg-white/10'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card h-64 animate-pulse bg-[color:var(--surface-card)]" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([domain, domainPaths]) => {
            const style = DOMAIN_STYLES[domain];
            return (
              <section key={domain} className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <LogoBadge label={style.icon} className={`h-10 w-10 text-[10px] bg-gradient-to-br ${style.band}`} />
                  <div>
                    <h2 className="text-2xl font-semibold text-[color:var(--text-main)]">{domain}</h2>
                    <p className="text-sm text-[color:var(--text-muted)]">{domainPaths.length} paths available</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {domainPaths.map(path => (
                    <PathCard key={path._id} path={path} onSelect={() => navigate(`/skills/${path._id}`, { state: { careerPath: path } })} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card mt-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <LogoBadge label="NF" className="h-14 w-14 text-sm bg-gradient-to-br from-fuchsia-500 to-orange-400" />
          </div>
          <p className="text-lg font-semibold text-[color:var(--text-main)]">No career paths match your search.</p>
          <p className="mt-2 text-[color:var(--text-muted)]">Try a different search term or switch to another domain.</p>
        </div>
      )}
    </div>
  );
}

function PathCard({ path, onSelect }: { path: CareerPath; onSelect: () => void }) {
  const style = DOMAIN_STYLES[path.domain] || DOMAIN_STYLES.General;

  return (
    <button onClick={onSelect} className="card glass-hover relative overflow-hidden text-left">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${style.band} opacity-20 blur-3xl`} />
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${style.band}`} />

      <div className="mt-5 flex items-start justify-between gap-3">
        <LogoBadge label={path.icon || 'CR'} className={`h-12 w-12 text-[11px] bg-gradient-to-br ${style.band}`} />
        <span className={`badge ${style.badge}`}>{path.subdomain || path.domain}</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-[color:var(--text-main)]">{path.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{path.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {path.tags.slice(0, 4).map(tag => (
          <span key={tag} className="rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border-soft)] pt-4 text-sm">
        <span className="text-[color:var(--text-muted)]">{path.estimatedMonths ? `ETA ${path.estimatedMonths} months` : 'Flexible timeline'}</span>
        <span className="font-semibold text-fuchsia-300">Open Path</span>
      </div>
    </button>
  );
}
