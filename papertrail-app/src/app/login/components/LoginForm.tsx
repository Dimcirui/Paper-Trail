'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
        setError('Please enter both username and password.');
        setLoading(false);
        return;
    }

    try {
      // Placeholder API route
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // After successful login, redirect to Dashboard
        const userPayload = data.user;
        setUser(userPayload);
        localStorage.setItem('user', JSON.stringify(userPayload)); // Persist user info
        
        router.push(redirectTo || '/dashboard');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700">PaperTrail Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <p className="p-3 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. PaperTrail Admin or admin@papertrail.local"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="rounded-lg bg-indigo-50 p-4 text-xs text-indigo-900">
          <p className="font-semibold uppercase tracking-wide text-[11px] text-indigo-600 mb-2">
            Demo Accounts
          </p>
          <p>Use any seeded username or email (password: <span className="font-semibold">pass</span>).</p>
          <ul className="mt-2 space-y-1">
            <li>• PaperTrail Admin — admin@papertrail.local</li>
            <li>• Dr. Priya Natarajan — priya.natarajan@yale.edu</li>
            <li>• Dr. Miguel Alvarez — miguel.alvarez@mit.edu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
