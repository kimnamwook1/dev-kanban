'use client';

interface ProgressBarProps {
  percent: number;
}

function getBarColor(percent: number): string {
  if (percent <= 33) return 'bg-priority-high';
  if (percent <= 66) return 'bg-priority-medium';
  return 'bg-[#2ECC71]';
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${getBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-text-secondary">
        {clamped}%
      </span>
    </div>
  );
}
