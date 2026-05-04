import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, Module, Phase, ModuleStatus, DailyLogEntry } from '../types';
import { createInitialProject, recreateProject } from '../data/initialData';
import { saveProject, loadProject, clearProject, exportProject, importProject } from '../utils/storage';
import { getToday } from '../utils/dates';
import { generateId } from '../utils/id';
import { saveProjectToFirebase, onProjectChange, subscribeAuthState } from '../utils/firebase';

// Fields that earlier versions of the app stored on each module but no longer
// uses. Stripped on load so they don't keep round-tripping through Firebase.
const LEGACY_MODULE_FIELDS = ['tasks', 'documents', 'attachments', 'notes'] as const;

function stripLegacyFields(m: Module): { module: Module; changed: boolean } {
  let changed = false;
  const copy = { ...m } as Module & Record<string, unknown>;
  for (const f of LEGACY_MODULE_FIELDS) {
    if (f in copy) {
      delete copy[f];
      changed = true;
    }
  }
  return { module: copy as Module, changed };
}

function normalizeProject(project: Project): Project {
  const today = getToday();
  let modules = [...project.modules];
  let changed = false;

  // Migration: merge "Offsite" and "Procore (Replica)" into "Offsite & Procore"
  const offsiteIdx = modules.findIndex((m) => m.prefix === 'offsite');
  const procoreIdx = modules.findIndex((m) => m.prefix === 'procore');
  if (offsiteIdx !== -1 && procoreIdx !== -1) {
    const offsite = modules[offsiteIdx];
    const procore = modules[procoreIdx];
    const merged: Module = {
      ...offsite,
      name: 'Offsite & Procore',
      description: 'Modular construction management + field operations (RFIs, submittals, daily logs)',
      prefix: 'offsite-procore',
      assignedTo: offsite.assignedTo || procore.assignedTo,
      status: (['done', 'in_review', 'in_progress', 'backlog'] as const).find(
        (s) => offsite.status === s || procore.status === s
      ) || offsite.status,
      statusHistory: [...offsite.statusHistory, ...procore.statusHistory],
    };
    modules = modules.filter((m) => m.prefix !== 'offsite' && m.prefix !== 'procore');
    modules.splice(offsiteIdx, 0, merged);
    modules = modules.map((m) => ({
      ...m,
      dependencies: m.dependencies
        .filter((id) => id !== procore.id)
        .map((id) => (id === offsite.id ? merged.id : id)),
    }));
    changed = true;
  }

  // Migration: ensure dailyLog array + onHold flag + strip legacy fields.
  modules = modules.map((m) => {
    let mod = m;
    if (!mod.dailyLog) { changed = true; mod = { ...mod, dailyLog: [] }; }
    if (typeof mod.onHold !== 'boolean') { changed = true; mod = { ...mod, onHold: false }; }
    const stripped = stripLegacyFields(mod);
    if (stripped.changed) changed = true;
    return stripped.module;
  });

  // Migration: seed progress from status for modules missing the field
  const progressSeed = { backlog: 0, in_progress: 33, in_review: 66, done: 100 } as const;
  modules = modules.map((m) => {
    if (typeof m.progress !== 'number') {
      changed = true;
      return { ...m, progress: progressSeed[m.status] };
    }
    return m;
  });

  // Done modules: completedDate = dueDate, and if completed after due, bump dueDate to match
  modules = modules.map((m) => {
    let mod = m;
    if (mod.statusHistory.length > 0) {
      changed = true;
      mod = { ...mod, statusHistory: [] };
    }
    if (mod.status === 'done') {
      const completedDate = mod.completedDate || today;
      const dueDate = mod.dueDate || completedDate;
      const fixedDueDate = dueDate < completedDate ? completedDate : dueDate;
      if (mod.completedDate !== completedDate || mod.dueDate !== fixedDueDate) {
        changed = true;
        mod = { ...mod, completedDate, dueDate: fixedDueDate };
      }
    }
    return mod;
  });

  // Sync project startDate from earliest phase
  const sortedPhases = [...project.phases].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (sortedPhases.length > 0 && sortedPhases[0].startDate < project.startDate) {
    changed = true;
  }
  const startDate = sortedPhases.length > 0 && sortedPhases[0].startDate < project.startDate
    ? sortedPhases[0].startDate
    : project.startDate;

  // Migration: drop legacy integrationMap field if present
  if ('integrationMap' in (project as unknown as Record<string, unknown>)) {
    changed = true;
    const { integrationMap: _drop, ...rest } = project as Project & { integrationMap?: unknown };
    project = rest as Project;
  }

  // Migration: refresh developer colors to the current palette by id
  // (christian → blue-500, qusai → rose-500). Names left untouched so renames stick.
  const DEV_COLORS: Record<string, string> = {
    'dev-christian': '#3B82F6',
    'dev-qusai': '#F43F5E',
  };
  const newDevelopers = project.developers.map((d) =>
    DEV_COLORS[d.id] && d.color !== DEV_COLORS[d.id]
      ? { ...d, color: DEV_COLORS[d.id] }
      : d
  ) as typeof project.developers;
  const developersChanged = newDevelopers.some((d, i) => d !== project.developers[i]);
  if (developersChanged) changed = true;

  return changed ? { ...project, modules, startDate, developers: newDevelopers } : project;
}

