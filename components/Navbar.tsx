'use client';

import {
  Search,
  Plus,
  Star,
  Moon,
  Sun,
  Tag,
  X,
  Zap,
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
  } = useSheetStore();

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
            (a, st) => a + st.questions.filter((q) => q.timeSpent > 0).length,
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
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-accent/20">
              <Image src="/logo.png" alt="Logo" width={42} height={42} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-text-primary leading-tight">
                {sheetName} - Codolio
              </h1>
              <p className="text-[10px] text-text-tertiary font-mono tracking-wider uppercase">
                {completedQuestions}/{totalQuestions} solved
                {favoriteCount > 0 && ` · ${favoriteCount} starred`}
              </p>
            </div>
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
  );
}
