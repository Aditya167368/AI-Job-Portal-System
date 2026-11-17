import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, 
  BrainCircuit, 
  BarChart3, 
  Sparkles, 
  Flame, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Bot,
  Layers
} from 'lucide-react';
import GenerateQuestionModal from './GenerateQuestionModal';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-5 w-5 text-black" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AI Interview <span className="text-amber-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">PRO</span>
                </span>
                <p className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">Adaptive Assistant</p>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/dashboard') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4 text-amber-400" />
                Dashboard
              </Link>

              <Link
                to="/problems"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/problems') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                Problem Bank
              </Link>

              <Link
                to="/interview"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition relative ${
                  isActive('/interview') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Bot className="h-4 w-4 text-purple-400" />
                Adaptive Interview
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              </Link>

              <Link
                to="/analytics"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/analytics') 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                Analytics
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dynamic AI Question Generator Button */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate with AI</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Elo & Tier pill */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame className="h-3.5 w-3.5" />
                    {user?.eloRating || 1200}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 font-medium capitalize">
                    {(user?.rankingTier || 'Intermediate').toLowerCase()}
                  </span>
                </div>

                <Link
                  to="/settings"
                  title="Settings & API Key"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Dynamic Question Generation Modal */}
      {showGenerateModal && (
        <GenerateQuestionModal onClose={() => setShowGenerateModal(false)} />
      )}
    </>
  );
}
