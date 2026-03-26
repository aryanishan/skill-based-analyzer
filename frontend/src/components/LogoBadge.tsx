interface LogoBadgeProps {
  label: string;
  className?: string;
}

export default function LogoBadge({ label, className = '' }: LogoBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-400 font-bold uppercase tracking-[0.2em] text-[#11170f] ${className}`.trim()}
    >
      <span>{label}</span>
    </div>
  );
}
