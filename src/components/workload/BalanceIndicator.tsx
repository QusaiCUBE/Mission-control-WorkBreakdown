import { Developer } from '../../types';

interface BalanceIndicatorProps {
  devStats: { dev: Developer; taskCount: number }[];
  unassignedCount: number;
  onAutoBalance: () => void;
}

export default function BalanceIndicator({ devStats, unassignedCount, onAutoBalance }: BalanceIndicatorProps) {
  const totalAssigned = devStats.reduce((s, d) => s + d.taskCount, 0);
  const total = totalAssigned + unassignedCount;

  const maxDev = Math.max(...devStats.map((d) => d.taskCount));
  const minDev = Math.min(...devStats.map((d) => d.taskCount));
  const imbalance = totalAssigned > 0 ? ((maxDev - minDev) / totalAssigned) * 100 : 0;
  const isImbalanced = imbalance > 30;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Workload Balance</h3>
        <button
          onClick={onAutoBalance}
          className="px-3 py-1 text-xs font-medium text-christian bg-christian/10 rounded-lg hover:bg-christian/20 transition-colors"
        >
          Auto-balance
        </button>
      </div>

      {/* Balance bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-bg-tertiary">
        {devStats.map(({ dev, taskCount }) => {
          const pct = total > 0 ? (taskCount / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={dev.id}
              className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: dev.color }}
            />
          );
        })}
        {unassignedCount > 0 && total > 0 && (
          <div
            className="h-full bg-gray-600 transition-all duration-500"
            style={{ width: `${(unassignedCount / total) * 100}%` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          {devStats.map(({ dev, taskCount }) => (
            <span key={dev.id} className="text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: dev.color }} />
              {dev.name}: {taskCount}
            </span>
          ))}
          {unassignedCount > 0 && (
            <span className="text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full mr-1 bg-gray-600" />
              Unassigned: {unassignedCount}
            </span>
          )}
        </div>
        {isImbalanced && (
          <span className="text-xs text-status-overdue">Imbalanced</span>
        )}
      </div>
    </div>
  );
}
