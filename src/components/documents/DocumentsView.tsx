import { useState } from 'react';
import { Module, Developer, RequiredDocument, DocumentStatus } from '../../types';
import { generateId } from '../../utils/id';
import DeveloperAvatar from '../shared/DeveloperAvatar';

interface DocumentsViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  onAddDocument: (moduleId: string, doc: RequiredDocument) => void;
  onUpdateDocument: (moduleId: string, docId: string, updates: Partial<RequiredDocument>) => void;
  onRemoveDocument: (moduleId: string, docId: string) => void;
  onModuleClick: (moduleId: string) => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string }> = {
  needed: { label: 'Needed', color: '#D63031', bg: '#D6303115' },
  requested: { label: 'Requested', color: '#F39C12', bg: '#F39C1215' },
  received: { label: 'Received', color: '#00B894', bg: '#00B89415' },
};

const ALL_STATUSES: DocumentStatus[] = ['needed', 'requested', 'received'];

export default function DocumentsView({
  modules,
  developers,
  onAddDocument,
  onUpdateDocument,
  onRemoveDocument,
  onModuleClick,
}: DocumentsViewProps) {
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [addingForModule, setAddingForModule] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');

  // Collect all documents with their parent module info
  const allDocs = modules.flatMap((m) =>
    m.documents.map((doc) => ({ doc, module: m }))
  );

  const filteredDocs = allDocs.filter(({ doc, module }) => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (filterModule !== 'all' && module.id !== filterModule) return false;
    return true;
  });

  // Stats
  const totalDocs = allDocs.length;
  const neededCount = allDocs.filter((d) => d.doc.status === 'needed').length;
  const requestedCount = allDocs.filter((d) => d.doc.status === 'requested').length;
  const receivedCount = allDocs.filter((d) => d.doc.status === 'received').length;

  const handleAdd = () => {
    if (!newTitle.trim() || !addingForModule) return;
    onAddDocument(addingForModule, {
      id: generateId(),
      title: newTitle.trim(),
      source: newSource.trim(),
      status: 'needed',
      notes: '',
    });
    setNewTitle('');
    setNewSource('');
    setAddingForModule(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3 rounded-xl border transition-colors text-left ${
            filterStatus === 'all' ? 'border-christian bg-christian/10' : 'border-border-primary bg-bg-secondary hover:bg-bg-tertiary'
          }`}
        >
          <p className="text-2xl font-bold text-white">{totalDocs}</p>
          <p className="text-xs text-gray-400">Total Documents</p>
        </button>
        {ALL_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const count = status === 'needed' ? neededCount : status === 'requested' ? requestedCount : receivedCount;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`p-3 rounded-xl border transition-colors text-left ${
                filterStatus === status ? `border-[${config.color}]` : 'border-border-primary bg-bg-secondary hover:bg-bg-tertiary'
              }`}
              style={filterStatus === status ? { borderColor: config.color, backgroundColor: config.bg } : undefined}
            >
              <p className="text-2xl font-bold" style={{ color: config.color }}>{count}</p>
              <p className="text-xs text-gray-400">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 py-1.5 text-sm bg-bg-secondary border border-border-primary rounded-lg text-gray-200 focus:outline-none focus:border-christian cursor-pointer"
        >
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <div className="ml-auto">
          <button
            onClick={() => setAddingForModule(addingForModule ? null : (filterModule !== 'all' ? filterModule : modules[0]?.id || null))}
            className="px-4 py-1.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Document
          </button>
        </div>
      </div>

      {/* Add form */}
      {addingForModule && (
        <div className="p-4 bg-bg-secondary border border-border-primary rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-white">Add Required Document</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={addingForModule}
              onChange={(e) => setAddingForModule(e.target.value)}
              className="px-3 py-1.5 text-sm bg-bg-tertiary border border-border-primary rounded-lg text-gray-200 focus:outline-none focus:border-christian cursor-pointer"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Document name (e.g. CRM Wireframe)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="px-3 py-1.5 text-sm bg-bg-tertiary border border-border-primary rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
            />
            <input
              type="text"
              placeholder="Needed from (e.g. Design team)"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="px-3 py-1.5 text-sm bg-bg-tertiary border border-border-primary rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => { setAddingForModule(null); setNewTitle(''); setNewSource(''); }}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Documents table */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_140px_100px_40px] gap-3 px-4 py-2.5 border-b border-border-primary text-xs font-semibold text-gray-400">
          <span>Document</span>
          <span>Module</span>
          <span>Needed From</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* Rows */}
        {filteredDocs.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            {totalDocs === 0
              ? 'No documents tracked yet. Click "+ Add Document" to get started.'
              : 'No documents match the current filters.'}
          </div>
        ) : (
          filteredDocs.map(({ doc, module }) => {
            const config = STATUS_CONFIG[doc.status];
            const dev = developers.find((d) => d.id === module.assignedTo);

            return (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_140px_140px_100px_40px] gap-3 px-4 py-3 border-b border-border-primary last:border-b-0 hover:bg-bg-tertiary transition-colors group items-center"
              >
                {/* Document title + notes */}
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">{doc.title}</p>
                  <input
                    type="text"
                    placeholder="Add note..."
                    value={doc.notes}
                    onChange={(e) => onUpdateDocument(module.id, doc.id, { notes: e.target.value })}
                    className="mt-0.5 w-full bg-transparent text-xs text-gray-500 placeholder-gray-700 focus:outline-none focus:text-gray-300"
                  />
                </div>

                {/* Module */}
                <button
                  onClick={() => onModuleClick(module.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 truncate"
                >
                  {dev && <DeveloperAvatar name={dev.name} color={dev.color} />}
                  <span className="truncate">{module.name}</span>
                </button>

                {/* Source */}
                <input
                  type="text"
                  value={doc.source}
                  onChange={(e) => onUpdateDocument(module.id, doc.id, { source: e.target.value })}
                  placeholder="—"
                  className="text-xs text-gray-400 bg-transparent focus:outline-none focus:text-gray-200 truncate"
                />

                {/* Status */}
                <select
                  value={doc.status}
                  onChange={(e) => onUpdateDocument(module.id, doc.id, { status: e.target.value as DocumentStatus })}
                  className="text-xs font-medium rounded-lg px-2 py-1 cursor-pointer border-0 focus:outline-none"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>

                {/* Delete */}
                <button
                  onClick={() => onRemoveDocument(module.id, doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-status-overdue transition-all justify-self-center"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H5.5l1-1h3l1 1H13a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
