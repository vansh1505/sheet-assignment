'use client';

import { useState, useRef, useEffect } from 'react';
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
import { GripVertical, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import QuestionCard from './QuestionCard';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    editSubTopic,
    deleteSubTopic,
    reorderQuestions,
    toggleFavorite,
    editQuestion,
    deleteQuestion,
    addTag,
    removeTag,
    startTimer,
    stopTimer,
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
        q.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (filteredQuestions.length === 0 && (searchQuery || showFavoritesOnly || tagFilter)) {
    return null;
  }

  const questionIds = filteredQuestions.map((q) => q.id);
  const completedCount = subTopic.questions.filter((q) => q.timeSpent > 0).length;

  return (
    <div className="ml-4 border-l-2 border-border-subtle pl-4">
      {/* Subtopic Header */}
      <div className="flex items-center gap-2 mb-2 group/st">
        <button
          onClick={() => toggleCollapseSubTopic(topicId, subTopic.id)}
          className="text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {subTopic.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="bg-bg-tertiary border border-border rounded-lg px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        ) : (
          <h4 className="text-sm font-semibold text-text-secondary tracking-wide">
            {subTopic.title}
          </h4>
        )}

        <span className="text-[10px] text-text-tertiary font-mono">
          {completedCount}/{subTopic.questions.length}
        </span>

        {/* Progress bar */}
        <div className="w-16 h-1 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/60 rounded-full transition-all duration-300"
            style={{
              width: subTopic.questions.length > 0
                ? `${(completedCount / subTopic.questions.length) * 100}%`
                : '0%',
            }}
          />
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover/st:opacity-100 transition-opacity ml-auto">
          <button
            onClick={onAddQuestion}
            className="p-1 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
            title="Add question"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => {
              setEditTitle(subTopic.title);
              setIsEditing(true);
            }}
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => deleteSubTopic(topicId, subTopic.id)}
            className="p-1 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Questions */}
      {!subTopic.isCollapsed && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {filteredQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  topicId={topicId}
                  subTopicId={subTopic.id}
                  index={idx}
                  onToggleFavorite={() => toggleFavorite(topicId, subTopic.id, q.id)}
                  onEdit={(title) => editQuestion(topicId, subTopic.id, q.id, title)}
                  onDelete={() => deleteQuestion(topicId, subTopic.id, q.id)}
                  onAddTag={(tag) => addTag(topicId, subTopic.id, q.id, tag)}
                  onRemoveTag={(tag) => removeTag(topicId, subTopic.id, q.id, tag)}
                  onStartTimer={() => startTimer(topicId, subTopic.id, q.id)}
                  onStopTimer={() => stopTimer(topicId, subTopic.id, q.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default function SubTopicSection(props: SubTopicSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.subTopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="flex items-start gap-1">
        <button
          className="drag-handle mt-2 p-0.5 rounded text-text-tertiary hover:text-text-secondary opacity-40 hover:opacity-100 transition-opacity shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={12} />
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
