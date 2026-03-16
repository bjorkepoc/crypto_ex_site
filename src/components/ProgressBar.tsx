interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  color?: "green" | "yellow" | "red" | "blue";
}

const colorClasses = {
  green: "bg-th-success",
  yellow: "bg-th-warning",
  red: "bg-th-error",
  blue: "bg-th-accent",
};

export default function ProgressBar({
  value,
  label,
  color = "blue",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-th-text-muted">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-th-bar">
        <div
          className={`h-full rounded-full transition-all ${colorClasses[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
