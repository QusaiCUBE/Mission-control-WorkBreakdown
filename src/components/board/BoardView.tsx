import { useState, useRef, useCallback } from 'react';
import { Module, Developer, ModuleStatus, Phase } from '../../types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import KanbanColumn from './KanbanColumn';
import ProgressPopover from './ProgressPopover';

interface BoardViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  onMoveModule: (moduleId: string, status: ModuleStatus) => void;
  onUpdateProgress: (moduleId: string, progress: number) => void;
  onModuleClick: (moduleId: string) => void;
  onAddModule?: (name: string, description: string, phase: string) => void;
  readOnly?: boolean;
}

const COLUMNS: ModuleStatus[] = ['backlog', 'in_progress', 'in_review', 'done'];
const PROMPT_STATUSES: ModuleStatus[] = ['in_progress', 'in_review'];

export default function BoardView({ modules, developers, phases, onMoveModule, onUpdateProgress, onModuleClick, onAddModule, readOnly }: BoardViewProps) {
  const lastDropCoords = useRef<{ x: number; y: number } | null>(null);
  const [popover, setPopover] = useState<{ moduleId: string; x: number; y: number } | null>(null);

  const handleMove = useCallback(
    (moduleId: string, targetStatus: ModuleStatus) => {
      const current = modules.find((m) => m.id === moduleId);
      const isChangingStatus = current && current.status !== targetStatus;
      onMoveModule(moduleId, targetStatus);
      if (!readOnly && isChangingStatus && PROMPT_STATUSES.includes(targetStatus) && lastDropCoords.current) {
        setPopover({ moduleId, x: lastDropCoords.current.x, y: lastDropCoords.current.y });
      }
    },
    [modules, onMoveModule, readOnly]
  );

  const { dragOverColumn, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(handleMove);

  const captureDrop = useCallback(
    (e: React.DragEvent, status: ModuleStatus) => {
      lastDropCoords.current = { x: e.clientX, y: e.clientY };
      handleDrop(e, status);
    },
    [handleDrop]
  );

  const popoverModule = popover ? modules.find((m) => m.id === popover.moduleId) : null;

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhase, setNewPhase] = useState(phases[0]?.id || '');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddModule?.(newName.trim(), newDesc.trim(), newPhase);
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      {/* Add module bar */}
      {onAddModule && !readOnly && <div className="flex items-center gap-3">
        {showAdd ? (
          <div className="flex items-end gap-2 flex-wrap bg-bg-secondary border border-border-primary rounded-lg p-3 w-full">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-gray-400 mb-1 block">Module Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Inventory Management"
                autoFocus
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Brief description"
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phase</label>
              <select
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                className="bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-christian cursor-pointer"
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); setNewDesc(''); }}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-sm font-medium text-christian bg-christian/10 rounded-lg hover:bg-christian/20 transition-colors"
          >
            + Add Module
          </button>
        )}
      </div>}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const columnModules = modules.filter((m) => m.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              modules={columnModules}
              developers={developers}
              isDropTarget={dragOverColumn === status}
              onModuleClick={onModuleClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => captureDrop(e, status)}
            />
          );
        })}
      </div>

      {popover && popoverModule && (
        <ProgressPopover
          value={popoverModule.progress ?? 0}
          x={popover.x}
          y={popover.y}
          onChange={(v) => onUpdateProgress(popover.moduleId, v)}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
