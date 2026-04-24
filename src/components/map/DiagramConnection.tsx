import { MapConnection, MapNode } from '../../types';

interface DiagramConnectionProps {
  connection: MapConnection;
  fromNode: MapNode;
  toNode: MapNode;
  isSelected: boolean;
  readOnly: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMidpointDragStart: (e: React.MouseEvent, connId: string) => void;
}

function getAnchorPoint(node: MapNode, anchor: string): { x: number; y: number } {
  switch (anchor) {
    case 'top': return { x: node.x, y: node.y - node.height / 2 };
    case 'bottom': return { x: node.x, y: node.y + node.height / 2 };
    case 'left': return { x: node.x - node.width / 2, y: node.y };
    case 'right': return { x: node.x + node.width / 2, y: node.y };
    default: return { x: node.x + node.width / 2, y: node.y };
  }
}

function getBezierOffset(anchor: string, extraX: number, extraY: number): { dx: number; dy: number } {
  const base = 60;
  switch (anchor) {
    case 'top': return { dx: extraX, dy: -base + extraY };
    case 'bottom': return { dx: extraX, dy: base + extraY };
    case 'left': return { dx: -base + extraX, dy: extraY };
    case 'right': return { dx: base + extraX, dy: extraY };
    default: return { dx: base + extraX, dy: extraY };
  }
}

export default function DiagramConnection({
  connection,
  fromNode,
  toNode,
  isSelected,
  readOnly,
  onClick,
  onMidpointDragStart,
}: DiagramConnectionProps) {
  const from = getAnchorPoint(fromNode, connection.fromAnchor);
  const to = getAnchorPoint(toNode, connection.toAnchor);
  const ox = connection.offsetX || 0;
  const oy = connection.offsetY || 0;
  const fromOff = getBezierOffset(connection.fromAnchor, ox, oy);
  const toOff = getBezierOffset(connection.toAnchor, ox, oy);

  const cp1x = from.x + fromOff.dx;
  const cp1y = from.y + fromOff.dy;
  const cp2x = to.x + toOff.dx;
  const cp2y = to.y + toOff.dy;

  const pathD = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

  // Midpoint of the bezier (approximate)
  const midX = (from.x + 3 * cp1x + 3 * cp2x + to.x) / 8;
  const midY = (from.y + 3 * cp1y + 3 * cp2y + to.y) / 8;

  const color = isSelected ? 'white' : (connection.style === 'dashed' ? '#9CA3AF' : '#6B7280');

  return (
    <g>
      {/* Visible path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={connection.style === 'dashed' ? '8 4' : undefined}
        markerEnd="url(#arrowhead)"
      />
      {/* Click target (wider) */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
        onClick={onClick}
      />
      {/* Label */}
      {connection.label && (
        <>
          <rect
            x={midX - connection.label.length * 3.5 - 4}
            y={midY - 10}
            width={connection.label.length * 7 + 8}
            height={16}
            rx={3}
            fill="#1A1D27"
            fillOpacity={0.9}
          />
          <text
            x={midX}
            y={midY + 1}
            textAnchor="middle"
            fontSize={10}
            fill="#9CA3AF"
            style={{ pointerEvents: 'none' }}
          >
            {connection.label}
          </text>
        </>
      )}
      {/* Draggable midpoint handle */}
      {isSelected && !readOnly && (
        <circle
          cx={midX}
          cy={midY + (connection.label ? 14 : 0)}
          r={6}
          fill="#0984E3"
          stroke="white"
          strokeWidth={1.5}
          style={{ cursor: 'move' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMidpointDragStart(e, connection.id);
          }}
        />
      )}
    </g>
  );
}
