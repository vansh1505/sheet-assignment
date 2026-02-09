'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TopicCard from '@/components/TopicCard';
import { SheetProgress, OverallProgressCard } from '@/components/SheetStats';
import {
  AddTopicModal,
  AddSubTopicModal,
  AddQuestionModal,
} from '@/components/Modals';
import { useSheetStore } from '@/store/sheetStore';
import { transformAPIData } from '@/lib/transform';
import type { APIResponse } from '@/types/sheet';
import { ChevronRight, Loader2 } from 'lucide-react';

const API_URL =
  'https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet';

export default function Home() {
  const {
    topics,
    darkMode,
    setInitialData,
    addTopic,
    addSubTopic,
    addQuestion,
    reorderTopics,
  } = useSheetStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddSubTopic, setShowAddSubTopic] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeSubTopicId, setActiveSubTopicId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [sheetName, setSheetName] = useState<string>('');

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch sheet data');
        const data: APIResponse = await res.json();
        console.log('Raw API data:', data);
        const { sheetName, banner, description, link, topics: transformedTopics } = transformAPIData(data);
        setInitialData(sheetName, transformedTopics);
        setBanner(banner);
        setDescription(description);
        setLink(link);
        setSheetName(sheetName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setInitialData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = topics.findIndex((t) => t.id === active.id);
      const newIndex = topics.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTopics(oldIndex, newIndex);
      }
    },
    [topics, reorderTopics]
  );

  const handleAddSubTopic = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    setShowAddSubTopic(true);
  }, []);

  const handleAddQuestion = useCallback(
    (topicId: string, subTopicId: string) => {
      setActiveTopicId(topicId);
      setActiveSubTopicId(subTopicId);
      setShowAddQuestion(true);
    },
    []
  );

  const activeTopic = topics.find((t) => t.id === activeTopicId);
  const activeSubTopic = activeTopic?.subTopics.find(
    (st) => st.id === activeSubTopicId
  );

  return (
    <div className={darkMode ? '' : 'light-mode'}>
      <div className="min-h-screen bg-bg-primary ">
        <Navbar onAddTopic={() => setShowAddTopic(true)} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="text-accent animate-spin" />
            <p className="text-text-tertiary text-sm font-medium">
              Loading question sheet...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <span className="text-2xl">⚠</span>
            </div>
            <p className="text-red-400 text-sm font-mono">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="max-w-7xl mx-auto px-4 sm:px-6 my-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-mono">
                    {sheetName}
                  </h1>
                  {description && (
                    <p className="mt-2 text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
                      {description}
                    </p>
                  )}
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-accent hover:underline"
                    >
                      <p className='flex items-center'>
                        View original sheet <ChevronRight height={16} width={16}/>
                      </p>
                    </a>
                  )}
                </div>

                {/* Stats section */}
                <OverallProgressCard />
              </div>
            </motion.header>

            {/* Sheet progress section */}
            {topics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
              >
                <SheetProgress />
              </motion.div>
            )}

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              {topics.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={topics.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-4">
                      {topics.map((topic, index) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          index={index}
                          onAddSubTopic={() => handleAddSubTopic(topic.id)}
                          onAddQuestion={(subTopicId) =>
                            handleAddQuestion(topic.id, subTopicId)
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
                  className="flex flex-col items-center justify-center py-32 gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-text-tertiary text-sm">
                    No topics yet. Add one to get started.
                  </p>
                  <button
                    onClick={() => setShowAddTopic(true)}
                    className="px-5 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-hover transition-colors"
                  >
                    + Add Topic
                  </button>
                </motion.div>
              )}
            </main>
          </>
        )}

        {/* Modals */}
        <AddTopicModal
          isOpen={showAddTopic}
          onClose={() => setShowAddTopic(false)}
          onAdd={(title) => addTopic(title)}
        />

        <AddSubTopicModal
          isOpen={showAddSubTopic}
          onClose={() => {
            setShowAddSubTopic(false);
            setActiveTopicId(null);
          }}
          onAdd={(title) => {
            if (activeTopicId) addSubTopic(activeTopicId, title);
          }}
          topicTitle={activeTopic?.title || ''}
        />

        <AddQuestionModal
          isOpen={showAddQuestion}
          onClose={() => {
            setShowAddQuestion(false);
            setActiveTopicId(null);
            setActiveSubTopicId(null);
          }}
          onAdd={(data) => {
            if (activeTopicId && activeSubTopicId) {
              addQuestion(activeTopicId, activeSubTopicId, {
                title: data.title,
                difficulty: data.difficulty,
                platformUrl: data.platformUrl,
                solutionUrl: data.solutionUrl,
                tags: data.tags ?? [],
              });
            }
          }}
          subTopicTitle={activeSubTopic?.title || ''}
        />
      </div>
    </div>
  );
}
