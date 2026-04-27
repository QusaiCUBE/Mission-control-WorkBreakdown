import { ViewName } from '../../types';
import { VIEW_LABELS } from '../../constants';
import SyncIndicator from './SyncIndicator';

interface HeaderProps {
  currentView: ViewName;
  overallProgress: number;
  user: string;
  onLogout: () => void;
}

export default function Header({ currentView, overallProgress, user, onLogout }: HeaderProps) {
  return (
    <header className="h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">{VIEW_LABELS[currentView]}</h1>
      </div>
      <div className="flex items-center gap-4">
        <SyncIndicator />
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
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border-primary">
          <span className="text-xs text-gray-400 capitalize">{user}</span>
          <button
            onClick={onLogout}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
