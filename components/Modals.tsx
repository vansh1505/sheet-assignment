'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

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
  onAdd: (title: string, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDifficulty('Medium');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), difficulty);
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
