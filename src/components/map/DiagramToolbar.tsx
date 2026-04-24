import { DiagramEditor, Tool } from './useDiagramEditor';

interface DiagramToolbarProps {
  editor: DiagramEditor;
}

const TOOLS: { key: Tool; label: string; icon: JSX.Element }[] = [
  {
    key: 'select',
    label: 'Select',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.672 1.91a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.708A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" /></svg>,
  },
  {
    key: 'box',
    label: 'Add Node',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" /></svg>,
  },
  {
    key: 'connect',
    label: 'Connect',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  },
];

const NODE_COLORS = [
  { label: 'Teal', color: '#0ABAB5' },
  { label: 'Blue', color: '#0984E3' },
  { label: 'Purple', color: '#6C5CE7' },
  { label: 'Green', color: '#00B894' },
  { label: 'Amber', color: '#F39C12' },
  { label: 'Red', color: '#E17055' },
  { label: 'Pink', color: '#FD79A8' },
  { label: 'Gold', color: '#FDCB6E' },
  { label: 'Gray', color: '#636E72' },
];

export default function DiagramToolbar({ editor }: DiagramToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-border-primary bg-bg-secondary flex-wrap">
      {/* Tools */}
      {TOOLS.map((t) => (
        <button
          key={t.key}
          onClick={() => editor.setTool(t.key)}
          title={t.label}
          className={`p-2 rounded-lg transition-colors ${
            editor.tool === t.key
              ? 'bg-christian/20 text-christian'
              : 'text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary'
          }`}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-px h-6 bg-border-primary mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={editor.undo}
        disabled={!editor.canUndo}
        title="Undo (Ctrl+Z)"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </button>
      <button
        onClick={editor.redo}
        disabled={!editor.canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 scale-x-[-1]"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </button>

      <div className="w-px h-6 bg-border-primary mx-1" />

      {/* Zoom */}
      <button
        onClick={() => editor.zoom(100, 0, 0)}
        title="Zoom Out"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
      </button>
      <span className="text-xs text-gray-500 w-10 text-center">
        {Math.round(editor.viewport.scale * 100)}%
      </span>
      <button
        onClick={() => editor.zoom(-100, 0, 0)}
        title="Zoom In"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
      </button>

      <div className="w-px h-6 bg-border-primary mx-1" />

      {/* Auto arrange */}
      <button
        onClick={editor.autoArrange}
        title="Auto Arrange"
        className="px-2 py-1 text-xs rounded-lg text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary"
      >
        Auto Arrange
      </button>

      {/* Delete selected */}
      {editor.selection && (
        <button
          onClick={editor.deleteSelected}
          title="Delete Selected"
          className="px-2 py-1 text-xs rounded-lg text-status-overdue hover:bg-status-overdue/10"
        >
          Delete
        </button>
      )}

      {/* Color palette when node selected */}
      {editor.selection?.type === 'node' && (
        <>
          <div className="w-px h-6 bg-border-primary mx-1" />
          <div className="flex gap-1">
            {NODE_COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => editor.updateNode(editor.selection!.id, { color: c.color })}
                title={c.label}
                className="w-5 h-5 rounded border border-border-primary hover:scale-125 transition-transform"
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </>
      )}

      <span className="text-[10px] text-gray-600 ml-auto hidden lg:block">
        Space+drag to pan | Scroll to zoom | Shift+drag from anchors to connect
      </span>
    </div>
  );
}
