'use client';

import { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="font-heading font-semibold text-lg text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Add Topic Modal ─── */
interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
}

export function AddTopicModal({ isOpen, onClose, onAdd }: AddTopicModalProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Topic">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Topic Name
          </label>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dynamic Programming"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-accent text-bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Topic
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Add SubTopic Modal ─── */
interface AddSubTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
  topicTitle: string;
}

export function AddSubTopicModal({
  isOpen,
  onClose,
  onAdd,
  topicTitle,
}: AddSubTopicModalProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Subtopic">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-text-tertiary -mt-2">
          Adding to <span className="text-accent font-medium">{topicTitle}</span>
        </p>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Subtopic Name
          </label>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Memoization"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-accent text-bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Subtopic
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Add Question Modal ─── */
interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    platformUrl?: string;
    solutionUrl?: string;
    tags?: string[];
  }) => void;
  subTopicTitle: string;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onAdd,
  subTopicTitle,
}: AddQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [platformUrl, setPlatformUrl] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDifficulty('Medium');
      setPlatformUrl('');
      setSolutionUrl('');
      setTagsInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      onAdd({
        title: title.trim(),
        difficulty,
        platformUrl: platformUrl.trim() || undefined,
        solutionUrl: solutionUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Question">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-text-tertiary -mt-2">
          Adding to <span className="text-accent font-medium">{subTopicTitle}</span>
        </p>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Question Title
          </label>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Two Sum"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Difficulty
          </label>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  difficulty === d
                    ? d === 'Easy'
                      ? 'badge-easy border-easy/40'
                      : d === 'Medium'
                        ? 'badge-medium border-medium/40'
                        : 'badge-hard border-hard/40'
                    : 'border-border-subtle text-text-tertiary hover:border-border hover:text-text-secondary'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Problem Link <span className="text-text-tertiary text-xs">(optional)</span>
          </label>
          <input
            value={platformUrl}
            onChange={(e) => setPlatformUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Solution Link <span className="text-text-tertiary text-xs">(optional)</span>
          </label>
          <input
            value={solutionUrl}
            onChange={(e) => setSolutionUrl(e.target.value)}
            placeholder="https://youtu.be/... or article link"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Tags <span className="text-text-tertiary text-xs">(optional, comma-separated)</span>
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. arrays, binary search, revision"
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-accent text-bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Question
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Confirm Delete Modal ─── */
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: 'topic' | 'subtopic' | 'question';
  itemName: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const descriptions: Record<string, string> = {
    topic: 'This will delete the topic and all its subtopics and questions.',
    subtopic: 'This will delete the subtopic and all its questions.',
    question: 'This will permanently remove this question.',
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <h3 className="font-heading font-bold text-lg text-text-primary">
            Delete {itemType}?
          </h3>
        </div>
        <p className="text-sm text-text-secondary mb-2 leading-relaxed">
          <span className="text-text-primary font-medium">&quot;{itemName}&quot;</span>
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          {descriptions[itemType]} This action <span className="text-red-400 font-semibold">cannot be undone</span>.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Notes Modal ─── */

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  notes: string;
  onSave: (notes: string) => void;
}

export function NotesModal({ isOpen, onClose, questionTitle, notes, onSave }: NotesModalProps) {
  const [value, setValue] = useState(notes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(notes);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen, notes]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) { handleSave(); } }}
    >
      <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-accent/10 shrink-0">
              <FileText size={16} className="text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-semibold text-sm text-text-primary">Notes</h2>
              <p className="text-[11px] text-text-tertiary truncate">{questionTitle}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write your notes here... approach, key insights, edge cases, complexity..."
            className="w-full h-48 bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/40 focus:outline-none focus:border-accent resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-[11px] text-text-tertiary">
              {value.length > 0 ? `${value.length} characters` : 'No notes yet'}
            </span>
            <div className="flex items-center gap-2">
              {value !== notes && (
                <button
                  onClick={() => setValue(notes)}
                  className="px-3 py-1.5 rounded-lg text-xs text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
                >
                  Discard
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-accent text-bg-primary text-xs font-medium hover:bg-accent-hover transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
