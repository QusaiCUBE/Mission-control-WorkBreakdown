import { useState } from 'react';
import { RequiredDocument, DocumentStatus } from '../../types';
import { generateId } from '../../utils/id';

interface RequiredDocumentsProps {
  documents: RequiredDocument[];
  moduleId: string;
  onAdd: (moduleId: string, doc: RequiredDocument) => void;
  onUpdate: (moduleId: string, docId: string, updates: Partial<RequiredDocument>) => void;
  onRemove: (moduleId: string, docId: string) => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  needed: { label: 'Needed', color: '#D63031' },
  requested: { label: 'Requested', color: '#F39C12' },
  received: { label: 'Received', color: '#00B894' },
};

export default function RequiredDocuments({ documents, moduleId, onAdd, onUpdate, onRemove }: RequiredDocumentsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(moduleId, {
      id: generateId(),
      title: newTitle.trim(),
      source: newSource.trim(),
      status: 'needed',
      notes: '',
    });
    setNewTitle('');
    setNewSource('');
    setShowAdd(false);
  };

  const receivedCount = documents.filter((d) => d.status === 'received').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Required Documents</h4>
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <span className="text-xs text-gray-400">
              {receivedCount}/{documents.length} received
            </span>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-christian hover:text-blue-400 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-3 p-3 bg-bg-tertiary rounded-lg border border-border-primary space-y-2">
          <input
            type="text"
            placeholder="Document name (e.g. CRM Wireframe)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
          />
          <input
            type="text"
            placeholder="Needed from (e.g. Design team, Client)"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-3 py-1 text-xs font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40"
            >
              Add Document
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTitle(''); setNewSource(''); }}
              className="px-3 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 && !showAdd ? (
        <p className="text-xs text-gray-500">No documents tracked yet</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const config = STATUS_CONFIG[doc.status];
            return (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-bg-tertiary group"
              >
                {/* Status indicator */}
                <select
                  value={doc.status}
                  onChange={(e) => onUpdate(moduleId, doc.id, { status: e.target.value as DocumentStatus })}
                  className="mt-0.5 text-xs font-medium rounded-lg px-2 py-1 cursor-pointer border-0 focus:outline-none"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {(Object.keys(STATUS_CONFIG) as DocumentStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{doc.title}</p>
                  {doc.source && (
                    <p className="text-xs text-gray-500 mt-0.5">From: {doc.source}</p>
                  )}
                  {/* Inline notes */}
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={doc.notes}
                    onChange={(e) => onUpdate(moduleId, doc.id, { notes: e.target.value })}
                    className="mt-1 w-full bg-transparent text-xs text-gray-400 placeholder-gray-600 focus:outline-none"
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemove(moduleId, doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-status-overdue transition-all"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M11 1.5v1h3.5a.5.5 0 010 1h-.538l-.853 10.66A2 2 0 0111.115 16H4.885a2 2 0 01-1.994-1.84L2.038 3.5H1.5a.5.5 0 010-1H5v-1A1.5 1.5 0 016.5 0h3A1.5 1.5 0 0111 1.5zm-5 0v1h4v-1a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5z"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
