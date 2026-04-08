import { Developer } from '../../types';

interface DeveloperNameEditorProps {
  developers: [Developer, Developer];
  onUpdateName: (devId: string, name: string) => void;
}

export default function DeveloperNameEditor({ developers, onUpdateName }: DeveloperNameEditorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Developers</h3>
      {developers.map((dev, i) => (
        <div key={dev.id} className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: dev.color }}
          >
            {dev.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">
              Developer {i + 1}
              {i === 0 && ' (Project Lead)'}
            </label>
            {i === 0 ? (
              <p className="text-sm text-gray-300">{dev.name}</p>
            ) : (
              <input
                type="text"
                value={dev.name}
                onChange={(e) => onUpdateName(dev.id, e.target.value)}
                placeholder="Enter name"
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-christian transition-colors"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
