import { Module } from '../../types';
import { getScheduleHealth } from '../../utils/progress';

interface BurndownIndicatorProps {
  modules: Module[];
  projectStartDate: string;
  projectEndDate: string;
}

const STATUS_CONFIG = {
  ahead: { label: 'Ahead of Schedule', color: '#00B894', icon: '↑' },
  on_track: { label: 'On Track', color: '#F39C12', icon: '→' },
  behind: { label: 'Behind Schedule', color: '#D63031', icon: '↓' },
};

export default function BurndownIndicator({ modules }: BurndownIndicatorProps) {
  const { status, avgDays, details } = getScheduleHealth(modules);
  const config = STATUS_CONFIG[status];

  // Active modules that are overdue (NOT done, past due)
  const overdueModules = details.filter((d) => !d.isDone && d.daysAhead < 0);
  // Active modules with time left
  const activeOnTime = details.filter((d) => !d.isDone && d.daysAhead >= 0);
  // Done modules
  const doneModules = details.filter((d) => d.isDone);
  const doneEarly = doneModules.filter((d) => d.daysAhead > 0);
  const doneLate = doneModules.filter((d) => d.daysAhead < 0);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Schedule Health</h3>

      <div className="flex flex-col items-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {config.icon}
        </div>
        <p className="text-sm font-medium" style={{ color: config.color }}>
          {config.label}
        </p>
        <p className="text-xl font-bold text-white mt-1">
          {Math.abs(avgDays)} day{Math.abs(avgDays) !== 1 ? 's' : ''}{' '}
          <span className="text-sm font-normal" style={{ color: config.color }}>
            {avgDays >= 0 ? 'ahead' : 'behind'}
          </span>
        </p>
      </div>

      {details.length > 0 && (
        <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-2">
          {/* Active overdue — these need attention */}
          {overdueModules.length > 0 && (
            <div>
              <p className="text-[10px] text-status-overdue font-medium mb-1 uppercase tracking-wide">Overdue</p>
              {overdueModules.map((d) => (
                <div key={d.moduleId} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-300 truncate">{d.name}</span>
                  <span className="text-xs text-status-overdue font-medium flex-shrink-0 ml-2">
                    {Math.abs(d.daysAhead)}d late
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Active on time */}
          {activeOnTime.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wide">In progress</p>
              {activeOnTime.map((d) => (
                <div key={d.moduleId} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-400 truncate">{d.name}</span>
                  <span className="text-xs text-status-done font-medium flex-shrink-0 ml-2">
                    {d.daysAhead}d left
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Done modules */}
          {doneModules.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-600 font-medium mb-1 uppercase tracking-wide">
                Completed ({doneModules.length})
              </p>
              {doneEarly.map((d) => (
                <div key={d.moduleId} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-500 truncate">{d.name}</span>
                  <span className="text-xs text-status-done font-medium flex-shrink-0 ml-2">
                    {d.daysAhead}d early
                  </span>
                </div>
              ))}
              {doneLate.map((d) => (
                <div key={d.moduleId} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-500 truncate">{d.name}</span>
                  <span className="text-xs text-status-progress font-medium flex-shrink-0 ml-2">
                    {Math.abs(d.daysAhead)}d late
                  </span>
                </div>
              ))}
              {doneModules.filter((d) => d.daysAhead === 0).map((d) => (
                <div key={d.moduleId} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-500 truncate">{d.name}</span>
                  <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">on time</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {details.length === 0 && (
        <p className="mt-4 text-xs text-gray-500 text-center">Set due dates on modules to track schedule</p>
      )}
    </div>
  );
}
