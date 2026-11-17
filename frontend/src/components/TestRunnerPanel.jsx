import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, HardDrive, Terminal, Sparkles, Award } from 'lucide-react';

export default function TestRunnerPanel({
  runResults,
  isExecuting,
  activeTab,
  setActiveTab,
  aiReview,
  question,
}) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  const results = runResults?.testResults || [];
  const activeCase = results[selectedCaseIdx];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4" />
            Accepted
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="h-4 w-4" />
            Wrong Answer
          </span>
        );
      case 'RUNTIME_ERROR':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <AlertTriangle className="h-4 w-4" />
            Runtime Error
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="h-4 w-4" />
            Time Limit Exceeded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-slate-800 text-xs">
      
      {/* Panel Tab Header */}
      <div className="flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Test Results
            {results.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                runResults?.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {runResults?.passedTests}/{runResults?.totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            AI Code Review
            {aiReview && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-400">
                Score: {aiReview.overallScore}
              </span>
            )}
          </button>
        </div>

        {/* Runtime & Memory Telemetry */}
        {runResults && (
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Runtime: <b className="text-slate-200 font-mono">{runResults.runtimeMs} ms</b>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 text-purple-400" />
              Memory: <b className="text-slate-200 font-mono">{runResults.memoryMb} MB</b>
            </span>
          </div>
        )}
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {isExecuting ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400">
            <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
            <span>Executing test suite against sandboxed container...</span>
          </div>
        ) : activeTab === 'results' ? (
          runResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(runResults.status)}
                  <span className="text-slate-300 font-medium">
                    {runResults.passedTests} of {runResults.totalTests} test cases passed
                  </span>
                </div>
              </div>

              {/* Case chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {results.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono transition ${
                      selectedCaseIdx === idx
                        ? 'border-amber-400 bg-slate-800 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${r.passed ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    Case {idx + 1} {r.hidden && <span className="text-[10px] text-slate-500">(hidden)</span>}
                  </button>
                ))}
              </div>

              {/* Active Case Inspector */}
              {activeCase && (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Input</span>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-950 font-mono text-slate-200 overflow-x-auto">
                      {activeCase.input}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Expected Output</span>
                      <pre className="mt-1 p-2 rounded-lg bg-slate-950 font-mono text-emerald-400 overflow-x-auto">
                        {activeCase.expectedOutput}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Your Output</span>
                      <pre className={`mt-1 p-2 rounded-lg bg-slate-950 font-mono overflow-x-auto ${
                        activeCase.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {activeCase.actualOutput || (activeCase.errorMessage ? 'Error' : 'undefined')}
                      </pre>
                    </div>
                  </div>

                  {activeCase.errorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[11px]">
                      <b>Error:</b> {activeCase.errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-slate-500 gap-2">
              <Terminal className="h-6 w-6 text-slate-600" />
              <span>Click "Run Code" to test visible cases or "Submit" for full evaluation.</span>
            </div>
          )
        ) : (
          /* AI Code Review Tab */
          aiReview ? (
            <div className="space-y-4">
              {/* Score & Verdict Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-extrabold text-base">
                    {aiReview.overallScore}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Code Quality Score</h5>
                    <p className="text-xs text-amber-300">Verdict: {aiReview.optimalityVerdict}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>Time: <b className="text-amber-400">{aiReview.timeComplexity}</b></span>
                  <span>Space: <b className="text-cyan-400">{aiReview.spaceComplexity}</b></span>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{aiReview.generalSummary}</p>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                  <h6 className="font-bold text-emerald-400 text-xs mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Key Strengths
                  </h6>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {aiReview.positivePoints?.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
                  <h6 className="font-bold text-amber-400 text-xs mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Areas to Refine
                  </h6>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {aiReview.improvementAreas?.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Edge cases checklist */}
              {aiReview.edgeCasesToConsider && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <h6 className="font-bold text-slate-300 text-xs mb-1.5">Critical Edge Cases to Test:</h6>
                  <div className="flex flex-wrap gap-1.5">
                    {aiReview.edgeCasesToConsider.map((ec, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                        {ec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-slate-500 gap-2">
              <Sparkles className="h-6 w-6 text-amber-500/60" />
              <span>Click "AI Review" above the editor to trigger a deep architectural and asymptotic review.</span>
            </div>
          )
        )}
      </div>

    </div>
  );
}
