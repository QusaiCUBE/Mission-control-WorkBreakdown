import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeAuthState } from '../utils/firebase';

export interface AuthState {
  ready: boolean;       // false until Firebase has determined initial auth status
  user: User | null;    // the authenticated Firebase user, or null
  username: string | null; // local-part of the user's email (e.g. "christian")
}

function emailToUsername(email: string | null): string | null {
  if (!email) return null;
  const at = email.indexOf('@');
  return at === -1 ? email : email.slice(0, at);
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ ready: false, user: null, username: null });

  useEffect(() => {
    return subscribeAuthState((user) => {
      setState({
        ready: true,
        user,
        username: user ? emailToUsername(user.email) : null,
      });
    });
  }, []);

  return state;
}
