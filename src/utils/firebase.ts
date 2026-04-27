import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database } from 'firebase/database';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User,
} from 'firebase/auth';
import { Project } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCcGlV2syO_D-jP1xYN0QPWfKczR05RAB0",
  authDomain: "mission-control-tracker.firebaseapp.com",
  projectId: "mission-control-tracker",
  storageBucket: "mission-control-tracker.firebasestorage.app",
  messagingSenderId: "546324162957",
  appId: "1:546324162957:web:a878b8c285b62e46c5b5c4",
  databaseURL: "https://mission-control-tracker-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);
const auth = getAuth(app);

const PROJECT_REF = 'project';

// === Sync status broadcasting ===
export type SyncState = 'connecting' | 'online' | 'offline' | 'error';
export interface SyncStatus {
  state: SyncState;
  error?: string;
  lastSyncedAt?: number;
}

let currentStatus: SyncStatus = { state: 'connecting' };
const statusListeners = new Set<(s: SyncStatus) => void>();

function setSyncStatus(patch: Partial<SyncStatus>): void {
  currentStatus = { ...currentStatus, ...patch };
  statusListeners.forEach((cb) => cb(currentStatus));
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  cb(currentStatus);
  statusListeners.add(cb);
  return () => { statusListeners.delete(cb); };
}

// === Auth state ===
// `authReady` resolves once Firebase has determined whether a user is signed in
// (regardless of outcome). DB operations check `currentUser` before running
// rather than waiting on a promise that requires sign-in.
let currentUser: User | null = null;
const authListeners = new Set<(u: User | null) => void>();

const authReady: Promise<void> = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authListeners.forEach((cb) => cb(user));
    if (user) {
      setSyncStatus({ state: 'online', error: undefined });
    } else {
      setSyncStatus({ state: 'offline', error: undefined });
    }
    // Resolve on the first call, then keep the subscription alive for re-auth
    resolve();
    unsub; // keep reference; we never unsubscribe (app-lifetime)
  });
});

export function getCurrentUser(): User | null {
  return currentUser;
}

export function subscribeAuthState(cb: (u: User | null) => void): () => void {
  cb(currentUser);
  authListeners.add(cb);
  return () => { authListeners.delete(cb); };
}

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUp(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentUser || !currentUser.email) {
    throw new Error('You must be signed in to change your password.');
  }
  // Re-authenticate before the sensitive operation. Firebase requires a recent
  // credential check to update the password — without this, updatePassword can
  // fail with auth/requires-recent-login.
  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);
}

// Track connection state via the realtime DB's built-in presence ref.
// Only mark as online/offline when there's a signed-in user; otherwise the
// auth listener owns the offline state.
authReady.then(() => {
  onValue(ref(db, '.info/connected'), (snap) => {
    if (!currentUser) return;
    if (snap.val() === true) {
      setSyncStatus({ state: 'online', error: undefined });
    } else {
      setSyncStatus({ state: 'offline' });
    }
  });
});

// Firebase converts arrays to objects with numeric keys.
// This recursively converts them back to arrays.
function fixArrays(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(fixArrays);

  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record);

  // Check if this object is really an array (all keys are sequential integers)
  const isArray = keys.length > 0 && keys.every((k, i) => k === String(i));
  if (isArray) {
    return keys.map((k) => fixArrays(record[k]));
  }

  // Regular object — recurse into values
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    result[key] = fixArrays(record[key]);
  }
  return result;
}

export function saveProjectToFirebase(project: Project): void {
  authReady
    .then(() => {
      if (!currentUser) {
        // Not signed in — do not push. State stays in localStorage only until
        // the user authenticates.
        return;
      }
      return set(ref(db, PROJECT_REF), JSON.parse(JSON.stringify(project)))
        .then(() => {
          setSyncStatus({ state: 'online', error: undefined, lastSyncedAt: Date.now() });
        });
    })
    .catch((err) => {
      console.error('Firebase save failed:', err);
      setSyncStatus({ state: 'error', error: `Save failed: ${err.code || err.message}` });
    });
}

export function onProjectChange(callback: (project: Project | null) => void): () => void {
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;

  authReady.then(() => {
    if (cancelled || !currentUser) {
      // Not signed in — don't subscribe. Caller should re-subscribe once
      // the user authenticates.
      callback(null);
      return;
    }
    unsubscribe = onValue(
      ref(db, PROJECT_REF),
      (snapshot) => {
        const raw = snapshot.val();
        if (raw) {
          const fixed = fixArrays(raw) as Project;
          // Ensure critical arrays exist
          if (!Array.isArray(fixed.modules)) fixed.modules = [];
          if (!Array.isArray(fixed.phases)) fixed.phases = [];
          if (!Array.isArray(fixed.developers)) {
            fixed.developers = [
              { id: 'dev-christian', name: 'Christian', color: '#0984E3' },
              { id: 'dev-qusai', name: 'Qusai', color: '#0ABAB5' },
            ];
          }
          for (const m of fixed.modules) {
            if (!Array.isArray(m.tasks)) m.tasks = [];
            if (!Array.isArray(m.documents)) m.documents = [];
            if (!Array.isArray(m.attachments)) m.attachments = [];
            if (!Array.isArray(m.statusHistory)) m.statusHistory = [];
            if (!Array.isArray(m.dependencies)) m.dependencies = [];
            if (typeof (m as any).progress !== 'number') {
              const seed = { backlog: 0, in_progress: 33, in_review: 66, done: 100 } as const;
              (m as any).progress = seed[m.status as keyof typeof seed] ?? 0;
            }
          }
          // Drop legacy integrationMap field if present
          delete (fixed as { integrationMap?: unknown }).integrationMap;
          callback(fixed);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Firebase read failed:', error);
        const err = error as Error & { code?: string };
        setSyncStatus({ state: 'error', error: `Read failed: ${err.code || err.message}` });
        callback(null);
      }
    );
  });

  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
}
