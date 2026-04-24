import { useState, useEffect } from 'react';
import { Module, Developer } from '../../types';

interface WorkloadSplitProps {
  modules: Module[];
  developers: [Developer, Developer];
}

export default function WorkloadSplit({ modules, developers }: WorkloadSplitProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 400); return () => clearTimeout(t); }, []);

  const totalModules = modules.length;

  const devStats = developers.map((dev) => {
    const devModules = modules.filter((m) => m.assignedTo === dev.id || (m.assignedTo === 'both'));
    return { dev, moduleCount: devModules.length };
  });

  const unassignedCount = modules.filter((m) => !m.assignedTo).length;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Workload Split</h3>

      {/* Stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex bg-bg-tertiary">
        {devStats.map(({ dev, moduleCount }) => {
          const widthPercent = totalModules > 0 ? (moduleCount / totalModules) * 100 : 0;
          if (widthPercent === 0) return null;
          return (
            <div
              key={dev.id}
              className="h-full transition-all duration-700 ease-out"
              style={{ width: mounted ? `${widthPercent}%` : '0%', backgroundColor: dev.color }}
            />
          );
        })}
        {unassignedCount > 0 && totalModules > 0 && (
          <div
            className="h-full bg-gray-600 transition-all duration-700 ease-out"
            style={{ width: mounted ? `${(unassignedCount / totalModules) * 100}%` : '0%' }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {devStats.map(({ dev, moduleCount }) => (
          <div key={dev.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dev.color }} />
              <span className="text-sm text-gray-300">{dev.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {moduleCount} module{moduleCount !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-300">Unassigned</span>
          </div>
          <span className="text-xs text-gray-500">
            {unassignedCount} module{unassignedCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
