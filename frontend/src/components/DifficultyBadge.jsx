import React from 'react';

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  const diff = (difficulty || 'MEDIUM').toUpperCase();

  const styles = {
    EASY: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30',
    MEDIUM: 'text-amber-400 bg-amber-950/50 border-amber-500/30',
    HARD: 'text-rose-400 bg-rose-950/50 border-rose-500/30',
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-md border ${
        styles[diff] || styles.MEDIUM
      } ${sizes[size] || sizes.sm}`}
    >
      {diff.charAt(0) + diff.slice(1).toLowerCase()}
    </span>
  );
}
