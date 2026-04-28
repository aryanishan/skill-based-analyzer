import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSearchIndex } from '../hooks/useSearchIndex';
import { getTypeLabel, recordRecentSearch, searchItems, SearchItem } from '../utils/search';

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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { items, loading } = useSearchIndex();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedQuery = useDebouncedValue(query, 170);

  const results = useMemo(() => searchItems(items, debouncedQuery, 8), [items, debouncedQuery]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const openSearchPage = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    recordRecentSearch(trimmed);
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const openItem = (item: SearchItem) => {
    recordRecentSearch(query || item.title);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(item.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(current => Math.min(current + 1, results.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(current => Math.max(current - 1, -1));
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        openItem(results[activeIndex]);
        return;
      }
      openSearchPage();
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="search-shell flex h-10 items-center gap-2">
        <span className="text-[color:var(--text-muted)]">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open && hasQuery}
          aria-controls="global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `global-search-result-${activeIndex}` : undefined}
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search users, skills, paths..."
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[color:var(--text-main)] outline-none placeholder:text-[color:var(--text-muted)]"
        />
      </div>

      {open && hasQuery && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-panel-strong)] shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl"
        >
          <div className="border-b border-[color:var(--border-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {loading ? 'Indexing workspace' : `${results.length} suggestions`}
          </div>

          {results.length > 0 ? (
            <div className="max-h-[390px] overflow-y-auto p-1.5">
              {results.map((item, index) => {
                const active = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    id={`global-search-result-${index}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => openItem(item)}
                    className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition ${
                      active ? 'bg-[color:var(--surface-muted)]' : 'hover:bg-[color:var(--surface-muted)]'
                    }`}
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-main)]">
                      {getTypeLabel(item.type).slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[color:var(--text-main)]">
                        <Highlight text={item.title} query={query} />
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[color:var(--text-muted)]">
                        <Highlight text={item.subtitle} query={query} />
                      </span>
                    </span>
                    <span className="shrink-0 text-[color:var(--text-muted)]">
                      <ArrowIcon />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="text-sm font-semibold text-[color:var(--text-main)]">No results found</div>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">Try another user, skill, domain, course, or path.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
