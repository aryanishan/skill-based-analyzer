interface LogoBadgeProps {
  label: string;
  className?: string;
}

export default function LogoBadge({ label, className = '' }: LogoBadgeProps) {
  const hasCustomBackground = /\bbg-/.test(className);
  const hasCustomTextColor = /\btext-(white|black|\[#|\[color:)/.test(className);
  const fallbackBackground = hasCustomBackground ? '' : 'bg-[color:var(--surface-strong)]';
  const fallbackTextColor = hasCustomTextColor ? '' : 'text-[color:var(--text-main)]';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-[12px] border border-[color:var(--border-soft)] ${fallbackBackground} ${fallbackTextColor} font-bold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] ${className}`.trim()}
    >
      <span className="block max-w-full overflow-hidden text-center leading-none">{label}</span>
    </div>
  );
}
