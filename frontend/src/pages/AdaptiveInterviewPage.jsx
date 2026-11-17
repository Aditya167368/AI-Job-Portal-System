import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Layers, 
  Building2, 
  Trophy,
  ChevronRight,
  Terminal,
  Send
} from 'lucide-react';

export default function AdaptiveInterviewPage() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Engineer');
  const [isStarted, setIsStarted] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 minutes per stage
  const [isExecuting, setIsExecuting] = useState(false);
  const [testOutput, setTestOutput] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || session?.status === 'COMPLETED') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, session?.status]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start Adaptive Interview Session
  const handleStartInterview = async () => {
    try {
      const res = await api.post('/adaptive/session/start', {
        targetCompany: company,
        targetRole: role,
      });

      const newSession = res.data;
      setSession(newSession);
      setIsStarted(true);
      setTimerSeconds(900);

      // Load initial question
      if (newSession.questionIds?.length > 0) {
        const qRes = await api.get(`/questions/${newSession.questionIds[0]}`);
        setCurrentQuestion(qRes.data);
        setCode(qRes.data.starterCode?.javascript || '// Write solution\nfunction solve(input) {\n    \n}');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  // Run visible cases
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setIsExecuting(true);
    try {
      const res = await api.post('/submissions/run', {
        questionId: currentQuestion.id,
        language,
        code,
      });
      setTestOutput(res.data);
    } catch (err) {
      console.error('Run error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit stage solution and adaptively progress
  const handleSubmitStage = async () => {
    if (!currentQuestion) return;
    setIsExecuting(true);
    try {
      const subRes = await api.post('/submissions/submit', {
        questionId: currentQuestion.id,
        language,
        code,
      });

      const isPassed = subRes.data.status === 'ACCEPTED';
      setTestOutput(subRes.data);

      // Progress session stage
      const progRes = await api.post(`/adaptive/session/${session.id}/progress?passed=${isPassed}&submissionId=${subRes.data.id}`);
      const updatedSession = progRes.data;
      setSession(updatedSession);

      if (updatedSession.status === 'COMPLETED') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        // Load next stage question
        const nextQId = updatedSession.questionIds[updatedSession.questionIds.length - 1];
        const nextQRes = await api.get(`/questions/${nextQId}`);
        setCurrentQuestion(nextQRes.data);
        setCode(nextQRes.data.starterCode?.javascript || '// Write solution');
        setTimerSeconds(900);
      }
    } catch (err) {
      console.error('Submit stage error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Session Not Started -> Setup Screen */}
      {!isStarted ? (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-lg text-white">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Adaptive Live Mock Interview</h2>
              <p className="text-xs text-slate-400">Simulate a multi-stage technical interview calibrated in real-time by ML</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              How the Adaptive Engine Works:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li><b>Stage 1: Warm-up</b> — Assesses foundational data structure patterns and speed.</li>
              <li><b>Stage 2: Core Algorithm</b> — Dynamically calibrates to Medium or Hard based on your Stage 1 performance.</li>
              <li><b>Stage 3: Optimization / Variation</b> — Pushes asymptotic efficiency and edge-case resilience.</li>
              <li><b>Final Verdict</b> — Generates an official FAANG-level hiring scorecard and Elo rating update.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">Target Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Software Engineer">Software Engineer (L4 / SDE II)</option>
                <option value="Senior Software Engineer">Senior Software Engineer (L5 / SDE III)</option>
                <option value="Full Stack Specialist">Full Stack Specialist</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 transition hover:scale-[1.01]"
          >
            <Play className="h-4 w-4 fill-white" />
            Begin Technical Interview
          </button>
        </div>
      ) : session?.status === 'COMPLETED' ? (
        
        /* Interview Scorecard Result */
        <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Interview Evaluation Report</h2>
            <p className="text-xs text-slate-400">{session.targetCompany} • {session.targetRole}</p>
          </div>

          {/* Verdict Banner */}
          <div className={`p-6 rounded-2xl border text-center space-y-2 ${
            session.finalVerdict === 'STRONG_HIRE' || session.finalVerdict === 'HIRE'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider">Overall Verdict</span>
            <div className="text-3xl font-black">{session.finalVerdict?.replace('_', ' ')}</div>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">{session.performanceSummary}</p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-xs text-slate-400">Score</span>
              <div className="text-2xl font-bold text-white mt-1">{session.overallScore}%</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-xs text-slate-400">Stages Completed</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{session.totalStages} / {session.totalStages}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-xs text-slate-400">Rating Adjustment</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">+36 Elo</div>
            </div>
          </div>

          {/* Interviewer Notes History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase text-slate-400">Interviewer Progression Notes</h4>
            <div className="space-y-2">
              {session.interviewerFeedback?.map((fb, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{fb}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setIsStarted(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Start New Interview Session
            </button>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
            >
              Back to Dashboard
            </Link>
          </div>

        </div>

      ) : (

        /* Active Interview In Progress */
        <div className="space-y-4">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Stage {(session?.stageIndex || 0) + 1} of {session?.totalStages || 3}: {session?.currentStage?.replace('_', ' ')}
                </h3>
                <p className="text-xs text-slate-400">{session?.targetCompany} • {session?.targetRole}</p>
              </div>
            </div>

            {/* Stage Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-sm font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
                <Clock className="h-4 w-4" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Problem & Editor Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Current Problem Statement */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">{currentQuestion?.title}</h4>
                <DifficultyBadge difficulty={currentQuestion?.difficulty} size="xs" />
              </div>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {currentQuestion?.descriptionMarkdown}
              </div>

              {currentQuestion?.examples?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Example</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                    <div><b>Input:</b> {currentQuestion.examples[0].input}</div>
                    <div><b>Output:</b> <span className="text-emerald-400">{currentQuestion.examples[0].output}</span></div>
                  </div>
                </div>
              )}

              {/* Interviewer commentary */}
              {session?.interviewerFeedback?.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-purple-300">
                    <Bot className="h-3.5 w-3.5" />
                    Interviewer Note
                  </div>
                  <p>{session.interviewerFeedback[session.interviewerFeedback.length - 1]}</p>
                </div>
              )}
            </div>

            {/* Right: Code Workspace */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[500px]">
              
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-xs">
                <span className="font-semibold text-slate-300">Solution Implementation</span>
                <span className="text-slate-500 font-mono">JavaScript (Node.js)</span>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              />

              {/* Action Bar */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                  Run Tests
                </button>

                <button
                  onClick={handleSubmitStage}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-md transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit & Advance Stage
                </button>
              </div>

              {/* Test Output Panel */}
              {testOutput && (
                <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold ${testOutput.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {testOutput.status}
                    </span>
                    <span>({testOutput.passedTests} / {testOutput.totalTests} passed)</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
