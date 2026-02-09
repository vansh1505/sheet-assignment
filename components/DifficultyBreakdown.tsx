'use client';

import { useMemo } from 'react';

interface Props {
  solvedEasy: number;
  totalEasy: number;
  solvedMedium: number;
  totalMedium: number;
  solvedHard: number;
  totalHard: number;
  solvedQuestions: number;
  totalQuestions: number;
  favoriteCount: number;
}

export default function DifficultyBreakdown({
  solvedEasy, totalEasy,
  solvedMedium, totalMedium,
  solvedHard, totalHard,
  solvedQuestions, totalQuestions,
  favoriteCount,
}: Props) {
  const gradient = useMemo(() => {
    if (totalQuestions === 0) return `conic-gradient(#292524 0% 100%)`;

    const s1 = (solvedEasy / totalQuestions) * 100;
    const s2 = s1 + (solvedMedium / totalQuestions) * 100;
    const s3 = s2 + (solvedHard / totalQuestions) * 100;

    return `conic-gradient(
      #34d399 0% ${s1}%,
      #fbbf24 ${s1}% ${s2}%,
      #ef4444 ${s2}% ${s3}%,
      #292524 ${s3}% 100%
    )`;
  }, [solvedEasy, solvedMedium, solvedHard, totalQuestions]);

  return (
    <div className="flex items-center justify-center gap-5 px-4 py-4 rounded-xl bg-bg-secondary border border-border-subtle">

      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-2.5 rounded-full bg-bg-secondary" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-text-primary">{solvedQuestions}</div>
            <div className="text-[10px] text-text-tertiary">Solved</div>
          </div>
        </div>
      </div>


      <div className="flex-1 space-y-2 w-44 text-text-primary">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Easy
          </span>
          <span className="tabular-nums text-text-primary">{solvedEasy}/{totalEasy}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Medium
          </span>
          <span className="tabular-nums">{solvedMedium}/{totalMedium}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            Hard
          </span>
          <span className="tabular-nums">{solvedHard}/{totalHard}</span>
        </div>

        <div className="pt-2 border-t border-white/10 text-xs text-text-secondary">
          {solvedQuestions}/{totalQuestions} solved
          {favoriteCount > 0 && ` · ${favoriteCount} starred`}
        </div>
      </div>
    </div>
  );
}
