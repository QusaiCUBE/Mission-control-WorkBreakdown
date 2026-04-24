import { useRef, useCallback, useState, useEffect } from 'react';
import { DiagramEditor } from './useDiagramEditor';
import DiagramNode from './DiagramNode';
import DiagramConnection from './DiagramConnection';

interface DiagramCanvasProps {
  editor: DiagramEditor;
  readOnly: boolean;
}

export default function DiagramCanvas({ editor, readOnly }: DiagramCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [dragNode, setDragNode] = useState<{ id: string; startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const [dragConn, setDragConn] = useState<{ id: string; startX: number; startY: number; origOffsetX: number; origOffsetY: number } | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') { setSpaceDown(true); e.preventDefault(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT') return;
        editor.deleteSelected();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { editor.undo(); e.preventDefault(); }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) { editor.redo(); e.preventDefault(); }
      if (e.key === 'Escape') { editor.setSelection(null); editor.setPendingConnection(null); editor.setEditingNodeId(null); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setSpaceDown(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [editor]);

  // Fit to screen on mount
  useEffect(() => {
    if (svgRef.current && editor.nodes.length > 0) {
      const rect = svgRef.current.getBoundingClientRect();
      editor.fitToScreen(rect.width, rect.height);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    editor.zoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  }, [editor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || spaceDown) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const isBackground = e.target === svgRef.current || ((e.target as SVGElement).tagName === 'rect' && (e.target as SVGElement).getAttribute('data-grid') === 'true');
    if (isBackground) {
      editor.setSelection(null);
      if (editor.tool === 'box' && !readOnly) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const { x, y } = editor.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
          editor.addNode('module', x, y);
        }
      } else if (editor.tool === 'select') {
        // Left-click drag on background to pan
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    }
  }, [editor, spaceDown, readOnly]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStart) {
      editor.pan(e.clientX - panStart.x, e.clientY - panStart.y);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (dragConn) {
      const dx = (e.clientX - dragConn.startX) / editor.viewport.scale;
      const dy = (e.clientY - dragConn.startY) / editor.viewport.scale;
      editor.updateConnection(dragConn.id, {
        offsetX: dragConn.origOffsetX + dx,
        offsetY: dragConn.origOffsetY + dy,
      });
      return;
    }
    if (dragNode) {
      const dx = (e.clientX - dragNode.startX) / editor.viewport.scale;
      const dy = (e.clientY - dragNode.startY) / editor.viewport.scale;
      const snapped = editor.snapToGrid(dragNode.nodeStartX + dx, dragNode.nodeStartY + dy);
      editor.moveNode(dragNode.id, snapped.x, snapped.y);
      return;
    }
    if (editor.pendingConnection) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const { x, y } = editor.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        editor.setPendingConnection({ ...editor.pendingConnection, mouseX: x, mouseY: y });
      }
    }
  }, [isPanning, panStart, dragNode, dragConn, editor]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }
    if (dragNode) {
      editor.commitToHistory();
      setDragNode(null);
      return;
    }
    if (dragConn) {
      editor.commitToHistory();
      setDragConn(null);
      return;
    }
    if (editor.pendingConnection) {
      // Check if over a node
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const { x, y } = editor.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        const target = editor.nodes.find((n) => (
          x >= n.x - n.width / 2 && x <= n.x + n.width / 2 &&
          y >= n.y - n.height / 2 && y <= n.y + n.height / 2
        ));
        if (target && target.id !== editor.pendingConnection.fromId) {
          // Determine closest anchor on target
          const dx = x - target.x;
          const dy = y - target.y;
          const toAnchor = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
          editor.addConnection(editor.pendingConnection.fromId, target.id, editor.pendingConnection.fromAnchor, toAnchor);
        }
      }
      editor.setPendingConnection(null);
    }
  }, [isPanning, dragNode, editor]);

  const { x: vx, y: vy, scale } = editor.viewport;

  return (
    <svg
      ref={svgRef}
      className="flex-1 select-none"
      style={{ cursor: isPanning ? 'grabbing' : spaceDown ? 'grab' : editor.tool === 'box' ? 'crosshair' : 'default' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setIsPanning(false); setPanStart(null); setDragNode(null); setDragConn(null); }}
    >
      {/* Grid */}
      <defs>
        <pattern id="diagram-grid" width={20 * scale} height={20 * scale} patternUnits="userSpaceOnUse" x={vx % (20 * scale)} y={vy % (20 * scale)}>
          <circle cx={1} cy={1} r={0.8} fill="#2D334830" />
        </pattern>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="#0F1117" />
      <rect width="100%" height="100%" fill="url(#diagram-grid)" data-grid="true" />

      <g transform={`translate(${vx}, ${vy}) scale(${scale})`}>
        {/* Connections */}
        {editor.connections.map((conn) => {
          const fromNode = editor.nodes.find((n) => n.id === conn.from);
          const toNode = editor.nodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          return (
            <DiagramConnection
              key={conn.id}
              connection={conn}
              fromNode={fromNode}
              toNode={toNode}
              isSelected={editor.selection?.type === 'connection' && editor.selection.id === conn.id}
              readOnly={readOnly}
              onClick={(e) => { e.stopPropagation(); editor.setSelection({ type: 'connection', id: conn.id }); }}
              onMidpointDragStart={(e, connId) => {
                e.stopPropagation();
                const c = editor.connections.find((cc) => cc.id === connId);
                if (c) setDragConn({ id: connId, startX: e.clientX, startY: e.clientY, origOffsetX: c.offsetX || 0, origOffsetY: c.offsetY || 0 });
              }}
            />
          );
        })}

        {/* Pending connection line */}
        {editor.pendingConnection && (() => {
          const fromNode = editor.nodes.find((n) => n.id === editor.pendingConnection!.fromId);
          if (!fromNode) return null;
          const anchor = editor.pendingConnection.fromAnchor;
          const fx = anchor === 'left' ? fromNode.x - fromNode.width / 2 : anchor === 'right' ? fromNode.x + fromNode.width / 2 : fromNode.x;
          const fy = anchor === 'top' ? fromNode.y - fromNode.height / 2 : anchor === 'bottom' ? fromNode.y + fromNode.height / 2 : fromNode.y;
          return (
            <line
              x1={fx} y1={fy}
              x2={editor.pendingConnection.mouseX} y2={editor.pendingConnection.mouseY}
              stroke="#0984E3"
              strokeWidth={2}
              strokeDasharray="6 3"
              markerEnd="url(#arrowhead)"
            />
          );
        })()}

        {/* Nodes */}
        {editor.nodes.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            isSelected={editor.selection?.type === 'node' && editor.selection.id === node.id}
            isEditing={editor.editingNodeId === node.id}
            readOnly={readOnly}
            showAnchors={editor.tool === 'connect'}
            onMouseDown={(e) => {
              e.stopPropagation();
              editor.setSelection({ type: 'node', id: node.id });
              if (!readOnly && editor.tool === 'select') {
                setDragNode({ id: node.id, startX: e.clientX, startY: e.clientY, nodeStartX: node.x, nodeStartY: node.y });
              }
            }}
            onDoubleClick={() => { if (!readOnly) editor.setEditingNodeId(node.id); }}
            onAnchorMouseDown={(anchor) => {
              if (readOnly) return;
              editor.setPendingConnection({ fromId: node.id, fromAnchor: anchor, mouseX: node.x, mouseY: node.y });
            }}
            onEditChange={(label) => editor.updateNode(node.id, { label })}
            onEditDone={() => editor.setEditingNodeId(null)}
          />
        ))}

        {/* Empty state */}
        {editor.nodes.length === 0 && (
          <text x={400} y={300} textAnchor="middle" fontSize={14} fill="#6B7280">
            {readOnly ? 'No integration map yet' : 'Click "Add Node" in the toolbar, then click on the canvas to place nodes'}
          </text>
        )}
      </g>

      {/* Minimap */}
      {editor.nodes.length > 0 && (
        <g transform={`translate(${(svgRef.current?.clientWidth || 800) - 190}, ${(svgRef.current?.clientHeight || 600) - 130})`}>
          <rect x={0} y={0} width={180} height={120} rx={4} fill="#1A1D27" fillOpacity={0.9} stroke="#2D3348" />
          {(() => {
            const ns = editor.nodes;
            const minX = Math.min(...ns.map((n) => n.x - n.width / 2));
            const minY = Math.min(...ns.map((n) => n.y - n.height / 2));
            const maxX = Math.max(...ns.map((n) => n.x + n.width / 2));
            const maxY = Math.max(...ns.map((n) => n.y + n.height / 2));
            const w = maxX - minX || 1;
            const h = maxY - minY || 1;
            const s = Math.min(170 / w, 110 / h);
            const ox = 5 + (170 - w * s) / 2;
            const oy = 5 + (110 - h * s) / 2;
            return ns.map((n) => (
              <rect
                key={n.id}
                x={ox + (n.x - n.width / 2 - minX) * s}
                y={oy + (n.y - n.height / 2 - minY) * s}
                width={n.width * s}
                height={n.height * s}
                rx={1}
                fill={n.color}
                fillOpacity={0.6}
              />
            ));
          })()}
        </g>
      )}
    </svg>
  );
}
