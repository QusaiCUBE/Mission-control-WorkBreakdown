import { useEffect, useState } from 'react';
import { subscribeSyncStatus, SyncStatus } from '../utils/firebase';

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({ state: 'connecting' });
  useEffect(() => subscribeSyncStatus(setStatus), []);
  return status;
}
