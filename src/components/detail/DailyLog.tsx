import { useMemo, useState } from 'react';
import { DailyLogEntry } from '../../types';
import { getToday } from '../../utils/dates';

interface DailyLogProps {
  entries: DailyLogEntry[];
  onAdd: (date: string, text: string) => void;
  onUpdate: (entryId: string, updates: Partial<Pick<DailyLogEntry, 'text' | 'date'>>) => void;
  onRemove: (entryId: string) => void;
  readOnly?: boolean;
}

function formatDayHeading(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const today = getToday();
  const yest = (() => {
    const y = new Date(today + 'T00:00:00');
    y.setDate(y.getDate() - 1);
    return y.toISOString().slice(0, 10);
  })();
  const long = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (date === today) return `Today · ${long}`;
  if (date === yest) return `Yesterday · ${long}`;
  return long;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function DailyLog({ entries, onAdd, onUpdate, onRemove, readOnly }: DailyLogProps) {
  const [date, setDate] = useState(getToday());
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const grouped = useMemo(() => {
    const byDate = new Map<string, DailyLogEntry[]>();
    for (const e of entries) {
      const arr = byDate.get(e.date) ?? [];
      arr.push(e);
      byDate.set(e.date, arr);
    }
    // Newest day first; within a day, newest entry first
    return [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, list]) => ({
        day,
        entries: [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      }));
  }, [entries]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(date, text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Daily Log
        </h3>
        <span className="text-[10px] text-gray-600">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {!readOnly && (
        <div className="mb-4 rounded-lg border border-border-primary bg-bg-tertiary/40 p-3">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[11px] text-gray-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs bg-bg-secondary border border-border-primary rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-christian"
            />
            <button
              type="button"
              onClick={() => setDate(getToday())}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Today
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What did you do today on this module?"
            rows={3}
            className="w-full text-sm bg-bg-secondary border border-border-primary rounded px-2 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-600">⌘/Ctrl + Enter to add</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="text-xs bg-christian text-white px-3 py-1 rounded hover:bg-christian/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add entry
            </button>
          </div>
        </div>
      )}

      {grouped.length === 0 ? (
        <p className="text-xs text-gray-600 italic">No log entries yet.</p>
      ) : (
        <ol className="space-y-4">
          {grouped.map(({ day, entries: dayEntries }) => (
            <li key={day}>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {formatDayHeading(day)}
              </div>
              <ul className="space-y-1.5 border-l-2 border-border-primary pl-3">
                {dayEntries.map((entry) => {
                  const isEditing = editingId === entry.id;
                  return (
                    <li key={entry.id} className="group">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-gray-600 mt-0.5 w-12 flex-shrink-0">
                          {formatTimestamp(entry.createdAt)}
                        </span>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="w-full text-sm bg-bg-secondary border border-border-primary rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-christian resize-y"
                              />
                              <div className="flex gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editText.trim()) {
                                      onUpdate(entry.id, { text: editText.trim() });
                                    }
                                    setEditingId(null);
                                  }}
                                  className="text-[11px] bg-christian text-white px-2 py-0.5 rounded hover:bg-christian/90 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="text-[11px] text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                              {entry.text}
                            </p>
                          )}
                          {!isEditing && entry.author && (
                            <p className="text-[10px] text-gray-600 mt-0.5">— {entry.author}</p>
                          )}
                        </div>
                        {!readOnly && !isEditing && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(entry.id);
                                setEditText(entry.text);
                              }}
                              className="text-[11px] text-gray-500 hover:text-gray-200 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(entry.id)}
                              className="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
