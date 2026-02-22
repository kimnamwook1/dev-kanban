'use client';

interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="inline-block rounded-full bg-white/8 px-2 py-0.5 text-xs text-text-secondary">
      {tag}
    </span>
  );
}
