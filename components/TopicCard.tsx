'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react';
import SubTopicSection from './SubTopicSection';
import { ConfirmDeleteModal } from './Modals';
import type { Topic } from '@/types/sheet';
import { useSheetStore } from '@/store/sheetStore';

interface TopicCardProps {
  topic: Topic;
  index: number;
  onAddSubTopic: () => void;
  onAddQuestion: (subTopicId: string) => void;
}

export default function TopicCard({
  topic,
  index,
  onAddSubTopic,
  onAddQuestion,
}: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { editTopic, deleteTopic, toggleCollapse, reorderSubTopics, searchQuery, showFavoritesOnly, tagFilter } =
    useSheetStore();

  const isFilterActive = !!(searchQuery || showFavoritesOnly || tagFilter);

  const filterQuestion = useMemo(() => {
    return (q: { isFavorite: boolean; tags: string[]; title: string }) => {
      if (showFavoritesOnly && !q.isFavorite) return false;
      if (tagFilter && !q.tags.includes(tagFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        // Match against question title, tags, topic title, or subtopic titles
        return (
          q.title.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query)) ||
          topic.title.toLowerCase().includes(query) ||
          (topic.subTopics ?? []).some((st) => st.title.toLowerCase().includes(query))
        );
      }
      return true;
    };
  }, [searchQuery, showFavoritesOnly, tagFilter, topic.title, topic.subTopics]);

  const hasMatchingQuestions = useMemo(() => {
    if (!isFilterActive) return true;
    return (topic.subTopics ?? []).some((st) => st.questions.some(filterQuestion));
  }, [topic.subTopics, isFilterActive, filterQuestion]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: topic.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editTitle.trim()) {
      editTopic(topic.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topic.subTopics.findIndex((st) => st.id === active.id);
    const newIndex = topic.subTopics.findIndex((st) => st.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSubTopics(topic.id, oldIndex, newIndex);
    }
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons, inputs, or the drag handle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.drag-handle')) return;
    toggleCollapse(topic.id);
  };

  const totalQuestions = useMemo(() =>
    (topic.subTopics ?? []).reduce(
      (acc, st) => acc + (isFilterActive ? st.questions.filter(filterQuestion).length : st.questions.length),
      0
    ), [topic.subTopics, isFilterActive, filterQuestion]);
  const completedQuestions = useMemo(() =>
    (topic.subTopics ?? []).reduce(
      (acc, st) => acc + (isFilterActive ? st.questions.filter(filterQuestion).filter((q) => q.isCompleted).length : st.questions.filter((q) => q.isCompleted).length),
      0
    ), [topic.subTopics, isFilterActive, filterQuestion]);
  const progress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;

  if (!hasMatchingQuestions) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`animate-fade-in-up ${staggerClass} rounded-2xl border overflow-hidden transition-all duration-200
        ${isDragging
          ? 'opacity-80 scale-[1.02] border-accent/40 shadow-2xl shadow-accent/10 ring-1 ring-accent/20'
          : 'border-border bg-bg-secondary/40 hover:bg-bg-secondary/60 shadow-sm'
        }`}
    >
      {/* Topic Header — clickable to toggle collapse */}
      <div
        className="flex items-center gap-4 px-5 py-5 bg-surface-glow cursor-pointer select-none"
        onClick={handleHeaderClick}
      >
        {/* Drag Handle */}
        <button
          className="drag-handle p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary transition-all shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Layers size={20} className="text-accent" />
        </div>

        {/* Title + Collapse indicator */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-base font-heading font-semibold text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <>
              <h3 className="font-heading font-semibold text-base text-text-primary truncate">
                {topic.title}
              </h3>
              <motion.span
                className="text-text-tertiary shrink-0"
                animate={{ rotate: topic.isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} />
              </motion.span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-text-tertiary font-mono tabular-nums">
              {completedQuestions}/{totalQuestions}
            </span>
            <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? 'var(--easy)' : 'var(--accent)',
                  opacity: progress === 0 ? 0 : 1,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAddSubTopic(); }}
              className="p-2 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
              title="Add subtopic"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(topic.title);
                setIsEditing(true);
              }}
              className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              title="Edit topic"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-2 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete topic"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTopic(topic.id)}
        itemType="topic"
        itemName={topic.title}
      />

      {/* Content */}
      <AnimatePresence initial={false}>
        {(!topic.isCollapsed || isFilterActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(topic.subTopics ?? []).map((st) => st.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {(topic.subTopics ?? []).map((st, idx) => (
                    <SubTopicSection
                      key={st.id}
                      subTopic={st}
                      topicId={topic.id}
                      index={idx}
                      onAddQuestion={() => onAddQuestion(st.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {(topic.subTopics ?? []).length === 0 && (
                <div className="text-center py-8 text-text-tertiary text-sm">
                  <p>No subtopics yet.</p>
                  <button
                    onClick={onAddSubTopic}
                    className="mt-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
                  >
                    + Add a subtopic
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
