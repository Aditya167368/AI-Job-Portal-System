import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) {
  const colorMap = {
    amber: 'from-amber-500/10 to-transparent text-amber-400 border-amber-500/20',
    emerald: 'from-emerald-500/10 to-transparent text-emerald-400 border-emerald-500/20',
    cyan: 'from-cyan-500/10 to-transparent text-cyan-400 border-cyan-500/20',
    rose: 'from-rose-500/10 to-transparent text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/10 to-transparent text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-slate-900/60 p-5 shadow-sm transition hover:border-slate-700 bg-gradient-to-br ${colorMap[color] || colorMap.amber}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2.5 text-slate-300">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
