'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListTodo, Plus, Trash2, X, GripVertical } from 'lucide-react';

/* ─── Types ─── */
interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'codolio-study-todos';

/* ─── Helpers ─── */
function loadTodos(): TodoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/* ─── Component ─── */
export default function StudyTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showClearDone, setShowClearDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setTodos(loadTodos());
    setMounted(true);
  }, []);

  // Persist whenever todos change (skip initial mount)
  useEffect(() => {
    if (mounted) saveTodos(todos);
  }, [todos, mounted]);

  const addTodo = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setInput('');
    inputRef.current?.focus();
  }, [input]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
    setShowClearDone(false);
  }, []);

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="px-5 py-4 rounded-xl bg-bg-secondary border border-border-subtle min-h-[180px]">
        <div className="flex items-center gap-2 mb-3">
          <ListTodo size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Study Goals
          </span>
        </div>
        <div className="text-xs text-text-tertiary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 rounded-xl bg-bg-secondary border border-border-subtle flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTodo size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Study Goals
          </span>
        </div>
        {totalCount > 0 && (
          <span className="text-[10px] tabular-nums text-text-tertiary">
            {doneCount}/{totalCount} done
          </span>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="flex gap-2 mb-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Revise Binary Search…"
          className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="shrink-0 p-1.5 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Add goal"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full h-1 bg-bg-tertiary rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(doneCount / totalCount) * 100}%`,
              background:
                doneCount === totalCount ? 'var(--easy)' : 'var(--accent)',
            }}
          />
        </div>
      )}

      {/* Todos list */}
      <div className="flex-1 space-y-1 max-h-[200px] overflow-y-auto pr-1">
        {todos.length === 0 && (
          <p className="text-xs text-text-tertiary text-center py-4">
            No study goals yet — add one above!
          </p>
        )}

        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
              todo.done
                ? 'bg-bg-tertiary/50'
                : 'hover:bg-bg-tertiary/60'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`shrink-0 h-4 w-4 rounded border transition-all flex items-center justify-center ${
                todo.done
                  ? 'bg-easy/20 border-easy/50'
                  : 'border-border hover:border-accent'
              }`}
              title={todo.done ? 'Mark undone' : 'Mark done'}
            >
              {todo.done && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-easy"
                >
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-xs leading-snug transition-colors ${
                todo.done
                  ? 'line-through text-text-tertiary'
                  : 'text-text-secondary'
              }`}
            >
              {todo.text}
            </span>

            {/* Delete */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-hard transition-all"
              title="Remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer — clear completed */}
      {doneCount > 0 && (
        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-text-tertiary">
            {doneCount} completed
          </span>
          {showClearDone ? (
            <div className="flex items-center gap-1">
              <button
                onClick={clearCompleted}
                className="text-[10px] text-hard hover:text-red-300 transition-colors"
              >
                Confirm clear
              </button>
              <button
                onClick={() => setShowClearDone(false)}
                className="p-0.5 text-text-tertiary hover:text-text-secondary"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearDone(true)}
              className="text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Clear done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
