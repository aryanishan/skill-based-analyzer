import React from 'react';
import LogoBadge from './LogoBadge';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card radial-panel flex flex-col items-center gap-5 px-10 py-10">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/10 dark:border-slate-700/80" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1c768f] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-amber-500 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoBadge label="AI" className="h-10 w-10 text-[10px]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[color:var(--text-main)]">Preparing your workspace</p>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Analyzing your career path and loading insights.</p>
        </div>
      </div>
    </div>
  );
}
