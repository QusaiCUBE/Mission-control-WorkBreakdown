import { DiagramEditor } from './useDiagramEditor';

interface DiagramPropertiesPanelProps {
  editor: DiagramEditor;
}

export default function DiagramPropertiesPanel({ editor }: DiagramPropertiesPanelProps) {
  if (!editor.selection) return null;

  const isNode = editor.selection.type === 'node';
  const node = isNode ? editor.nodes.find((n) => n.id === editor.selection!.id) : null;
  const conn = !isNode ? editor.connections.find((c) => c.id === editor.selection!.id) : null;

  return (
    <div className="w-60 bg-bg-secondary border-l border-border-primary p-4 overflow-y-auto space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {isNode ? 'Node' : 'Connection'}
      </h3>

      {node && (
        <>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Label</label>
            <input
              type="text"
              value={node.label}
              onChange={(e) => editor.updateNode(node.id, { label: e.target.value })}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-christian"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Subtitle</label>
            <input
              type="text"
              value={node.subtitle}
              onChange={(e) => editor.updateNode(node.id, { subtitle: e.target.value })}
              placeholder="e.g. Core Module"
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <select
              value={node.type}
              onChange={(e) => editor.updateNode(node.id, { type: e.target.value as any })}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-christian cursor-pointer"
            >
              <option value="module">Module</option>
              <option value="service">Service</option>
              <option value="database">Database</option>
              <option value="api">API</option>
              <option value="user">User</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Width</label>
              <input
                type="number"
                value={node.width}
                onChange={(e) => editor.updateNode(node.id, { width: Math.max(60, parseInt(e.target.value) || 150) })}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-christian text-center"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Height</label>
              <input
                type="number"
                value={node.height}
                onChange={(e) => editor.updateNode(node.id, { height: Math.max(30, parseInt(e.target.value) || 56) })}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-christian text-center"
              />
            </div>
          </div>
        </>
      )}

      {conn && (
        <>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Label</label>
            <input
              type="text"
              value={conn.label}
              onChange={(e) => editor.updateConnection(conn.id, { label: e.target.value })}
              placeholder="e.g. Client data"
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Style</label>
            <div className="flex gap-2">
              <button
                onClick={() => editor.updateConnection(conn.id, { style: 'solid' })}
                className={`flex-1 py-1 text-xs rounded-lg border ${conn.style === 'solid' ? 'border-christian text-christian' : 'border-border-primary text-gray-400'}`}
              >
                Solid
              </button>
              <button
                onClick={() => editor.updateConnection(conn.id, { style: 'dashed' })}
                className={`flex-1 py-1 text-xs rounded-lg border ${conn.style === 'dashed' ? 'border-christian text-christian' : 'border-border-primary text-gray-400'}`}
              >
                Dashed
              </button>
            </div>
          </div>
        </>
      )}

      <button
        onClick={editor.deleteSelected}
        className="w-full py-1.5 text-xs text-status-overdue border border-status-overdue/30 rounded-lg hover:bg-status-overdue/10 transition-colors"
      >
        Delete {isNode ? 'Node' : 'Connection'}
      </button>
    </div>
  );
}
