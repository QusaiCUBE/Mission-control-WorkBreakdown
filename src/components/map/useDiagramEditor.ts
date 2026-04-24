import { useState, useCallback, useRef, useEffect } from 'react';
import { IntegrationMap, MapNode, MapConnection } from '../../types';
import { generateId } from '../../utils/id';
import { createDefaultERPMap } from '../../data/erpMapData';

export type Tool = 'select' | 'box' | 'connect';
export type SelectionType = { type: 'node'; id: string } | { type: 'connection'; id: string } | null;

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

const GRID_SIZE = 20;
const DEFAULT_NODE_W = 150;
const DEFAULT_NODE_H = 56;

function normalizeNode(n: MapNode): MapNode {
  return {
    ...n,
    width: n.width || DEFAULT_NODE_W,
    height: n.height || DEFAULT_NODE_H,
    subtitle: n.subtitle || '',
  };
}

function normalizeConnection(c: MapConnection): MapConnection {
  return {
    ...c,
    fromAnchor: c.fromAnchor || 'right',
    toAnchor: c.toAnchor || 'left',
    style: c.style || 'solid',
    offsetX: c.offsetX ?? 0,
    offsetY: c.offsetY ?? 0,
  };
}

export function useDiagramEditor(
  initialMap: IntegrationMap,
  onSave: (map: IntegrationMap) => void,
  readOnly: boolean
) {
  const [nodes, setNodes] = useState<MapNode[]>(() => {
    const mapNodes = (initialMap.nodes || []).map(normalizeNode);
    if (mapNodes.length === 0) {
      const defaultMap = createDefaultERPMap();
      return defaultMap.nodes.map(normalizeNode);
    }
    return mapNodes;
  });
  const [connections, setConnections] = useState<MapConnection[]>(() => {
    const mapConns = (initialMap.connections || []).map(normalizeConnection);
    if (mapConns.length === 0 && (initialMap.nodes || []).length === 0) {
      const defaultMap = createDefaultERPMap();
      return defaultMap.connections.map(normalizeConnection);
    }
    return mapConns;
  });
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [tool, setTool] = useState<Tool>('select');
  const [selection, setSelection] = useState<SelectionType>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{ fromId: string; fromAnchor: string; mouseX: number; mouseY: number } | null>(null);

  // Undo/redo
  const [history, setHistory] = useState<IntegrationMap[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sync from external changes (Firebase)
  const isExternalUpdate = useRef(false);
  useEffect(() => {
    if (initialMap.nodes && initialMap.connections) {
      isExternalUpdate.current = true;
      setNodes((initialMap.nodes || []).map(normalizeNode));
      setConnections((initialMap.connections || []).map(normalizeConnection));
    }
  }, [initialMap]);

  // Save debounced
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    if (readOnly) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSave({ nodes, connections });
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections]);

  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - viewport.x) / viewport.scale,
    y: (sy - viewport.y) / viewport.scale,
  }), [viewport]);

  const snapToGrid = useCallback((x: number, y: number) => ({
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  }), []);

  const commitToHistory = useCallback(() => {
    const snapshot = { nodes: [...nodes], connections: [...connections] };
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot].slice(-50));
    setHistoryIndex((prev) => prev + 1);
  }, [nodes, connections, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex < 0) return;
    const snapshot = history[historyIndex];
    if (snapshot) {
      setNodes(snapshot.nodes);
      setConnections(snapshot.connections);
      setHistoryIndex((i) => i - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const snapshot = history[historyIndex + 1];
    if (snapshot) {
      setNodes(snapshot.nodes);
      setConnections(snapshot.connections);
      setHistoryIndex((i) => i + 1);
    }
  }, [history, historyIndex]);

  const addNode = useCallback((type: MapNode['type'], x: number, y: number, label?: string, color?: string) => {
    if (readOnly) return;
    commitToHistory();
    const snapped = snapToGrid(x, y);
    const newNode: MapNode = {
      id: generateId(),
      label: label || 'New Node',
      subtitle: '',
      type,
      x: snapped.x,
      y: snapped.y,
      width: DEFAULT_NODE_W,
      height: DEFAULT_NODE_H,
      color: color || '#636E72',
    };
    setNodes((prev) => [...prev, newNode]);
    setSelection({ type: 'node', id: newNode.id });
    setTool('select');
  }, [readOnly, commitToHistory, snapToGrid]);

  const updateNode = useCallback((id: string, updates: Partial<MapNode>) => {
    if (readOnly) return;
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n));
  }, [readOnly]);

  const deleteSelected = useCallback(() => {
    if (readOnly || !selection) return;
    commitToHistory();
    if (selection.type === 'node') {
      setNodes((prev) => prev.filter((n) => n.id !== selection.id));
      setConnections((prev) => prev.filter((c) => c.from !== selection.id && c.to !== selection.id));
    } else {
      setConnections((prev) => prev.filter((c) => c.id !== selection.id));
    }
    setSelection(null);
  }, [readOnly, selection, commitToHistory]);

  const addConnection = useCallback((from: string, to: string, fromAnchor: string, toAnchor: string) => {
    if (readOnly || from === to) return;
    const exists = connections.some((c) => (c.from === from && c.to === to) || (c.from === to && c.to === from));
    if (exists) return;
    commitToHistory();
    const newConn: MapConnection = {
      id: generateId(),
      from,
      to,
      fromAnchor: fromAnchor as MapConnection['fromAnchor'],
      toAnchor: toAnchor as MapConnection['toAnchor'],
      label: '',
      style: 'solid',
      offsetX: 0,
      offsetY: 0,
    };
    setConnections((prev) => [...prev, newConn]);
    setSelection({ type: 'connection', id: newConn.id });
  }, [readOnly, connections, commitToHistory]);

  const updateConnection = useCallback((id: string, updates: Partial<MapConnection>) => {
    if (readOnly) return;
    setConnections((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  }, [readOnly]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    if (readOnly) return;
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x, y } : n));
  }, [readOnly]);

  const zoom = useCallback((delta: number, centerX: number, centerY: number) => {
    setViewport((v) => {
      const factor = Math.pow(1.1, -delta / 100);
      const newScale = Math.min(3, Math.max(0.2, v.scale * factor));
      const ratio = newScale / v.scale;
      return {
        scale: newScale,
        x: centerX - (centerX - v.x) * ratio,
        y: centerY - (centerY - v.y) * ratio,
      };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const fitToScreen = useCallback((containerWidth: number, containerHeight: number) => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.x - n.width / 2));
    const minY = Math.min(...nodes.map((n) => n.y - n.height / 2));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width / 2));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height / 2));
    const w = maxX - minX + 100;
    const h = maxY - minY + 100;
    const scale = Math.min(containerWidth / w, containerHeight / h, 1.5);
    setViewport({
      scale,
      x: (containerWidth - w * scale) / 2 - minX * scale + 50 * scale,
      y: (containerHeight - h * scale) / 2 - minY * scale + 50 * scale,
    });
  }, [nodes]);

  const autoArrange = useCallback(() => {
    if (readOnly || nodes.length === 0) return;
    commitToHistory();

    // Group nodes by type for tiered layout
    const hubs = nodes.filter((n) => n.type === 'service' && n.label.toLowerCase().includes('erp'));
    const agents = nodes.filter((n) => n.type === 'service' && !n.label.toLowerCase().includes('erp'));
    const modules = nodes.filter((n) => n.type === 'module');
    const others = nodes.filter((n) => n.type !== 'service' && n.type !== 'module');

    // Split modules into two tiers (first half = tier1, second = tier2)
    const half = Math.ceil(modules.length / 2);
    const tier1 = modules.slice(0, half);
    const tier2 = modules.slice(half);

    const gapX = 280;
    const tierGapY = 220;
    const startY = 80;

    const arrangeRow = (row: typeof nodes, y: number) => {
      const totalWidth = row.length * gapX;
      const startX = Math.max(200, 600 - totalWidth / 2 + gapX / 2);
      return row.map((node, i) => ({ ...node, x: startX + i * gapX, y }));
    };

    const arranged = [
      ...arrangeRow(hubs, startY),
      ...arrangeRow(agents, startY).map((n, i) => ({ ...n, x: (hubs.length > 0 ? hubs[hubs.length - 1].x + gapX + 200 : 900) + i * gapX })),
      ...arrangeRow(tier1, startY + tierGapY),
      ...arrangeRow(tier2, startY + tierGapY * 2),
      ...arrangeRow(others, startY + tierGapY * 3),
    ];

    // Reset connection offsets so they don't look weird after rearranging
    setConnections((prev) => prev.map((c) => ({ ...c, offsetX: 0, offsetY: 0 })));
    setNodes(arranged);
  }, [readOnly, nodes, commitToHistory]);

  return {
    nodes,
    connections,
    viewport,
    tool,
    selection,
    editingNodeId,
    pendingConnection,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < history.length - 1,
    setTool,
    setSelection,
    setEditingNodeId,
    setPendingConnection,
    screenToCanvas,
    snapToGrid,
    addNode,
    updateNode,
    deleteSelected,
    addConnection,
    updateConnection,
    moveNode,
    commitToHistory,
    undo,
    redo,
    zoom,
    pan,
    setViewport,
    fitToScreen,
    autoArrange,
  };
}

export type DiagramEditor = ReturnType<typeof useDiagramEditor>;
