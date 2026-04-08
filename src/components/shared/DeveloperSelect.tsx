import { Developer } from '../../types';

interface DeveloperSelectProps {
  developers: Developer[];
  value: string | null;
  onChange: (devId: string | null) => void;
  size?: 'sm' | 'md';
}

export default function DeveloperSelect({ developers, value, onChange, size = 'sm' }: DeveloperSelectProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${sizeClasses} bg-bg-tertiary border border-border-primary rounded-lg text-gray-200 focus:outline-none focus:border-christian transition-colors cursor-pointer`}
    >
      <option value="">Unassigned</option>
      {developers.map((dev) => (
        <option key={dev.id} value={dev.id}>
          {dev.name}
        </option>
      ))}
      <option value="both">Both</option>
    </select>
  );
}
