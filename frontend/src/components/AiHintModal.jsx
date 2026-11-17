import React, { useState } from 'react';
import { Lightbulb, X, Clock, HardDrive, Target, ChevronRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function AiHintModal({ question, currentCode, language, onClose }) {
  const [level, setLevel] = useState(1);
  const [hintData, setHintData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const fetchHint = async (targetLevel) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        questionId: question.id || question.slug,
        currentCode,
        language,
        hintLevel: targetLevel,
        userQuery: customQuestion || undefined,
      });
      setHintData(res.data);
      setLevel(targetLevel);
    } catch (err) {
      console.error('Failed to get AI hint:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHint(1);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Socratic AI Hint</h3>
            <p className="text-xs text-slate-400">Guiding you to the optimal solution without spoiling the answer</p>
          </div>
        </div>

        {/* Level selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { lvl: 1, title: 'Level 1', desc: 'Intuition' },
            { lvl: 2, title: 'Level 2', desc: 'Pattern' },
            { lvl: 3, title: 'Level 3', desc: 'Logic Nudge' },
          ].map((item) => (
            <button
              key={item.lvl}
              onClick={() => fetchHint(item.lvl)}
              disabled={loading}
              className={`flex flex-col items-center py-2 px-3 rounded-xl border transition ${
                level === item.lvl
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold">{item.title}</span>
              <span className="text-[10px] text-slate-400">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Hint Content Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[140px] flex flex-col justify-between">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
              <p className="text-xs">AI Interviewer is analyzing your logic...</p>
            </div>
          ) : hintData ? (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
                <Target className="h-3.5 w-3.5" />
                <span>Recommended Approach: {hintData.recommendedTechnique}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{hintData.hint}</p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  Target Time: <b className="text-slate-200">{hintData.timeComplexityTarget}</b>
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                  Target Space: <b className="text-slate-200">{hintData.spaceComplexityTarget}</b>
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Ask custom question */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask a specific question (e.g. 'Can I use two pointers?')"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHint(level)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={() => fetchHint(level)}
            disabled={loading}
            className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-slate-700 border border-slate-700"
          >
            Ask
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
          >
            Got it, back to coding
          </button>
        </div>

      </div>
    </div>
  );
}
