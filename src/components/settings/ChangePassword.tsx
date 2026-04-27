import { useState } from 'react';
import { changePassword } from '../../utils/firebase';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current one.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      reset();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      const code = e.code ?? '';

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (code === 'auth/weak-password') {
        setError('New password is too weak.');
      } else if (code === 'auth/password-does-not-meet-requirements') {
        // Firebase wraps the missing requirements inside the message string.
        setError(e.message || 'New password does not meet the security policy.');
      } else if (code === 'auth/requires-recent-login') {
        setError('Session is too old. Sign out and back in, then try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error — check your connection.');
      } else {
        setError(e.message || 'Could not change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-1">Change Password</h3>
      <p className="text-xs text-gray-500 mb-4">
        Update the password for your Mission Control account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(''); setSuccess(false); }}
            autoComplete="current-password"
            className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(''); setSuccess(false); }}
            autoComplete="new-password"
            className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setSuccess(false); }}
            autoComplete="new-password"
            className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-christian transition-colors"
          />
        </div>

        {error && <p className="text-xs text-status-overdue whitespace-pre-wrap">{error}</p>}
        {success && (
          <p className="text-xs text-status-done">Password updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          className="px-4 py-2 text-sm font-medium text-white bg-christian rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
