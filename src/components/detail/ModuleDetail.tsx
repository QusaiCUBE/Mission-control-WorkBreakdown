import { Module, Developer, Priority, DailyLogEntry } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import Slider from '../shared/Slider';
import ModuleMetadata from './ModuleMetadata';
import StatusHistory from './StatusHistory';
import DailyLog from './DailyLog';
import { isOverdue } from '../../utils/dates';

interface ModuleDetailProps {
  module: Module;
  developers: [Developer, Developer];
  onClose: () => void;
  onUpdateModule: (moduleId: string, updates: Partial<Module>) => void;
  onAssignModule: (moduleId: string, devId: string | null) => void;
  onUpdatePriority: (moduleId: string, priority: Priority) => void;
  onUpdateProgress: (moduleId: string, progress: number) => void;
  onSetOnHold: (moduleId: string, onHold: boolean) => void;
  onAddLogEntry: (moduleId: string, date: string, text: string) => void;
  onUpdateLogEntry: (
    moduleId: string,
    entryId: string,
    updates: Partial<Pick<DailyLogEntry, 'text' | 'date'>>
  ) => void;
  onRemoveLogEntry: (moduleId: string, entryId: string) => void;
  readOnly?: boolean;
}

export default function ModuleDetail({
  module,
  developers,
  onClose,
  onUpdateModule,
  onAssignModule,
  onUpdatePriority,
  onUpdateProgress,
  onSetOnHold,
  onAddLogEntry,
  onUpdateLogEntry,
  onRemoveLogEntry,
  readOnly,
}: ModuleDetailProps) {
  const overdue = isOverdue(module.dueDate) && module.status !== 'done';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            {readOnly ? (
              <>
                <h2 className="text-xl font-bold text-white">{module.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{module.description}</p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={module.name}
                  onChange={(e) => onUpdateModule(module.id, { name: e.target.value })}
                  className="text-xl font-bold text-white bg-transparent border-0 border-b border-transparent hover:border-border-primary focus:border-christian focus:outline-none w-full transition-colors px-0 py-0.5"
                />
                <input
                  type="text"
                  value={module.description}
                  onChange={(e) => onUpdateModule(module.id, { description: e.target.value })}
                  placeholder="Add description..."
                  className="text-sm text-gray-400 bg-transparent border-0 border-b border-transparent hover:border-border-primary focus:border-christian focus:outline-none w-full mt-1 transition-colors px-0 py-0.5 placeholder-gray-600"
                />
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-bg-tertiary transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={module.status} isOverdue={overdue} />
          {module.onHold && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              On Hold
            </span>
          )}
          {!readOnly && module.status !== 'done' && (
            <button
              type="button"
              onClick={() => onSetOnHold(module.id, !module.onHold)}
              className={`ml-auto inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded transition-colors ${
                module.onHold
                  ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary'
              }`}
            >
              {module.onHold ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <polygon points="6 4 20 12 6 20" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                  Put on Hold
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {module.status !== 'done' && (
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
              Progress
            </label>
            <Slider
              value={module.progress ?? 0}
              onChange={(v) => onUpdateProgress(module.id, v)}
              disabled={readOnly || module.onHold}
              ariaLabel={`Progress for ${module.name}`}
            />
            {module.onHold && (
              <p className="text-[10px] text-amber-400 mt-1">
                This module is on hold. Resume it to keep editing progress.
              </p>
            )}
          </div>
        )}

        <ModuleMetadata
          module={module}
          developers={developers}
          onAssign={(devId) => onAssignModule(module.id, devId)}
          onUpdatePriority={(p) => onUpdatePriority(module.id, p)}
        />

        <div className="border-t border-border-primary pt-6">
          <DailyLog
            entries={module.dailyLog ?? []}
            onAdd={(date, text) => onAddLogEntry(module.id, date, text)}
            onUpdate={(entryId, updates) => onUpdateLogEntry(module.id, entryId, updates)}
            onRemove={(entryId) => onRemoveLogEntry(module.id, entryId)}
            readOnly={readOnly}
          />
        </div>

        <div className="border-t border-border-primary pt-6">
          <StatusHistory history={module.statusHistory} />
        </div>
      </div>
    </div>
  );
}
