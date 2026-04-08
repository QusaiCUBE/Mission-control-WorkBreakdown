import { Module, Developer } from '../../types';
import { STATUS_COLORS } from '../../constants';
import ProgressBar from '../shared/ProgressBar';
import { getModuleProgress } from '../../utils/progress';
import { isOverdue } from '../../utils/dates';

interface ModuleStatusGridProps {
  modules: Module[];
  developers: [Developer, Developer];
  onModuleClick: (moduleId: string) => void;
}

export default function ModuleStatusGrid({ modules, developers, onModuleClick }: ModuleStatusGridProps) {
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Modules at a Glance</h3>

      <div className="grid grid-cols-2 gap-2">
        {modules.map((module) => {
          const progress = getModuleProgress(module);
          const overdue = isOverdue(module.dueDate) && module.status !== 'done';
          const statusColor = overdue ? '#D63031' : STATUS_COLORS[module.status];
          const dev = developers.find((d) => d.id === module.assignedTo);

          return (
            <button
              key={module.id}
              onClick={() => onModuleClick(module.id)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
              style={{ borderLeft: `3px solid ${dev?.color || '#6B7280'}` }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{module.name}</p>
                <div className="mt-1">
                  <ProgressBar value={progress} size="sm" color={statusColor} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
