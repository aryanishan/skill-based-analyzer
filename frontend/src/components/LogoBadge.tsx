interface LogoBadgeProps {
  label: string;
  className?: string;
}

export default function LogoBadge({ label, className = '' }: LogoBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] font-bold uppercase tracking-[0.2em] text-[color:var(--text-main)] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] ${className}`.trim()}
    >
      <span>{label}</span>
    </div>
  );
}
