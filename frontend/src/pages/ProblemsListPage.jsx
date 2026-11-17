import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import GenerateQuestionModal from '../components/GenerateQuestionModal';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Layers, 
  Building2, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function ProblemsListPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        size: 50,
        difficulty: selectedDifficulty || undefined,
        topic: selectedTopic || undefined,
        company: selectedCompany || undefined,
        search: search.trim() || undefined,
      };
      const res = await api.get('/questions', { params });
      setQuestions(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [topRes, compRes] = await Promise.all([
          api.get('/questions/topics'),
          api.get('/questions/companies'),
        ]);
        setTopics(topRes.data || []);
        setCompanies(compRes.data || []);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedDifficulty, selectedTopic, selectedCompany]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header with Title and AI Generator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Problem Bank
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {questions.length} Questions
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse top tech coding interview problems or generate custom variations dynamically.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition hover:scale-[1.02] w-fit"
        >
          <Sparkles className="h-4 w-4" />
          Generate AI Problem
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3.5">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems by title, algorithm, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Company Dropdown */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <button
            onClick={() => setSelectedTopic('')}
            className={`px-3 py-1 rounded-full border transition whitespace-nowrap ${
              selectedTopic === ''
                ? 'bg-amber-500 text-black font-bold border-amber-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(selectedTopic === t ? '' : t)}
              className={`px-3 py-1 rounded-full border transition whitespace-nowrap ${
                selectedTopic === t
                  ? 'bg-amber-500 text-black font-bold border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

      </div>

      {/* Problem Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Topics</th>
                <th className="py-3.5 px-4">Companies</th>
                <th className="py-3.5 px-4 text-center">Acceptance</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                      <span>Filtering questions...</span>
                    </div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Cpu className="h-8 w-8 text-slate-600" />
                      <p className="text-sm">No problems found matching your criteria.</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                      >
                        Synthesize with AI
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                questions.map((q, idx) => (
                  <tr
                    key={q.id || q.slug}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <Circle className="h-4 w-4 text-slate-600 mx-auto group-hover:text-amber-400 transition" />
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200 group-hover:text-amber-400 transition">
                      <Link to={`/problems/${q.id || q.slug}`} className="flex items-center gap-2">
                        <span>{idx + 1}. {q.title}</span>
                        {q.isAiGenerated && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            AI
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={q.difficulty} size="xs" />
                    </td>

                    {/* Topics */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {q.topics?.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Companies */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {q.companies?.slice(0, 3).map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300/80">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acceptance */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {q.acceptanceRate ? `${q.acceptanceRate}%` : '50.0%'}
                    </td>

                    {/* Solve button */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/problems/${q.id || q.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-black text-slate-300 font-semibold text-[11px] transition shadow-sm"
                      >
                        <span>Solve</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <GenerateQuestionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
