'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCcw,
  ExternalLink,
  Youtube,
  MoreVertical,
  FileText,
} from 'lucide-react';
import type { Question } from '@/types/sheet';
import { ConfirmDeleteModal, NotesModal } from './Modals';

import { useSheetStore } from '@/store/sheetStore';

interface QuestionCardProps {
  question: Question;
  topicId: string;
  subTopicId: string;
  index: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  Easy: { label: 'Easy', color: 'text-easy' },
  Basic: { label: 'Easy', color: 'text-easy' },
  Medium: { label: 'Medium', color: 'text-medium' },
  Hard: { label: 'Hard', color: 'text-hard' },
};


export const QUESTION_GRID = 'grid grid-cols-[26px_64px_1fr_32px_30px_30px_120px_28px_28px] gap-x-1 items-center';

export default function QuestionCard({
  question,
  topicId,
  subTopicId,
}: QuestionCardProps) {
  const {
    toggleFavorite,
    toggleComplete,
    editQuestion,
    deleteQuestion,
    addTag,
    removeTag,
    startTimer,
    stopTimer,
    resetTimer,
    updateNotes,
  } = useSheetStore();

  const onToggleFavorite = () => toggleFavorite(topicId, subTopicId, question.id);
  const onToggleComplete = () => toggleComplete(topicId, subTopicId, question.id);
  const onEdit = (title: string) => editQuestion(topicId, subTopicId, question.id, title);
  const onDelete = () => deleteQuestion(topicId, subTopicId, question.id);
  const onAddTag = (tag: string) => addTag(topicId, subTopicId, question.id, tag);
  const onRemoveTag = (tag: string) => removeTag(topicId, subTopicId, question.id, tag);
  const onStartTimer = () => startTimer(topicId, subTopicId, question.id);
  const onStopTimer = () => stopTimer(topicId, subTopicId, question.id);
  const onResetTimer = () => resetTimer(topicId, subTopicId, question.id);
  const onUpdateNotes = (notes: string) => updateNotes(topicId, subTopicId, question.id, notes);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    transition: { duration: 200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
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
    if (!question.isTimerRunning) { setElapsed(0); return; }
    const interval = setInterval(() => {
      if (question.timerStartedAt) setElapsed(Math.floor((Date.now() - question.timerStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [question.isTimerRunning, question.timerStartedAt]);


  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);


  useEffect(() => {
    if (!showMenu) return;
    const handler = () => setShowMenu(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [showMenu]);

  const openMenu = useCallback(() => {
    if (showMenu) { setShowMenu(false); return; }
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      // Menu is ~120px tall. If there's room below, open down; otherwise open up.
      const menuHeight = 120;
      if (rect.bottom + menuHeight > window.innerHeight) {
        setMenuPos({ top: rect.top - menuHeight - 4, left: rect.right - 150 });
      } else {
        setMenuPos({ top: rect.bottom + 4, left: rect.right - 150 });
      }
    }
    setShowMenu(true);
  }, [showMenu]);

  const handleEditSubmit = () => {
    if (editTitle.trim()) onEdit(editTitle.trim());
    setIsEditing(false);
  };

  const handleTagSubmit = () => {
    if (newTag.trim()) { onAddTag(newTag.trim().toLowerCase()); setNewTag(''); }
  };

  const handleSolve = () => {
    if (question.platformUrl) window.open(question.platformUrl, '_blank');
    if (!question.isTimerRunning) onStartTimer();
  };

  const handleSolveAgain = () => {
    if (question.platformUrl) window.open(question.platformUrl, '_blank');
    onStopTimer();
    onResetTimer();
  };

  const totalTime = question.timeSpent + elapsed;
  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.Medium;
  const visibleTags = question.tags.slice(0, 2);
  const extraTagCount = question.tags.length - 2;

  return (
    <>
      <div ref={setNodeRef} style={style}>

        <div
          className={`group ${QUESTION_GRID} h-10 px-1.5 border-b border-border-subtle/20 transition-colors duration-100
            ${isDragging
              ? 'opacity-60 bg-bg-tertiary shadow-lg'
              : question.isCompleted
                ? 'bg-easy/3 hover:bg-easy/6'
                : 'hover:bg-bg-secondary/40'
            }`}
        >

          <div className="flex justify-center">
            <button onClick={onToggleComplete} className="flex items-center justify-center">
              <span className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all
                ${question.isCompleted
                  ? 'bg-easy border-easy text-white'
                  : 'border-text-tertiary/30 hover:border-easy/60'
                }`}
              >
                {question.isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                    <Check size={10} strokeWidth={3} />
                  </motion.div>
                )}
              </span>
            </button>
          </div>


          <div className="flex justify-center">
            <span className={`text-xs font-semibold ${diff.color}`}>{diff.label}</span>
          </div>


          <div className="min-w-0 flex items-center gap-2">
            <button
              className="drag-handle text-text-tertiary opacity-30 hover:opacity-100 transition-opacity cursor-grab shrink-0"
              {...attributes} {...listeners}
            >
              <GripVertical size={13} />
            </button>
            {isEditing ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSubmit(); if (e.key === 'Escape') setIsEditing(false); }}
                className="flex-1 min-w-0 bg-bg-tertiary border border-border rounded px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            ) : (
              <span className={`text-[13px] truncate ${question.isCompleted ? 'text-text-tertiary line-through decoration-text-tertiary/30' : 'text-text-primary'}`}>
                {question.title}
              </span>
            )}

            {!isEditing && question.tags.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {visibleTags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-px rounded-sm bg-tag-bg text-tag-text font-medium truncate max-w-16">
                    {tag}
                  </span>
                ))}
                {extraTagCount > 0 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-[10px] px-1 py-px rounded-sm bg-tag-bg text-tag-text font-medium hover:brightness-110 transition-all cursor-pointer"
                  >
                    +{extraTagCount}
                  </button>
                )}
              </div>
            )}
          </div>


          <div className="flex justify-center">
            <button
              onClick={() => setShowNotes(true)}
              className={`p-0.5 rounded transition-colors ${question.notes ? 'text-accent' : 'text-text-tertiary/40 hover:text-accent/70'}`}
              title={question.notes ? 'View notes' : 'Add notes'}
            >
              <FileText size={13} fill={question.notes ? 'currentColor' : 'none'} fillOpacity={0.15} />
            </button>
          </div>


          <div className="flex justify-center">
            {question.platformUrl ? (
              <a href={question.platformUrl} target="_blank" rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent transition-colors" title="Open problem">
                <ExternalLink size={14} />
              </a>
            ) : <span />}
          </div>


          <div className="flex justify-center">
            {question.solutionUrl ? (
              <a href={question.solutionUrl} target="_blank" rel="noopener noreferrer"
                className="text-red-400/70 hover:text-red-400 transition-colors" title="Watch solution">
                <Youtube size={15} />
              </a>
            ) : <span />}
          </div>


          <div className="flex items-center justify-center overflow-hidden">
            {question.isTimerRunning ? (
              <button onClick={onStopTimer}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-easy/15 text-easy hover:bg-easy/25 transition-colors">
                <Square size={9} />
                <span className="font-mono tabular-nums">{formatTime(totalTime)}</span>
              </button>
            ) : question.isCompleted ? (
              <div className="flex items-center gap-1">
                {totalTime > 0 ? (
                  <span className="text-[10px] text-easy font-mono tabular-nums">
                    {formatTime(totalTime)}
                  </span>
                ) : null}
                <button onClick={handleSolveAgain}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-easy/80 hover:text-accent hover:bg-accent/10 transition-colors" title="Solve again">
                  <RotateCcw size={10} />Again
                </button>
              </div>
            ) : (
              <button onClick={handleSolve}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-accent/15 text-accent hover:bg-accent/25 border border-accent/20 transition-colors">
                <Play size={10} />Solve
              </button>
            )}
          </div>


          <div className="flex justify-center">
            <button onClick={onToggleFavorite}
              className={`transition-colors ${question.isFavorite ? 'text-favorite' : 'text-text-tertiary hover:text-favorite'}`}>
              <Star size={14} fill={question.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>


          <div className="flex justify-center">
            <button
              ref={menuBtnRef}
              onClick={openMenu}
              className={`p-0.5 rounded transition-colors ${showMenu ? 'text-accent bg-accent/10' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>


        {showMenu && typeof document !== 'undefined' && createPortal(
          <div ref={menuRef} className="fixed z-50" style={{ top: menuPos?.top ?? 0, left: menuPos?.left ?? 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="bg-bg-secondary border border-border rounded-lg shadow-xl py-1 min-w-37.5"
            >
              <button
                onClick={() => { setShowTagEditor(!showTagEditor); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <Tag size={13} />{showTagEditor ? 'Close Tags' : 'Add/Remove Tags'}
              </button>
              <button
                onClick={() => { setEditTitle(question.title); setIsEditing(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <Pencil size={13} />Edit Title
              </button>
              <div className="my-1 border-t border-border-subtle/30" />
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />Delete
              </button>
            </motion.div>
          </div>,
          document.body
        )}


        <AnimatePresence>
          {showAllTags && question.tags.length > 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 flex-wrap pl-24 pr-4 py-1.5">
                {question.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-tag-bg text-tag-text font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {showTagEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 flex-wrap pl-24 pr-4 pb-1.5 pt-1 border-b border-border-subtle/10">
                {question.tags.map((tag, i) => (
                  <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-subtle/50 font-medium">
                    {tag}
                    <button onClick={() => onRemoveTag(tag)} className="hover:text-red-400 transition-colors"><X size={8} /></button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    ref={tagInputRef}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleTagSubmit(); if (e.key === 'Escape') { setShowTagEditor(false); setNewTag(''); } }}
                    placeholder="add tag..."
                    className="text-[10px] bg-bg-tertiary border border-border rounded px-1.5 py-0.5 w-20 text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary/50"
                  />
                  <button onClick={handleTagSubmit} className="p-0.5 rounded text-text-tertiary hover:text-accent transition-colors"><Plus size={11} /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        itemType="question"
        itemName={question.title}
      />

      <NotesModal
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        questionTitle={question.title}
        notes={question.notes ?? ''}
        onSave={onUpdateNotes}
      />
    </>
  );
}
