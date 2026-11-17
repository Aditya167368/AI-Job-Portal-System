import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Brain, Building2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function GenerateQuestionModal({ onClose }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('Dynamic Programming');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [company, setCompany] = useState('Google');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const topics = [
    'Dynamic Programming',
    'Graphs',
    'Trees',
    'Arrays & Hashing',
    'Two Pointers',
    'Sliding Window',
    'Stack',
    'Binary Search',
    'Trie',
    'Backtracking',
    'Heap / Priority Queue',
  ];

  const companies = [
    'Google',
    'Meta',
    'Amazon',
    'Microsoft',
    'Apple',
    'Netflix',
    'Uber',
    'Stripe',
    'Palantir',
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setStatusMessage('Analyzing top tech interview question patterns...');
    const timer1 = setTimeout(() => {
      setStatusMessage('Prompting OpenAI with rigorous constraint specifications...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setStatusMessage('Synthesizing starter templates and hidden test cases...');
    }, 2500);

    try {
      const response = await api.post('/questions/generate', {
        topic,
        difficulty,
        targetCompany: company,
        customPrompt,
      });

      setStatusMessage('Problem generated successfully!');
      setTimeout(() => {
        onClose();
        navigate(`/problems/${response.data.id || response.data.slug}`);
      }, 500);
    } catch (err) {
      console.error('Error generating problem:', err);
      setError(err.response?.data?.message || 'Failed to generate problem. Using dynamic fallback.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Generate AI Interview Problem</h3>
            <p className="text-xs text-slate-400">Dynamically synthesize novel LeetCode-style questions using OpenAI</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          
          {/* Topic Select */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              Algorithmic Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty radio buttons */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-1.5">
              <Brain className="h-3.5 w-3.5 text-amber-400" />
              Target Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                <button
                  type="button"
                  key={d}
                  disabled={loading}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl border py-2 text-xs font-bold transition ${
                    difficulty === d
                      ? d === 'EASY'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                        : d === 'MEDIUM'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-400'
                        : 'border-rose-500 bg-rose-950/60 text-rose-400'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Target Company */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              Target Company Style
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Custom Prompt Context */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
              Custom Scenario / Focus (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Focus on sliding window with character frequency map"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Status message or error */}
          {loading && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2 animate-pulse">
              <Cpu className="h-4 w-4 shrink-0 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Synthesizing...' : 'Generate Problem'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
