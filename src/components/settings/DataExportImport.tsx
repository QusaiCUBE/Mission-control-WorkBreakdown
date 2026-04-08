import { useRef } from 'react';

interface DataExportImportProps {
  onExport: () => string;
  onImport: (json: string) => void;
}

export default function DataExportImport({ onExport, onImport }: DataExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-control-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        onImport(json);
      } catch {
        alert('Failed to import: invalid JSON file');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Data Management</h3>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors"
        >
          Export JSON
        </button>

        <label className="px-4 py-2 text-sm font-medium text-gray-300 bg-bg-tertiary rounded-lg hover:bg-border-primary transition-colors cursor-pointer">
          Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
