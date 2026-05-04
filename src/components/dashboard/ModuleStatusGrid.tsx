import { Module, Developer } from '../../types';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants';
import ProgressBar from '../shared/ProgressBar';
import { getModuleProgress, getModuleOverallProgress } from '../../utils/progress';
import { isOverdue, formatDate } from '../../utils/dates';

interface ModuleStatusGridProps {
  modules: Module[];
  developers: [Developer, Developer];
  onModuleClick: (moduleId: string) => void;
}

export default function ModuleStatusGrid({ modules, developers, onModuleClick }: ModuleStatusGridProps) {
  const sortedModules = [...modules].sort(
    (a, b) => getModuleOverallProgress(b) - getModuleOverallProgress(a)
  );

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-4">Modules at a Glance</h3>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 flex-1 content-start">
        {sortedModules.map((module, idx) => {
          const progress = getModuleProgress(module);
          const overdue = isOverdue(module.dueDate) && module.status !== 'done';
          const statusColor = overdue ? '#D63031' : STATUS_COLORS[module.status];
          const isBoth = module.assignedTo === 'both';
          const dev = isBoth ? null : developers.find((d) => d.id === module.assignedTo);
          const borderColor = isBoth ? '#8B5CF6' : (dev?.color || '#6B7280');
          const statusLabel = overdue ? 'Overdue' : STATUS_LABELS[module.status];
          return (
            <button
              key={module.id}
              onClick={() => onModuleClick(module.id)}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors text-left animate-scale-in"
              style={{ borderLeft: `3px solid ${borderColor}`, animationDelay: `${0.3 + idx * 0.06}s` }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ backgroundColor: statusColor }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-200 truncate">{module.name}</p>
                  <span
                    className="text-[10px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {dev && <span className="text-[10px] text-gray-500">{dev.name}</span>}
                  {isBoth && <span className="text-[10px] text-purple-400">Both</span>}
                  {!dev && !isBoth && <span className="text-[10px] text-gray-600">Unassigned</span>}
                  {module.dueDate && module.status !== 'done' && (
                    <span className={`text-[10px] ${overdue ? 'text-status-overdue' : 'text-gray-600'}`}>
                      Due {formatDate(module.dueDate)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5">
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
