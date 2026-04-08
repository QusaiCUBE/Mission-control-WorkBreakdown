import { useState } from 'react';
import DatePicker from '../shared/DatePicker';
import ConfirmDialog from '../shared/ConfirmDialog';

interface ProjectDateEditorProps {
  startDate: string;
  phaseDurations: number[];
  onUpdateStartDate: (date: string) => void;
  onUpdatePhaseDurations: (durations: number[]) => void;
}

const PHASE_NAMES = ['Phase 0: Setup', 'Phase 1: Integration', 'Phase 2: Shell', 'Phase 3: Polish'];

export default function ProjectDateEditor({
  startDate,
  phaseDurations,
  onUpdateStartDate,
  onUpdatePhaseDurations,
}: ProjectDateEditorProps) {
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [pendingDurations, setPendingDurations] = useState<number[] | null>(null);
  const [draftDurations, setDraftDurations] = useState<number[]>(phaseDurations);
  const [durationsChanged, setDurationsChanged] = useState(false);

  const handleDurationDraft = (index: number, value: number) => {
    const newDurations = [...draftDurations];
    newDurations[index] = Math.max(1, value);
    setDraftDurations(newDurations);
    setDurationsChanged(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Project Schedule</h3>
      <p className="text-xs text-status-progress">
        Changing dates or durations will reset all module progress.
      </p>

      <DatePicker
        label="Project Start Date"
        value={startDate}
        onChange={(date) => { if (date) setPendingDate(date); }}
      />

      <div className="space-y-3 mt-4">
        <label className="text-xs text-gray-400">Phase Durations (weeks)</label>
        {PHASE_NAMES.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-gray-300 w-40">{name}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={draftDurations[i] || 1}
              onChange={(e) => handleDurationDraft(i, parseInt(e.target.value) || 1)}
              className="w-20 bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-christian transition-colors text-center"
            />
            <span className="text-xs text-gray-500">weeks</span>
          </div>
        ))}
        {durationsChanged && (
          <button
            onClick={() => setPendingDurations(draftDurations)}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply Duration Changes
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDate !== null}
        title="Change Start Date"
        message="Changing the start date will reset all module progress, assignments, and notes. Are you sure?"
        confirmLabel="Change Date"
        destructive
        onConfirm={() => {
          if (pendingDate) onUpdateStartDate(pendingDate);
          setPendingDate(null);
        }}
        onCancel={() => setPendingDate(null)}
      />

      <ConfirmDialog
        isOpen={pendingDurations !== null}
        title="Change Phase Durations"
        message="Changing phase durations will reset all module progress, assignments, and notes. Are you sure?"
        confirmLabel="Change Durations"
        destructive
        onConfirm={() => {
          if (pendingDurations) onUpdatePhaseDurations(pendingDurations);
          setPendingDurations(null);
          setDurationsChanged(false);
        }}
        onCancel={() => {
          setPendingDurations(null);
          setDraftDurations(phaseDurations);
          setDurationsChanged(false);
        }}
      />
    </div>
  );
}
