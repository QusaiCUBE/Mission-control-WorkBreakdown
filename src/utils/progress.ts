import { Module } from '../types';

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

export function getOverallProgress(modules: Module[]): number {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, m) => sum + getModuleOverallProgress(m), 0);
  return Math.round(total / modules.length);
}

export function getModulesCompleted(modules: Module[]): number {
  return modules.filter((m) => m.status === 'done').length;
}
