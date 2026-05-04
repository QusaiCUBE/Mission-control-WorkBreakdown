export type ViewName = 'dashboard' | 'board' | 'timeline' | 'workload' | 'settings';
export type ModuleStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Developer {
  id: string;
  name: string;
  color: string;
}

export interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface StatusChange {
  from: string;
  to: string;
  date: string;
  by: string;
}

export interface DailyLogEntry {
  id: string;
  date: string;       // YYYY-MM-DD — the day this entry is logged against
  text: string;
  createdAt: string;  // ISO timestamp for ordering within a day
  author: string;     // username who wrote it
}

export interface Module {
  id: string;
  name: string;
  description: string;
  prefix: string;
  assignedTo: string | null;
  status: ModuleStatus;
  phase: string;
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  priority: Priority;
  progress: number;
  onHold: boolean;
  statusHistory: StatusChange[];
  dependencies: string[];
  dailyLog: DailyLogEntry[];
}

export interface Project {
  name: string;
  startDate: string;
  developers: [Developer, Developer];
  phases: Phase[];
  modules: Module[];
}
