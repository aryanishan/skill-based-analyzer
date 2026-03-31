import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const DOMAINS = ['All', 'Software/IT', 'Core Engineering', 'Government Exams', 'General'];

const DOMAIN_STYLES: Record<string, { badge: string; panel: string; dot: string; icon: string }> = {
  'Software/IT': { badge: 'bg-[#f3e7bc] text-[#6c5310]', panel: 'bg-[#fff6db]', dot: 'bg-[#f3c94a]', icon: 'IT' },
  'Core Engineering': { badge: 'bg-[#d9dfd3] text-[#43503b]', panel: 'bg-[#eef2ea]', dot: 'bg-[#94a383]', icon: 'CE' },
  'Government Exams': { badge: 'bg-[#f7d7c8] text-[#7d4632]', panel: 'bg-[#fff1ea]', dot: 'bg-[#f18a57]', icon: 'GX' },
  General: { badge: 'bg-[#e4e6ea] text-[#4c5560]', panel: 'bg-[#f3f4f7]', dot: 'bg-[#7e8b95]', icon: 'GN' },
};

export default function CareerSelectPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

    void fetchPaths();
  }, []);

  const filtered = useMemo(() => paths.filter(path => {
    const matchDomain = selectedDomain === 'All' || path.domain === selectedDomain;
    const matchSearch = path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDomain && matchSearch;
  }), [paths, selectedDomain, searchQuery]);

  const grouped = useMemo(() => DOMAINS
    .filter(domain => domain !== 'All')
    .reduce((acc, domain) => {
      const domainPaths = filtered.filter(path => path.domain === domain);
      if (domainPaths.length) acc[domain] = domainPaths;
      return acc;
    }, {} as Record<string, CareerPath[]>), [filtered]);

  return (
    <div className="section-shell space-y-5">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="theme-chip">Career Catalog</div>
            <h1 className="mt-4 max-w-3xl font-['Sora'] text-4xl font-bold tracking-tight text-[color:var(--text-main)] sm:text-5xl">
              Choose a path the way you would browse a premium dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--text-soft)]">
              Every role card now lives inside the same dashboard visual system as the homepage, roadmap, and analytics views.
              Search by role or skill, then jump directly into marking what you already know.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Visible paths', value: filtered.length },
                { label: 'Domains', value: new Set(paths.map(path => path.domain)).size || 4 },
                { label: 'Skills indexed', value: paths.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0) || 0 },
              ].map(item => (
                <div key={item.label} className="mini-stat rounded-[28px] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{item.label}</div>
                  <div className="mt-3 text-3xl font-bold text-[color:var(--text-main)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card !p-4">
              <div className="text-sm font-medium text-[color:var(--text-soft)]">Search by role name or tags</div>
              <div className="mt-3 flex items-center gap-3 rounded-full border border-[color:var(--border-soft)] bg-white/50 px-4 py-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="6" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Search paths or skills..."
                  className="w-full bg-transparent text-sm text-[color:var(--text-main)] outline-none placeholder:text-[color:var(--text-muted)]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="card !p-4">
              <div className="text-sm font-medium text-[color:var(--text-soft)]">Filter by domain</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {DOMAINS.map(domain => {
                  const active = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-[color:var(--bg-dark)] text-[color:var(--text-on-dark)] shadow-[0_12px_24px_rgba(17,21,26,0.16)]'
                          : 'border border-[color:var(--border-soft)] bg-white/50 text-[color:var(--text-soft)]'
                      }`}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card h-72 animate-pulse bg-[color:var(--bg-panel)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([domain, domainPaths]) => {
            const style = DOMAIN_STYLES[domain];
            return (
              <section key={domain} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LogoBadge label={style.icon} className={`h-12 w-12 text-[10px] ${style.panel}`} />
                    <div>
                      <h2 className="font-['Sora'] text-2xl font-bold text-[color:var(--text-main)]">{domain}</h2>
                      <p className="text-sm text-[color:var(--text-muted)]">{domainPaths.length} curated options</p>
                    </div>
                  </div>
                  <span className={`badge rounded-full ${style.badge}`}>Active library section</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {domainPaths.map(path => (
                    <button
                      key={path._id}
                      type="button"
                      onClick={() => navigate(`/skills/${path._id}`, { state: { careerPath: path } })}
                      className="card glass-hover group relative overflow-hidden text-left"
                    >
                      <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-black/5 blur-2xl transition group-hover:scale-110" />
                      <div className="flex items-start justify-between gap-3">
                        <LogoBadge label={path.icon || style.icon} className={`h-14 w-14 text-[11px] ${style.panel}`} />
                        <span className={`badge rounded-full ${style.badge}`}>{path.subdomain || path.domain}</span>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                        Guided path
                      </div>

                      <h3 className="mt-3 text-2xl font-semibold text-[color:var(--text-main)]">{path.name}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{path.description}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {path.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="rounded-full border border-[color:var(--border-soft)] bg-white/50 px-3 py-1.5 text-xs font-medium text-[color:var(--text-muted)]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border-soft)] pt-4 text-sm">
                        <span className="text-[color:var(--text-muted)]">{path.estimatedMonths ? `${path.estimatedMonths} month plan` : 'Flexible timing'}</span>
                        <span className="font-semibold text-[color:var(--text-main)]">Start analysis</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <LogoBadge label="NF" className="h-14 w-14 bg-[#f4dcb8] text-sm" />
          </div>
          <p className="text-xl font-semibold text-[color:var(--text-main)]">No career paths match your search.</p>
          <p className="mt-2 text-[color:var(--text-muted)]">Try another keyword or switch domain filters.</p>
        </div>
      )}
    </div>
  );
}
