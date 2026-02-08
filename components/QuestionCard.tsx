'use client';

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Star,
  GripVertical,
  Clock,
  Play,
  Square,
  X,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { Question } from '@/types/sheet';

interface QuestionCardProps {
  question: Question;
  topicId: string;
  subTopicId: string;
  index: number;
  onToggleFavorite: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

const tagColors: Record<string, string> = {
  revision: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  important: 'bg-red-500/15 text-red-400 border-red-500/25',
  tricky: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

const defaultTagColor = 'bg-tag-bg text-tag-text border-tag-text/20';

export default function QuestionCard({
  question,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddTag,
  onRemoveTag,
  onStartTimer,
  onStopTimer,
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) tagInputRef.current.focus();
  }, [showTagInput]);

  useEffect(() => {
    if (!question.isTimerRunning) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      if (question.timerStartedAt) {
        setElapsed(Math.floor((Date.now() - question.timerStartedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [question.isTimerRunning, question.timerStartedAt]);

  const handleEditSubmit = () => {
    if (editTitle.trim()) {
      onEdit(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTagSubmit = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim().toLowerCase());
      setNewTag('');
    }
    setShowTagInput(false);
  };

  const difficultyClass =
    question.difficulty === 'Easy'
      ? 'badge-easy'
      : question.difficulty === 'Hard'
        ? 'badge-hard'
        : 'badge-medium';

  const totalTime = question.timeSpent + elapsed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-200
        ${isDragging
          ? 'opacity-50 scale-[1.02] border-accent/40 bg-bg-tertiary shadow-lg shadow-accent/5 z-50'
          : 'border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary hover:border-border'
        }`}
    >
      {/* Drag Handle */}
      <button
        className="drag-handle mt-1 p-0.5 rounded text-text-tertiary hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {/* Difficulty Badge */}
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${difficultyClass}`}>
            {question.difficulty}
          </span>

          {/* Title */}
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
              className="flex-1 bg-bg-tertiary border border-border rounded-lg px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <span className="text-sm text-text-primary truncate font-medium">
              {question.title}
            </span>
          )}

          {/* External Link */}
          {question.platformUrl && (
            <a
              href={question.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-tertiary hover:text-accent transition-colors shrink-0"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {question.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${tagColors[tag] || defaultTagColor}`}
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {showTagInput ? (
            <input
              ref={tagInputRef}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={handleTagSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTagSubmit();
                if (e.key === 'Escape') setShowTagInput(false);
              }}
              placeholder="tag name"
              className="text-[10px] bg-bg-tertiary border border-border rounded-md px-2 py-0.5 w-20 text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-text-tertiary hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          {totalTime > 0 && (
            <span className="text-[11px] text-text-tertiary font-mono tabular-nums">
              <Clock size={10} className="inline mr-0.5 -mt-0.5" />
              {formatTime(totalTime)}
            </span>
          )}
          {question.isTimerRunning ? (
            <button
              onClick={onStopTimer}
              className="p-1 rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors animate-pulse-glow"
            >
              <Square size={12} />
            </button>
          ) : (
            <button
              onClick={onStartTimer}
              className="p-1 rounded-md text-text-tertiary hover:text-easy hover:bg-easy/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Play size={12} />
            </button>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded-md transition-all ${
            question.isFavorite
              ? 'text-favorite'
              : 'text-text-tertiary hover:text-favorite opacity-0 group-hover:opacity-100'
          }`}
        >
          <Star size={14} fill={question.isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditTitle(question.title);
              setIsEditing(true);
            }}
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
