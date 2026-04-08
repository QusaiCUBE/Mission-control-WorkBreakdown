interface DatePickerProps {
  value: string | null;
  onChange: (date: string) => void;
  label?: string;
}

function friendlyDate(date: string | null): string {
  if (!date) return 'Select date';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DatePicker({ value, onChange, label }: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-gray-400">{label}</label>}
      <div className="relative w-full">
        {/* Visible friendly text */}
        <div className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-sm text-gray-200 flex items-center justify-between pointer-events-none">
          <span>{friendlyDate(value)}</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500 flex-shrink-0">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
        </div>
        {/* Actual date input covering full area, transparent but clickable */}
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || '')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ fontSize: '16px' }}
        />
      </div>
    </div>
  );
}
