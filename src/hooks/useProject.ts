import { useState, useEffect, useCallback } from 'react';
import { Project, Module, Phase, ModuleStatus, RequiredDocument } from '../types';
import { createInitialProject, recreateProject } from '../data/initialData';
import { saveProject, loadProject, clearProject, exportProject, importProject } from '../utils/storage';
import { getToday } from '../utils/dates';
import { generateId } from '../utils/id';

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
    // Keep the more-progressed module's status, merge tasks from offsite
    const merged: Module = {
      ...offsite,
      name: 'Offsite & Procore',
      description: 'Modular construction management + field operations (RFIs, submittals, daily logs)',
      prefix: 'offsite-procore',
      // Keep whichever assignment exists
      assignedTo: offsite.assignedTo || procore.assignedTo,
      // Keep whichever status is further along
      status: (['done', 'in_review', 'in_progress', 'backlog'] as const).find(
        (s) => offsite.status === s || procore.status === s
      ) || offsite.status,
      notes: [offsite.notes, procore.notes].filter(Boolean).join('\n'),
      statusHistory: [...offsite.statusHistory, ...procore.statusHistory],
    };
    // Remove both, insert merged at the offsite position
    modules = modules.filter((m) => m.prefix !== 'offsite' && m.prefix !== 'procore');
    modules.splice(offsiteIdx, 0, merged);
    // Update shell dependencies: replace old IDs with merged ID
    modules = modules.map((m) => ({
      ...m,
      dependencies: m.dependencies
        .filter((id) => id !== procore.id)
        .map((id) => (id === offsite.id ? merged.id : id)),
    }));
    changed = true;
  }

  // Migration: add documents array to modules that don't have it
  modules = modules.map((m) => {
    if (!m.documents) {
      changed = true;
      return { ...m, documents: [] };
    }
    return m;
  });

  // Fix done modules: completedDate = dueDate, and if completed after due, bump dueDate to match
  modules = modules.map((m) => {
    let mod = m;
    // Clear stale status history
    if (mod.statusHistory.length > 0) {
      changed = true;
      mod = { ...mod, statusHistory: [] };
    }
    if (mod.status === 'done') {
      // Set completedDate to today if not set, and ensure dueDate >= completedDate
      const completedDate = mod.completedDate || today;
      const dueDate = mod.dueDate || completedDate;
      // If completed after due, the due date was wrong — set due = completed (on time)
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

  return changed ? { ...project, modules, startDate } : project;
}

export function useProject() {
  const [project, setProject] = useState<Project>(() => {
    const saved = loadProject();
    return normalizeProject(saved ?? createInitialProject(getToday()));
  });

  useEffect(() => {
    saveProject(project);
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
          tasks: [],
          documents: [],
          notes: '',
          statusHistory: [],
          dependencies: [],
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
        return {
          ...m,
          status: newStatus,
          // Use due date as completion date if available, otherwise today
          completedDate: movingToDone ? (m.dueDate || today) : movingFromDone ? null : m.completedDate,
          tasks: m.tasks,
          statusHistory: [
            ...m.statusHistory,
            { from: m.status, to: newStatus, date: today, by: 'user' },
          ],
        };
      }),
    }));
  }, []);

  const assignModule = useCallback((moduleId: string, devId: string | null) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, assignedTo: devId } : m)),
    }));
  }, []);

  const assignTask = useCallback((moduleId: string, taskId: string, devId: string | null) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: devId } : t)),
            }
          : m
      ),
    }));
  }, []);

  const toggleTask = useCallback((moduleId: string, taskId: string) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              tasks: m.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      completed: !t.completed,
                      completedDate: !t.completed ? getToday() : null,
                    }
                  : t
              ),
            }
          : m
      ),
    }));
  }, []);

  const addDocument = useCallback((moduleId: string, doc: RequiredDocument) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, documents: [...m.documents, doc] } : m
      ),
    }));
  }, []);

  const updateDocument = useCallback((moduleId: string, docId: string, updates: Partial<RequiredDocument>) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, documents: m.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)) }
          : m
      ),
    }));
  }, []);

  const removeDocument = useCallback((moduleId: string, docId: string) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, documents: m.documents.filter((d) => d.id !== docId) } : m
      ),
    }));
  }, []);

  const setProjectStartDate = useCallback((date: string) => {
    setProject((prev) => ({ ...prev, startDate: date }));
  }, []);

  const updateDeveloperName = useCallback((devId: string, name: string) => {
    setProject((prev) => ({
      ...prev,
      developers: prev.developers.map((d) =>
        d.id === devId ? { ...d, name } : d
      ) as [typeof prev.developers[0], typeof prev.developers[1]],
    }));
  }, []);

  const updateModuleNotes = useCallback((moduleId: string, notes: string) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, notes } : m)),
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

  const updateCompletedDate = useCallback((moduleId: string, completedDate: string | null) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, completedDate } : m
      ),
    }));
  }, []);

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
      // Preserve developer names
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
    assignTask,
    toggleTask,
    setProjectStartDate,
    updateDeveloperName,
    updateModuleNotes,
    updateModuleDates,
    updateCompletedDate,
    updateModulePriority,
    updateStartDate,
    updatePhaseDurations,
    importData,
    updatePhase,
    addPhase,
    removePhase,
    addDocument,
    updateDocument,
    removeDocument,
    reorderModules,
    resetProject,
    exportData,
  };
}
