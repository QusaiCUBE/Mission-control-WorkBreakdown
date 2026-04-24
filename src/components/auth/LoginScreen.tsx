import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

// SHA-256 hashes of passwords — actual passwords are NOT in the code
// To change passwords, generate new hashes at: run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')).then(h => console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')))
const ACCOUNT_HASHES: Record<string, string> = {
  christian: 'bb6c2bc0c24271f986727bc3c9ec39b86e3862f589761804f3ba3082ec2c4e1e',
  qusai: '662315d2843b73a79431264cbecac19acd249f7505017043449d13e70a5e731d',
  justin: '46fafb6bac3b1bd94a9457182abc6bfefc41843d207500e4a5e7ba09bdac1b60',
};

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const user = username.toLowerCase().trim();
    const expectedHash = ACCOUNT_HASHES[user];

    if (!expectedHash) {
      setError('Invalid username or password');
      setLoading(false);
      return;
    }

    const inputHash = await hashPassword(password);

    if (inputHash === expectedHash) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
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
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
            />
          </div>

          {error && <p className="text-xs text-status-overdue">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
