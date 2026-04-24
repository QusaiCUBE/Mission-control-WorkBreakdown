import { Module, Developer, Priority, RequiredDocument, Attachment } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import Slider from '../shared/Slider';
import RequiredDocuments from './RequiredDocuments';
import FileAttachments from './FileAttachments';
import ModuleNotes from './ModuleNotes';
import ModuleMetadata from './ModuleMetadata';
import StatusHistory from './StatusHistory';
import { isOverdue } from '../../utils/dates';

interface ModuleDetailProps {
  module: Module;
  developers: [Developer, Developer];
  onClose: () => void;
  onUpdateModule: (moduleId: string, updates: Partial<Module>) => void;
  onAssignModule: (moduleId: string, devId: string | null) => void;
  onUpdateNotes: (moduleId: string, notes: string) => void;
  onUpdatePriority: (moduleId: string, priority: Priority) => void;
  onUpdateProgress: (moduleId: string, progress: number) => void;
  onAddDocument: (moduleId: string, doc: RequiredDocument) => void;
  onUpdateDocument: (moduleId: string, docId: string, updates: Partial<RequiredDocument>) => void;
  onRemoveDocument: (moduleId: string, docId: string) => void;
  onAddAttachment: (moduleId: string, attachment: Attachment) => void;
  onRemoveAttachment: (moduleId: string, attachmentId: string) => void;
  readOnly?: boolean;
}

export default function ModuleDetail({
  module,
  developers,
  onClose,
  onUpdateModule,
  onAssignModule,
  onUpdateNotes,
  onUpdatePriority,
  onUpdateProgress,
  onAddDocument,
  onUpdateDocument,
  onRemoveDocument,
  onAddAttachment,
  onRemoveAttachment,
  readOnly,
}: ModuleDetailProps) {
  const overdue = isOverdue(module.dueDate) && module.status !== 'done';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            {readOnly ? (
              <>
                <h2 className="text-xl font-bold text-white">{module.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{module.description}</p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={module.name}
                  onChange={(e) => onUpdateModule(module.id, { name: e.target.value })}
                  className="text-xl font-bold text-white bg-transparent border-0 border-b border-transparent hover:border-border-primary focus:border-christian focus:outline-none w-full transition-colors px-0 py-0.5"
                />
                <input
                  type="text"
                  value={module.description}
                  onChange={(e) => onUpdateModule(module.id, { description: e.target.value })}
                  placeholder="Add description..."
                  className="text-sm text-gray-400 bg-transparent border-0 border-b border-transparent hover:border-border-primary focus:border-christian focus:outline-none w-full mt-1 transition-colors px-0 py-0.5 placeholder-gray-600"
                />
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-bg-tertiary transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={module.status} isOverdue={overdue} />
          {module.documents.length > 0 && (
            <span className="text-xs text-gray-500">
              {module.documents.filter((d) => d.status === 'received').length}/{module.documents.length} docs
            </span>
          )}
          {module.attachments.length > 0 && (
            <span className="text-xs text-gray-500">
              {module.attachments.length} file{module.attachments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {module.status !== 'done' && (
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
              Progress
            </label>
            <Slider
              value={module.progress ?? 0}
              onChange={(v) => onUpdateProgress(module.id, v)}
              disabled={readOnly}
              ariaLabel={`Progress for ${module.name}`}
            />
          </div>
        )}

        <ModuleMetadata
          module={module}
          developers={developers}
          onAssign={(devId) => onAssignModule(module.id, devId)}
          onUpdatePriority={(p) => onUpdatePriority(module.id, p)}
        />

        <div className="border-t border-border-primary pt-6">
          <RequiredDocuments
            documents={module.documents}
            moduleId={module.id}
            onAdd={onAddDocument}
            onUpdate={onUpdateDocument}
            onRemove={onRemoveDocument}
          />
        </div>

        <div className="border-t border-border-primary pt-6">
          <FileAttachments
            attachments={module.attachments}
            moduleId={module.id}
            onAdd={onAddAttachment}
            onRemove={onRemoveAttachment}
          />
        </div>

        <div className="border-t border-border-primary pt-6">
          <ModuleNotes
            notes={module.notes}
            onChange={(notes) => onUpdateNotes(module.id, notes)}
          />
        </div>

        <div className="border-t border-border-primary pt-6">
          <StatusHistory history={module.statusHistory} />
        </div>
      </div>
    </div>
  );
}
