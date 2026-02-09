'use client';

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  Star,
  GripVertical,
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Play,
  Square,
  Tag,
  Lightbulb,
  Clock,
  RotateCcw,
} from 'lucide-react';
import type { Question } from '@/types/sheet';
import { ConfirmDeleteModal } from './Modals';

interface QuestionCardProps {
  question: Question;
  topicId: string;
  subTopicId: string;
  index: number;
  onToggleFavorite: () => void;
  onToggleComplete: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const tagColors: Record<string, string> = {
  revision: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  important: 'bg-red-500/15 text-red-400 border-red-500/25',
  tricky: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  arrays: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  'dynamic programming': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
};

const defaultTagColor = 'bg-tag-bg text-tag-text border-tag-text/20';

const difficultyConfig: Record<string, { label: string; class: string; bg: string }> = {
  Easy: { label: 'Easy', class: 'text-easy', bg: 'bg-easy/12 border-easy/20' },
  Basic: { label: 'Basic', class: 'text-easy', bg: 'bg-easy/12 border-easy/20' },
  Medium: { label: 'Medium', class: 'text-medium', bg: 'bg-medium/12 border-medium/20' },
  Hard: { label: 'Hard', class: 'text-hard', bg: 'bg-hard/12 border-hard/20' },
};

// LeetCode icon SVG
function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="14" height="14">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-1.35-1.352a1.373 1.373 0 0 0-1.94 0l-2.39 2.39a1.373 1.373 0 0 0 0 1.94l4.244 4.243a1.373 1.373 0 0 0 1.94 0l8.81-8.812a1.374 1.374 0 0 0 0-1.94L14.444.437A1.374 1.374 0 0 0 13.483 0zM8.726 7.58l5.272 5.272-3.544 3.544-5.272-5.272L8.726 7.58zM16.67 13.07a1.087 1.087 0 0 0-.765.317l-1.08 1.08a1.087 1.087 0 0 0 0 1.53l2.877 2.878a1.087 1.087 0 0 0 1.53 0l1.08-1.08a1.087 1.087 0 0 0 0-1.53l-2.877-2.878a1.087 1.087 0 0 0-.765-.317z" />
    </svg>
  );
}

