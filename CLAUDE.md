# Mission Control — Work Breakdown & Project Tracker

## What You're Building

Build an interactive, single-page web application that serves as the project management hub for integrating the Cube Building Systems "Mission Control" ERP. This is a two-person development team working through 9 software modules plus a main shell that need to be modified and integrated into one monorepo.

This app should feel like a lightweight, custom-built project tracker — not a generic to-do list. It needs to show the full picture of the project at a glance while letting the two developers drill into specific tasks, assign work, track progress, and stay on deadline.

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Single-page app (no backend needed — use localStorage for persistence)
- No external UI libraries — build all components from scratch
- Clean, modern dark theme (dark background, crisp text, color-coded status indicators)

## The Two Developers

- **Developer 1: Christian** (Project Lead)
- **Developer 2: TBD** (Second Developer — make the name editable)

## The Project Structure

The Mission Control ERP integration project has these phases and modules:

### Phase 0: Setup (Week 1)
- Create `mission-control` GitHub repo
- Set up monorepo structure (npm workspaces, /packages/, /shared/)
- Create the shared package (@mission-control/shared — types, event bus config, middleware, API response format)
- Copy all existing module codebases into /packages/ folders

### Phase 1: Module Integration (Weeks 2-7)
Each of the 9 modules needs the same set of integration changes. The modules are:

1. **CRM** — Client relationship management
2. **Offsite** — Modular construction management
3. **Procore (Replica)** — Field operations (RFIs, submittals, daily logs)
4. **Bidding / Tenders** — Tender scraping and bid tracking
5. **Grants / Gov Funds** — Government funding tracker
6. **Live Material Pricing** — Real-time construction material prices
7. **Document Generation** — Template-based doc engine
8. **Site Photos** — Mobile + web photo management
9. **CBS AI Agent** — AI chatbot with full ERP access

For EACH module, the integration tasks are:
1. Remove existing authentication/login system
2. Add x-mc-user header parsing (receive user info from Mission Control)
3. Add /manifest endpoint for module auto-discovery
4. Standardize API response format to shared spec
5. Add Redis event bus integration (publish/subscribe events)
6. Export main UI as mountable React component
7. Add database table prefixes if missing
8. Security audit and fixes (input validation, rate limiting, Helmet.js, etc.)
9. Testing — verify module works standalone after changes
10. Code review and merge to main branch

