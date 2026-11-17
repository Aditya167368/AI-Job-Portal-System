import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, UserPlus, Mail, KeyRound, User, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup({
        username,
        email,
        password,
        fullName: fullName || username,
        preferredLanguage,
        targetCompanies: ['Google', 'Meta', 'Amazon'],
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    const rand = Math.floor(Math.random() * 9000) + 1000;
    setUsername(`candidate_${rand}`);
    setEmail(`candidate_${rand}@interview.ai`);
    setPassword('Password123!');
    setFullName(`Alex Chen`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md text-black mb-2">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Candidate Account</h2>
          <p className="text-xs text-slate-400">Initialize your adaptive Elo rating and progress record</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="devcoder99"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1 block">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition disabled:opacity-50 mt-2"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating Account...' : 'Register & Start'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center space-y-3">
          <button
            type="button"
            onClick={handleFillDemo}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Auto-Fill Sample Candidate
          </button>

          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
