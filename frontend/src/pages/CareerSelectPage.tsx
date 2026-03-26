import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const DOMAINS = ['All', 'Software/IT', 'Core Engineering', 'Government Exams', 'General'];

const DOMAIN_STYLES: Record<string, { band: string; badge: string; icon: string }> = {
  'Software/IT': {
    band: 'from-indigo-300 via-violet-300 to-slate-100',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/15',
    icon: 'IT',
  },
  'Core Engineering': {
    band: 'from-slate-300 via-slate-200 to-white',
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/15',
    icon: 'CE',
  },
  'Government Exams': {
    band: 'from-violet-300 via-indigo-200 to-white',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/15',
    icon: 'GX',
  },
  General: {
    band: 'from-zinc-200 via-slate-200 to-white',
    badge: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/15',
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
    <div className="section-shell">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <div className="theme-chip">Career Discovery</div>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-[color:var(--text-main)] sm:text-4xl">
              Compare career tracks in a cleaner workspace built for faster decisions.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--text-soft)]">
              Search, filter, and open a roadmap with less noise on screen. The layout now favors compact analytics styling, clearer grouping, and stronger contrast for the important actions.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {['Guided selection', 'Live skill mapping', 'Domain-based colors'].map(label => (
                <span key={label} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3.5 py-1.5 text-sm text-[color:var(--text-soft)]">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Career Paths', value: paths.length, icon: 'CP', tone: 'from-indigo-300 to-white' },
              { label: 'Domains', value: 4, icon: 'DM', tone: 'from-slate-300 to-white' },
              { label: 'Skills Tracked', value: '100+', icon: 'SK', tone: 'from-violet-200 to-white' },
              { label: 'Insights', value: 'Live', icon: 'IN', tone: 'from-slate-200 to-indigo-200' },
            ].map(item => (
              <div key={item.label} className="metric-tile rounded-[14px] p-3.5">
                <div className="flex items-center justify-between">
                  <LogoBadge label={item.icon} className={`h-9 w-9 text-[9px] bg-gradient-to-br ${item.tone}`} />
                  <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${item.tone}`} />
                </div>
                <div className="mt-5 text-xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="card flex items-center gap-3 p-3.5">
          <LogoBadge label="SR" className="h-10 w-10 text-[9px]" />
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

        <div className="card flex flex-wrap gap-2 p-3.5">
          {DOMAINS.map(domain => {
            const active = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#25283b] text-white shadow-[0_12px_28px_rgba(20,29,58,0.18)]'
                    : 'bg-[color:var(--surface-strong)] text-[color:var(--text-muted)] hover:bg-white/10'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card h-56 animate-pulse bg-[color:var(--surface-card)]" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
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

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="card mt-6 text-center">
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
      <div className={`h-1 rounded-full bg-gradient-to-r ${style.band}`} />

      <div className="mt-5 flex items-start justify-between gap-3">
        <LogoBadge label={path.icon || 'CR'} className={`h-12 w-12 text-[11px] bg-gradient-to-br ${style.band}`} />
        <span className={`badge ${style.badge}`}>{path.subdomain || path.domain}</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-[color:var(--text-main)]">{path.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{path.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {path.tags.slice(0, 4).map(tag => (
          <span key={tag} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border-soft)] pt-4 text-sm">
        <span className="text-[color:var(--text-muted)]">{path.estimatedMonths ? `ETA ${path.estimatedMonths} months` : 'Flexible timeline'}</span>
        <span className="font-semibold text-indigo-500 dark:text-indigo-300">Open Path</span>
      </div>
    </button>
  );
}
