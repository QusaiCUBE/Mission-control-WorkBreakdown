import { Priority } from '../../types';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../constants';

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
