'use client';

import type { Priority } from '@/lib/types';

interface PriorityIndicatorProps {
  priority: Priority;
}

const priorityColorMap: Record<Priority, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${priorityColorMap[priority]}`}
      title={`${priority} priority`}
    />
  );
}
