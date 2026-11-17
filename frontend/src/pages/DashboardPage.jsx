import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Calendar, 
  Layers, 
  TrendingUp,
  BrainCircuit,
  Zap,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, recRes, dailyRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/adaptive/recommend'),
          api.get('/questions/daily'),
        ]);

        setDashboard(dashRes.data);
        setRecommendation(recRes.data);
        setDailyQuestion(dailyRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-sm font-medium">Loading your performance metrics...</p>
        </div>
      </div>
    );
  }

  const elo = dashboard?.eloRating || 1200;
  const tier = dashboard?.rankingTier || 'INTERMEDIATE';
  const totalSolved = dashboard?.totalSolved || 0;
  const easySolved = dashboard?.easySolved || 0;
  const mediumSolved = dashboard?.mediumSolved || 0;
  const hardSolved = dashboard?.hardSolved || 0;
  const streak = dashboard?.currentStreak || 0;
  const acceptanceRate = dashboard?.acceptanceRate || 0;
  const topicMastery = dashboard?.topicMastery || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Welcome & Quick Action Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                Adaptive ML Engine Active
              </span>
              <span className="text-xs text-slate-400">
                Top {100 - (dashboard?.percentileRank || 50)}% Percentile
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ready for your next interview sprint, <span className="text-amber-400">{user?.fullName || user?.username || 'Candidate'}</span>?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your personalized cognitive frontier is currently set to <b className="text-amber-300">{recommendation?.recommendedDifficulty || 'MEDIUM'}</b>. Practice tailored problems or simulate a FAANG technical round.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/interview"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
            >
              <Bot className="h-4 w-4" />
              Simulate Live Interview
            </Link>
            {dailyQuestion && (
              <Link
                to={`/problems/${dailyQuestion.id || dailyQuestion.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-sm transition"
              >
                <Calendar className="h-4 w-4 text-amber-400" />
                Daily Challenge
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Skill Rating (Elo)"
          value={elo}
          subtitle={`Tier: ${tier.charAt(0) + tier.slice(1).toLowerCase()}`}
          icon={Trophy}
          color="amber"
          trend="+18 this week"
        />
        <StatCard
          title="Problems Solved"
          value={totalSolved}
          subtitle={`${easySolved} Easy • ${mediumSolved} Med • ${hardSolved} Hard`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Current Streak"
          value={`${streak} Days`}
          subtitle={`Longest: ${dashboard?.longestStreak || streak} days`}
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${acceptanceRate}%`}
          subtitle={`${dashboard?.acceptedSubmissions || 0} accepted of ${dashboard?.totalSubmissions || 0}`}
          icon={Target}
          color="cyan"
        />
      </div>

      {/* AI Recommendation & Daily Challenge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ML Recommended Next Problem Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ML Adaptive Recommendation</h3>
                  <p className="text-xs text-slate-400">Curated based on your skill rating and topic mastery</p>
                </div>
              </div>
              <DifficultyBadge difficulty={recommendation?.recommendedDifficulty} size="sm" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 mb-4">
              {recommendation?.reason}
            </p>

            {/* Recommended Questions List */}
            <div className="space-y-2.5">
              {recommendation?.recommendedQuestions?.map((q) => (
                <Link
                  key={q.id || q.slug}
                  to={`/problems/${q.id || q.slug}`}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-amber-500/50 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition">
                      {q.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {q.topics?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DifficultyBadge difficulty={q.difficulty} size="xs" />
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Focus Areas: <b>{recommendation?.focusAreas?.join(', ')}</b></span>
            <span className="text-emerald-400 font-semibold">
              Success Probability: {Math.round((recommendation?.estimatedSuccessProbability || 0.6) * 100)}%
            </span>
          </div>
        </div>

        {/* Daily Challenge & Fast Launch Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Daily Coding Challenge</h3>
                <p className="text-xs text-slate-400">Keep your streak alive</p>
              </div>
            </div>

            {dailyQuestion ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{dailyQuestion.title}</h4>
                  <DifficultyBadge difficulty={dailyQuestion.difficulty} size="xs" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">
                  {dailyQuestion.descriptionMarkdown}
                </p>
                <div className="flex flex-wrap gap-1">
                  {dailyQuestion.companies?.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {c}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/problems/${dailyQuestion.id || dailyQuestion.slug}`}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Solve Daily Problem
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No daily challenge active.</p>
            )}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2.5">
            <Bot className="h-4 w-4 shrink-0 text-purple-400" />
            <span>AI Interviewer adapts difficulty in real-time as you solve.</span>
          </div>
        </div>

      </div>

      {/* Topic Mastery Progress Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Algorithmic Topic Mastery</h3>
              <p className="text-xs text-slate-400">Performance and accuracy distribution across domains</p>
            </div>
          </div>
          <Link to="/problems" className="text-xs font-semibold text-amber-400 hover:underline">
            View all problems →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(topicMastery).map(([topicName, stats]) => {
            const mastery = stats.masteryScore || Math.min(100, (stats.solvedCount || 0) * 25);
            return (
              <div key={topicName} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{topicName}</span>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{mastery}% Mastery</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, mastery)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Solved: <b className="text-slate-200">{stats.solvedCount || 0}</b></span>
                  <span>Accuracy: <b className="text-slate-200">{Math.round((stats.accuracy || 0) * 100)}%</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
