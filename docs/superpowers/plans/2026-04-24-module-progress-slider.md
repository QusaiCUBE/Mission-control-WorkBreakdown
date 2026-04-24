# Module Progress Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-module `progress` field (0-100) with a popover slider prompt on board drops into In Progress / In Review, live-saving from the module detail slide-over, and a fill overlay on the Gantt chart.

**Architecture:** Progress becomes a first-class field on `Module`, independent of status. Status changes via drag-drop set presets only for Backlog (0) and Done (100); In Progress and In Review open a popover-anchored slider that live-saves. The module detail slide-over hosts the same slider for fine-tuning at any time. Existing data migrates silently in both `normalizeProject()` and the Firebase array-fix.

**Tech Stack:** React 18, TypeScript, Tailwind, Vite, Firebase Realtime Database (already wired). No test framework in this repo — each task ends with a manual `npm run dev` verification step.

**Spec:** `docs/superpowers/specs/2026-04-24-module-progress-slider-design.md`

---

## File Structure

### New files

- `src/components/shared/Slider.tsx` — reusable horizontal slider (range input styled, numeric label, disabled state).
- `src/components/board/ProgressPopover.tsx` — absolutely-positioned popover containing the Slider + title + close button; handles click-outside and Escape dismissal.

### Modified files

- `src/types/index.ts` — add `progress: number` to `Module`.
- `src/utils/progress.ts` — `getModuleProgress()` returns `module.progress`; overall/phase progress average the new field.
- `src/utils/firebase.ts` — array-fix block seeds `progress` from status on incoming modules missing it.
- `src/hooks/useProject.ts` — migrate missing `progress` in `normalizeProject()`; change `moveModule` to set preset 0/100 for backlog/done only; add `updateModuleProgress` callback.
- `src/data/initialData.ts` — initial modules ship with `progress: 0`.
- `src/components/board/BoardView.tsx` — intercept `onMoveModule`; on status change into in_progress or in_review, open `ProgressPopover` anchored to drop coordinates.
- `src/components/detail/ModuleDetail.tsx` — add Progress section with slider between header and `ModuleMetadata`.
- `src/components/timeline/GanttChart.tsx` — add a 1px tick at progress boundary and a `<title>` tooltip to each bar.
- `src/App.tsx` — pass `updateModuleProgress` through permission gate on `canEditModules`.

---

## Task 1: Add `progress` field to type + migrations + initial data

**Files:**
- Modify: `src/types/index.ts:55-73`
- Modify: `src/hooks/useProject.ts:10-96`
- Modify: `src/utils/firebase.ts:88-112`
- Modify: `src/data/initialData.ts:48-98`

- [ ] **Step 1: Add `progress` to the `Module` interface**

Open `src/types/index.ts`. In the `Module` interface (starts around line 55), add `progress: number` after `priority: Priority`:

```ts
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
  progress: number;               // NEW — 0-100
  tasks: Task[];
  documents: RequiredDocument[];
  attachments: Attachment[];
  notes: string;
  statusHistory: StatusChange[];
  dependencies: string[];
}
```

- [ ] **Step 2: Add migration in `normalizeProject`**

Open `src/hooks/useProject.ts`. Find the block that migrates `documents` and `attachments` arrays (around line 49-55). Add a `progress` migration right after it:

```ts
  // Migration: seed progress from status for modules missing it
  const STATUS_PROGRESS_SEED: Record<ModuleStatus, number> = {
    backlog: 0,
    in_progress: 33,
    in_review: 66,
    done: 100,
  };
  modules = modules.map((m) => {
    if (typeof m.progress !== 'number') {
      changed = true;
      return { ...m, progress: STATUS_PROGRESS_SEED[m.status] };
    }
    return m;
  });
```

Make sure `ModuleStatus` is already imported (it is — line 2). If the const was declared elsewhere, declare it module-scope or inside `normalizeProject`. Inside-the-function is fine here.

- [ ] **Step 3: Seed `progress` on Firebase-incoming modules**

Open `src/utils/firebase.ts`. Inside `onProjectChange`, find the `for (const m of fixed.modules)` loop (around line 89-95) and add a line to seed progress if missing:

