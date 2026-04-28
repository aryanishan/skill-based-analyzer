import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

export default function CareerSelectPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState(params.get('domain') || 'All');
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
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

  useEffect(() => {
    const next: Record<string, string> = {};
    if (selectedDomain !== 'All') next.domain = selectedDomain;
    if (searchQuery.trim()) next.q = searchQuery.trim();
    setParams(next, { replace: true });
  }, [selectedDomain, searchQuery, setParams]);

  const domains = useMemo(() => ['All', ...Array.from(new Set(paths.map(path => path.domain)))], [paths]);

  const filtered = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return paths.filter(path => {
      const matchDomain = selectedDomain === 'All' || path.domain === selectedDomain;
      const matchSearch =
        !normalized ||
        [path.name, path.domain, path.subdomain || '', path.description, ...(path.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalized);
      return matchDomain && matchSearch;
    });
  }, [paths, selectedDomain, searchQuery]);

  const stats = useMemo(() => {
    const visibleSkills = filtered.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0);
    const months = filtered.length
      ? Math.round(filtered.reduce((sum, path) => sum + (path.estimatedMonths || 0), 0) / filtered.length)
      : 0;

    return [
      { label: 'Visible paths', value: filtered.length },
      { label: 'Indexed skills', value: visibleSkills },
      { label: 'Avg duration', value: `${months} mo` },
      { label: 'Domains', value: new Set(paths.map(path => path.domain)).size },
    ];
  }, [filtered, paths]);

  const domainBreakdown = useMemo(
    () =>
      domains
        .filter(domain => domain !== 'All')
        .map(domain => ({
          domain,
          count: paths.filter(path => path.domain === domain).length,
        })),
    [domains, paths]
  );

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="eyebrow">Career Catalog</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">Role and path library</h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Dense catalog browsing for roles, domains, roadmap length, and tags.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Filter paths, tags, domains..."
              className="input-compact w-full xl:w-[340px]"
            />
            <select className="input-compact w-full sm:w-[220px]" value={selectedDomain} onChange={event => setSelectedDomain(event.target.value)}>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="dashboard-card h-fit">
          <div className="eyebrow">Domains</div>
          <div className="mt-3 space-y-1.5">
            {domainBreakdown.map(item => {
              const active = selectedDomain === item.domain;
              return (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => setSelectedDomain(item.domain)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-[color:var(--bg-dark)] text-[color:var(--text-on-dark)]' : 'text-[color:var(--text-soft)] hover:bg-[color:var(--surface-muted)]'
                  }`}
                >
                  <span className="truncate">{item.domain}</span>
                  <span className="text-xs opacity-70">{item.count}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedDomain('All')}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                selectedDomain === 'All' ? 'bg-[color:var(--bg-dark)] text-[color:var(--text-on-dark)]' : 'text-[color:var(--text-soft)] hover:bg-[color:var(--surface-muted)]'
              }`}
            >
              <span>All domains</span>
              <span className="text-xs opacity-70">{paths.length}</span>
            </button>
          </div>
        </aside>

        <div className="dashboard-card overflow-hidden !p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)] md:grid-cols-[minmax(0,1fr)_170px_110px_120px]">
            <div>Path</div>
            <div className="hidden md:block">Domain</div>
            <div>Skills</div>
            <div>Timeline</div>
          </div>

          {loading ? (
            <div className="divide-y divide-[color:var(--border-soft)]">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-[68px] animate-pulse bg-[color:var(--surface-muted)]" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-[color:var(--border-soft)]">
              {filtered.map(path => (
                <button
                  key={path._id}
                  type="button"
                  onClick={() => navigate(`/skills/${path._id}`, { state: { careerPath: path } })}
                  className="grid w-full grid-cols-[minmax(0,1fr)_110px_110px] gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--surface-muted)] md:grid-cols-[minmax(0,1fr)_170px_110px_120px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoBadge label={path.icon || path.name.slice(0, 2)} className="h-9 w-9 rounded-md text-[8px]" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{path.name}</div>
                      <div className="mt-1 flex min-w-0 flex-wrap gap-1">
                        {path.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded-md border border-[color:var(--border-soft)] px-2 py-0.5 text-[11px] text-[color:var(--text-muted)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <div className="truncate text-sm text-[color:var(--text-main)]">{path.domain}</div>
                    <div className="truncate text-xs text-[color:var(--text-muted)]">{path.subdomain || 'General'}</div>
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--text-main)]">{path.roadmap?.length || 0}</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{path.estimatedMonths || 0} months</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <div className="text-base font-semibold text-[color:var(--text-main)]">No paths found</div>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">Adjust the domain or search filter.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
