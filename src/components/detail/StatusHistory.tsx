import { StatusChange, ModuleStatus } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import { formatDateFull } from '../../utils/dates';

interface StatusHistoryProps {
  history: StatusChange[];
}

export default function StatusHistory({ history }: StatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Status History</h4>
        <p className="text-xs text-gray-500">No status changes yet</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-3">Status History</h4>
      <div className="space-y-3">
        {[...history].reverse().map((entry, i) => {
          const toColor = STATUS_COLORS[entry.to as ModuleStatus] || '#6B7280';
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: toColor }}
                />
                {i < history.length - 1 && (
                  <div className="w-px h-6 bg-border-primary mt-1" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-300">
                  <span className="text-gray-500">
                    {STATUS_LABELS[entry.from as ModuleStatus] || entry.from}
                  </span>
                  {' → '}
                  <span style={{ color: toColor }}>
                    {STATUS_LABELS[entry.to as ModuleStatus] || entry.to}
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{formatDateFull(entry.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
