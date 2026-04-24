import { useState, useRef } from 'react';
import { Attachment } from '../../types';
import { generateId } from '../../utils/id';
import { getToday } from '../../utils/dates';

interface FileAttachmentsProps {
  attachments: Attachment[];
  moduleId: string;
  onAdd: (moduleId: string, attachment: Attachment) => void;
  onRemove: (moduleId: string, attachmentId: string) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
  if (type.includes('document') || type.includes('word')) return '📝';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  return '📎';
}

export default function FileAttachments({ attachments, moduleId, onAdd, onRemove }: FileAttachmentsProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    setError(null);
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is too large. Max size is 2MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        onAdd(moduleId, {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data,
          addedDate: getToday(),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const a = document.createElement('a');
    a.href = attachment.data;
    a.download = attachment.name;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Files</h4>
        <span className="text-xs text-gray-500">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-3 ${
          isDragOver
            ? 'border-christian bg-christian/10'
            : 'border-border-primary hover:border-gray-500'
        }`}
      >
        <p className="text-xs text-gray-400">
          {isDragOver ? 'Drop files here' : 'Drag & drop files here or click to browse'}
        </p>
        <p className="text-[10px] text-gray-600 mt-1">Max 2MB per file</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-status-overdue mb-2">{error}</p>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-bg-tertiary group"
            >
              <span className="text-base flex-shrink-0">{getFileIcon(att.type)}</span>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleDownload(att)}
                  className="text-sm text-gray-200 hover:text-christian truncate block w-full text-left transition-colors"
                >
                  {att.name}
                </button>
                <p className="text-[10px] text-gray-600">{formatFileSize(att.size)}</p>
              </div>
              <button
                onClick={() => onRemove(moduleId, att.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-status-overdue transition-all flex-shrink-0"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H5.5l1-1h3l1 1H13a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