```ts
          for (const m of fixed.modules) {
            if (!Array.isArray(m.tasks)) m.tasks = [];
            if (!Array.isArray(m.documents)) m.documents = [];
            if (!Array.isArray(m.attachments)) m.attachments = [];
            if (!Array.isArray(m.statusHistory)) m.statusHistory = [];
            if (!Array.isArray(m.dependencies)) m.dependencies = [];
            if (typeof (m as any).progress !== 'number') {
              const seed = { backlog: 0, in_progress: 33, in_review: 66, done: 100 } as const;
              (m as any).progress = seed[m.status as keyof typeof seed] ?? 0;
            }
          }
```

- [ ] **Step 4: Set `progress: 0` on modules created by `initialData.ts`**

Open `src/data/initialData.ts`. Inside `createModules()`, both the Phase 1 loop (around line 51) and the Shell block (around line 80) construct module objects. Add `progress: 0` to both, right after `priority`:

```ts
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
      progress: 0,                 // NEW
      tasks: createTasks(),
      documents: [],
      attachments: [],
      notes: '',
      statusHistory: [],
      dependencies: [],
    });
```

Do the same for the Shell module block (the second `modules.push` below).

- [ ] **Step 5: Verify types compile**

Run: `npm run build`
Expected: TypeScript succeeds. If `Module` consumers complain about a missing `progress`, find them and either set it or make the fix in this task.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/hooks/useProject.ts src/utils/firebase.ts src/data/initialData.ts
git commit -m "feat(types): add progress field to Module with migrations"
```

---

## Task 2: Update progress utilities to read the new field

**Files:**
- Modify: `src/utils/progress.ts:4-30`

- [ ] **Step 1: Update `getModuleProgress` to return `module.progress`**

Open `src/utils/progress.ts`. Replace the `STATUS_WEIGHT` constant usage in `getModuleProgress`. The `STATUS_WEIGHT` constant can stay (other callers might use it) but `getModuleProgress` now returns the field directly:

```ts
import { Module } from '../types';
import { daysBetween, getToday } from './dates';

export function getModuleProgress(module: Module): number {
  return Math.max(0, Math.min(100, module.progress ?? 0));
}

export function getModuleTaskCounts(module: Module): { completed: number; total: number } {
  const total = module.documents.length;
  const completed = module.documents.filter((d) => d.status === 'received').length;
  return { completed, total };
}

export function getOverallProgress(modules: Module[]): number {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, m) => sum + getModuleProgress(m), 0);
  return Math.round(total / modules.length);
}

export function getPhaseProgress(modules: Module[], phaseId: string): number {
  const phaseModules = modules.filter((m) => m.phase === phaseId);
  return getOverallProgress(phaseModules);
}
```

Note: `STATUS_WEIGHT` and `ModuleStatus` import can be removed from this file if unused. Check `Module` import replaces `Module, ModuleStatus` if `ModuleStatus` is no longer referenced.

- [ ] **Step 2: Verify the board and dashboard still render**

Run: `npm run dev`
Expected: The dev server starts. Open `http://localhost:5173`. Log in as any user. On the Dashboard, the "Overall Progress" percentage and module cards render (values will differ slightly from before because they now average per-module `progress` instead of status weights — that's expected).

- [ ] **Step 3: Commit**

```bash
git add src/utils/progress.ts
git commit -m "feat(progress): compute module progress from dedicated field"
```

---

## Task 3: Add `updateModuleProgress` callback and change `moveModule` presets

**Files:**
- Modify: `src/hooks/useProject.ts:208-229, 422-453`
- Modify: `src/App.tsx:142-160, 76-85`
- Modify: `src/utils/permissions.ts` (no changes expected — `canEditModules` already covers it)

- [ ] **Step 1: Change `moveModule` to set progress presets on backlog/done**

Open `src/hooks/useProject.ts`. Find `moveModule` (starts around line 208). Replace it with:

```ts
  const moveModule = useCallback((moduleId: string, newStatus: ModuleStatus) => {
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id !== moduleId || m.status === newStatus) return m;
        const today = getToday();
        const movingToDone = newStatus === 'done';
        const movingFromDone = m.status === 'done' && newStatus !== 'done';

        // Progress presets: backlog = 0, done = 100. In progress / in review keep
        // whatever value the module had — the popover is what sets them.
        let nextProgress = m.progress;
        if (newStatus === 'backlog') nextProgress = 0;
        else if (newStatus === 'done') nextProgress = 100;

        return {
          ...m,
          status: newStatus,
          progress: nextProgress,
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
```

- [ ] **Step 2: Add `updateModuleProgress` callback**

Still in `src/hooks/useProject.ts`. Add this callback somewhere near the other module-update callbacks (e.g. right after `updateModulePriority`, around line 372):

