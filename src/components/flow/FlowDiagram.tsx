import { Module } from '../../types';
import { INTEGRATION_TASKS } from '../../data/tasks';
import FlowStep from './FlowStep';

interface FlowDiagramProps {
  modules: Module[];
  selectedStep: number | null;
  onSelectStep: (step: number) => void;
}

const STEP_WIDTH = 150;
const STEP_HEIGHT = 90;
const GAP_X = 24;
const GAP_Y = 40;
const COLS_PER_ROW = 5;
const PADDING = 30;

function getStepPosition(index: number): { x: number; y: number } {
  const row = Math.floor(index / COLS_PER_ROW);
  const col = index % COLS_PER_ROW;
  // Serpentine: even rows go left-to-right, odd rows go right-to-left
  const actualCol = row % 2 === 0 ? col : COLS_PER_ROW - 1 - col;

  return {
    x: PADDING + actualCol * (STEP_WIDTH + GAP_X),
    y: PADDING + row * (STEP_HEIGHT + GAP_Y),
  };
}

function buildConnectorPath(from: { x: number; y: number }, to: { x: number; y: number }, fromRow: number, toRow: number): string {
  const fromCenterX = from.x + STEP_WIDTH / 2;
  const fromBottom = from.y + STEP_HEIGHT;
  const toCenterX = to.x + STEP_WIDTH / 2;
  const toTop = to.y;

  if (fromRow === toRow) {
    // Same row: horizontal connector
    const fromRight = from.x + STEP_WIDTH;
    const toLeft = to.x;
    // If left-to-right
    if (fromRight < toLeft) {
      const midY = from.y + STEP_HEIGHT / 2;
      return `M ${fromRight} ${midY} L ${toLeft} ${midY}`;
    }
    // Right-to-left (odd row)
    const fromLeft = from.x;
    const toRight = to.x + STEP_WIDTH;
    const midY = from.y + STEP_HEIGHT / 2;
    return `M ${fromLeft} ${midY} L ${toRight} ${midY}`;
  }

  // Different rows: vertical connector (end of one row to start of next)
  const midY = fromBottom + GAP_Y / 2;
  return `M ${fromCenterX} ${fromBottom} L ${fromCenterX} ${midY} L ${toCenterX} ${midY} L ${toCenterX} ${toTop}`;
}

export default function FlowDiagram({ modules, selectedStep, onSelectStep }: FlowDiagramProps) {
  const steps = INTEGRATION_TASKS;
  const totalRows = Math.ceil(steps.length / COLS_PER_ROW);
  const svgWidth = PADDING * 2 + COLS_PER_ROW * STEP_WIDTH + (COLS_PER_ROW - 1) * GAP_X;
  const svgHeight = PADDING * 2 + totalRows * STEP_HEIGHT + (totalRows - 1) * GAP_Y;

  return (
    <svg width={svgWidth} height={svgHeight} className="w-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {/* Connectors */}
      {steps.slice(0, -1).map((_, i) => {
        const fromPos = getStepPosition(i);
        const toPos = getStepPosition(i + 1);
        const fromRow = Math.floor(i / COLS_PER_ROW);
        const toRow = Math.floor((i + 1) / COLS_PER_ROW);
        const path = buildConnectorPath(fromPos, toPos, fromRow, toRow);

        // Determine if this connection is "complete" (all modules past both steps)
        const allPastFrom = modules.every((m) => m.tasks[i]?.completed);
        const color = allPastFrom ? '#00B894' : '#2D3348';

        return (
          <g key={i}>
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Arrow at the end */}
            {fromRow === toRow && (
              <circle
                cx={
                  fromRow % 2 === 0
                    ? toPos.x - 2
                    : toPos.x + STEP_WIDTH + 2
                }
                cy={toPos.y + STEP_HEIGHT / 2}
                r={3}
                fill={color}
              />
            )}
          </g>
        );
      })}

      {/* Steps */}
      {steps.map((step, i) => {
        const pos = getStepPosition(i);
        return (
          <FlowStep
            key={i}
            stepIndex={i}
            title={step.title}
            x={pos.x}
            y={pos.y}
            width={STEP_WIDTH}
            height={STEP_HEIGHT}
            modules={modules}
            isSelected={selectedStep === i}
            onClick={() => onSelectStep(i)}
          />
        );
      })}
    </svg>
  );
}
