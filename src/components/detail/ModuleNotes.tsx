import { useState, useEffect, useRef } from 'react';

interface ModuleNotesProps {
  notes: string;
  onChange: (notes: string) => void;
}

export default function ModuleNotes({ notes, onChange }: ModuleNotesProps) {
  const [value, setValue] = useState(notes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(notes);
  }, [notes]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(newValue), 300);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-2">Notes</h4>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes..."
        rows={4}
        className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian resize-y transition-colors"
      />
    </div>
  );
}
