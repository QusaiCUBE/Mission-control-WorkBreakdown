import { Module, Developer, Phase } from '../../types';
import DeveloperColumn from './DeveloperColumn';
import BalanceIndicator from './BalanceIndicator';
import CalendarHeatMap from './CalendarHeatMap';

interface WorkloadViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  projectStartDate: string;
  onModuleClick: (moduleId: string) => void;
  onAssignModule: (moduleId: string, devId: string | null) => void;
}

export default function WorkloadView({
  modules,
  developers,
  phases,
  projectStartDate,
  onModuleClick,
  onAssignModule,
}: WorkloadViewProps) {
  const devStats = developers.map((dev) => {
    const devModules = modules.filter((m) => m.assignedTo === dev.id);
    return {
      dev,
      modules: devModules,
      moduleCount: devModules.length,
    };
  });

  const unassigned = modules.filter((m) => !m.assignedTo);
  const unassignedCount = unassigned.length;

  const handleAutoBalance = () => {
    const allModules = [...modules];
    const loads = developers.map((dev) => ({ devId: dev.id, load: 0 }));

    allModules.forEach((module) => {
      loads.sort((a, b) => a.load - b.load);
      const target = loads[0];
      onAssignModule(module.id, target.devId);
      target.load += 1;
    });
  };

  return (
    <div className="space-y-4">
      <BalanceIndicator
        devStats={devStats.map((d) => ({ dev: d.dev, taskCount: d.moduleCount }))}
        unassignedCount={unassignedCount}
        onAutoBalance={handleAutoBalance}
      />

      <div className="flex gap-6">
        {devStats.map(({ dev, modules: devModules }) => (
          <DeveloperColumn
            key={dev.id}
            developer={dev}
            modules={devModules}
            onModuleClick={onModuleClick}
          />
        ))}
      </div>

      {/* Unassigned section */}
      {unassigned.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Unassigned ({unassigned.length})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {unassigned.map((module) => (
              <button
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                className="p-3 bg-bg-secondary border border-border-primary border-dashed rounded-lg hover:border-gray-500 transition-colors text-left"
              >
                <p className="text-sm text-gray-300">{module.name}</p>
                <p className="text-xs text-gray-500 mt-1">{module.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <CalendarHeatMap
        modules={modules}
        developers={developers}
        phases={phases}
        projectStartDate={projectStartDate}
      />
    </div>
  );
}
