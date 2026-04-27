import { Project, Module, Task, Phase } from '../types';
import { generateId } from '../utils/id';
import { addDays, generatePhaseDates } from '../utils/dates';
import { INTEGRATION_TASKS } from './tasks';
import { MODULE_DEFINITIONS } from './modules';
import { DEFAULT_PHASE_DURATIONS } from '../constants';

function createTasks(): Task[] {
  return INTEGRATION_TASKS.map((template) => ({
    id: generateId(),
    title: template.title,
    description: template.description,
    completed: false,
    assignedTo: null,
    completedDate: null,
    order: template.order,
  }));
}

function createPhases(startDate: string, durations: number[] = DEFAULT_PHASE_DURATIONS): Phase[] {
  const dates = generatePhaseDates(startDate, durations);
  const phaseNames = [
    { id: 'phase-0', name: 'Phase 0: Setup', description: 'Repository setup, monorepo structure, shared package' },
    { id: 'phase-1', name: 'Phase 1: Module Integration', description: 'Integrate all 9 modules with shared standards' },
    { id: 'phase-2', name: 'Phase 2: Shell', description: 'Build the Mission Control shell application' },
    { id: 'phase-3', name: 'Phase 3: Polish & QA', description: 'Integration testing, bug fixes, performance, docs' },
  ];

  return phaseNames.map((phase, i) => ({
    ...phase,
    startDate: dates[i].start,
    endDate: dates[i].end,
  }));
}

function createModules(phases: Phase[]): Module[] {
  const phase1 = phases.find((p) => p.id === 'phase-1')!;
  const phase2 = phases.find((p) => p.id === 'phase-2')!;

  const phase1Modules = MODULE_DEFINITIONS.filter((d) => d.phase === 'phase-1');
  const moduleCount = phase1Modules.length;
  const phase1Days = Math.round(
    (new Date(phase1.endDate + 'T00:00:00').getTime() - new Date(phase1.startDate + 'T00:00:00').getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const staggerDays = Math.floor(phase1Days / moduleCount);

  const modules: Module[] = [];

  // Phase 1 modules — staggered across the phase
  phase1Modules.forEach((def, index) => {
    const startDate = addDays(phase1.startDate, index * staggerDays);
    const dueDate = addDays(startDate, 13); // ~2 weeks per module

    modules.push({
      id: generateId(),
      name: def.name,
      description: def.description,
      prefix: def.prefix,
      assignedTo: null,
      status: 'backlog',
      phase: def.phase,
      startDate,
      dueDate,
      completedDate: null,
      priority: 'medium',
      progress: 0,
      tasks: createTasks(),
      documents: [],
      attachments: [],
      notes: '',
      statusHistory: [],
      dependencies: [],
      dailyLog: [],
    });
  });

  // Shell module — Phase 2, depends on all Phase 1 modules
  const shellDef = MODULE_DEFINITIONS.find((d) => d.phase === 'phase-2')!;
  const phase1ModuleIds = modules.map((m) => m.id);

  modules.push({
    id: generateId(),
    name: shellDef.name,
    description: shellDef.description,
    prefix: shellDef.prefix,
    assignedTo: null,
    status: 'backlog',
    phase: shellDef.phase,
    startDate: phase2.startDate,
    dueDate: phase2.endDate,
    completedDate: null,
    priority: 'high',
    progress: 0,
    tasks: createTasks(),
    documents: [],
    attachments: [],
    notes: '',
    statusHistory: [],
    dependencies: phase1ModuleIds,
    dailyLog: [],
  });

  return modules;
}

export function createInitialProject(startDate: string): Project {
  const phases = createPhases(startDate);
  const modules = createModules(phases);

  return {
    name: 'Mission Control — ERP Integration',
    startDate,
    developers: [
      { id: 'dev-christian', name: 'Christian', color: '#0984E3' },
      { id: 'dev-qusai', name: 'TBD', color: '#0ABAB5' },
    ],
    phases,
    modules,
    integrationMap: { nodes: [], connections: [] },
  };
}

export function recreateProject(startDate: string, durations?: number[]): Project {
  const phases = createPhases(startDate, durations);
  const modules = createModules(phases);

  return {
    name: 'Mission Control — ERP Integration',
    startDate,
    developers: [
      { id: 'dev-christian', name: 'Christian', color: '#0984E3' },
      { id: 'dev-qusai', name: 'TBD', color: '#0ABAB5' },
    ],
    phases,
    modules,
    integrationMap: { nodes: [], connections: [] },
  };
}
