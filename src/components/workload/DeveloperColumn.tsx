import { Module, Developer, Priority } from '../../types';
import ProgressBar from '../shared/ProgressBar';
import StatusBadge from '../shared/StatusBadge';
import PriorityBadge from '../shared/PriorityBadge';
import { getModuleOverallProgress } from '../../utils/progress';
import { isOverdue } from '../../utils/dates';

interface DeveloperColumnProps {
  developer: Developer;
  modules: Module[];
  onModuleClick: (moduleId: string) => void;
}

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function DeveloperColumn({ developer, modules, onModuleClick }: DeveloperColumnProps) {
  const doneCount = modules.filter((m) => m.status === 'done').length;

  // Sort: active modules first (by priority high→low), done modules at the bottom
  const sortedModules = [...modules].sort((a, b) => {
    const aDone = a.status === 'done' ? 1 : 0;
    const bDone = b.status === 'done' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });

  return (
    <div className="flex-1 min-w-[300px]">
      {/* Developer header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: developer.color }}
        >
          {developer.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{developer.name}</h3>
          <p className="text-xs text-gray-500">
            {modules.length} modules, {doneCount} done
          </p>
        </div>
      </div>

      {/* Module cards */}
      <div className="space-y-2">
        {sortedModules.length === 0 ? (
          <div className="p-4 border border-border-primary rounded-lg border-dashed text-center">
            <p className="text-xs text-gray-500">No modules assigned</p>
          </div>
        ) : (
          sortedModules.map((module) => {
            const progress = getModuleOverallProgress(module);
            const overdue = isOverdue(module.dueDate) && module.status !== 'done';

            return (
              <button
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                className="w-full p-3 bg-bg-secondary border border-border-primary rounded-lg hover:border-gray-500 transition-colors text-left"
                style={{ borderLeftWidth: '3px', borderLeftColor: developer.color }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm text-white font-medium truncate">{module.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusBadge status={module.status} isOverdue={overdue} />
                    <PriorityBadge priority={module.priority} />
                  </div>
                </div>
                <ProgressBar value={progress} size="sm" color={developer.color} />
                <span className="text-xs text-gray-500 mt-1 block">
                  {module.description}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
