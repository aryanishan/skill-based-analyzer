interface LogoBadgeProps {
  label: string;
  className?: string;
}

export default function LogoBadge({ label, className = '' }: LogoBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-200 via-slate-100 to-white font-bold uppercase tracking-[0.2em] text-[#171925] ${className}`.trim()}
    >
      <span>{label}</span>
    </div>
  );
}
