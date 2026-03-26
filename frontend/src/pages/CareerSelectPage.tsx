import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const DOMAINS = ['All', 'Software/IT', 'Core Engineering', 'Government Exams', 'General'];

const DOMAIN_STYLES: Record<string, { band: string; badge: string; icon: string }> = {
  'Software/IT': {
    band: 'from-sky-500 via-cyan-500 to-teal-500',
    badge: 'bg-sky-500/12 text-sky-600 dark:text-sky-300 border border-sky-500/20',
    icon: 'IT',
  },
  'Core Engineering': {
    band: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/20',
    icon: 'CE',
  },
  'Government Exams': {
    band: 'from-rose-500 via-orange-500 to-amber-500',
    badge: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border border-rose-500/20',
    icon: 'GX',
  },
  General: {
    band: 'from-emerald-500 via-teal-500 to-cyan-500',
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
              Explore career paths with clearer structure, stronger color cues, and sharper focus.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-soft)]">
              Search by path, narrow by domain, and pick a roadmap that fits where you are now. Each section is color-coded so the experience feels more like a product and less like a template.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Career Paths', value: paths.length, icon: 'CP', tone: 'from-sky-500 to-cyan-500' },
              { label: 'Domains', value: 4, icon: 'DM', tone: 'from-amber-500 to-orange-500' },
              { label: 'Skills Tracked', value: '100+', icon: 'SK', tone: 'from-emerald-500 to-teal-500' },
              { label: 'Insights', value: 'Live', icon: 'IN', tone: 'from-rose-500 to-orange-500' },
            ].map(item => (
              <div key={item.label} className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4">
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
          <LogoBadge label="SR" className="h-11 w-11 text-[10px] bg-gradient-to-br from-slate-700 to-slate-500" />
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[color:var(--text-main)] text-[color:var(--bg-main)]'
                    : 'bg-[color:var(--surface-strong)] text-[color:var(--text-muted)]'
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
            <LogoBadge label="NF" className="h-14 w-14 text-sm bg-gradient-to-br from-slate-600 to-slate-400" />
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
    <button onClick={onSelect} className="card glass-hover text-left">
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${style.band}`} />

      <div className="mt-5 flex items-start justify-between gap-3">
        <LogoBadge label={path.icon || 'CR'} className={`h-12 w-12 text-[11px] bg-gradient-to-br ${style.band}`} />
        <span className={`badge ${style.badge}`}>{path.subdomain || path.domain}</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-[color:var(--text-main)]">{path.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{path.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {path.tags.slice(0, 4).map(tag => (
          <span key={tag} className="rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border-soft)] pt-4 text-sm">
        <span className="text-[color:var(--text-muted)]">{path.estimatedMonths ? `ETA ${path.estimatedMonths} months` : 'Flexible timeline'}</span>
        <span className="font-semibold text-sky-500">Open Path</span>
      </div>
    </button>
  );
}
