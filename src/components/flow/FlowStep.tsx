import { Module } from '../../types';

interface FlowStepProps {
  stepIndex: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  modules: Module[];
  isSelected: boolean;
  onClick: () => void;
}

export default function FlowStep({
  stepIndex,
  title,
  x,
  y,
  width,
  height,
  modules,
  isSelected,
  onClick,
}: FlowStepProps) {
  const totalModules = modules.length;
  const completedCount = modules.filter(
    (m) => m.tasks[stepIndex]?.completed
  ).length;
  const progress = totalModules > 0 ? completedCount / totalModules : 0;
  const hasActive = modules.some(
    (m) => {
      // Module is "at" this step if this is its first incomplete task
      const firstIncomplete = m.tasks.findIndex((t) => !t.completed);
      return firstIncomplete === stepIndex;
    }
  );

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill={isSelected ? '#242836' : '#1A1D27'}
        stroke={isSelected ? '#0984E3' : '#2D3348'}
        strokeWidth={isSelected ? 2 : 1}
      />

      {/* Progress fill */}
      {progress > 0 && (
        <rect
          x={x}
          y={y}
          width={Math.max(width * progress, 20)}
          height={height}
          rx={10}
          fill="#00B89420"
          className="transition-all duration-700 ease-out"
        />
      )}

      {/* Pulse ring for active steps */}
      {hasActive && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          rx={12}
          fill="none"
          stroke="#F39C12"
          strokeWidth="1"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Step number */}
      <text
        x={x + 12}
        y={y + 20}
        className="text-[10px] font-bold"
        fill="#6B7280"
      >
        {stepIndex + 1}
      </text>

      {/* Title */}
      <foreignObject x={x + 8} y={y + 24} width={width - 16} height={height - 48}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#E2E8F0',
            lineHeight: '1.3',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
          }}
        >
          {title}
        </div>
      </foreignObject>

      {/* Progress label */}
      <text
        x={x + width / 2}
        y={y + height - 10}
        textAnchor="middle"
        className="text-[10px]"
        fill={completedCount === totalModules ? '#00B894' : '#6B7280'}
      >
        {completedCount}/{totalModules}
      </text>
    </g>
  );
}
