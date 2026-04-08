import { Project } from '../types';
import { STORAGE_KEY } from '../constants';

export function saveProject(project: Project): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function loadProject(): Project | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function importProject(json: string): Project {
  const data = JSON.parse(json);
  if (
    !data.name ||
    !data.startDate ||
    !Array.isArray(data.modules) ||
    !Array.isArray(data.developers) ||
    !Array.isArray(data.phases)
  ) {
    throw new Error('Invalid project data: missing required fields');
  }
  // Ensure modules have required arrays
  for (const m of data.modules) {
    if (!Array.isArray(m.tasks)) m.tasks = [];
    if (!Array.isArray(m.dependencies)) m.dependencies = [];
    if (!Array.isArray(m.statusHistory)) m.statusHistory = [];
    if (!m.notes) m.notes = '';
  }
  return data as Project;
}
