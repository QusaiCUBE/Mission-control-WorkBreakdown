import { ModuleStatus } from '../../types';
import { STATUS_LABELS, STATUS_COLORS, OVERDUE_COLOR } from '../../constants';

interface StatusBadgeProps {
  status: ModuleStatus;
  isOverdue?: boolean;
}

export default function StatusBadge({ status, isOverdue }: StatusBadgeProps) {
  const color = isOverdue && status !== 'done' ? OVERDUE_COLOR : STATUS_COLORS[status];
  const label = isOverdue && status !== 'done' ? 'Overdue' : STATUS_LABELS[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
