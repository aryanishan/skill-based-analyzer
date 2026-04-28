import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSearchIndex } from '../hooks/useSearchIndex';
import {
  getTypeLabel,
  loadRecentSearches,
  recordRecentSearch,
  searchItems,
  SearchItemType,
} from '../utils/search';

const TYPE_FILTERS: Array<'all' | SearchItemType> = ['all', 'career_path', 'skill', 'roadmap', 'domain', 'course', 'user'];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return <>{text}</>;

  const matcher = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');

  return (
    <>
      {text.split(matcher).map((part, index) => {
        const matched = terms.some(term => part.toLowerCase() === term);
        return matched ? (
          <mark key={`${part}-${index}`} className="rounded bg-[color:var(--brand-soft)] px-0.5 text-[color:var(--brand-strong)]">
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        );
      })}
    </>
  );
}

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, loading } = useSearchIndex();
  const [typeFilter, setTypeFilter] = useState<'all' | SearchItemType>('all');
  const query = params.get('q') || '';
  const debouncedQuery = useDebouncedValue(query, 160);

  useEffect(() => {
    if (query.trim()) recordRecentSearch(query);
  }, [query]);

  const results = useMemo(() => searchItems(items, debouncedQuery), [items, debouncedQuery]);
  const filtered = useMemo(
    () => (typeFilter === 'all' ? results : results.filter(item => item.type === typeFilter)),
    [results, typeFilter]
  );

  const counts = useMemo(() => {
    const next = new Map<SearchItemType, number>();
    results.forEach(item => next.set(item.type, (next.get(item.type) || 0) + 1));
    return next;
  }, [results]);

  const recentSearches = useMemo(() => loadRecentSearches(), [query]);

  const updateQuery = (value: string) => {
    setParams(value.trim() ? { q: value } : {});
  };

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="eyebrow">Search</div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[color:var(--text-main)]">
              {query ? `Results for "${query}"` : 'Search the workspace'}
            </h1>
          </div>
          <GlobalSearch className="w-full lg:w-[440px]" />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={event => updateQuery(event.target.value)}
            placeholder="Search users, skills, paths, roadmaps, domains, courses"
            className="input-compact w-full sm:max-w-xl"
          />
          <div className="text-sm text-[color:var(--text-muted)]">
            {loading ? 'Loading index...' : `${filtered.length} of ${results.length} matches`}
          </div>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(filter => {
            const active = typeFilter === filter;
            const label = filter === 'all' ? 'All' : getTypeLabel(filter);
            const count = filter === 'all' ? results.length : counts.get(filter) || 0;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setTypeFilter(filter)}
                className={`segmented-button ${active ? 'segmented-button-active' : ''}`}
              >
                {label}
                <span className="ml-2 text-[11px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {query.trim() ? (
        <section className="dashboard-card overflow-hidden !p-0">
          {filtered.length > 0 ? (
            <div className="divide-y divide-[color:var(--border-soft)]">
              {filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="grid w-full gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--surface-muted)] md:grid-cols-[140px_minmax(0,1fr)_150px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="status-dot bg-[color:var(--brand-strong)]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">
                      <Highlight text={item.title} query={query} />
                    </div>
                    <div className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                      <Highlight text={item.subtitle} query={query} />
                    </div>
                    {item.description && (
                      <div className="mt-1 line-clamp-1 text-xs text-[color:var(--text-soft)]">
                        <Highlight text={item.description} query={query} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="truncate text-xs text-[color:var(--text-muted)]">{item.meta}</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border-soft)] text-[color:var(--text-main)]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M7 17 17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-sm font-bold text-[color:var(--text-main)]">
                0
              </div>
              <div className="mt-3 text-base font-semibold text-[color:var(--text-main)]">No results found</div>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">Try another user, skill, domain, course, or path.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="dashboard-card">
            <div className="eyebrow">Index</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TYPE_FILTERS.filter(filter => filter !== 'all').map(filter => (
                <div key={filter} className="metric-card">
                  <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    {getTypeLabel(filter as SearchItemType)}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{counts.get(filter as SearchItemType) || 0}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="eyebrow">Recent Searches</div>
            <div className="mt-3 space-y-2">
              {recentSearches.length ? (
                recentSearches.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setParams({ q: item })}
                    className="flex w-full items-center justify-between rounded-md border border-[color:var(--border-soft)] px-3 py-2 text-left text-sm text-[color:var(--text-main)] transition hover:bg-[color:var(--surface-muted)]"
                  >
                    <span className="truncate">{item}</span>
                    <span className="text-[color:var(--text-muted)]">Search</span>
                  </button>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Recent searches will appear here.</div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
