import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import TestRunnerPanel from '../components/TestRunnerPanel';
import AiHintModal from '../components/AiHintModal';
import AiChatDrawer from '../components/AiChatDrawer';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Clock,
  HardDrive,
  Info,
  Terminal,
  Flame,
  Award
} from 'lucide-react';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [runResults, setRunResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [aiReview, setAiReview] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedHints, setExpandedHints] = useState({});
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await api.get(`/questions/${id}`);
        const q = res.data;
        setQuestion(q);

        // Set default starter code
        if (q.starterCode && q.starterCode[language]) {
          setCode(q.starterCode[language]);
        } else if (q.starterCode && q.starterCode.javascript) {
          setCode(q.starterCode.javascript);
        } else {
          setCode('// Write your solution here\nfunction solve(input) {\n    \n}');
        }
      } catch (err) {
        console.error('Failed to load question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
    }
  };

  // Handle Tab key in code editor
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      setCode(val.substring(0, start) + '    ' + val.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run Code (Visible test cases)
  const handleRunCode = async () => {
    setIsExecuting(true);
    setActiveTab('results');
    setSubmissionFeedback(null);
    try {
      const res = await api.post('/submissions/run', {
        questionId: question.id || question.slug,
        language,
        code,
      });
      setRunResults(res.data);
    } catch (err) {
      console.error('Run code error:', err);
      setRunResults({
        status: 'RUNTIME_ERROR',
        error: err.response?.data?.message || 'Execution failed',
        passedTests: 0,
        totalTests: question.testCases?.length || 1,
        testResults: [],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit Solution (Full evaluation including hidden cases)
  const handleSubmitCode = async () => {
    setIsExecuting(true);
    setActiveTab('results');
    try {
      const res = await api.post('/submissions/submit', {
        questionId: question.id || question.slug,
        language,
        code,
      });

      const sub = res.data;
      setRunResults({
        status: sub.status,
        passedTests: sub.passedTests,
        totalTests: sub.totalTests,
        runtimeMs: sub.runtimeMs,
        memoryMb: sub.memoryMb,
        testResults: sub.testResults,
      });

      if (sub.status === 'ACCEPTED') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00b8a3', '#ffa116', '#3b82f6', '#10b981'],
        });

        setSubmissionFeedback({
          type: 'success',
          message: 'All test cases passed! Solution accepted into your performance record.',
        });
      } else {
        setSubmissionFeedback({
          type: 'error',
          message: `Submission failed: ${sub.passedTests} of ${sub.totalTests} tests passed.`,
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmissionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Submission failed.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Trigger AI Code Review
  const handleAiReview = async () => {
    setActiveTab('review');
    try {
      const res = await api.post('/ai/review', {
        questionId: question.id || question.slug,
        code,
        language,
      });
      setAiReview(res.data);
    } catch (err) {
      console.error('AI Review error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-sm font-medium">Preparing sandbox environment...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center space-y-4">
        <p className="text-rose-400 font-bold">Problem not found.</p>
        <Link to="/problems" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-white text-xs">
          Return to Problem Bank
        </Link>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 text-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Problems</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} size="xs" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Socratic Hint */}
          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition font-medium"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Hint</span>
          </button>

          {/* AI Code Review */}
          <button
            onClick={handleAiReview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Review</span>
          </button>

          {/* AI Live Interview Chat */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition font-medium"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Interviewer Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Panel: Problem Statement */}
        <div className="lg:col-span-5 h-full overflow-y-auto border-r border-slate-800 p-5 space-y-6 bg-slate-900/30">
          
          {/* Header info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} size="sm" />
              {question.companies?.map((c) => (
                <span key={c} className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300/80 font-medium">
                  {c}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{question.title}</h2>
          </div>

          {/* Markdown Description */}
          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200 whitespace-pre-line">
            {question.descriptionMarkdown}
          </div>

          {/* Examples */}
          {question.examples?.length > 0 && (
            <div className="space-y-3.5">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Examples</h4>
              {question.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2 text-xs">
                  <span className="font-bold text-amber-400">Example {i + 1}:</span>
                  <div className="font-mono text-slate-300 space-y-1 bg-slate-950 p-2.5 rounded-lg">
                    <div><b className="text-slate-500">Input:</b> {ex.input}</div>
                    <div><b className="text-slate-500">Output:</b> <span className="text-emerald-400">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="text-slate-400 font-sans text-[11px] pt-1">
                        <b className="text-slate-500">Explanation:</b> {ex.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {question.constraints?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Constraints</h4>
              <ul className="space-y-1 text-xs font-mono text-slate-300 list-disc list-inside">
                {question.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints dropdown */}
          {question.hints?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Hints</h4>
              {question.hints.map((h, i) => {
                const isOpen = expandedHints[i];
                return (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedHints(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-300 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                        Hint {i + 1}
                      </span>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {isOpen && (
                      <div className="p-3 pt-0 text-slate-400 border-t border-slate-800/40 leading-relaxed text-[11px]">
                        {h}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Target Big-O Complexity */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Target Time: <b className="text-white font-mono">{question.timeComplexity || 'O(N)'}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-purple-400" />
              Target Space: <b className="text-white font-mono">{question.spaceComplexity || 'O(N)'}</b>
            </span>
          </div>

        </div>

        {/* Right Panel: Code Editor + Runner */}
        <div className="lg:col-span-7 h-full flex flex-col overflow-hidden bg-[#090d16]">
          
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
            
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white font-medium focus:border-amber-500 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python 3</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* Reset code */}
            <button
              onClick={handleResetCode}
              title="Reset starter template"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Code Editor Surface */}
          <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
            {/* Line numbers gutter */}
            <div className="select-none py-3 px-2.5 text-right text-slate-600 bg-slate-950/60 border-r border-slate-800/80 font-mono text-[11px] leading-relaxed">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea Code Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              className="flex-1 resize-none bg-transparent p-3 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none selection:bg-amber-500/30 overflow-y-auto"
              style={{ tabSize: 4 }}
            />
          </div>

          {/* Submission feedback pill */}
          {submissionFeedback && (
            <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
              submissionFeedback.type === 'success' 
                ? 'bg-emerald-950/80 text-emerald-400 border-t border-emerald-500/30' 
                : 'bg-rose-950/80 text-rose-400 border-t border-rose-500/30'
            }`}>
              <span>{submissionFeedback.message}</span>
              <button onClick={() => setSubmissionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800 bg-slate-900/80">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Multi-language sandbox with automated test evaluations
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                Run Code
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Submit
              </button>
            </div>
          </div>

          {/* Bottom Test Runner & Review Panel */}
          <div className="h-56">
            <TestRunnerPanel
              runResults={runResults}
              isExecuting={isExecuting}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              aiReview={aiReview}
              question={question}
            />
          </div>

        </div>
      </div>

      {/* AI Modals and Drawers */}
      {showHintModal && (
        <AiHintModal
          question={question}
          currentCode={code}
          language={language}
          onClose={() => setShowHintModal(false)}
        />
      )}

      <AiChatDrawer
        question={question}
        currentCode={code}
        language={language}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
}
