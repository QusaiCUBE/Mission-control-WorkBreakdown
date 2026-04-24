import { MapNode } from '../../types';

interface DiagramNodeProps {
  node: MapNode;
  isSelected: boolean;
  isEditing: boolean;
  readOnly: boolean;
  showAnchors: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onAnchorMouseDown: (anchor: string) => void;
  onEditChange: (label: string) => void;
  onEditDone: () => void;
}

const ANCHOR_POSITIONS = [
  { key: 'top', dx: 0, dy: -0.5 },
  { key: 'right', dx: 0.5, dy: 0 },
  { key: 'bottom', dx: 0, dy: 0.5 },
  { key: 'left', dx: -0.5, dy: 0 },
];

export default function DiagramNode({
  node,
  isSelected,
  isEditing,
  readOnly,
  showAnchors,
  onMouseDown,
  onDoubleClick,
  onAnchorMouseDown,
  onEditChange,
  onEditDone,
}: DiagramNodeProps) {
  const x = node.x - node.width / 2;
  const y = node.y - node.height / 2;

  return (
    <g onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} style={{ cursor: readOnly ? 'default' : 'grab' }}>
      {/* Box */}
      <rect
        x={x}
        y={y}
        width={node.width}
        height={node.height}
        rx={6}
        fill={`${node.color}22`}
        stroke={isSelected ? 'white' : node.color}
        strokeWidth={isSelected ? 2 : 1}
      />
      {/* Left accent */}
      <rect x={x} y={y} width={4} height={node.height} rx={2} fill={node.color} />

      {isEditing ? (
        <foreignObject x={x + 8} y={y + 4} width={node.width - 16} height={node.height - 8}>
          <input
            autoFocus
            value={node.label}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') onEditDone(); }}
            onBlur={onEditDone}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              width: '100%',
              outline: 'none',
              padding: 0,
            }}
          />
        </foreignObject>
      ) : (
        <>
          <text
            x={node.x + 2}
            y={node.y - 4}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="white"
            style={{ pointerEvents: 'none' }}
          >
            {node.label}
          </text>
          <text
            x={node.x + 2}
            y={node.y + 12}
            textAnchor="middle"
            fontSize={9}
            fill="#9CA3AF"
            style={{ pointerEvents: 'none' }}
          >
            {node.subtitle || node.type}
          </text>
        </>
      )}

      {/* Anchor points */}
      {(showAnchors || isSelected) && !readOnly && ANCHOR_POSITIONS.map(({ key, dx, dy }) => (
        <circle
          key={key}
          cx={node.x + dx * node.width}
          cy={node.y + dy * node.height}
          r={5}
          fill={node.color}
          stroke="white"
          strokeWidth={1}
          opacity={showAnchors ? 0.9 : 0.4}
          style={{ cursor: 'crosshair' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onAnchorMouseDown(key);
          }}
        />
      ))}
    </g>
  );
}
