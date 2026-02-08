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
import Navbar from '@/components/Navbar';
import TopicCard from '@/components/TopicCard';
import {
  AddTopicModal,
  AddSubTopicModal,
  AddQuestionModal,
} from '@/components/Modals';
import { useSheetStore } from '@/store/sheetStore';
import { transformAPIData } from '@/lib/transform';
import type { APIResponse } from '@/types/sheet';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
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
      <div className="min-h-screen bg-bg-primary">
        <Navbar onAddTopic={() => setShowAddTopic(true)} />

        <header className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
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
                  View original sheet →
                </a>
              )}
            </div>

            {/* optional stats box */}
            <div className="hidden md:flex items-center gap-4 px-4 py-3 rounded-xl bg-bg-secondary border border-white/10">
              <div className="flex items-center gap-4">

                {/* progress circle */}
                <div
                  className="relative h-20 w-20 shrink-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #34d399 35%,
                      #fbbf24 0 75%,
                      #ef4444 0
                    )`,
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-[#0a0a0a]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-lg font-bold">78</div>
                  </div>
                </div>

                {/* stats */}
                <div className="flex-1 space-y-2 w-40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Easy
                    </span>
                    <span className="tabular-nums">32/80</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Medium
                    </span>
                    <span className="tabular-nums">36/90</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      Hard
                    </span>
                    <span className="tabular-nums">10/40</span>
                  </div>

                  {/* overall line */}
                  <div className="pt-2 border-t border-white/10 text-xs text-text-secondary">
                    78/191 solved · 12 starred
                  </div>
                </div>

              </div>
            </div>


          </div>

        </header>


        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={topics.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
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
          )}

          {!loading && !error && topics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
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
            </div>
          )}
        </main>

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
          onAdd={(title, difficulty) => {
            if (activeTopicId && activeSubTopicId) {
              addQuestion(activeTopicId, activeSubTopicId, { title, difficulty });
            }
          }}
          subTopicTitle={activeSubTopic?.title || ''}
        />
      </div>
    </div>
  );
}
