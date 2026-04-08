interface ProgressBarProps {
  value: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({ value, color, size = 'md', showLabel }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-bg-tertiary rounded-full overflow-hidden ${SIZE_CLASSES[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color || '#00B894',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 font-medium w-8 text-right">{clampedValue}%</span>
      )}
    </div>
  );
}
