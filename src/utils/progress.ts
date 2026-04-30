import { Module } from '../types';
import { daysBetween, getToday } from './dates';

export function getModuleProgress(module: Module): number {
  const v = typeof module.progress === 'number' ? module.progress : 0;
  return Math.max(0, Math.min(100, v));
}

// Weighted contribution of a single module to the overall project progress.
// Each column owns a slice of the 0-100 overall range; the per-module `progress`
// (0-100 within its column) interpolates across that slice.
//
// In-progress and in-review are intentionally weighted differently — review is
// itself a substantial chunk of the work (revisions, fixes, sign-off), so a
// module finished with the build phase isn't "halfway done" with the whole
// journey — it's only ~40% there.
//   backlog      → 0
//   in_progress  → 0-40    (build phase)
//   in_review    → 40-100  (review + revisions, the larger slice)
//   done         → 100
export function getModuleOverallProgress(module: Module): number {
  const p = getModuleProgress(module);
  switch (module.status) {
    case 'backlog': return 0;
    case 'in_progress': return p * 0.40;
    case 'in_review': return 40 + p * 0.60;
    case 'done': return 100;
  }
}

export function getModuleTaskCounts(module: Module): { completed: number; total: number } {
  const total = module.documents.length;
  const completed = module.documents.filter((d) => d.status === 'received').length;
  return { completed, total };
}

export function getOverallProgress(modules: Module[]): number {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, m) => sum + getModuleOverallProgress(m), 0);
  return Math.round(total / modules.length);
}

export function getPhaseProgress(modules: Module[], phaseId: string): number {
  const phaseModules = modules.filter((m) => m.phase === phaseId);
  return getOverallProgress(phaseModules);
}

export function getDeveloperWorkload(
  modules: Module[],
  devId: string
): { totalTasks: number; completedTasks: number; moduleCount: number } {
  const devModules = modules.filter((m) => m.assignedTo === devId);
  return {
    totalTasks: devModules.length,
    completedTasks: devModules.filter((m) => m.status === 'done').length,
    moduleCount: devModules.length,
  };
}

/**
 * For each module with a due date, calculate how many days ahead/behind it is:
 * - Done modules: days between completedDate and dueDate (positive = finished early)
 * - Not-done modules past due: negative days (overdue)
 * - Not-done modules before due: positive days remaining
 * Returns average days ahead (+) or behind (-), plus status.
 */
export interface ScheduleDetail {
  moduleId: string;
  name: string;
  daysAhead: number;
  isDone: boolean;
}

export function getScheduleHealth(modules: Module[]): {
  status: 'ahead' | 'on_track' | 'behind';
  avgDays: number;
  details: ScheduleDetail[];
} {
  const today = getToday();
  const details: ScheduleDetail[] = [];

  for (const m of modules) {
    if (!m.dueDate) continue;

    if (m.status === 'done') {
      // Done: how early/late was it finished?
      const completedOn = m.completedDate || today;
      const daysAhead = daysBetween(completedOn, m.dueDate);
      details.push({ moduleId: m.id, name: m.name, daysAhead, isDone: true });
    } else {
      // Not done: positive = still have time, negative = overdue
      const daysLeft = daysBetween(today, m.dueDate);
      details.push({ moduleId: m.id, name: m.name, daysAhead: daysLeft, isDone: false });
    }
  }

  if (details.length === 0) {
    return { status: 'on_track', avgDays: 0, details };
  }

  // Schedule health is based ONLY on completed modules + overdue modules
  // "Days left" on active modules doesn't mean ahead — it just means not due yet
  const completedDetails = details.filter((d) => d.isDone);
  const overdueDetails = details.filter((d) => !d.isDone && d.daysAhead < 0);
  const relevantDetails = [...completedDetails, ...overdueDetails];

  let avgDays = 0;
  let status: 'ahead' | 'on_track' | 'behind' = 'on_track';

  if (relevantDetails.length > 0) {
    avgDays = Math.round(relevantDetails.reduce((s, d) => s + d.daysAhead, 0) / relevantDetails.length);
    if (avgDays >= 3) status = 'ahead';
    else if (avgDays <= -1) status = 'behind';
    else status = 'on_track';
  }

  return { status, avgDays, details };
}

export function getModulesCompleted(modules: Module[]): number {
  return modules.filter((m) => m.status === 'done').length;
}