```ts
  const updateModuleProgress = useCallback((moduleId: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    setProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, progress: clamped } : m
      ),
    }));
  }, []);
```

Add it to the returned object at the bottom of the hook (around line 422-452):

```ts
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
    updateModuleProgress,         // NEW
    updateStartDate,
    updatePhaseDurations,
    importData,
    updatePhase,
    addPhase,
    removePhase,
    addDocument,
    updateDocument,
    removeDocument,
    addAttachment,
    removeAttachment,
    reorderModules,
    updateIntegrationMap,
    resetProject,
    exportData,
  };
```

- [ ] **Step 3: Verify dev server still runs**

Run: `npm run dev`
Expected: Drag a backlog card to Done. Confirm its progress bar (Dashboard or card itself) shows 100%. Drag it back to Backlog — progress shows 0%. In Progress and In Review do nothing special yet to progress — that's the next task.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useProject.ts
git commit -m "feat(useProject): progress presets on backlog/done, add updateModuleProgress"
```

---

## Task 4: Build reusable `Slider` component

**Files:**
- Create: `src/components/shared/Slider.tsx`

- [ ] **Step 1: Create the Slider component**

Create `src/components/shared/Slider.tsx` with the following contents. It's a styled range input with a numeric label; live `onChange` so consumers can auto-save on every drag frame.

```tsx
interface SliderProps {
  value: number;              // 0-100
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  ariaLabel = 'Progress',
}: SliderProps) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  // Tailwind can't style range inputs well cross-browser — use a background gradient
  // on the input itself so the filled portion matches regardless of browser defaults.
  const bg = `linear-gradient(to right, #0984E3 0%, #0984E3 ${pct}%, #2D3348 ${pct}%, #2D3348 100%)`;

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
        style={{ background: bg }}
      />
      <span className="text-xs text-gray-300 font-medium w-10 text-right tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: TypeScript succeeds. (The component isn't used yet — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Slider.tsx
git commit -m "feat(shared): add reusable Slider component"
```

---

## Task 5: Build `ProgressPopover` component

**Files:**
- Create: `src/components/board/ProgressPopover.tsx`

- [ ] **Step 1: Create the popover**

Create `src/components/board/ProgressPopover.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import Slider from '../shared/Slider';

interface ProgressPopoverProps {
  value: number;
  x: number;                  // viewport coords of the drop
  y: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

const POPOVER_WIDTH = 280;
const POPOVER_HEIGHT = 96;
const MARGIN = 12;

export default function ProgressPopover({ value, x, y, onChange, onClose }: ProgressPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Click outside closes
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Defer by a frame so the drop event that opened us doesn't immediately close us
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', onDocMouseDown);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDocMouseDown);
    };
  }, [onClose]);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Clamp position to viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x - POPOVER_WIDTH / 2;
  let top = y + MARGIN;
  if (left + POPOVER_WIDTH + MARGIN > vw) left = vw - POPOVER_WIDTH - MARGIN;
  if (left < MARGIN) left = MARGIN;
  if (top + POPOVER_HEIGHT + MARGIN > vh) top = y - POPOVER_HEIGHT - MARGIN;
  if (top < MARGIN) top = MARGIN;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Set module progress"
      className="fixed z-50 w-[280px] bg-bg-secondary border border-border-primary rounded-lg shadow-xl p-3"
      style={{ left, top }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-300">Set progress</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-0.5 rounded text-gray-500 hover:text-gray-200 hover:bg-bg-tertiary transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <Slider value={value} onChange={onChange} ariaLabel="Module progress" />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: TypeScript succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/board/ProgressPopover.tsx
git commit -m "feat(board): add ProgressPopover component"
```

---

## Task 6: Wire popover into BoardView

**Files:**
- Modify: `src/components/board/BoardView.tsx:1-123`
- Modify: `src/App.tsx:75-85`

- [ ] **Step 1: Update `BoardView` to intercept drops and open the popover**

Open `src/components/board/BoardView.tsx`. We need to:
1. Accept a new prop `onUpdateProgress`.
2. Wrap `onMoveModule` in a function that tracks the drop coords (captured from the drop event) and decides whether to open the popover.
3. Render `ProgressPopover` when state dictates.

Replace the contents of the file with:

```tsx
import { useState, useRef, useCallback } from 'react';
import { Module, Developer, ModuleStatus, Phase } from '../../types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import KanbanColumn from './KanbanColumn';
import ProgressPopover from './ProgressPopover';

interface BoardViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  onMoveModule: (moduleId: string, status: ModuleStatus) => void;
  onUpdateProgress: (moduleId: string, progress: number) => void;
  onModuleClick: (moduleId: string) => void;
  onAddModule?: (name: string, description: string, phase: string) => void;
  readOnly?: boolean;
}

