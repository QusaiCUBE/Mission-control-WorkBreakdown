import { ViewName } from '../../types';
import { VIEW_LABELS } from '../../constants';

interface HeaderProps {
  currentView: ViewName;
  overallProgress: number;
}

export default function Header({ currentView, overallProgress }: HeaderProps) {
  return (
    <header className="h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">{VIEW_LABELS[currentView]}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Overall</span>
          <div className="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-status-done rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-white font-medium">{overallProgress}%</span>
        </div>
      </div>
    </header>
  );
}