### Phase 2: Mission Control Shell (Weeks 8-9)
- Build the main shell application (/packages/shell/)
- Authentication system (login, user management, roles/permissions)
- Navigation sidebar, header bar, global search
- Module mounting and routing (load each module's React component)
- Event bus wiring (connect all modules to shared Redis pub/sub)
- AI Agent sidebar panel integration
- Global notification system
- End-to-end testing across all modules

### Phase 3: Polish & QA (Week 10)
- Cross-module integration testing
- Bug fixes and edge cases
- Performance optimization
- Documentation
- Final security audit
- Prepare for deployment (deployment itself is out of scope for now)

## Features to Build

### 1. Dashboard (Main View)
The landing page should show:
- **Project timeline** — a horizontal Gantt-style bar showing all 4 phases with current date marker
- **Overall progress** — percentage complete, modules done vs remaining
- **Developer workload split** — visual showing how work is distributed between Christian and Developer 2
- **Upcoming deadlines** — next 5 items due
- **Modules at a glance** — grid of all 9 modules + shell showing status (not started / in progress / in review / done)
- **Burndown or velocity indicator** — something showing if the project is on track

### 2. Module Board (Kanban View)
A kanban board with columns:
- **Backlog** — not yet started
- **In Progress** — currently being worked on
- **In Review** — code review / testing
- **Done** — merged and complete

Each module is a card that can be dragged between columns. Cards show:
- Module name and icon/color
- Assigned developer
- Progress bar (X of 10 integration tasks complete)
- Due date
- Priority indicator

### 3. Module Detail View
Click on any module to see:
- The 10 integration tasks as a checklist (checkable)
- Who is assigned to each task (or the whole module)
- Task-level notes/comments
- Start date, due date, actual completion date
- Dependencies (e.g., "Shared package must be done first")
- Status history (when it moved between kanban columns)

### 4. Timeline View
A Gantt chart showing:
- All modules plotted across the timeline
- Phase markers (Phase 0, 1, 2, 3)
- Dependencies shown as connecting lines
- Color-coded by assigned developer
- Current date marker (today line)
- Ability to drag to adjust dates

### 5. Workload View
A view focused on the two developers:
- Side-by-side columns showing Christian's modules vs Developer 2's modules
- Hours/effort estimation per module
- Balance indicator (is the work evenly split?)
- Calendar heat map showing who's busy when

### 6. Assignment System
- Click any module or task to assign it to Christian or Developer 2
- Drag-and-drop between developer columns in Workload View
- Auto-balance suggestion button ("Suggest even split")
- Each developer gets a color (use throughout the app for visual clarity)

### 7. Deadline Management
- Each module has a baseline start and due date
- Auto-generate initial dates based on the phase schedule above
- Visual warnings when tasks are overdue or at risk
- Editable dates (click to change)
- Phase-level deadline tracking

### 8. Interactive Flow Diagram
A visual process flow showing:
- The journey of a module from "existing standalone software" → "integration ready"
- The steps: Copy to monorepo → Remove auth → Add header parsing → Add manifest → Standardize API → Add event bus → Export component → Add table prefixes → Security audit → Test → Review → Merge
- Animated progress showing which step each module is currently on
- Click a step to see which modules are at that step

### 9. ERP Integration Map Editor (Lucidchart-style)

A dedicated page that provides a fully interactive, editable diagram of the entire Mission Control ERP architecture. This is NOT a static image — it is a live canvas editor similar to Lucidchart, draw.io, or Miro where users can visually design and reorganize the ERP system map.

#### Canvas & Viewport
- Infinite canvas with pan (click and drag on empty space) and zoom (scroll wheel / pinch)
- Minimap in the corner showing the full diagram with a viewport rectangle
- Zoom controls (zoom in, zoom out, fit to screen, 100%)
- Grid background (subtle dots or lines) that snaps elements to alignment
- Rulers along the top and left edges (optional, toggleable)

#### Pre-loaded Content
The canvas starts pre-populated with the current Mission Control ERP architecture:
- **ERP Hub** (top center) — the main Cube Building Systems ERP box
- **Tier 1 modules:** CRM, Offsite, Procore (Replica), Live Material Pricing
- **Tier 2 modules:** Bidding/Tenders, Document Generation, Site Photos, Grants/Gov Funds
- **CBS AI Agent** — positioned alongside the ERP hub
- All existing connection arrows between modules showing data flows
- Each module box color-coded to match the integration map we already built (CRM = teal, Offsite = coral, Procore = red, Pricing = blue, Bidding = amber, Docs = purple, Photos = pink, Grants = green, AI Agent = gold, ERP Hub = purple)

#### Node/Box Editing
- **Select** — click a box to select it (shows selection handles)
- **Multi-select** — shift+click or drag a selection rectangle to select multiple boxes
- **Move** — drag any box to reposition it. Snap-to-grid and alignment guides (blue dashed lines) appear when boxes align with other boxes horizontally or vertically
- **Resize** — drag corner/edge handles to resize a box
- **Edit text** — double-click a box to edit its title and subtitle inline
- **Change color** — right-click or use a properties panel to change the box's border/accent color
- **Delete** — select and press Delete/Backspace, or right-click → Delete
- **Add new box** — button or keyboard shortcut to add a new module/node to the canvas. Opens a small form: name, subtitle, color, tier (core module / data feed / special)

#### Connection/Arrow Editing
- **Draw connections** — hover over a box edge to see connection anchor points (small circles on each side). Click and drag from an anchor point to another box to create a connection arrow
- **Arrow types:**
  - Solid line = primary data flow
  - Dashed line = cross-module feedback
  - Color matches the source or target module
- **Arrow labels** — click on a connection to add/edit a label (e.g., "Client data", "BIM cost data", "Won tenders")
- **Arrow routing** — arrows auto-route around boxes (never through them). When boxes are moved, connected arrows re-route automatically
- **Bend points** — click on an arrow to add bend points for manual routing. Drag bend points to adjust the path
- **Delete connection** — select an arrow and press Delete, or right-click → Delete

#### Auto-Layout & Formatting
- **Auto-arrange** button — automatically repositions all boxes into a clean, organized layout:
  - Groups boxes by tier (ERP hub on top, core modules in middle, data feeds below, AI agent to the side)
  - Even spacing between boxes
  - Minimizes arrow crossings
  - Centers the diagram on canvas
- **Align tools** — select multiple boxes, then align left/center/right/top/middle/bottom
- **Distribute tools** — select multiple boxes, then distribute evenly horizontally or vertically
- **Auto-spacing** — button to normalize gaps between all selected boxes
- **Group** — select multiple boxes and group them (move/resize as one unit, dashed outline around group, optional group label)
- **Ungroup** — break a group back into individual boxes

#### Properties Panel (Right Sidebar)
When a box or arrow is selected, show a properties panel:
- **For boxes:** Name, subtitle, color picker, border style, width, height, x/y position, assigned developer, status (synced with the kanban board from the other views), notes
- **For arrows:** Label, line style (solid/dashed), color, source box, target box, data flow description
- **For canvas (nothing selected):** Background color, grid toggle, snap-to-grid toggle, show/hide minimap

#### Toolbar (Top of Canvas)
A horizontal toolbar with:
- **Selection tool** (pointer icon) — default, for selecting/moving
- **Add box** — click then click on canvas to place a new box
- **Add connection** — click then drag between two boxes
- **Add text label** — floating text annotation on the canvas
- **Add shape** — basic shapes (rectangle, rounded rect, diamond, circle) for custom diagram elements like decision points or grouping
- **Undo / Redo** — full undo/redo history for all actions
- **Zoom controls** — zoom in, zoom out, fit to screen
- **Auto-arrange** button
- **Export** — export the current diagram as:
  - PNG image (high resolution)
  - SVG file
  - JSON (full diagram data for re-import)
- **Import** — load a previously exported JSON diagram
- **Fullscreen** — toggle fullscreen mode for maximum canvas space

#### Smart Features
- **Snap to alignment** — when dragging a box, show blue guide lines when it aligns with other boxes (center-to-center, edge-to-edge)
- **Smart arrow routing** — arrows automatically avoid crossing through boxes. When you move a box, all connected arrows recalculate their paths
- **Auto-label suggestions** — when drawing a new connection between two modules, suggest a label based on the known data flows (e.g., connecting CRM to Bidding auto-suggests "Tender contacts")
- **Status sync** — each module box on the map shows its current integration status from the kanban board (a small colored dot or badge: gray/amber/purple/green). Clicking it navigates to that module's detail view
- **Dependency visualization** — toggle a mode that highlights dependency chains (e.g., "Shared package → all modules → Shell")

#### Keyboard Shortcuts
- `Space + drag` = Pan canvas
- `Ctrl/Cmd + scroll` = Zoom
- `Ctrl/Cmd + Z` = Undo
- `Ctrl/Cmd + Shift + Z` = Redo
- `Delete` / `Backspace` = Delete selected
- `Ctrl/Cmd + A` = Select all
- `Ctrl/Cmd + D` = Duplicate selected
- `Ctrl/Cmd + G` = Group selected
- `Ctrl/Cmd + Shift + G` = Ungroup
- `Escape` = Deselect all
- `+` / `-` = Zoom in/out
- `0` = Fit to screen
- Arrow keys = Nudge selected box by 1px (Shift + arrow = 10px)

#### Data Persistence
- The full diagram state (all boxes, connections, positions, labels, colors, groups) saves to localStorage alongside the project data
- Changes auto-save on every edit
- Export/import JSON allows backing up and sharing the diagram

### 10. Settings / Config
- Edit Developer 2's name
- Adjust project start date
- Modify phase durations
- Export project data as JSON
- Import project data from JSON
- Reset all progress

## Design Requirements

- **Dark theme** — dark gray/navy background (#0F1117 or similar), light text, colored accents
- **Color system:**
  - Christian: Blue (#0984E3)
  - Developer 2: Teal (#0ABAB5)
  - Not started: Gray
  - In progress: Amber/Yellow (#F39C12)
  - In review: Purple (#6C5CE7)
  - Done: Green (#00B894)
  - Overdue: Red (#D63031)
- **Navigation** — sidebar with icons for each view (Dashboard, Board, Timeline, Workload, Flow, ERP Map, Settings)
- **Responsive** — should work on desktop and tablet
- **Animations** — smooth transitions between views, satisfying checkbox animations, progress bar fills
- **Typography** — Inter font, clean hierarchy

## Data Model (localStorage)

```typescript
interface Project {
  name: string;
  startDate: string;
  developers: [Developer, Developer];
  phases: Phase[];
  modules: Module[];
  diagram: DiagramState;
}

interface Developer {
  id: string;
  name: string;
  color: string;
}

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Module {
  id: string;
  name: string;
  description: string;
  prefix: string;
  assignedTo: string | null; // developer id
  status: 'backlog' | 'in_progress' | 'in_review' | 'done';
  phase: string; // phase id
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tasks: Task[];
  notes: string;
  statusHistory: StatusChange[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  assignedTo: string | null;
  completedDate: string | null;
  order: number;
}

interface StatusChange {
  from: string;
  to: string;
  date: string;
  by: string;
}

// === ERP Map Editor Data Model ===

interface DiagramState {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  groups: DiagramGroup[];
  labels: DiagramLabel[];
  viewport: { x: number; y: number; zoom: number };
  settings: DiagramSettings;
  undoStack: DiagramSnapshot[];
  redoStack: DiagramSnapshot[];
}

interface DiagramNode {
  id: string;
  moduleId: string | null;    // links to Module.id if this represents a module, null for custom boxes
  title: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;              // border/accent color hex
  tier: 'hub' | 'core' | 'feed' | 'special' | 'custom';
  shape: 'rounded_rect' | 'rect' | 'diamond' | 'circle';
  groupId: string | null;
  locked: boolean;
}

interface DiagramConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchor: 'top' | 'bottom' | 'left' | 'right';
  targetAnchor: 'top' | 'bottom' | 'left' | 'right';
  label: string;
  lineStyle: 'solid' | 'dashed';
  color: string;
  bendPoints: { x: number; y: number }[];   // manual routing points
}

interface DiagramGroup {
  id: string;
  label: string;
  nodeIds: string[];
  color: string;
}

interface DiagramLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface DiagramSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showRulers: boolean;
  backgroundColor: string;
}

interface DiagramSnapshot {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  groups: DiagramGroup[];
  labels: DiagramLabel[];
}
```

## Initial Data

Pre-populate the app with:
- All 9 modules + the Mission Control Shell (10 total items)
- Each module pre-loaded with the 10 integration tasks
- Phase dates based on a start date of today
- All modules starting in "Backlog" status
- No assignments (user will assign during planning)
- The Shell module should be in Phase 2 with a dependency on all Phase 1 modules being complete
- **ERP Map pre-populated** with all modules as nodes in the correct layout:
  - ERP Hub centered at top (purple, large box)
  - CBS AI Agent to the right of the hub (gold)
  - Tier 1 (CRM, Offsite, Procore, Material Pricing) in a row below the hub
  - Tier 2 (Bidding, Docs, Photos, Grants) in a row below Tier 1
  - All known data flow connections pre-drawn with labels (Client data, Project data, Field docs, Price feeds, BIM cost data, Won tenders, Tender contacts, Photo logs, Funding for clients, etc.)
  - Connection arrows using solid lines for primary flows and dashed for cross-module feedback

## Important Notes

- This is a PROJECT MANAGEMENT TOOL, not the ERP itself
- All data persists in localStorage — no backend
- The app should feel snappy and polished — this is a tool two developers will use daily
- Prioritize the Dashboard and Board views — those will be used most
- The Flow Diagram should be visually impressive — it shows the integration process
- Make it feel like a real product, not a prototype