export function useProject() {
  const defaultProject = normalizeProject(loadProject() ?? createInitialProject(getToday()));
  const [project, setProject] = useState<Project>(defaultProject);
  const isRemoteUpdate = useRef(false);
  const firebaseReady = useRef(false);

  // Subscribe to Firebase only while a user is signed in. When the auth user
  // changes (login / logout), tear down the previous subscription and start a
  // new one — otherwise post-login state never syncs.
  useEffect(() => {
    let dataUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = subscribeAuthState((user) => {
      if (dataUnsubscribe) {
        dataUnsubscribe();
        dataUnsubscribe = null;
      }
      firebaseReady.current = false;

      if (!user) return;

      dataUnsubscribe = onProjectChange((remoteProject) => {
        if (remoteProject) {
          isRemoteUpdate.current = true;
          const normalized = normalizeProject(remoteProject);
          setProject(normalized);
          saveProject(normalized);
        }
        firebaseReady.current = true;
      });
    });

    return () => {
      authUnsubscribe();
      if (dataUnsubscribe) dataUnsubscribe();
    };
  }, []);

  // Save locally always, but only push to Firebase AFTER first read
  useEffect(() => {
    saveProject(project);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (firebaseReady.current) {
      saveProjectToFirebase(project);
    }
  }, [project]);

  const addModule = useCallback((name: string, description: string, phase: string) => {
    setProject((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: generateId(),
          name,
          description,
          prefix: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          assignedTo: null,
          status: 'backlog' as const,
          phase,
          startDate: null,
          dueDate: null,
          completedDate: null,
          priority: 'medium' as const,
          progress: 0,
          onHold: false,
          statusHistory: [],
          dependencies: [],
          dailyLog: [],
        },
      ],
    }));
  }, []);

  const removeModule = useCallback((moduleId: string) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }));
  }, []);

  const updateModule = useCallback((moduleId: string, updates: Partial<Module>) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)),
    }));
  }, []);

  const sortPhases = (phases: Phase[]) => [...phases].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const syncStartDate = (prev: Project, newPhases: Phase[]): string => {
    if (newPhases.length === 0) return prev.startDate;
    const sorted = sortPhases(newPhases);
    return sorted[0].startDate < prev.startDate ? sorted[0].startDate : prev.startDate;
  };

  const updatePhase = useCallback((phaseId: string, updates: Partial<Phase>) => {
    setProject((prev) => {
      const newPhases = sortPhases(prev.phases.map((p) => (p.id === phaseId ? { ...p, ...updates } : p)));
      return { ...prev, phases: newPhases, startDate: syncStartDate(prev, newPhases) };
    });
  }, []);

  const addPhase = useCallback((name: string, startDate: string, endDate: string) => {
    setProject((prev) => {
      const newPhases = sortPhases([
        ...prev.phases,
        { id: generateId(), name, startDate, endDate, description: '' },
      ]);
      return { ...prev, phases: newPhases, startDate: syncStartDate(prev, newPhases) };
    });
  }, []);

  const removePhase = useCallback((phaseId: string) => {
    setProject((prev) => ({
      ...prev,
      phases: prev.phases.filter((p) => p.id !== phaseId),
    }));
  }, []);

  const moveModule = useCallback((moduleId: string, newStatus: ModuleStatus) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id !== moduleId || m.status === newStatus) return m;
        const today = getToday();
        const movingToDone = newStatus === 'done';
        const movingFromDone = m.status === 'done' && newStatus !== 'done';
        // Progress is scoped to the current column. Any status change resets to 0,
        // except Done which is always 100.
        const nextProgress = newStatus === 'done' ? 100 : 0;
        return {
          ...m,
          status: newStatus,
          progress: nextProgress,
          completedDate: movingToDone ? (m.dueDate || today) : movingFromDone ? null : m.completedDate,
          statusHistory: [
            ...m.statusHistory,
            { from: m.status, to: newStatus, date: today, by: 'user' },
          ],
        };
      }),
    }));
  }, []);

  const updateModuleProgress = useCallback((moduleId: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, progress: clamped } : m)),
    }));
  }, []);

  const assignModule = useCallback((moduleId: string, devId: string | null) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, assignedTo: devId } : m)),
    }));
  }, []);

  const setModuleOnHold = useCallback((moduleId: string, onHold: boolean) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, onHold } : m)),
    }));
  }, []);

  const addLogEntry = useCallback(
    (moduleId: string, date: string, text: string, author: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const entry: DailyLogEntry = {
        id: generateId(),
        date,
        text: trimmed,
        createdAt: new Date().toISOString(),
        author,
      };
      setProject((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, dailyLog: [...(m.dailyLog ?? []), entry] } : m
        ),
      }));
    },
    []
  );

  const updateLogEntry = useCallback(
    (moduleId: string, entryId: string, updates: Partial<Pick<DailyLogEntry, 'text' | 'date'>>) => {
      setProject((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                dailyLog: (m.dailyLog ?? []).map((e) =>
                  e.id === entryId ? { ...e, ...updates } : e
                ),
              }
            : m
        ),
      }));
    },
    []
  );

  const removeLogEntry = useCallback((moduleId: string, entryId: string) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, dailyLog: (m.dailyLog ?? []).filter((e) => e.id !== entryId) }
          : m
      ),
    }));
  }, []);

  const updateDeveloperName = useCallback((devId: string, name: string) => {
    setProject((prev) => ({
      ...prev,
      developers: prev.developers.map((d) =>
        d.id === devId ? { ...d, name } : d
      ) as [typeof prev.developers[0], typeof prev.developers[1]],
    }));
  }, []);

  const updateModuleDates = useCallback(
    (moduleId: string, startDate: string | null, dueDate: string | null) => {
      setProject((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, startDate, dueDate } : m
        ),
      }));
    },
    []
  );

  const updateModulePriority = useCallback(
    (moduleId: string, priority: Module['priority']) => {
      setProject((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, priority } : m
        ),
      }));
    },
    []
  );

  const updateStartDate = useCallback((date: string) => {
    setProject((prev) => {
      const newProject = recreateProject(date);
      newProject.developers = prev.developers;
      return newProject;
    });
  }, []);

  const updatePhaseDurations = useCallback((durations: number[]) => {
    setProject((prev) => {
      const newProject = recreateProject(prev.startDate, durations);
      newProject.developers = prev.developers;
      return newProject;
    });
  }, []);

  const importData = useCallback((json: string) => {
    try {
      const data = importProject(json);
      setProject(data);
    } catch (e) {
      alert(`Import failed: ${e instanceof Error ? e.message : 'Invalid file'}`);
    }
  }, []);

  const resetProject = useCallback(() => {
    clearProject();
    setProject(createInitialProject(getToday()));
  }, []);

  const reorderModules = useCallback((fromIndex: number, toIndex: number) => {
    setProject((prev) => {
      const newModules = [...prev.modules];
      const [moved] = newModules.splice(fromIndex, 1);
      newModules.splice(toIndex, 0, moved);
      return { ...prev, modules: newModules };
    });
  }, []);

  const exportData = useCallback(() => {
    return exportProject(project);
  }, [project]);

  return {
    project,
    addModule,
    removeModule,
    updateModule,
    moveModule,
    assignModule,
    setModuleOnHold,
    updateDeveloperName,
    updateModuleDates,
    updateModulePriority,
    updateModuleProgress,
    updateStartDate,
    updatePhaseDurations,
    importData,
    updatePhase,
    addPhase,
    removePhase,
    addLogEntry,
    updateLogEntry,
    removeLogEntry,
    reorderModules,
    resetProject,
    exportData,
  };
}