const COLUMNS: ModuleStatus[] = ['backlog', 'in_progress', 'in_review', 'done'];
const PROGRESS_PROMPT_STATUSES: ModuleStatus[] = ['in_progress', 'in_review'];

export default function BoardView({
  modules,
  developers,
  phases,
  onMoveModule,
  onUpdateProgress,
  onModuleClick,
  onAddModule,
  readOnly,
}: BoardViewProps) {
  // Track the mouse position of the last drop, so the popover can anchor to it.
  const lastDropCoords = useRef<{ x: number; y: number } | null>(null);
  const [popover, setPopover] = useState<{ moduleId: string; x: number; y: number } | null>(null);

  // Wrap onMoveModule: if status is actually changing AND target is in_progress/in_review,
  // open the popover for the just-moved module. Otherwise just move.
  const handleMove = useCallback(
    (moduleId: string, targetStatus: ModuleStatus) => {
      const current = modules.find((m) => m.id === moduleId);
      const isChangingStatus = current && current.status !== targetStatus;
      onMoveModule(moduleId, targetStatus);
      if (
        !readOnly &&
        isChangingStatus &&
        PROGRESS_PROMPT_STATUSES.includes(targetStatus) &&
        lastDropCoords.current
      ) {
        setPopover({
          moduleId,
          x: lastDropCoords.current.x,
          y: lastDropCoords.current.y,
        });
      }
    },
    [modules, onMoveModule, readOnly]
  );

  const dnd = useDragAndDrop(handleMove);

  // Intercept drop to capture mouse coords BEFORE useDragAndDrop runs its handler.
  const captureDrop = useCallback(
    (e: React.DragEvent, status: ModuleStatus) => {
      lastDropCoords.current = { x: e.clientX, y: e.clientY };
      dnd.handleDrop(e, status);
    },
    [dnd]
  );

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhase, setNewPhase] = useState(phases[0]?.id || '');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddModule?.(newName.trim(), newDesc.trim(), newPhase);
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
  };

  const popoverModule = popover ? modules.find((m) => m.id === popover.moduleId) : null;

  return (
    <div className="space-y-4">
      {/* Add module bar */}
      {onAddModule && !readOnly && (
        <div className="flex items-center gap-3">
          {showAdd ? (
            <div className="flex items-end gap-2 flex-wrap bg-bg-secondary border border-border-primary rounded-lg p-3 w-full">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-gray-400 mb-1 block">Module Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="e.g. Inventory Management"
                  autoFocus
                  className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Brief description"
                  className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phase</label>
                <select
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value)}
                  className="bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-christian cursor-pointer"
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-1.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setNewDesc(''); }}
                className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 text-sm font-medium text-christian bg-christian/10 rounded-lg hover:bg-christian/20 transition-colors"
            >
              + Add Module
            </button>
          )}
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const columnModules = modules.filter((m) => m.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              modules={columnModules}
              developers={developers}
              isDropTarget={dnd.dragOverColumn === status}
              onModuleClick={onModuleClick}
              onDragStart={dnd.handleDragStart}
              onDragEnd={dnd.handleDragEnd}
              onDragOver={(e) => dnd.handleDragOver(e, status)}
              onDragLeave={dnd.handleDragLeave}
              onDrop={(e) => captureDrop(e, status)}
            />
          );
        })}
      </div>

      {/* Progress popover */}
      {popover && popoverModule && (
        <ProgressPopover
          value={popoverModule.progress ?? 0}
          x={popover.x}
          y={popover.y}
          onChange={(v) => onUpdateProgress(popover.moduleId, v)}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Pass the new prop from `App.tsx`**

Open `src/App.tsx`. Find the `currentView === 'board'` block (around line 75-85). Add `onUpdateProgress`:

```tsx
          {currentView === 'board' && (
            <BoardView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              onMoveModule={perms.canMoveModules ? projectHook.moveModule : noopAny}
              onUpdateProgress={perms.canEditModules ? projectHook.updateModuleProgress : noopAny}
              onModuleClick={viewState.openModuleDetail}
              onAddModule={perms.canCreateModules ? projectHook.addModule : undefined}
              readOnly={!perms.canMoveModules}
            />
          )}
```

- [ ] **Step 3: Manually verify**

Run: `npm run dev`
1. Log in as `qusai` (admin) or `christian` (regular).
2. Drag a Backlog card to In Progress. Confirm: popover appears near where you dropped, slider starts at that module's current progress, dragging the slider live-updates the module card's progress bar behind it.
3. Press Escape — popover closes, last slider value persists. Click the card to open the detail slide-over; confirm progress value is what you left it on.
4. Drag a card to Backlog — popover does NOT open; progress snaps to 0.
5. Drag a card to Done — popover does NOT open; progress snaps to 100.
6. Drag a card to In Review — popover opens.
7. Drag a card within the same column — popover does NOT open.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/BoardView.tsx src/App.tsx
git commit -m "feat(board): popover slider on drop into In Progress / In Review"
```

---

## Task 7: Add Progress slider to module detail slide-over

**Files:**
- Modify: `src/components/detail/ModuleDetail.tsx:1-138`
- Modify: `src/App.tsx:142-160`

- [ ] **Step 1: Extend `ModuleDetail` props and UI**

Open `src/components/detail/ModuleDetail.tsx`. Add `onUpdateProgress` to the props and render a Progress section between the header and `ModuleMetadata`:

At the top of the file, add the Slider import:

```tsx
import Slider from '../shared/Slider';
```

In the props interface, add:

```tsx
  onUpdateProgress: (moduleId: string, progress: number) => void;
```

In the destructured params of the component, add `onUpdateProgress`.

In the JSX, right above the `<ModuleMetadata ...>` element (around line 99), insert:

```tsx
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
            Progress
          </label>
          <Slider
            value={module.progress ?? 0}
            onChange={(v) => onUpdateProgress(module.id, v)}
            disabled={readOnly}
            ariaLabel={`Progress for ${module.name}`}
          />
        </div>
```

- [ ] **Step 2: Pass the callback from `App.tsx`**

Open `src/App.tsx`. Find the `<ModuleDetail ...>` block (around line 142-160). Add:

```tsx
          <ModuleDetail
            module={selectedModule}
            developers={project.developers}
            onClose={viewState.closeModuleDetail}
            onUpdateModule={perms.canEditModules ? projectHook.updateModule : noopAny}
            onAssignModule={perms.canAssign ? projectHook.assignModule : noopAny}
            onUpdateNotes={perms.canEditNotes ? projectHook.updateModuleNotes : noopAny}
            onUpdatePriority={perms.canEditModules ? projectHook.updateModulePriority : noopAny}
            onUpdateProgress={perms.canEditModules ? projectHook.updateModuleProgress : noopAny}
            onAddDocument={perms.canEditDocuments ? projectHook.addDocument : noopAny}
            onUpdateDocument={perms.canEditDocuments ? projectHook.updateDocument : () => {}}
            onRemoveDocument={perms.canEditDocuments ? projectHook.removeDocument : noopAny}
            onAddAttachment={perms.canAttachFiles ? projectHook.addAttachment : noopAny}
            onRemoveAttachment={perms.canAttachFiles ? projectHook.removeAttachment : noopAny}
            readOnly={!perms.canEditModules}
          />
```

- [ ] **Step 3: Manually verify**

Run: `npm run dev`
1. Click any module card to open the slide-over. Confirm the Progress slider appears right under the header (above Assigned/Priority/Dates).
2. Drag the slider. Confirm the number updates live and persists after closing + re-opening the slide-over.
3. Log out, log in as `justin` (viewer). Open a module — confirm the slider is disabled (grayed, not draggable).

- [ ] **Step 4: Commit**

```bash
git add src/components/detail/ModuleDetail.tsx src/App.tsx
git commit -m "feat(detail): add progress slider to module slide-over"
```

---

## Task 8: Enhance Gantt bar with progress tick + tooltip

**Files:**
- Modify: `src/components/timeline/GanttChart.tsx:196-265`

- [ ] **Step 1: Add tick line and hover tooltip to each module bar**

Open `src/components/timeline/GanttChart.tsx`. Inside the module bar `<g>` block (around line 200-263), after the "Progress fill" `<rect>` and before "Module name" `<text>`, insert a tick line. Also wrap the bar group in a `<title>` for the tooltip. Replace the module `<g>` block (lines 200-264) with:

```tsx
        return (
          <g key={module.id} style={{ cursor: isDraggingThis ? 'grabbing' : 'grab' }}>
            <title>
              {module.name} — {progress}% complete
              {module.startDate && module.dueDate
                ? ` (${module.startDate} → ${module.dueDate})`
                : ''}
            </title>

            {/* Background bar */}
            <rect
              x={x}
              y={y}
              width={w}
              height={BAR_HEIGHT}
              rx={4}
              fill={`${barColor}${hasNoDates ? '20' : '40'}`}
              stroke={barColor}
              strokeWidth={1}
              strokeDasharray={hasNoDates ? '4 2' : undefined}
              onMouseDown={(e) => handleMouseDown(e, module.id, 'move', moduleStart, moduleEnd)}
            />

            {/* Progress fill */}
            {progressW > 0 && (
              <rect
                x={x}
                y={y}
                width={progressW}
                height={BAR_HEIGHT}
                rx={4}
                fill={`${barColor}80`}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Progress boundary tick (only when partial) */}
            {progress > 0 && progress < 100 && (
              <line
                x1={x + progressW}
                y1={y}
                x2={x + progressW}
                y2={y + BAR_HEIGHT}
                stroke="white"
                strokeWidth={1}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Module name */}
            <text
              x={x + 10}
              y={y + BAR_HEIGHT / 2 + 4}
              className="text-[11px] font-medium"
              fill="white"
              style={{ pointerEvents: 'none' }}
            >
              {module.name}
            </text>

            {/* Resize handle (left edge) */}
            <rect
              x={x}
              y={y}
              width={8}
              height={BAR_HEIGHT}
              fill="transparent"
              rx={4}
              style={{ cursor: 'col-resize' }}
              onMouseDown={(e) => handleMouseDown(e, module.id, 'resize-start', moduleStart, moduleEnd)}
            />

            {/* Resize handle (right edge) */}
            <rect
              x={x + w - 8}
              y={y}
              width={8}
              height={BAR_HEIGHT}
              fill="transparent"
              rx={4}
              style={{ cursor: 'col-resize' }}
              onMouseDown={(e) => handleMouseDown(e, module.id, 'resize-end', moduleStart, moduleEnd)}
            />
          </g>
        );
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`
1. Go to the Timeline view. Confirm each bar shows a fill overlay matching its `progress`.
2. Hover over a bar — a tooltip reads e.g. `CRM — 42% complete (2026-05-01 → 2026-05-14)`.
3. Confirm a white 1px tick appears at the fill boundary when progress is between 0 and 100.
4. Change a module's progress via the slide-over slider; go back to Timeline — confirm the bar updates.

- [ ] **Step 3: Commit**

```bash
git add src/components/timeline/GanttChart.tsx
git commit -m "feat(gantt): add progress boundary tick and hover tooltip"
```

---

## Task 9: Final end-to-end verification

- [ ] **Step 1: Fresh-load migration check**

Run: `npm run dev`
Log in as `qusai`. Open DevTools → Application → Local Storage → delete the `mc-project` key. Reload. Confirm:
- The app loads with fresh initial data.
- All modules show progress = 0.
- No console errors.

- [ ] **Step 2: Firebase round-trip**

Still logged in, drag a module to In Progress, set slider to 50, close popover. Wait ~1s. In another browser/incognito window log in as `christian`. Confirm the module appears with 50% progress — Firebase sync works.

- [ ] **Step 3: Permission check**

Log in as `justin` (viewer). Confirm:
- Cannot drag cards on the board (existing behavior).
- Popover does not open on drop (because drag is blocked).
- In the slide-over, Progress slider is disabled / grayed.

- [ ] **Step 4: Build & typecheck**

Run: `npm run build`
Expected: clean build, no TypeScript errors.

- [ ] **Step 5: No commit needed if nothing broke; otherwise fix & commit.**

---

## Self-review checklist (run after finishing all tasks)

- [ ] Spec §"Data model" — covered by Task 1 (field) and migrations.
- [ ] Spec §"UX: board drop popover" — covered by Tasks 4, 5, 6.
- [ ] Spec §"UX: module detail slide-over" — covered by Task 7.
- [ ] Spec §"Gantt chart visualization" — covered by Task 8 (fill already existed, tick + tooltip added).
- [ ] Spec §"Code impact" — every file listed in the spec is touched.
- [ ] Spec §"Permissions" — covered in Tasks 6, 7 (callbacks gated on `canEditModules`; slider disabled for viewers).
- [ ] Spec §"Success criteria" — validated in Task 9 manual checks.
