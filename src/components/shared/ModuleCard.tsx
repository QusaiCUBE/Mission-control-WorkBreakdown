import { Module, Developer } from '../../types';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import DeveloperAvatar from './DeveloperAvatar';
import { getModuleProgress } from '../../utils/progress';
import { formatDate, isOverdue } from '../../utils/dates';

interface ModuleCardProps {
  module: Module;
  developers: [Developer, Developer];
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export default function ModuleCard({
  module,
  developers,
  onClick,
  draggable,
  onDragStart,
  isDragging,
}: ModuleCardProps) {
  const isBoth = module.assignedTo === 'both';
  const assignedDev = isBoth ? null : developers.find((d) => d.id === module.assignedTo);
  const progress = getModuleProgress(module);
  const overdue = isOverdue(module.dueDate) && module.status !== 'done';
  const docsNeeded = module.documents.filter((d) => d.status === 'needed').length;
  const leftColor = isBoth ? '#8B5CF6' : (assignedDev?.color || '#6B7280');

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`bg-bg-secondary border border-border-primary rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: leftColor,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-white leading-tight">{module.name}</h3>
        <PriorityBadge priority={module.priority} />
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{module.description}</p>

      <ProgressBar value={progress} size="sm" />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {isBoth ? (
            <DeveloperAvatar name="Both" color="#8B5CF6" />
          ) : assignedDev ? (
            <DeveloperAvatar name={assignedDev.name} color={assignedDev.color} />
          ) : (
            <span className="text-xs text-gray-500">Unassigned</span>
          )}
          {docsNeeded > 0 && (
            <span className="text-xs text-status-overdue">{docsNeeded} doc{docsNeeded > 1 ? 's' : ''} needed</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {module.status === 'done' && module.completedDate ? (
            <span className="text-xs text-status-done">
              Done {formatDate(module.completedDate)}
            </span>
          ) : module.dueDate ? (
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
