interface LogoBadgeProps {
  label: string;
  className?: string;
}

export default function LogoBadge({ label, className = '' }: LogoBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple font-bold uppercase tracking-[0.2em] text-white ${className}`.trim()}
    >
      <span>{label}</span>
    </div>
  );
}
