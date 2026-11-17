import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  BarChart3, 
  Trophy, 
  Target, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Flame,
  Award,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, leadRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/leaderboard'),
        ]);
        setDashboard(dashRes.data);
        setLeaderboard(leadRes.data || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
          <p className="text-sm font-medium">Aggregating telemetry & performance curves...</p>
        </div>
      </div>
    );
  }

  const totalSolved = dashboard?.totalSolved || 0;
  const easy = dashboard?.easySolved || 0;
  const medium = dashboard?.mediumSolved || 0;
  const hard = dashboard?.hardSolved || 0;
  const totalSubmissions = dashboard?.totalSubmissions || 0;
  const ratingHistory = dashboard?.ratingHistory || [1200];
  const topicMastery = dashboard?.topicMastery || {};
  const recentSubmissions = dashboard?.recentSubmissions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-cyan-400" />
          Performance & Skill Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on algorithmic competencies, Elo rating evolution, and submission outcomes.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Difficulty Distribution Ring / Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Difficulty Breakdown</h3>
            <span className="text-xs font-mono text-slate-400">{totalSolved} Solved</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Easy</span>
                <span className="font-mono text-slate-300">{easy} solved</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${totalSolved ? (easy / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">Medium</span>
                <span className="font-mono text-slate-300">{medium} solved</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${totalSolved ? (medium / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Hard</span>
                <span className="font-mono text-slate-300">{hard} solved</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${totalSolved ? (hard / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Overall Accuracy: <b className="text-white">{dashboard?.acceptanceRate || 0}%</b></span>
            <span>Total Attempts: <b className="text-white">{totalSubmissions}</b></span>
          </div>
        </div>

        {/* Skill Rating Trend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                Elo Rating Evolution
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-400 font-mono">{dashboard?.eloRating || 1200}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Peak: {dashboard?.peakRating || 1200}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Dynamic skill updates calculated using Bayesian outcome expectations.
            </p>

            {/* Sparkline / Bar visualization */}
            <div className="h-32 mt-4 flex items-end gap-1.5 pt-4 border-b border-slate-800">
              {ratingHistory.map((r, idx) => {
                const min = Math.min(...ratingHistory) - 50;
                const max = Math.max(...ratingHistory) + 50;
                const range = max - min || 100;
                const pct = Math.max(15, Math.min(100, ((r - min) / range) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div 
                      className="w-full rounded-t bg-gradient-to-t from-amber-500/40 to-amber-400 hover:from-amber-400 hover:to-amber-300 transition-all duration-300"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-mono bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none transition">
                      {r}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Ranking Tier: <b className="text-amber-400">{dashboard?.rankingTier}</b></span>
            <span>Percentile: <b className="text-emerald-400">{dashboard?.percentileRank}%</b></span>
          </div>
        </div>

      </div>

      {/* Topic Competency Table & Global Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topic Mastery Matrix */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Algorithmic Competency Matrix</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3 text-center">Solved</th>
                  <th className="py-2.5 px-3 text-center">Accuracy</th>
                  <th className="py-2.5 px-3">Mastery Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(topicMastery).map(([topic, stats]) => {
                  const mastery = stats.masteryScore || Math.min(100, (stats.solvedCount || 0) * 20);
                  return (
                    <tr key={topic} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-slate-200">{topic}</td>
                      <td className="py-3 px-3 text-center font-mono">{stats.solvedCount || 0}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400">
                        {Math.round((stats.accuracy || 0) * 100)}%
                      </td>
                      <td className="py-3 px-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                              style={{ width: `${Math.max(5, mastery)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{mastery}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Top Performers</h3>
          </div>

          <div className="space-y-2.5">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No ranked candidates yet.</p>
            ) : (
              leaderboard.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.rankingTier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-400 font-mono">{u.eloRating} Elo</div>
                    <div className="text-[10px] text-slate-400">{u.totalSolved} Solved</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
