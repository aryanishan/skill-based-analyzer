import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-purple animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Analyzing your career path...</p>
      </div>
    </div>
  );
}
