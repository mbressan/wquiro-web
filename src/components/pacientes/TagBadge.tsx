import type { PatientTag } from '@/types/patient';

interface TagBadgeProps {
  tag: PatientTag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}