export default function QuestionCard({
  question,
  onToggleFavorite,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTag,
  onRemoveTag,
  onStartTimer,
  onStopTimer,
  onResetTimer,
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  } = useSortable({
    id: question.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    if (showTagEditor && tagInputRef.current) tagInputRef.current.focus();
  }, [showTagEditor]);

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
    if (editTitle.trim()) onEdit(editTitle.trim());
    setIsEditing(false);
  };

  const handleTagSubmit = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim().toLowerCase());
      setNewTag('');
    }
  };

  const handleSolve = () => {
    // Open problem link in new tab and start timer
    if (question.platformUrl) {
      window.open(question.platformUrl, '_blank');
    }
    onStartTimer();
  };

  const handleSolveAgain = () => {
    // Open problem link and reset+restart timer
    if (question.platformUrl) {
      window.open(question.platformUrl, '_blank');
    }
    onResetTimer();
  };

  const totalTime = question.timeSpent + elapsed;
  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.Medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border transition-all duration-150
        ${isDragging
          ? 'opacity-60 scale-[1.01] border-accent/30 bg-bg-tertiary shadow-lg'
          : question.isCompleted
            ? 'border-easy/15 bg-easy/3 hover:bg-easy/6'
            : 'border-border-subtle/50 bg-bg-secondary/30 hover:bg-bg-secondary/60'
        }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-2 py-2">
        {/* Drag handle */}
        <button
          className="drag-handle shrink-0 p-0.5 rounded text-text-tertiary opacity-0 group-hover:opacity-40 hover:opacity-100! transition-opacity cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        {/* Completion checkbox */}
        <button
          onClick={onToggleComplete}
          className={`shrink-0 h-4.5 w-4.5 rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-200
            ${question.isCompleted
              ? 'bg-easy border-easy text-white'
              : 'border-text-tertiary/40 hover:border-accent/60 bg-transparent'
            }`}
        >
          {question.isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={11} strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Difficulty pill */}
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${diff.bg} ${diff.class}`}>
          {diff.label}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
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
              className="w-full bg-bg-tertiary border border-border rounded-md px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <span
              className={`text-[13px] leading-tight truncate block ${
                question.isCompleted
                  ? 'text-text-tertiary line-through decoration-text-tertiary/30'
                  : 'text-text-primary'
              }`}
            >
              {question.title}
            </span>
          )}
        </div>

        {/* LeetCode link */}
        {question.platformUrl && (
          <a
            href={question.platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1 rounded-md text-text-tertiary hover:text-[#ffa116] hover:bg-[#ffa116]/10 transition-colors"
            title="Open on LeetCode"
          >
            <LeetCodeIcon />
          </a>
        )}

        {/* Solution link */}
        {question.solutionUrl && (
          <a
            href={question.solutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1 rounded-md text-text-tertiary hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            title="Watch solution"
          >
            <Lightbulb size={14} />
          </a>
        )}

        {/* Timer display */}
        {totalTime > 0 && (
          <div className="shrink-0 flex items-center gap-1 text-[11px] text-text-tertiary font-mono tabular-nums">
            <Clock size={11} className="opacity-50" />
            {formatTime(totalTime)}
          </div>
        )}

        {/* Solve / Timer / Completed buttons */}
        <div className="shrink-0">
          {question.isTimerRunning ? (
            /* Timer running — show elapsed + "Completed" button */
            <button
              onClick={onStopTimer}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-easy/15 text-easy hover:bg-easy/25 transition-colors animate-pulse-glow"
            >
              <Square size={10} />
              Completed
            </button>
          ) : question.isCompleted ? (
            /* Already completed — show "Solve Again" */
            <button
              onClick={handleSolveAgain}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <RotateCcw size={10} />
              Solve again
            </button>
          ) : (
            /* Not started — show "Solve" */
            <button
              onClick={handleSolve}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Play size={10} />
              Solve
            </button>
          )}
        </div>

        {/* Favorite — always visible if active */}
        <button
          onClick={onToggleFavorite}
          className={`shrink-0 p-1 rounded-md transition-colors ${
            question.isFavorite
              ? 'text-favorite opacity-100!'
              : 'text-text-tertiary hover:text-favorite opacity-0 group-hover:opacity-100'
          }`}
          title="Favorite"
        >
          <Star size={14} fill={question.isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Manage tags toggle */}
        <button
          onClick={() => setShowTagEditor(!showTagEditor)}
          className={`shrink-0 p-1 rounded-md transition-colors ${
            showTagEditor
              ? 'text-accent bg-accent/10'
              : 'text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100'
          }`}
          title="Manage tags"
        >
          <Tag size={12} />
        </button>

        {/* Edit + Delete */}
        <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setEditTitle(question.title); setIsEditing(true); }}
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            title="Edit title"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        itemType="question"
        itemName={question.title}
      />

      {/* Tags & tag editor — second row, only if tags exist or editor is open */}
      {(question.tags.length > 0 || showTagEditor) && (
        <div className="flex items-center gap-1.5 flex-wrap px-3 pb-2 pt-0">
          {question.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${tagColors[tag] || defaultTagColor}`}
            >
              {tag}
              {showTagEditor && (
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={8} />
                </button>
              )}
            </span>
          ))}
          {showTagEditor && (
            <div className="flex items-center gap-1">
              <input
                ref={tagInputRef}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { handleTagSubmit(); }
                  if (e.key === 'Escape') { setShowTagEditor(false); setNewTag(''); }
                }}
                placeholder="add tag..."
                className="text-[10px] bg-bg-tertiary border border-border rounded-md px-1.5 py-0.5 w-20 text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary/50"
              />
              <button
                onClick={handleTagSubmit}
                className="p-0.5 rounded text-text-tertiary hover:text-accent transition-colors"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
