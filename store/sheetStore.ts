import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Topic, Question } from '@/types/sheet';

interface SheetState {
  topics: Topic[];
  sheetName: string;
  searchQuery: string;
  showFavoritesOnly: boolean;
  tagFilter: string;
  darkMode: boolean;

  setInitialData: (sheetName: string, topics: Topic[]) => void;
  setSearchQuery: (query: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setTagFilter: (tag: string) => void;
  toggleDarkMode: () => void;

  addTopic: (title: string) => void;
  editTopic: (topicId: string, title: string) => void;
  deleteTopic: (topicId: string) => void;
  toggleCollapse: (topicId: string) => void;
    toggleCollapseSubTopic: (topicId: string, subTopicId: string) => void;

  addSubTopic: (topicId: string, title: string) => void;
  editSubTopic: (topicId: string, subTopicId: string, title: string) => void;
  deleteSubTopic: (topicId: string, subTopicId: string) => void;

  addQuestion: (topicId: string, subTopicId: string, question: Omit<Question, 'id' | 'isFavorite' | 'isCompleted' | 'timeSpent' | 'isTimerRunning' | 'timerStartedAt'> & { tags?: string[] }) => void;
  editQuestion: (topicId: string, subTopicId: string, questionId: string, title: string) => void;
  deleteQuestion: (topicId: string, subTopicId: string, questionId: string) => void;

  reorderTopics: (oldIndex: number, newIndex: number) => void;
  reorderSubTopics: (topicId: string, oldIndex: number, newIndex: number) => void;
  reorderQuestions: (topicId: string, subTopicId: string, oldIndex: number, newIndex: number) => void;

  toggleFavorite: (topicId: string, subTopicId: string, questionId: string) => void;
  addTag: (topicId: string, subTopicId: string, questionId: string, tag: string) => void;
  removeTag: (topicId: string, subTopicId: string, questionId: string, tag: string) => void;

  startTimer: (topicId: string, subTopicId: string, questionId: string) => void;
  stopTimer: (topicId: string, subTopicId: string, questionId: string) => void;
  resetTimer: (topicId: string, subTopicId: string, questionId: string) => void;
  toggleComplete: (topicId: string, subTopicId: string, questionId: string) => void;
  resetAllData: () => void;
  setAllCollapsed: (collapsed: boolean) => void;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

function updateQuestion(
  topics: Topic[],
  topicId: string,
  subTopicId: string,
  questionId: string,
  updater: (q: Question) => Question
): Topic[] {
  return topics.map((t) =>
    t.id !== topicId
      ? t
      : {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id !== subTopicId
              ? st
              : {
                  ...st,
                  questions: st.questions.map((q) =>
                    q.id !== questionId ? q : updater(q)
                  ),
                }
          ),
        }
  );
}

export const useSheetStore = create<SheetState>()(
  persist(
    (set) => ({
      topics: [],
      sheetName: 'Question Sheet',
      searchQuery: '',
      showFavoritesOnly: false,
      tagFilter: '',
      darkMode: true,

        setInitialData: (sheetName, topics) =>
        set((state) => {
          const hasQuestions = state.topics.some((t) =>
            t.subTopics.some((st) => st.questions.length > 0)
          );
          if (hasQuestions) return state;
          const collapsedTopics = topics.map(t => ({
            ...t,
            isCollapsed: true,
            subTopics: t.subTopics.map(st => ({ ...st, isCollapsed: true }))
          }));
          return { sheetName, topics: collapsedTopics };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
      setTagFilter: (tag) => set({ tagFilter: tag }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      addTopic: (title) =>
        set((s) => ({
          topics: [
            ...s.topics,
            { id: uuidv4(), title, subTopics: [], isCollapsed: true },
          ],
        })),

      editTopic: (topicId, title) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId ? { ...t, title } : t
          ),
        })),

      deleteTopic: (topicId) =>
        set((s) => ({
          topics: s.topics.filter((t) => t.id !== topicId),
        })),

      toggleCollapse: (topicId) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId ? { ...t, isCollapsed: !t.isCollapsed } : t
          ),
        })),

      toggleCollapseSubTopic: (topicId, subTopicId) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId
                      ? { ...st, isCollapsed: !st.isCollapsed }
                      : st
                  ),
                }
              : t
          ),
        })),

      addSubTopic: (topicId, title) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: [
                    ...t.subTopics,
                    { id: uuidv4(), title, questions: [], isCollapsed: true },
                  ],
                }
              : t
          ),
        })),

      editSubTopic: (topicId, subTopicId, title) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId ? { ...st, title } : st
                  ),
                }
              : t
          ),
        })),

      deleteSubTopic: (topicId, subTopicId) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.filter((st) => st.id !== subTopicId),
                }
              : t
          ),
        })),

      addQuestion: (topicId, subTopicId, question) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId
                      ? {
                          ...st,
                          questions: [
                            ...st.questions,
                            {
                              ...question,
                              id: uuidv4(),
                              isFavorite: false,
                              isCompleted: false,
                              tags: question.tags ?? [],
                              timeSpent: 0,
                              isTimerRunning: false,
                              timerStartedAt: null,
                            },
                          ],
                        }
                      : st
                  ),
                }
              : t
          ),
        })),

      editQuestion: (topicId, subTopicId, questionId, title) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            title,
          })),
        })),

      deleteQuestion: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId
                      ? {
                          ...st,
                          questions: st.questions.filter((q) => q.id !== questionId),
                        }
                      : st
                  ),
                }
              : t
          ),
        })),

      reorderTopics: (oldIndex, newIndex) =>
        set((s) => ({ topics: arrayMove(s.topics, oldIndex, newIndex) })),

      reorderSubTopics: (topicId, oldIndex, newIndex) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? { ...t, subTopics: arrayMove(t.subTopics, oldIndex, newIndex) }
              : t
          ),
        })),

      reorderQuestions: (topicId, subTopicId, oldIndex, newIndex) =>
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId
                      ? { ...st, questions: arrayMove(st.questions, oldIndex, newIndex) }
                      : st
                  ),
                }
              : t
          ),
        })),

      toggleFavorite: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            isFavorite: !q.isFavorite,
          })),
        })),

      addTag: (topicId, subTopicId, questionId, tag) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            tags: q.tags.includes(tag) ? q.tags : [...q.tags, tag],
          })),
        })),

      removeTag: (topicId, subTopicId, questionId, tag) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            tags: q.tags.filter((t) => t !== tag),
          })),
        })),

      startTimer: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            isTimerRunning: true,
            timerStartedAt: Date.now(),
          })),
        })),

      stopTimer: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => {
            const elapsed = q.timerStartedAt
              ? Math.floor((Date.now() - q.timerStartedAt) / 1000)
              : 0;
            return {
              ...q,
              isTimerRunning: false,
              timerStartedAt: null,
              timeSpent: q.timeSpent + elapsed,
              isCompleted: true,
            };
          }),
        })),

      resetTimer: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            timeSpent: 0,
            isTimerRunning: true,
            timerStartedAt: Date.now(),
          })),
        })),

      toggleComplete: (topicId, subTopicId, questionId) =>
        set((s) => ({
          topics: updateQuestion(s.topics, topicId, subTopicId, questionId, (q) => ({
            ...q,
            isCompleted: !q.isCompleted,
            // Reset time when un-completing so Solve button returns
            ...(!q.isCompleted ? {} : { timeSpent: 0, isTimerRunning: false, timerStartedAt: null }),
          })),
        })),

      resetAllData: () => {
        localStorage.removeItem('sheet-store');
        localStorage.removeItem('codolio-study-todos');
        set({
          topics: [],
          sheetName: 'Question Sheet',
          searchQuery: '',
          showFavoritesOnly: false,
          tagFilter: '',
        });
        window.location.reload();
      },

      setAllCollapsed: (collapsed) =>
        set((s) => ({
          topics: s.topics.map((t) => ({
            ...t,
            isCollapsed: collapsed,
            subTopics: t.subTopics.map((st) => ({
              ...st,
              isCollapsed: collapsed,
            })),
          })),
        })),
    }),
    {
      name: 'sheet-store',
      partialize: (state) => ({
        topics: state.topics,
        sheetName: state.sheetName,
        darkMode: state.darkMode,
      }),
    }
  )
);
