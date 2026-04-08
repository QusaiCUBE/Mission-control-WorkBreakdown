import { Module, Developer } from '../../types';

interface WorkloadSplitProps {
  modules: Module[];
  developers: [Developer, Developer];
}

export default function WorkloadSplit({ modules, developers }: WorkloadSplitProps) {
  const totalTasks = modules.reduce((s, m) => s + m.tasks.length, 0);

  const devStats = developers.map((dev) => {
    const devModules = modules.filter((m) => m.assignedTo === dev.id);
    const tasks = devModules.reduce((s, m) => s + m.tasks.length, 0);
    return { dev, tasks, modules: devModules.length };
  });

  const unassignedModules = modules.filter((m) => !m.assignedTo);
  const unassignedTasks = unassignedModules.reduce((s, m) => s + m.tasks.length, 0);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Workload Split</h3>

      {/* Stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex bg-bg-tertiary">
        {devStats.map(({ dev, tasks }) => {
          const widthPercent = totalTasks > 0 ? (tasks / totalTasks) * 100 : 0;
          if (widthPercent === 0) return null;
          return (
            <div
              key={dev.id}
              className="h-full transition-all duration-500"
              style={{ width: `${widthPercent}%`, backgroundColor: dev.color }}
            />
          );
        })}
        {unassignedTasks > 0 && totalTasks > 0 && (
          <div
            className="h-full bg-gray-600 transition-all duration-500"
            style={{ width: `${(unassignedTasks / totalTasks) * 100}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {devStats.map(({ dev, tasks, modules: moduleCount }) => (
          <div key={dev.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dev.color }} />
              <span className="text-sm text-gray-300">{dev.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {moduleCount} modules, {tasks} tasks
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-300">Unassigned</span>
          </div>
          <span className="text-xs text-gray-500">
            {unassignedModules.length} modules, {unassignedTasks} tasks
          </span>
        </div>
      </div>
    </div>
  );
}
