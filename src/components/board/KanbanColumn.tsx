import { Module, Developer, ModuleStatus } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import KanbanCard from './KanbanCard';
import EmptyState from '../shared/EmptyState';

interface KanbanColumnProps {
  status: ModuleStatus;
  modules: Module[];
  developers: [Developer, Developer];
  isDropTarget: boolean;
  onModuleClick: (moduleId: string) => void;
  onDragStart: (e: React.DragEvent, moduleId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDeleteModule?: (moduleId: string) => void;
}

export default function KanbanColumn({
  status,
  modules,
  developers,
  isDropTarget,
  onModuleClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onDeleteModule,
}: KanbanColumnProps) {
  const color = STATUS_COLORS[status];

  return (
    <div
      className={`flex-1 min-w-[280px] bg-bg-primary rounded-xl border transition-colors duration-200 ${
        isDropTarget ? 'border-christian bg-christian/5' : 'border-border-primary'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="p-3 border-b border-border-primary flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold text-white">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-gray-500 ml-auto">{modules.length}</span>
      </div>

      <div className="p-3 space-y-3 min-h-[200px]">
        {modules.length === 0 ? (
          <EmptyState message="No modules" />
        ) : (
          modules.map((module) => (
            <KanbanCard
              key={module.id}
              module={module}
              developers={developers}
              onClick={() => onModuleClick(module.id)}
              onDragStart={(e) => onDragStart(e, module.id)}
              onDragEnd={onDragEnd}
              onDelete={onDeleteModule ? () => onDeleteModule(module.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
