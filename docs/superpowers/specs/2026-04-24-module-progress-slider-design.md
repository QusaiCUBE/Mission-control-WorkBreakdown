# Module Progress Slider — Design

**Date:** 2026-04-24
**Status:** Approved pending spec review

## Problem

Progress for each module is currently derived entirely from `status`
(`backlog=0, in_progress=33, in_review=66, done=100` in `src/utils/progress.ts`).
This is too coarse: a module can be just-started or nearly-finished within
"In Progress" (and to a lesser extent "In Review") and the UI gives no way
to express that. The Gantt chart and module card both reflect only the
status-based value, so a 90%-complete In Progress module looks identical
to a just-started one.

## Goal

Give each module its own editable `progress` value (0–100). Prompt the
user to set it when dragging to In Progress or In Review on the board,
let them fine-tune it from the module detail slide-over, and reflect it
on the Gantt chart as a fill overlay.

## Non-goals

- Auto-deriving status from progress (e.g. moving to Done at 100%).
  Status and progress stay independent — status is driven by the board,
  progress is driven by the slider.
- Changing how status itself works (columns, transitions, history).
- Adding per-task progress — only per-module.

## Data model

Add one field to `Module` in `src/types/index.ts`:

```ts
progress: number   // 0–100, integer
```

### Defaults when status changes (via board drag)

| Move to | `progress` behavior |
|---|---|
| Backlog | set to **0** (preset, no prompt) |
| In Progress | **popover opens**; slider starts at module's current `progress` |
| In Review | **popover opens**; slider starts at module's current `progress` |
| Done | set to **100** (preset, no prompt) |

Moving within the same column (no status change) does not trigger the
popover.

### Migration

On first load after this feature ships, any module without a `progress`
field gets seeded from its current status:

| status | seeded progress |
|---|---|
| backlog | 0 |
| in_progress | 33 |
| in_review | 66 |
| done | 100 |

Handled in `normalizeProject()` in `src/hooks/useProject.ts` and in the
array-fix block in `src/utils/firebase.ts` so both local-storage and
Firebase-synced projects migrate cleanly.

## UX: board drop popover

When a card is dropped into In Progress or In Review and the status
actually changes, a small popover appears anchored to the card.

### Layout

- ~280px wide, dark background matching app theme, subtle border and
  shadow.
- Anchored below the dropped card; flips above if it would go off-screen.
- Header row: `Set progress` on the left, `×` close button on the right.
- Slider row: horizontal slider (range 0–100, step 1) and live numeric
  label (`42%`) to the right of the bar.
- No Save / Cancel buttons.

### Behavior

- The status move happens immediately on drop (before the popover opens).
  If the user dismisses the popover without touching the slider, the
  module stays in the new column with its previous progress value.
- The slider commits **live**: every drag frame updates the module's
  `progress` field. No separate Save step.
- Dismiss on: click-outside, Escape key, or the `×` button. Whatever
  value the slider is on at dismiss time is the saved value (same as
  the last drag frame).

## UX: module detail slide-over

In `src/components/detail/ModuleDetail.tsx`, add a **Progress** section
directly under the existing Status control.

- Full-width slider (same underlying component as the popover).
- Live numeric label to the right.
- Always editable regardless of status — users can bump a Done module
  to 95% or fine-tune any value.
- Saves on every drag change (same auto-save behavior).

## Gantt chart visualization

In `src/components/timeline/GanttChart.tsx`, each module bar gets a
progress fill overlay:

- Filled portion (`progress%` of the bar's width, from the left):
  solid developer color at full opacity.
- Remaining portion: same developer color at ~25% opacity.
- Thin 1px vertical tick at the progress boundary for clarity.
- Hover tooltip includes `"{progress}% complete"`.

The module card (`src/components/shared/ModuleCard.tsx`) also reads
`module.progress` directly via the existing `ProgressBar` component,
replacing the status-derived value.

## Code impact

### New files

- `src/components/board/ProgressPopover.tsx` — the popover component
  (positioning, slider, dismiss handlers).
- `src/components/shared/Slider.tsx` — reusable slider used by popover
  and ModuleDetail.

### Modified files

- `src/types/index.ts` — add `progress: number` to `Module`.
- `src/utils/progress.ts` — change `getModuleProgress()` to return
  `module.progress`. Update `getOverallProgress()` and `getPhaseProgress()`
  to average `module.progress` values instead of status weights.
- `src/hooks/useProject.ts` —
  - Migration in `normalizeProject()` to seed `progress` from status for
    legacy modules.
  - `moveModule()` applies status-based preset only for backlog (0) and
    done (100). For in_progress/in_review, progress is left unchanged
    (the popover is what sets it).
  - New `updateModuleProgress(moduleId, progress)` callback.
- `src/utils/firebase.ts` — array-fix block ensures `progress` exists on
  every incoming module (seeded from status if missing).
- `src/data/initialData.ts` — initial modules ship with `progress: 0`.
- `src/components/board/BoardView.tsx` — on drop into in_progress or
  in_review, open `ProgressPopover` anchored to the dropped card.
- `src/components/board/KanbanCard.tsx` — expose a ref (or return the
  drop coordinates) so the popover can anchor.
- `src/components/detail/ModuleDetail.tsx` — add Progress section with
  slider, wired to `updateModuleProgress`.
- `src/components/shared/ModuleCard.tsx` — no logic change, but now
  shows accurate per-module progress since `getModuleProgress()` reads
  the new field.
- `src/components/timeline/GanttChart.tsx` — render progress fill
  overlay on each bar.
- `src/App.tsx` — pass the new `updateModuleProgress` handler through
  permission gates (gated on `canEditModules`).

### Permissions

`updateModuleProgress` is gated on `canEditModules` in `getPermissions()`
(`src/utils/permissions.ts`). Viewers see the slider but cannot drag it.

## Open risks

- **Popover anchoring during scroll.** The board has horizontal scroll
  on narrow columns; the popover must reposition or close if the card
  scrolls out of view. Default: close on scroll.
- **Mobile / tablet drag-drop.** Current board uses HTML5 drag-and-drop;
  the popover positioning should still work on touch but should be
  verified.
- **Overall-progress semantics.** Switching `getOverallProgress()` from
  status-weight average to `progress` average will shift the Dashboard
  "overall %" slightly for existing projects on first load. Acceptable
  because the new value is more accurate.

## Success criteria

1. Dragging a card into In Progress or In Review opens a popover with a
   live-saving slider anchored to the card.
2. Popover dismisses via click-outside / Escape / × and the last slider
   value persists.
3. Dragging into Backlog or Done does **not** open a popover; progress
   snaps to 0 or 100 respectively.
4. Module detail slide-over shows a full-width progress slider that
   saves live.
5. Gantt chart bars show a fill overlay reflecting `module.progress`.
6. Existing modules loaded from localStorage or Firebase migrate
   silently, seeded from their current status.
7. Viewer-role users see progress values but cannot change them.
