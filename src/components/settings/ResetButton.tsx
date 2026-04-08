import { useState } from 'react';
import ConfirmDialog from '../shared/ConfirmDialog';

interface ResetButtonProps {
  onReset: () => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Danger Zone</h3>

      <div className="p-4 border border-status-overdue/30 rounded-lg bg-status-overdue/5">
        <p className="text-sm text-gray-300 mb-3">
          Reset all progress. This will clear all assignments, task completions, notes, and status changes.
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-status-overdue rounded-lg hover:bg-red-600 transition-colors"
        >
          Reset All Progress
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Reset All Progress"
        message="Are you sure? This will clear all progress, assignments, and notes. This action cannot be undone."
        confirmLabel="Reset Everything"
        destructive
        onConfirm={() => {
          onReset();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
