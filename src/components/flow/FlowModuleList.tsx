import { Module, Developer } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import DeveloperAvatar from '../shared/DeveloperAvatar';

interface FlowModuleListProps {
  stepIndex: number;
  stepTitle: string;
  modules: Module[];
  developers: [Developer, Developer];
  onModuleClick: (moduleId: string) => void;
}

export default function FlowModuleList({
  stepIndex,
  stepTitle,
  modules,
  developers,
  onModuleClick,
}: FlowModuleListProps) {
  // Mutually exclusive buckets — completed takes priority
  const completed = modules.filter((m) => m.tasks[stepIndex]?.completed);
  const completedIds = new Set(completed.map((m) => m.id));

  const atStep = modules.filter((m) => {
    if (completedIds.has(m.id)) return false;
    const firstIncomplete = m.tasks.findIndex((t) => !t.completed);
    return firstIncomplete === stepIndex;
  });

  const notReached = modules.filter((m) => {
    if (completedIds.has(m.id)) return false;
    const firstIncomplete = m.tasks.findIndex((t) => !t.completed);
    return firstIncomplete !== -1 && firstIncomplete < stepIndex;
  });

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 mt-4">
      <h3 className="text-sm font-semibold text-white mb-1">
        Step {stepIndex + 1}: {stepTitle}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {completed.length} completed, {atStep.length} in progress, {notReached.length} not reached
      </p>

      {atStep.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-status-progress mb-2">Currently at this step</h4>
          <div className="space-y-1">
            {atStep.map((m) => (
              <ModuleRow key={m.id} module={m} developers={developers} onClick={() => onModuleClick(m.id)} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-status-done mb-2">Completed</h4>
          <div className="space-y-1">
            {completed.map((m) => (
              <ModuleRow key={m.id} module={m} developers={developers} onClick={() => onModuleClick(m.id)} />
            ))}
          </div>
        </div>
      )}

      {notReached.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">Not yet reached</h4>
          <div className="space-y-1">
            {notReached.map((m) => (
              <ModuleRow key={m.id} module={m} developers={developers} onClick={() => onModuleClick(m.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleRow({
  module,
  developers,
  onClick,
}: {
  module: Module;
  developers: [Developer, Developer];
  onClick: () => void;
}) {
  const dev = developers.find((d) => d.id === module.assignedTo);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
    >
      {dev ? (
        <DeveloperAvatar name={dev.name} color={dev.color} />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-700" />
      )}
      <span className="text-sm text-gray-300 flex-1">{module.name}</span>
      <StatusBadge status={module.status} />
    </button>
  );
}
