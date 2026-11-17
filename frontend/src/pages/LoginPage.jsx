import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogIn, Sparkles, KeyRound, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('demodev');
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md text-black mb-2">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Your Workspace</h2>
          <p className="text-xs text-slate-400">Track progress, AI hints, and dynamic interview sessions</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer or candidate@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick fill */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-3">
          <button
            type="button"
            onClick={handleFillDemo}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Auto-Fill Demo Credentials
          </button>

          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-amber-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
