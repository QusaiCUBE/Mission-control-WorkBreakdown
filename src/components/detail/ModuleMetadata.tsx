import { Module, Developer, Priority } from '../../types';
import DeveloperSelect from '../shared/DeveloperSelect';
import { PRIORITY_LABELS } from '../../constants';
import { formatDateFull } from '../../utils/dates';

interface ModuleMetadataProps {
  module: Module;
  developers: [Developer, Developer];
  onAssign: (devId: string | null) => void;
  onUpdatePriority: (priority: Priority) => void;
}

export default function ModuleMetadata({
  module,
  developers,
  onAssign,
  onUpdatePriority,
}: ModuleMetadataProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Assigned To</label>
          <DeveloperSelect
            developers={developers}
            value={module.assignedTo}
            onChange={onAssign}
            size="md"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Priority</label>
          <select
            value={module.priority}
            onChange={(e) => onUpdatePriority(e.target.value as Priority)}
            className="px-3 py-1.5 text-sm bg-bg-tertiary border border-border-primary rounded-lg text-gray-200 focus:outline-none focus:border-christian transition-colors cursor-pointer w-full"
          >
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Read-only dates — edit on Timeline by dragging bars */}
      {(module.startDate || module.dueDate) && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {module.startDate && <span>Start: {formatDateFull(module.startDate)}</span>}
          {module.dueDate && <span>Due: {formatDateFull(module.dueDate)}</span>}
          <span className="text-gray-600 italic">Drag bars on Timeline to edit</span>
        </div>
      )}


      {module.dependencies.length > 0 && (
        <div className="text-xs text-gray-500">
          Depends on {module.dependencies.length} module{module.dependencies.length > 1 ? 's' : ''} completing first
        </div>
      )}
    </div>
  );
}
