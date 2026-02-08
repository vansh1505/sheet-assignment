'use client';

import { useMemo } from 'react';
import { useSheetStore } from '@/store/sheetStore';
import { CheckCircle2, Layers, BookOpen } from 'lucide-react';
import OverallProgress from './OverallProgress';

function useSheetStats() {
  const { topics } = useSheetStore();

  return useMemo(() => {
    let totalEasy = 0,
      totalMedium = 0,
      totalHard = 0;
    let solvedEasy = 0,
      solvedMedium = 0,
      solvedHard = 0;
    let totalQuestions = 0,
      solvedQuestions = 0;
    let totalTopics = topics.length;
    let completedTopics = 0;
    let favoriteCount = 0;

    const topicBreakdown: {
      title: string;
      total: number;
      solved: number;
    }[] = [];

    for (const topic of topics) {
      let topicTotal = 0;
      let topicSolved = 0;

      for (const st of topic.subTopics ?? []) {
        for (const q of st.questions) {
          totalQuestions++;
          topicTotal++;

          const isSolved = q.timeSpent > 0;
          if (q.isFavorite) favoriteCount++;

          if (q.difficulty === 'Easy' || q.difficulty === 'Basic') {
            totalEasy++;
            if (isSolved) solvedEasy++;
          } else if (q.difficulty === 'Medium') {
            totalMedium++;
            if (isSolved) solvedMedium++;
          } else if (q.difficulty === 'Hard') {
            totalHard++;
            if (isSolved) solvedHard++;
          }

          if (isSolved) {
            solvedQuestions++;
            topicSolved++;
          }
        }
      }

      topicBreakdown.push({ title: topic.title, total: topicTotal, solved: topicSolved });

      if (topicTotal > 0 && topicSolved === topicTotal) {
        completedTopics++;
      }
    }

    const overallProgress =
      totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

    return {
      totalEasy, totalMedium, totalHard,
      solvedEasy, solvedMedium, solvedHard,
      totalQuestions, solvedQuestions,
      totalTopics, completedTopics,
      favoriteCount, overallProgress,
      topicBreakdown,
    };
  }, [topics]);
}


/* ─── Difficulty Stats (header inline card — matches original design) ─── */
export function OverallProgressCard() {
  const stats = useSheetStats();

  return <OverallProgress progress={stats.overallProgress} />;
}

/* ─── Sheet Progress (separate section below header) ─── */
export function SheetProgress() {
  const stats = useSheetStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty Breakdown */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-bg-secondary border border-white/10">
          <div className="flex items-center gap-4">
            {/* progress circle */}
            <div
              className="relative h-20 w-20 shrink-0 rounded-full"
              style={{
                background: stats.solvedQuestions > 0
                  ? `conic-gradient(
                      #34d399 ${stats.totalQuestions > 0 ? (stats.solvedEasy / stats.totalQuestions) * 100 : 0}%,
                      #fbbf24 ${stats.totalQuestions > 0 ? (stats.solvedEasy / stats.totalQuestions) * 100 : 0}% ${stats.totalQuestions > 0 ? ((stats.solvedEasy + stats.solvedMedium) / stats.totalQuestions) * 100 : 0}%,
                      #ef4444 ${stats.totalQuestions > 0 ? ((stats.solvedEasy + stats.solvedMedium) / stats.totalQuestions) * 100 : 0}% ${stats.totalQuestions > 0 ? ((stats.solvedEasy + stats.solvedMedium + stats.solvedHard) / stats.totalQuestions) * 100 : 0}%,
                      #292524 ${stats.totalQuestions > 0 ? ((stats.solvedEasy + stats.solvedMedium + stats.solvedHard) / stats.totalQuestions) * 100 : 0}% 100%
                    )`
                  : `conic-gradient(#292524 0% 100%)`
              }}
            >
              <div className="absolute inset-2 rounded-full bg-[#0a0a0a]" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-lg font-bold">{stats.solvedQuestions}</div>
              </div>
            </div>

            {/* stats */}
            <div className="flex-1 space-y-2 w-40">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Easy
                </span>
                <span className="tabular-nums">{stats.solvedEasy}/{stats.totalEasy}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Medium
                </span>
                <span className="tabular-nums">{stats.solvedMedium}/{stats.totalMedium}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Hard
                </span>
                <span className="tabular-nums">{stats.solvedHard}/{stats.totalHard}</span>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-text-secondary">
                {stats.solvedQuestions}/{stats.totalQuestions} solved
                {stats.favoriteCount > 0 && ` · ${stats.favoriteCount} starred`}
              </div>
            </div>
          </div>
        </div>

        {/* Topics Completed */}
        <div className="px-5 py-4 rounded-xl bg-bg-secondary border border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Topics
            </span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {stats.completedTopics}
            </span>
            <span className="text-xs text-text-tertiary mb-1">
              / {stats.totalTopics} completed
            </span>
          </div>
          <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: stats.totalTopics > 0 ? `${(stats.completedTopics / stats.totalTopics) * 100}%` : '0%',
                background: stats.completedTopics === stats.totalTopics && stats.totalTopics > 0 ? 'var(--easy)' : 'var(--accent)',
              }}
            />
          </div>
        </div>

        {/* Difficulty Split */}
        <div className="px-5 py-4 rounded-xl bg-bg-secondary border border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              By Difficulty
            </span>
          </div>
          <div className="space-y-2.5">
            {/* Easy */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary">Easy</span>
                <span className="tabular-nums text-text-primary">{stats.solvedEasy}/{stats.totalEasy}</span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: stats.totalEasy > 0 ? `${(stats.solvedEasy / stats.totalEasy) * 100}%` : '0%' }} />
              </div>
            </div>
            {/* Medium */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary">Medium</span>
                <span className="tabular-nums text-text-primary">{stats.solvedMedium}/{stats.totalMedium}</span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-300" style={{ width: stats.totalMedium > 0 ? `${(stats.solvedMedium / stats.totalMedium) * 100}%` : '0%' }} />
              </div>
            </div>
            {/* Hard */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary">Hard</span>
                <span className="tabular-nums text-text-primary">{stats.solvedHard}/{stats.totalHard}</span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-400 transition-all duration-300" style={{ width: stats.totalHard > 0 ? `${(stats.solvedHard / stats.totalHard) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-topic progress */}
      {stats.topicBreakdown.length > 0 && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-bg-secondary border border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Topic-wise Progress
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
            {stats.topicBreakdown.map((t) => {
              const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
              return (
                <div key={t.title}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary truncate mr-2">{t.title}</span>
                    <span className="text-text-tertiary tabular-nums shrink-0">{t.solved}/{t.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100 ? 'var(--easy)' : 'var(--accent)',
                        opacity: pct === 0 ? 0 : 1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SheetStats() {
  return <OverallProgressCard />;
}

