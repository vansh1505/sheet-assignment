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
  Download,
  Upload,
  MoreVertical,
} from 'lucide-react';
import { useSheetStore } from '@/store/sheetStore';
import { useState, useMemo, useRef, useEffect } from 'react';
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
    importProgress,
  } = useSheetStore();

  const allCollapsed = useMemo(
    () => topics.length > 0 && topics.every((t) => t.isCollapsed),
    [topics]
  );

  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach((t) =>
      t.subTopics?.forEach((st) =>
        st.questions?.forEach((q) => q.tags?.forEach((tag) => tags.add(tag)))
      )
    );
    return Array.from(tags).sort();
  }, [topics]);

  const handleExport = () => {
    const { sheetName: name, topics: t } = useSheetStore.getState();
    const data = { sheetName: name, topics: t, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.sheetName.replace(/\s+/g, '-').toLowerCase()}-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left — Logo & name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="shrink-0" />
              <h1 className="font-heading font-bold text-base text-text-primary leading-tight truncate hidden sm:block">
                {sheetName}
              </h1>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-1.5">
              {/* Desktop search */}
              <div className="relative hidden md:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-56 bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-8 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border transition-all md:hidden"
              >
                <Search size={16} />
              </button>

              {/* Favorites */}
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

              {/* Tag filter */}
              <div className="relative hidden sm:block" ref={tagDropdownRef}>
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
                  <div className="absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl py-1 z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setTagFilter(''); setShowTagDropdown(false); }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors ${!tagFilter ? 'text-accent' : 'text-text-secondary'}`}
                    >
                      All tags
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setTagFilter(tag === tagFilter ? '' : tag); setShowTagDropdown(false); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors ${tagFilter === tag ? 'text-accent' : 'text-text-secondary'}`}
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

              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border transition-all"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* More menu — groups secondary actions */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 rounded-xl border border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border transition-all"
                  title="More options"
                >
                  <MoreVertical size={16} />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-bg-secondary border border-border rounded-xl shadow-xl py-1 z-50">
                    {/* Tag filter — visible only on mobile inside menu */}
                    <button
                      onClick={() => { setShowMoreMenu(false); setShowTagDropdown(!showTagDropdown); }}
                      className="sm:hidden w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
                    >
                      <Tag size={15} />
                      Filter by tag
                      {tagFilter && <span className="ml-auto text-xs text-accent">{tagFilter}</span>}
                    </button>

                    <button
                      onClick={() => { setAllCollapsed(!allCollapsed); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
                    >
                      {allCollapsed ? <ChevronsUpDown size={15} /> : <ChevronsDownUp size={15} />}
                      {allCollapsed ? 'Expand all' : 'Collapse all'}
                    </button>

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      onClick={() => { handleExport(); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
                    >
                      <Download size={15} />
                      Export progress
                    </button>

                    <button
                      onClick={() => { setImportError(null); setShowImportModal(true); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
                    >
                      <Upload size={15} />
                      Import progress
                    </button>

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      onClick={() => { setShowResetModal(true); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <RotateCcw size={15} />
                      Reset all data
                    </button>
                  </div>
                )}
              </div>

              {/* Add topic */}
              <button
                onClick={onAddTopic}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:bg-accent-hover transition-colors shadow-md shadow-accent/15"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Topic</span>
              </button>
            </div>
          </div>

          {/* Mobile search bar — slides down */}
          {showMobileSearch && (
            <div className="pb-3 md:hidden">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  autoFocus
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-accent/10">
                <Upload size={22} className="text-accent" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">Import Progress</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Upload a previously exported JSON file to restore your progress. This will <span className="text-amber-400 font-semibold">replace</span> your current data.
            </p>
            {importError && (
              <p className="text-sm text-red-400 mb-4 bg-red-500/10 rounded-xl px-3 py-2">{importError}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string);
                    if (!data.sheetName || !Array.isArray(data.topics)) {
                      setImportError('Invalid file format. Expected exported progress JSON.');
                      return;
                    }
                    importProgress({ sheetName: data.sheetName, topics: data.topics });
                    setShowImportModal(false);
                    setImportError(null);
                  } catch {
                    setImportError('Failed to parse JSON file. Please check the file and try again.');
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowImportModal(false); setImportError(null); }}
                className="px-4 py-2 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-hover transition-colors shadow-md shadow-accent/15"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset modal */}
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
                onClick={() => { resetAllData(); setShowResetModal(false); }}
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
