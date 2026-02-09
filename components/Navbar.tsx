'use client';

import {
  Search,
  Plus,
  Star,
  Moon,
  Sun,
  Tag,
  X,
  RotateCcw,
  AlertTriangle,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import { useSheetStore } from '@/store/sheetStore';
import { useState, useMemo }from 'react';
import Image from 'next/image';

interface NavbarProps {
  onAddTopic: () => void;
}

export default function Navbar({ onAddTopic }: NavbarProps) {
  const {
    sheetName,
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    setShowFavoritesOnly,
    tagFilter,
    setTagFilter,
    darkMode,
    toggleDarkMode,
    topics,
    resetAllData,
    setAllCollapsed,
  } = useSheetStore();

  const allCollapsed = useMemo(
    () => topics.length > 0 && topics.every((t) => t.isCollapsed),
    [topics]
  );

  const [showResetModal, setShowResetModal] = useState(false);

  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach((t) =>
      t.subTopics?.forEach((st) =>
        st.questions?.forEach((q) => q.tags?.forEach((tag) => tags.add(tag)))
      )
    );
    return Array.from(tags).sort();
  }, [topics]);

  const totalQuestions = useMemo(
    () =>
      topics.reduce(
        (acc, t) =>
          acc + (t.subTopics ?? []).reduce((a, st) => a + st.questions.length, 0),
        0
      ),
    [topics]
  );

  const completedQuestions = useMemo(
    () =>
      topics.reduce(
        (acc, t) =>
          acc +
          (t.subTopics ?? []).reduce(
            (a, st) => a + st.questions.filter((q) => q.isCompleted).length,
            0
          ),
        0
      ),
    [topics]
  );

  const favoriteCount = useMemo(
    () =>
      topics.reduce(
        (acc, t) =>
          acc +
          (t.subTopics ?? []).reduce(
            (a, st) => a + st.questions.filter((q) => q.isFavorite).length,
            0
          ),
        0
      ),
    [topics]
  );

  return (
    <>
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={42} height={42} />
              <h1 className="font-heading font-bold text-lg text-text-primary leading-tight">
                {sheetName} - Codolio
              </h1>
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-48 sm:w-64 bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Favorites Filter */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2 rounded-xl border transition-all ${
                showFavoritesOnly
                  ? 'bg-favorite/15 border-favorite/30 text-favorite'
                  : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border'
              }`}
              title="Show favorites only"
            >
              <Star size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            </button>

            {/* Tag Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className={`p-2 rounded-xl border transition-all ${
                  tagFilter
                    ? 'bg-tag-bg border-tag-text/30 text-tag-text'
                    : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border'
                }`}
                title="Filter by tag"
              >
                <Tag size={16} />
              </button>
              {showTagDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl py-1 z-50">
                  <button
                    onClick={() => {
                      setTagFilter('');
                      setShowTagDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors ${
                      !tagFilter ? 'text-accent' : 'text-text-secondary'
                    }`}
                  >
                    All tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setTagFilter(tag === tagFilter ? '' : tag);
                        setShowTagDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors ${
                        tagFilter === tag ? 'text-accent' : 'text-text-secondary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length === 0 && (
                    <p className="px-3 py-2 text-xs text-text-tertiary">No tags yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Collapse / Expand All */}
            <button
              onClick={() => setAllCollapsed(!allCollapsed)}
              className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border transition-all"
              title={allCollapsed ? 'Expand all' : 'Collapse all'}
            >
              {allCollapsed ? <ChevronsUpDown size={16} /> : <ChevronsDownUp size={16} />}
            </button>

            {/* Reset All */}
            <button
              onClick={() => setShowResetModal(true)}
              className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-red-400 hover:border-red-400/30 transition-all"
              title="Reset all data"
            >
              <RotateCcw size={16} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border transition-all"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Add Topic */}
            <button
              onClick={onAddTopic}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:bg-accent-hover transition-colors shadow-md shadow-accent/15"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Topic</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Reset Confirmation Modal */}
    {showResetModal && (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle size={22} className="text-red-400" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary">Reset All Data?</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            This will permanently erase all your progress, completions, timers, tags, and study todos. This action <span className="text-red-400 font-semibold">cannot be undone</span>.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetAllData();
                setShowResetModal(false);
              }}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
