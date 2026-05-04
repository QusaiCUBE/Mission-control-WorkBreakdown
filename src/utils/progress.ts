import { Module } from '../types';

export function getModuleProgress(module: Module): number {
  const v = typeof module.progress === 'number' ? module.progress : 0;
  return Math.max(0, Math.min(100, v));
}

// Weighted contribution of a single module to the overall project progress.
// Each column owns a slice of the 0-100 overall range; the per-module `progress`
// (0-100 within its column) interpolates across that slice.
//
// The build phase is the heavy lift, review is the final polish — so a module
// fully built but not yet reviewed sits at 80%, and the review phase only
// covers the last 20 points to reach Done.
//   backlog      → 0
//   in_progress  → 0-80    (build phase, the larger slice)
//   in_review    → 80-100  (review polish, the final 20%)
//   done         → 100
export function getModuleOverallProgress(module: Module): number {
  const p = getModuleProgress(module);
  switch (module.status) {
    case 'backlog': return 0;
    case 'in_progress': return p * 0.80;
    case 'in_review': return 80 + p * 0.20;
    case 'done': return 100;
  }
}

export function getOverallProgress(modules: Module[]): number {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, m) => sum + getModuleOverallProgress(m), 0);
  return Math.round(total / modules.length);
}

export function getModulesCompleted(modules: Module[]): number {
  return modules.filter((m) => m.status === 'done').length;
}
