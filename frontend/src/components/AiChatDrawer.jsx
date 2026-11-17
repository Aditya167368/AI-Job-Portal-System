import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, MessageSquare } from 'lucide-react';
import api from '../services/api';

export default function AiChatDrawer({ question, currentCode, language, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Technical Interviewer. I'm observing your progress on "${question?.title || 'this challenge'}". Feel free to ask clarifying questions, discuss trade-offs, or share your thought process!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        questionId: question.id || question.slug,
        message: userMsg,
        currentCode,
        language,
        history: newMessages.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          followUp: res.data.suggestedFollowUp,
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Let's focus on your algorithmic invariants. Walk me through how your pointers advance on each iteration.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Interview Copilot
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h4>
            <p className="text-[10px] text-slate-400">FAANG Mock Interviewer</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
              {m.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="h-3 w-3" />
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3 text-purple-400" />
                  <span>Interviewer</span>
                </>
              )}
            </div>
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.content}

              {m.followUp && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 italic flex items-center gap-1">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>Prompt: "{m.followUp}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800 w-fit">
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
            <span>Interviewer is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-900 flex gap-1.5 overflow-x-auto text-[11px] text-slate-400">
        <button
          onClick={() => { setInput("Can you clarify the constraints?"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white"
        >
          Clarify constraints
        </button>
        <button
          onClick={() => { setInput("What edge cases should I consider?"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white"
        >
          Check edge cases
        </button>
        <button
          onClick={() => { setInput("Is there an O(1) space approach?"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white"
        >
          Space trade-off?
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
        <input
          type="text"
          placeholder="Speak to interviewer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl bg-purple-600 px-3 py-2 text-white hover:bg-purple-500 disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
