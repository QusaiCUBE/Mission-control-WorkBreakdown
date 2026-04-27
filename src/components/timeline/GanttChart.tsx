import { useRef, useCallback, useState } from 'react';
import { Module, Developer, Phase } from '../../types';
import { daysBetween, addDays, getToday } from '../../utils/dates';
import { getModuleProgress } from '../../utils/progress';

interface GanttChartProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  projectStartDate: string;
  totalDays: number;
  dayWidth: number;
  onUpdateDates: (moduleId: string, startDate: string | null, dueDate: string | null) => void;
}

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 40;
const BAR_HEIGHT = 24;
const BAR_Y_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2;

const PHASE_BG_COLORS = ['#6C5CE715', '#0984E315', '#0ABAB515', '#00B89415', '#E1705515', '#FDCB6E15', '#74B9FF15', '#A29BFE15'];
const PHASE_BORDER_COLORS = ['#6C5CE740', '#0984E340', '#0ABAB540', '#00B89440', '#E1705540', '#FDCB6E40', '#74B9FF40', '#A29BFE40'];

function dateToX(date: string, startDate: string, dayWidth: number): number {
  return daysBetween(startDate, date) * dayWidth;
}

export default function GanttChart({
  modules,
  developers,
  phases,
  projectStartDate,
  totalDays,
  dayWidth,
  onUpdateDates,
}: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{
    moduleId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    origStart: string;
    origEnd: string;
  } | null>(null);
  const [pendingDates, setPendingDates] = useState<{
    moduleId: string;
    start: string;
    end: string;
  } | null>(null);

  const svgWidth = totalDays * dayWidth;
  const svgHeight = HEADER_HEIGHT + modules.length * ROW_HEIGHT;
  const today = getToday();
  const todayX = dateToX(today, projectStartDate, dayWidth);

  // Daily grid lines — one per day so each day's column is visible
  const dayLines: { x: number; isWeekStart: boolean }[] = [];
  for (let d = 1; d < totalDays; d++) {
    const date = new Date(projectStartDate + 'T00:00:00');
    date.setDate(date.getDate() + d);
    dayLines.push({ x: d * dayWidth, isWeekStart: date.getDay() === 1 });
  }

  // Month labels — one label at the first day of each month within the range
  const monthLabels: { x: number; label: string }[] = [];
  {
    const start = new Date(projectStartDate + 'T00:00:00');
    // First label always at x=0 showing the start month
    monthLabels.push({
      x: 0,
      label: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    for (let d = 1; d < totalDays; d++) {
      const date = new Date(projectStartDate + 'T00:00:00');
      date.setDate(date.getDate() + d);
      if (date.getDate() === 1) {
        monthLabels.push({
          x: d * dayWidth,
          label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      }
    }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, moduleId: string, type: 'move' | 'resize-start' | 'resize-end', origStart: string, origEnd: string) => {
      e.stopPropagation();
      setDragging({
        moduleId,
        type,
        startX: e.clientX,
        origStart,
        origEnd,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;

      const deltaX = e.clientX - dragging.startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (dragging.type === 'move') {
        const newStart = addDays(dragging.origStart, deltaDays);
        const newEnd = addDays(dragging.origEnd, deltaDays);
        setPendingDates({ moduleId: dragging.moduleId, start: newStart, end: newEnd });
      } else if (dragging.type === 'resize-end') {
        const newEnd = addDays(dragging.origEnd, deltaDays);
        if (daysBetween(dragging.origStart, newEnd) >= 1) {
          setPendingDates({ moduleId: dragging.moduleId, start: dragging.origStart, end: newEnd });
        }
      } else if (dragging.type === 'resize-start') {
        const newStart = addDays(dragging.origStart, deltaDays);
        if (daysBetween(newStart, dragging.origEnd) >= 1) {
          setPendingDates({ moduleId: dragging.moduleId, start: newStart, end: dragging.origEnd });
        }
      }
    },
    [dragging, dayWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (pendingDates) {
      onUpdateDates(pendingDates.moduleId, pendingDates.start, pendingDates.end);
      setPendingDates(null);
    }
    setDragging(null);
  }, [pendingDates, onUpdateDates]);

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      className="select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Phase backgrounds */}
      {phases.map((phase, i) => {
        const x = dateToX(phase.startDate, projectStartDate, dayWidth);
        const w = (daysBetween(phase.startDate, phase.endDate) + 1) * dayWidth;
        const bgColor = PHASE_BG_COLORS[i % PHASE_BG_COLORS.length];
        const borderColor = PHASE_BORDER_COLORS[i % PHASE_BORDER_COLORS.length];
        return (
          <g key={phase.id}>
            <rect x={x} y={0} width={w} height={svgHeight} fill={bgColor} />
            {/* Left border line for each phase */}
            <line x1={x} y1={0} x2={x} y2={svgHeight} stroke={borderColor} strokeWidth="1" />
            {/* Phase name at the top */}
            <text
              x={x + 6}
              y={14}
              className="text-[9px] font-medium"
              fill={borderColor.replace('40', 'AA')}
            >
              {phase.name}
            </text>
          </g>
        );
      })}

      {/* Daily grid lines — faint per day, slightly stronger at week starts */}
      {dayLines.map(({ x, isWeekStart }, i) => (
        <line
          key={i}
          x1={x}
          y1={0}
          x2={x}
          y2={svgHeight}
          stroke={isWeekStart ? '#2D3348' : '#2D334855'}
          strokeWidth="1"
        />
      ))}

      {/* Row separators */}
      {modules.map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={HEADER_HEIGHT + i * ROW_HEIGHT}
          x2={svgWidth}
          y2={HEADER_HEIGHT + i * ROW_HEIGHT}
          stroke="#2D334840"
          strokeWidth="1"
        />
      ))}

      {/* Header: month labels */}
      {monthLabels.map(({ x, label }, i) => (
        <text key={i} x={x + 4} y={26} className="text-[10px] font-medium" fill="#9CA3AF">
          {label}
        </text>
      ))}

      {/* Header separator */}
      <line x1={0} y1={HEADER_HEIGHT} x2={svgWidth} y2={HEADER_HEIGHT} stroke="#2D3348" strokeWidth="1" />

      {/* Module bars */}
      {modules.map((module, i) => {
        // Default dates for modules without them: start at project start, 14 days duration
        const moduleStart = module.startDate || projectStartDate;
        const moduleEnd = module.dueDate || addDays(moduleStart, 13);

        const isDraggingThis = dragging?.moduleId === module.id;
        const effectiveStart = (isDraggingThis && pendingDates) ? pendingDates.start : moduleStart;
        const effectiveEnd = (isDraggingThis && pendingDates) ? pendingDates.end : moduleEnd;
        const hasNoDates = !module.startDate && !module.dueDate;

        const isBoth = module.assignedTo === 'both';
        const dev = isBoth ? null : developers.find((d) => d.id === module.assignedTo);
        const barColor = isBoth ? '#8B5CF6' : (dev?.color || '#6B7280');
        const x = dateToX(effectiveStart, projectStartDate, dayWidth);
        const barDays = daysBetween(effectiveStart, effectiveEnd) + 1;
        const w = Math.max(barDays * dayWidth, dayWidth);
        const y = HEADER_HEIGHT + i * ROW_HEIGHT + BAR_Y_OFFSET;
        const progress = getModuleProgress(module);
        const progressW = (progress / 100) * w;

        return (
          <g key={module.id} style={{ cursor: isDraggingThis ? 'grabbing' : 'grab' }}>
            <title>
              {module.name} — {progress}% complete{module.startDate && module.dueDate ? ` (${module.startDate} → ${module.dueDate})` : ''}
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

            {/* Progress boundary tick */}
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
      })}

      {/* Dependency lines removed — were confusing */}

      {/* Today line */}
      {todayX >= 0 && todayX <= svgWidth && (
        <g>
          <line x1={todayX} y1={0} x2={todayX} y2={svgHeight} stroke="#D63031" strokeWidth="2" strokeDasharray="6 3" />
          <polygon points={`${todayX - 5},0 ${todayX + 5},0 ${todayX},8`} fill="#D63031" />
        </g>
      )}
    </svg>
  );
}
