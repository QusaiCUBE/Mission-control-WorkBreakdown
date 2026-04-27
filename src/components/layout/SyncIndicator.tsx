import { useSyncStatus } from '../../hooks/useSyncStatus';

function relativeTime(ts: number | undefined): string {
  if (!ts) return '';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

export default function SyncIndicator() {
  const status = useSyncStatus();

  const config = (() => {
    switch (status.state) {
      case 'connecting':
        return { color: '#9CA3AF', label: 'Connecting…', title: 'Connecting to Firebase' };
      case 'online':
        return {
          color: '#00B894',
          label: status.lastSyncedAt ? `Synced ${relativeTime(status.lastSyncedAt)}` : 'Live',
          title: 'Connected — changes sync to all devices',
        };
      case 'offline':
        return {
          color: '#F39C12',
          label: 'Offline',
          title: 'No connection — changes will resync when you reconnect',
        };
      case 'error':
        return {
          color: '#D63031',
          label: 'Sync error',
          title: status.error || 'Unknown sync error',
        };
    }
  })();

  return (
    <div
      className="flex items-center gap-1.5 text-xs text-gray-400 max-w-[420px]"
      title={config.title}
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${status.state === 'connecting' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: config.color }}
      />
      <span className="hidden md:inline whitespace-nowrap">{config.label}</span>
      {status.state === 'error' && status.error && (
        <span
          className="hidden lg:inline text-[10px] text-status-overdue truncate"
          style={{ maxWidth: 320 }}
        >
          — {status.error}
        </span>
      )}
    </div>
  );
}
