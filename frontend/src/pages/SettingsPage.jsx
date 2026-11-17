import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Sparkles, Check, ShieldCheck, Cpu, User, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, openAiKey, updateOpenAiKey } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(openAiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    updateOpenAiKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    updateOpenAiKey('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure candidate preferences and AI synthesis models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OpenAI Integration Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">OpenAI API Key</h3>
              <p className="text-xs text-slate-400">Enables dynamic GPT-4o-mini problem synthesis</p>
            </div>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
                API Key (Optional)
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition"
              >
                Save Key
              </button>
              {openAiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition"
                >
                  Clear Key
                </button>
              )}
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Settings updated successfully.</span>
              </div>
            )}
          </form>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Engine Fallback</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If no key is configured, the assistant automatically utilizes its high-fidelity algorithmic synthesis engine with test verification suites across all topics.
            </p>
          </div>
        </div>

        {/* Candidate Profile Details */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Candidate Profile</h3>
              <p className="text-xs text-slate-400">Your current account identity</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Username</span>
              <span className="font-semibold text-white">{user?.username || 'Guest'}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Current Rating</span>
              <span className="font-bold text-amber-400 font-mono">{user?.eloRating || 1200} Elo</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Target Companies</span>
              <span className="font-semibold text-slate-300">
                {user?.targetCompanies?.join(', ') || 'Google, Meta, Amazon'}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Preferred Language</span>
              <span className="font-semibold text-emerald-400 capitalize">
                {user?.preferredLanguage || 'JavaScript'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
