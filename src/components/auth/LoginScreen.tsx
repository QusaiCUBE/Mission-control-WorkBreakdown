import { useState } from 'react';
import { signIn, signUp } from '../../utils/firebase';

const ALLOWED_USERNAMES = ['christian', 'qusai', 'justin'] as const;
type AllowedUsername = (typeof ALLOWED_USERNAMES)[number];

function isAllowed(name: string): name is AllowedUsername {
  return (ALLOWED_USERNAMES as readonly string[]).includes(name);
}

function usernameToEmail(username: string): string {
  return `${username}@mc.app`;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const name = username.toLowerCase().trim();

    if (!isAllowed(name)) {
      setError('That username is not authorized for this project.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const email = usernameToEmail(name);
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // The App-level auth listener will pick up the new user and route past
      // the login screen automatically.
    } catch (err) {
      const e = err as { code?: string; message?: string };
      const code = e.code ?? '';

      // Friendly messages for common cases. If the account doesn't exist on
      // sign-in, automatically offer the sign-up flow.
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        if (mode === 'signin') {
          setMode('signup');
          setError(`No account for "${name}" yet. Set a password to create it.`);
        } else {
          setError('Invalid credentials.');
        }
      } else if (code === 'auth/wrong-password') {
        setError('Wrong password.');
      } else if (code === 'auth/email-already-in-use') {
        setMode('signin');
        setError(`Account exists for "${name}". Enter your password to sign in.`);
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error — check your connection.');
      } else if (code === 'auth/configuration-not-found') {
        setError('Email/Password sign-in is not enabled in Firebase. Ask the admin to enable it.');
      } else if (code === 'auth/admin-restricted-operation') {
        setError(
          mode === 'signup'
            ? 'Account creation is disabled for this project. Existing users can sign in above.'
            : 'This operation is restricted by the admin.'
        );
      } else if (code === 'auth/password-does-not-meet-requirements') {
        setError(
          'Your password no longer meets the security policy. ' +
          'Sign in with a compliant password, or ask the admin to reset your password ' +
          'in the Firebase Console.'
        );
      } else {
        setError(e.message || 'Sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-christian flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            MC
          </div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-gray-500 mt-1">Work Breakdown Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-primary rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoFocus
              autoComplete="username"
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              {mode === 'signup' ? 'Set a password' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
            />
            {mode === 'signup' && (
              <p className="text-[10px] text-gray-600 mt-1">
                At least 6 characters. This will be your account password going forward.
              </p>
            )}
          </div>

          {error && <p className="text-xs text-status-overdue">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading
              ? mode === 'signup' ? 'Creating account…' : 'Signing in…'
              : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
            className="w-full text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {mode === 'signup'
              ? 'Have an account? Sign in instead'
              : 'First time? Create your account'}
          </button>
        </form>
      </div>
    </div>
  );
}
