import { useState, useRef, useCallback } from 'react';
import { Module, Developer, Phase } from '../../types';
import { daysBetween } from '../../utils/dates';
import GanttChart from './GanttChart';

interface TimelineViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  projectStartDate: string;
  onModuleClick: (moduleId: string) => void;
  onUpdateDates: (moduleId: string, startDate: string | null, dueDate: string | null) => void;
  onReorderModules: (fromIndex: number, toIndex: number) => void;
}

function friendlyDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function TimelineView({
  modules,
  developers,
  phases,
  projectStartDate,
  onModuleClick,
  onUpdateDates,
  onReorderModules,
}: TimelineViewProps) {
  const [dayWidth, setDayWidth] = useState(30);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);
  const [dropRowIndex, setDropRowIndex] = useState<number | null>(null);

  // Calculate timeline range: earliest date to latest date across project start, phases, and modules
  const allDates = [projectStartDate];
  for (const p of phases) { allDates.push(p.startDate, p.endDate); }
  for (const m of modules) { if (m.startDate) allDates.push(m.startDate); if (m.dueDate) allDates.push(m.dueDate); }
  allDates.sort();
  const timelineStart = allDates[0];
  const timelineEnd = allDates[allDates.length - 1];
  const totalDays = daysBetween(timelineStart, timelineEnd) + 1;

  const handleRowDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragRowIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    (e.target as HTMLElement).style.opacity = '0.5';
  }, []);

  const handleRowDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDragRowIndex(null);
    setDropRowIndex(null);
  }, []);

  const handleRowDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropRowIndex(index);
  }, []);

  const handleRowDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onReorderModules(fromIndex, toIndex);
      }
      setDragRowIndex(null);
      setDropRowIndex(null);
    },
    [onReorderModules]
  );

  return (
    <div className="space-y-3">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Timeline range */}
        <span className="text-xs text-gray-400">
          {friendlyDate(timelineStart)} — {friendlyDate(timelineEnd)}
        </span>

        <span className="text-gray-700 mx-1">|</span>

        {/* Zoom */}
        <span className="text-xs text-gray-400">Zoom:</span>
        <button
          onClick={() => setDayWidth((w) => Math.max(10, w - 5))}
          className="px-2 py-1 text-xs bg-bg-secondary border border-border-primary rounded hover:bg-bg-tertiary transition-colors"
        >
          -
        </button>
        <button
          onClick={() => setDayWidth((w) => Math.min(60, w + 5))}
          className="px-2 py-1 text-xs bg-bg-secondary border border-border-primary rounded hover:bg-bg-tertiary transition-colors"
        >
          +
        </button>
        <span className="text-xs text-gray-500">{dayWidth}px/day</span>
        <span className="text-xs text-gray-600 ml-4">Drag modules on the left to reorder</span>
      </div>

      {/* Phase legend */}
      {phases.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[...phases].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((phase, i) => {
            const colors = ['#6C5CE7', '#0984E3', '#0ABAB5', '#00B894', '#E17055', '#FDCB6E', '#74B9FF', '#A29BFE'];
            const color = colors[i % colors.length];
            return (
              <span key={phase.id} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}60` }} />
                {phase.name}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex border border-border-primary rounded-xl overflow-hidden bg-bg-secondary">
        {/* Module name column */}
        <div className="w-48 flex-shrink-0 border-r border-border-primary bg-bg-secondary z-10">
          <div className="h-10 border-b border-border-primary flex items-center px-3">
            <span className="text-xs font-semibold text-gray-400">Module</span>
          </div>
          {modules.map((module, index) => {
            const dev = module.assignedTo === 'both' ? null : developers.find((d) => d.id === module.assignedTo);
            const isBoth = module.assignedTo === 'both';
            const isOver = dropRowIndex === index && dragRowIndex !== index;

            return (
              <div
                key={module.id}
                draggable
                onDragStart={(e) => handleRowDragStart(e, index)}
                onDragEnd={handleRowDragEnd}
                onDragOver={(e) => handleRowDragOver(e, index)}
                onDrop={(e) => handleRowDrop(e, index)}
                className={`h-10 w-full flex items-center px-2 border-b transition-colors cursor-grab active:cursor-grabbing ${
                  isOver
                    ? 'border-christian bg-christian/10 border-b-2'
                    : 'border-border-primary hover:bg-bg-tertiary'
                }`}
              >
                <svg viewBox="0 0 8 14" fill="currentColor" className="w-2 h-3 text-gray-600 mr-1.5 flex-shrink-0">
                  <circle cx="2" cy="2" r="1.2" />
                  <circle cx="6" cy="2" r="1.2" />
                  <circle cx="2" cy="7" r="1.2" />
                  <circle cx="6" cy="7" r="1.2" />
                  <circle cx="2" cy="12" r="1.2" />
                  <circle cx="6" cy="12" r="1.2" />
                </svg>
                <button
                  onClick={() => onModuleClick(module.id)}
                  className="flex items-center flex-1 min-w-0"
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: isBoth ? '#8B5CF6' : (dev?.color || '#6B7280') }}
                  />
                  <span className="text-xs text-gray-300 truncate">{module.name}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Gantt chart area */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto">
          <GanttChart
            modules={modules}
            developers={developers}
            phases={phases}
            projectStartDate={timelineStart}
            totalDays={totalDays}
            dayWidth={dayWidth}
            onUpdateDates={onUpdateDates}
          />
        </div>
      </div>
    </div>
  );
}
