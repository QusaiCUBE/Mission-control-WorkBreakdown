import { ModuleStatus, Priority, ViewName } from '../types';

export const VIEW_LABELS: Record<ViewName, string> = {
  dashboard: 'Dashboard',
  board: 'Board',
  timeline: 'Timeline',
  workload: 'Workload',
  settings: 'Settings',
};

export const STATUS_LABELS: Record<ModuleStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const STATUS_COLORS: Record<ModuleStatus, string> = {
  backlog: '#6B7280',
  in_progress: '#F39C12',
  in_review: '#6C5CE7',
  done: '#00B894',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#6B7280',
  medium: '#F39C12',
  high: '#E17055',
  critical: '#D63031',
};

export const OVERDUE_COLOR = '#D63031';

export const DEVELOPER_COLORS = {
  christian: '#3B82F6',
  qusai: '#F43F5E',
} as const;

export const STORAGE_KEY = 'mission-control-project';

export const DEFAULT_PHASE_DURATIONS = [1, 6, 2, 1]; // weeks
