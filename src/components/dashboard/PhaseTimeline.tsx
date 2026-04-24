import { useState } from 'react';
import { Phase } from '../../types';
import { daysBetween, getToday, addDays } from '../../utils/dates';

interface PhaseTimelineProps {
  phases: Phase[];
  projectStartDate: string;
  onUpdatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  onAddPhase: (name: string, startDate: string, endDate: string) => void;
  onRemovePhase: (phaseId: string) => void;
  readOnly?: boolean;
}

const PHASE_COLORS = ['#6C5CE7', '#0984E3', '#0ABAB5', '#00B894', '#E17055', '#FDCB6E', '#74B9FF', '#A29BFE'];

function friendlyDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PhaseTimeline({ phases: unsortedPhases, projectStartDate, onUpdatePhase, onAddPhase, onRemovePhase, readOnly }: PhaseTimelineProps) {
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  // Auto-sort phases by start date
  const phases = [...unsortedPhases].sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (phases.length === 0 && !showAdd) {
    return (
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Project Timeline</h3>
          <button onClick={() => setShowAdd(true)} className="text-xs text-christian hover:text-blue-400">+ Add Phase</button>
        </div>
        <p className="text-sm text-gray-500">No phases yet. Add one to get started.</p>
      </div>
    );
  }

  const projectEndDate = phases.length > 0 ? phases[phases.length - 1].endDate : projectStartDate;
  const totalDays = Math.max(1, daysBetween(projectStartDate, projectEndDate) + 1);
  const todayOffset = daysBetween(projectStartDate, getToday());
  const todayPercent = Math.min(100, Math.max(0, (todayOffset / totalDays) * 100));

  const editPhase = editingPhase ? phases.find((p) => p.id === editingPhase) : null;
  const editPhaseIndex = editPhase ? phases.indexOf(editPhase) : -1;

  const handleAddPhase = () => {
    if (!newName.trim()) return;
    const lastEnd = phases.length > 0 ? phases[phases.length - 1].endDate : projectStartDate;
    const start = addDays(lastEnd, 1);
    const end = addDays(start, 6);
    onAddPhase(newName.trim(), start, end);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Project Timeline</h3>
        {!readOnly && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Click a phase to edit</span>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-xs text-christian hover:text-blue-400 transition-colors"
            >
              + Add Phase
            </button>
          </div>
        )}
      </div>

      {/* Add phase form */}
      {showAdd && (
        <div className="mb-4 flex items-end gap-2 bg-bg-tertiary rounded-lg p-3">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Phase Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
              placeholder="e.g. Phase 4: Deployment"
              autoFocus
              className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
            />
          </div>
          <button
            onClick={handleAddPhase}
            disabled={!newName.trim()}
            className="px-4 py-1.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40"
          >
            Add
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewName(''); }}
            className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="relative">
        {/* Phase bar — positioned by actual dates, taller to fit wrapped text */}
        <div className="relative h-14 rounded-lg overflow-hidden bg-bg-tertiary">
          {phases.map((phase, i) => {
            const offsetDays = daysBetween(projectStartDate, phase.startDate);
            const phaseDays = daysBetween(phase.startDate, phase.endDate) + 1;
            const leftPercent = (offsetDays / totalDays) * 100;
            const widthPercent = (phaseDays / totalDays) * 100;
            const isEditing = editingPhase === phase.id;
            const color = PHASE_COLORS[i % PHASE_COLORS.length];

            return (
              <button
                key={phase.id}
                onClick={() => !readOnly && setEditingPhase(isEditing ? null : phase.id)}
                title={`${phase.name}\n${friendlyDate(phase.startDate)} — ${friendlyDate(phase.endDate)}`}
                className="absolute top-0 h-full flex items-center justify-center transition-all hover:brightness-110 overflow-hidden px-1"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                  outline: isEditing ? '2px solid white' : 'none',
                  outlineOffset: '-2px',
                }}
              >
                <span
                  className="text-[11px] leading-snug font-semibold text-white text-center break-words"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                  }}
                >
                  {phase.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Today marker — animated slide-in */}
        {todayPercent >= 0 && todayPercent <= 100 && (
          <div
            className="absolute top-0 flex flex-col items-center pointer-events-none animate-slide-today"
            style={{ left: `${todayPercent}%`, height: '56px' }}
          >
            <div className="w-0.5 h-14 bg-white" />
            <div className="mt-1 bg-white text-bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
              Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}

        {/* Date labels */}
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>{friendlyDate(projectStartDate)}</span>
          <span>{friendlyDate(projectEndDate)}</span>
        </div>
      </div>

      {/* Phase editor */}
      {editPhase && (
        <div
          className="mt-4 p-4 rounded-lg border"
          style={{
            backgroundColor: `${PHASE_COLORS[editPhaseIndex % PHASE_COLORS.length]}10`,
            borderColor: `${PHASE_COLORS[editPhaseIndex % PHASE_COLORS.length]}40`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Edit Phase</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onRemovePhase(editPhase.id);
                  setEditingPhase(null);
                }}
                className="text-xs text-status-overdue hover:text-red-400 transition-colors"
              >
                Delete Phase
              </button>
              <button
                onClick={() => setEditingPhase(null)}
                className="text-gray-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Phase name */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Name</label>
              <input
                type="text"
                value={editPhase.name}
                onChange={(e) => onUpdatePhase(editPhase.id, { name: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-christian transition-colors"
              />
            </div>

            {/* Start date — friendly display with hidden date picker */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
              <div className="relative">
                <div className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200">
                  {friendlyDate(editPhase.startDate)}
                </div>
                <input
                  type="date"
                  value={editPhase.startDate}
                  onChange={(e) => {
                    if (e.target.value) onUpdatePhase(editPhase.id, { startDate: e.target.value });
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">End Date</label>
              <div className="relative">
                <div className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200">
                  {friendlyDate(editPhase.endDate)}
                </div>
                <input
                  type="date"
                  value={editPhase.endDate}
                  onChange={(e) => {
                    if (e.target.value) onUpdatePhase(editPhase.id, { endDate: e.target.value });
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Phase info */}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>
              {daysBetween(editPhase.startDate, editPhase.endDate) + 1} days
              ({Math.round((daysBetween(editPhase.startDate, editPhase.endDate) + 1) / 7)} weeks)
            </span>
            <span>{friendlyDate(editPhase.startDate)} — {friendlyDate(editPhase.endDate)}</span>
          </div>

          {/* Description */}
          <div className="mt-3">
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <input
              type="text"
              value={editPhase.description}
              onChange={(e) => onUpdatePhase(editPhase.id, { description: e.target.value })}
              placeholder="What happens in this phase?"
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
