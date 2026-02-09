'use client';

import { useState, useRef, useEffect } from 'react';
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
import { GripVertical, Plus, Pencil, Trash2, ChevronDown, Check } from 'lucide-react';
import QuestionCard, { QUESTION_GRID } from './QuestionCard';
import { ConfirmDeleteModal } from './Modals';
import type { SubTopic } from '@/types/sheet';
import { useSheetStore } from '@/store/sheetStore';

interface SubTopicSectionProps {
  subTopic: SubTopic;
  topicId: string;
  index: number;
  onAddQuestion: () => void;
}

function SubTopicInner({
  subTopic,
  topicId,
  onAddQuestion,
}: Omit<SubTopicSectionProps, 'index'>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subTopic.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    editSubTopic,
    deleteSubTopic,
    reorderQuestions,
    toggleCollapseSubTopic,
    searchQuery,
    showFavoritesOnly,
    tagFilter,
  } = useSheetStore();

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleEditSubmit = () => {
    if (editTitle.trim()) {
      editSubTopic(topicId, subTopic.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subTopic.questions.findIndex((q) => q.id === active.id);
    const newIndex = subTopic.questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderQuestions(topicId, subTopic.id, oldIndex, newIndex);
    }
  };

  const filteredQuestions = subTopic.questions.filter((q) => {
    if (showFavoritesOnly && !q.isFavorite) return false;
    if (tagFilter && !q.tags.includes(tagFilter)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.tags.some((t) => t.toLowerCase().includes(query)) ||
        subTopic.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (filteredQuestions.length === 0 && (searchQuery || showFavoritesOnly || tagFilter)) {
    return null;
  }

  const questionIds = filteredQuestions.map((q) => q.id);
  const isFilterActive = !!(searchQuery || showFavoritesOnly || tagFilter);
  const completedCount = isFilterActive
    ? filteredQuestions.filter((q) => q.isCompleted).length
    : subTopic.questions.filter((q) => q.isCompleted).length;
  const displayTotal = isFilterActive ? filteredQuestions.length : subTopic.questions.length;

  return (
    <div className="ml-4 border-l-2 border-border-subtle pl-4">

      <div
        className="flex items-center gap-3 mb-2 group/st cursor-pointer select-none py-1.5"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('input') || target.closest('.drag-handle')) return;
          toggleCollapseSubTopic(topicId, subTopic.id);
        }}
      >
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
            className="bg-bg-tertiary border border-border rounded-lg px-2.5 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        ) : (
          <h4 className="text-sm font-semibold text-text-secondary tracking-wide">
            {subTopic.title}
          </h4>
        )}

        <motion.span
          className="text-text-tertiary shrink-0"
          animate={{ rotate: subTopic.isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.span>

        <span className="text-[11px] text-text-tertiary font-mono tabular-nums">
          {completedCount}/{displayTotal}
        </span>


        <div className="w-20 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: displayTotal > 0
                ? `${(completedCount / displayTotal) * 100}%`
                : '0%',
              background: completedCount === displayTotal && displayTotal > 0 ? 'var(--easy)' : 'var(--accent)',
              opacity: completedCount === 0 ? 0.6 : 1,
            }}
          />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover/st:opacity-100 transition-opacity ml-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onAddQuestion(); }}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
            title="Add question"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditTitle(subTopic.title);
              setIsEditing(true);
            }}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteSubTopic(topicId, subTopic.id)}
        itemType="subtopic"
        itemName={subTopic.title}
      />


      <AnimatePresence initial={false}>
        {(!subTopic.isCollapsed || isFilterActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                {filteredQuestions.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-sm text-text-tertiary/60">
                    No questions found
                  </div>
                ) : (
                  <>

                    <div className={`${QUESTION_GRID} h-7 px-1.5 border-b border-border-subtle/30 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary/60 select-none`}>
                      <span className="flex justify-center"><Check height={18} /></span>
                      <span className="flex justify-center">Difficulty</span>
                      <span className="pl-6">Problem</span>
                      <span className="flex justify-center">Note</span>
                      <span className="flex justify-center">Link</span>
                      <span className="flex justify-center">Sol</span>
                      <span className="flex justify-center">Solve</span>
                      <span className="flex justify-center">Favourite</span>
                      <span />
                    </div>
                    <div className="space-y-px">
                      {filteredQuestions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          topicId={topicId}
                          subTopicId={subTopic.id}
                          index={idx}
                        />
                      ))}
                    </div>
                  </>
                )}
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SubTopicSection(props: SubTopicSectionProps) {
  const { searchQuery, showFavoritesOnly, tagFilter } = useSheetStore();

  const isFilterActive = !!(searchQuery || showFavoritesOnly || tagFilter);

  const hasMatchingQuestions = !isFilterActive || props.subTopic.questions.some((q) => {
    if (showFavoritesOnly && !q.isFavorite) return false;
    if (tagFilter && !q.tags.includes(tagFilter)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return q.title.toLowerCase().includes(query) || q.tags.some((t) => t.toLowerCase().includes(query));
    }
    return true;
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.subTopic.id,
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

  if (!hasMatchingQuestions) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-opacity duration-200 ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          className="drag-handle mt-3 p-1 rounded-lg text-text-tertiary hover:text-text-secondary opacity-40 hover:opacity-100 transition-all shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1">
          <SubTopicInner
            subTopic={props.subTopic}
            topicId={props.topicId}
            onAddQuestion={props.onAddQuestion}
          />
        </div>
      </div>
    </div>
  );
}
