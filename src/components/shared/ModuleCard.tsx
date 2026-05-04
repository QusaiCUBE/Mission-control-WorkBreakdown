import { Module, Developer } from '../../types';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import DeveloperAvatar from './DeveloperAvatar';
import { getModuleOverallProgress } from '../../utils/progress';
import { formatDate, isOverdue } from '../../utils/dates';

interface ModuleCardProps {
  module: Module;
  developers: [Developer, Developer];
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  onDelete?: () => void;
}

export default function ModuleCard({
  module,
  developers,
  onClick,
  draggable,
  onDragStart,
  isDragging,
  onDelete,
}: ModuleCardProps) {
  const isBoth = module.assignedTo === 'both';
  const assignedDev = isBoth ? null : developers.find((d) => d.id === module.assignedTo);
  const progress = getModuleOverallProgress(module);
  const overdue = isOverdue(module.dueDate) && module.status !== 'done';
  const leftColor = isBoth ? '#8B5CF6' : (assignedDev?.color || '#6B7280');

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group relative bg-bg-secondary border border-border-primary rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: leftColor,
      }}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="text-sm font-medium text-white leading-tight flex-1 min-w-0">{module.name}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <PriorityBadge priority={module.priority} />
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              title="Delete module"
              aria-label={`Delete ${module.name}`}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-status-overdue transition-opacity p-0.5 rounded"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{module.description}</p>

      {module.status !== 'done' && <ProgressBar value={progress} size="sm" />}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {isBoth ? (
            <DeveloperAvatar name="Both" color="#8B5CF6" />
          ) : assignedDev ? (
            <DeveloperAvatar name={assignedDev.name} color={assignedDev.color} />
          ) : (
            <span className="text-xs text-gray-500">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {module.status !== 'done' && module.dueDate ? (
            <span className={`text-xs ${overdue ? 'text-status-overdue' : 'text-gray-500'}`}>
              Due {formatDate(module.dueDate)}
            </span>
          ) : null}
          <StatusBadge status={module.status} isOverdue={overdue} />
        </div>
      </div>
    </div>
  );
}
