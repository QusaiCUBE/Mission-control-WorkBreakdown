import { ViewName } from '../../types';
import { VIEW_LABELS } from '../../constants';

interface SidebarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
}

const VIEW_ICONS: Record<ViewName, JSX.Element> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  board: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="5" height="18" rx="1" />
      <rect x="10" y="3" width="5" height="12" rx="1" />
      <rect x="17" y="3" width="5" height="15" rx="1" />
    </svg>
  ),
  timeline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <rect x="5" y="4" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="9" y="10" width="10" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="4" y="16" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  workload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M17 14a4 4 0 0 1 4 4v3" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
};

const VIEWS: ViewName[] = ['dashboard', 'board', 'timeline', 'workload', 'settings'];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-56 bg-bg-secondary border-r border-border-primary flex flex-col z-30 transition-all duration-200">
      <div className="h-14 flex items-center px-4 border-b border-border-primary">
        <div className="w-8 h-8 rounded-lg bg-christian flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          MC
        </div>
        <span className="ml-3 font-semibold text-sm text-white hidden lg:block truncate">
          Mission Control
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {VIEWS.map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === view
                ? 'bg-christian/15 text-christian'
                : 'text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary'
            }`}
          >
            {VIEW_ICONS[view]}
            <span className="hidden lg:block">{VIEW_LABELS[view]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
