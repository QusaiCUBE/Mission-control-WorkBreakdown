interface DeveloperAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
  showName?: boolean;
}

export default function DeveloperAvatar({ name, color, size = 'sm', showName }: DeveloperAvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {showName && <span className="text-sm text-gray-300">{name}</span>}
    </div>
  );
}
