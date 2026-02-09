'use client';

import { useMemo } from 'react';
import { useSheetStore } from '@/store/sheetStore';
import { Layers, BookOpen } from 'lucide-react';
import OverallProgress from './OverallProgress';
import StudyTodos from './StudyTodos';
import DifficultyBreakdown from './DifficultyBreakdown';

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

          const isSolved = q.isCompleted;
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
        <DifficultyBreakdown
          solvedEasy={stats.solvedEasy}
          totalEasy={stats.totalEasy}
          solvedMedium={stats.solvedMedium}
          totalMedium={stats.totalMedium}
          solvedHard={stats.solvedHard}
          totalHard={stats.totalHard}
          solvedQuestions={stats.solvedQuestions}
          totalQuestions={stats.totalQuestions}
          favoriteCount={stats.favoriteCount}
        />

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
          <div className="flex flex-wrap gap-1.5">
            {stats.topicBreakdown.map((t, i) => {
              const isComplete = t.total > 0 && t.solved === t.total;
              return (
                <span
                  key={t.title}
                  title={`${t.title} — ${t.solved}/${t.total}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isComplete
                      ? 'bg-easy shadow-[0_0_6px_rgba(34,197,94,0.4)]'
                      : 'bg-bg-tertiary border border-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Study Goals (Todo) */}
        <StudyTodos />
      </div>

      {/* Per-topic progress */}
      {/* {stats.topicBreakdown.length > 0 && (
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
      )} */}
    </div>
  );
}

export default function SheetStats() {
  return <OverallProgressCard />;
}

