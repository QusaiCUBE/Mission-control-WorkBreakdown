import { Module, Developer } from '../../types';
import { formatDate, daysBetween, getToday } from '../../utils/dates';

interface UpcomingDeadlinesProps {
  modules: Module[];
  developers: [Developer, Developer];
  onModuleClick: (moduleId: string) => void;
}

export default function UpcomingDeadlines({ modules, developers, onModuleClick }: UpcomingDeadlinesProps) {
  const today = getToday();

  const upcoming = modules
    .filter((m) => m.dueDate && m.status !== 'done')
    .sort((a, b) => {
      const da = daysBetween(today, a.dueDate!);
      const db = daysBetween(today, b.dueDate!);
      return da - db;
    })
    .slice(0, 5);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Upcoming Deadlines</h3>

      {upcoming.length === 0 ? (
        <p className="text-xs text-gray-500">No upcoming deadlines</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((module) => {
            const daysLeft = daysBetween(today, module.dueDate!);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 5;
            const dev = developers.find((d) => d.id === module.assignedTo);

            return (
              <button
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: isOverdue
                      ? '#D63031'
                      : isUrgent
                        ? '#F39C12'
                        : '#00B894',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{module.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatDate(module.dueDate)}</span>
                    {dev && (
                      <span className="text-xs" style={{ color: dev.color }}>
                        {dev.name}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    isOverdue
                      ? 'text-status-overdue'
                      : isUrgent
                        ? 'text-status-progress'
                        : 'text-gray-400'
                  }`}
                >
                  {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
