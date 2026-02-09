<p align="center">
  <img src="public/logo.png" alt="Codolio Logo" width="80" height="80" />
</p>

<h1 align="center">Striver SDE Sheet — Interactive Question Tracker</h1>

<p align="center">
  <strong>A feature-rich, single-page DSA sheet management app built for the Codolio Frontend Assignment</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-5-orange" alt="Zustand" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer" alt="Framer Motion" />
</p>

---

## 📌 Assignment Checklist — All Requirements Fulfilled

| # | Requirement | Status | Implementation |
|---|------------|--------|---------------|
| 1 | **Add / Edit / Delete Topics** | ✅ Done | Full CRUD with inline editing, confirmation modals for safe deletion |
| 2 | **Add / Edit / Delete Sub-topics** | ✅ Done | Nested under topics with collapsible UI and cascading deletes |
| 3 | **Add / Edit / Delete Questions** | ✅ Done | Rich creation modal (title, difficulty, platform URL, solution URL, tags) + inline edit via context menu |
| 4 | **Drag & Drop Reorder** | ✅ Done | Smooth DnD at **all 3 hierarchy levels** — topics, sub-topics, and questions — powered by `@dnd-kit` |
| 5 | **Single-page Application** | ✅ Done | Next.js App Router, fully client-rendered SPA with zero page reloads |
| 6 | **Clean & Intuitive UI** | ✅ Done | Custom dark/light theme inspired by Codolio, polished micro-interactions |
| 7 | **State Management (Zustand)** | ✅ Done | Zustand with `persist` middleware — all progress survives page refreshes |
| 8 | **API Integration** | ✅ Done | Fetches Striver SDE Sheet data from the provided Codolio API endpoint and transforms it into the app's data model |

---

## 🚀 Bonus Features — Going Far Beyond the Requirements

Every feature below was designed to solve a **real problem** DSA aspirants face daily. This isn't just a CRUD app — it's a complete study companion.

### ⏱️ Problem Solve Timer
- Click **"Solve"** → opens the problem link **and** auto-starts a precision timer
- Live elapsed time displayed directly in the question row
- Stop the timer when done — your solve time is **saved permanently**
- Completed questions display total time taken, helping you **track improvement over time**
- **"Solve Again"** button to re-attempt problems and beat your previous time

### 📝 Per-Question Notes
- Dedicated **Notes column** (`📝` icon) visible on every question row — no digging through menus
- Click to open a rich notes modal — store your **approach, key insights, edge cases, time/space complexity**
- Visual indicator (filled icon) instantly shows which questions have notes
- Auto-saves on close with character count — never lose your thoughts
- Discard button if you change your mind

### ⭐ Favorites System
- Star any question to mark it as important for revision
- **One-click filter** in navbar to show only starred questions
- Favorite count displayed in the stats dashboard

### 🏷️ Smart Tag Management
- Each question supports **multiple tags** (auto-populated from API data)
- Add/remove tags via the 3-dot context menu
- **Global tag filter** — dropdown in navbar lists all unique tags across the sheet
- Inline tag display with `+N` overflow badge that expands on click to show all tags

### 🔍 Powerful Global Search
- Real-time search across **question titles, tags, topic names, and sub-topic names**
- Topics and sub-topics with zero matching questions **auto-hide**
- Progress counts update to reflect only the filtered subset

### 📊 Comprehensive Analytics Dashboard
| Component | What It Shows |
|-----------|--------------|
| **Overall Progress** | Animated semicircle dot chart with percentage |
| **Difficulty Breakdown** | Donut chart with Easy/Medium/Hard solve counts |
| **Topic Progress** | Per-topic completion dots at a glance |
| **Study Goals** | Built-in daily todo list with its own localStorage persistence |

### 🌗 Dark / Light Mode
- Full theme toggle with carefully crafted color palettes for both modes
- CSS custom properties ensure instant, smooth transitions
- Both themes maintain proper contrast ratios for readability

### 🔄 Collapse / Expand All
- One-click collapse or expand **all topics** from the navbar
- Individual topic and sub-topic collapse with smooth animated transitions
- Smart behavior: auto-expands collapsed sections when search/filter is active

### 🗑️ Safe Deletion with Confirmation
- Every destructive action shows a **confirmation modal** before executing
- Clear warnings about cascading effects (deleting a topic removes all its sub-topics and questions)
- Explicit "cannot be undone" messaging

### 🔁 Full Data Reset
- Reset option in navbar to start fresh
- Confirmation modal with explicit warning about data loss
- Clears all progress, timers, tags, notes, and study goals

### 🎬 Entrance Animations
- Header, stats, and topic cards animate in with staggered fade-up effects after data loads
- Loading spinner shown while API data is fetched — nothing renders prematurely
- Smooth collapse/expand animations throughout the app

---

## 🏗️ Architecture & Technical Decisions

### Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16 | Framework — App Router for file-based routing |
| **React** | 19 | UI library with latest concurrent features |
| **TypeScript** | 5 | Full type safety across all components, store, and API types |
| **Tailwind CSS** | 4 | Utility-first styling with CSS custom properties for themeing |
| **Zustand** | 5 | Lightweight state management with `persist` middleware for localStorage |
| **@dnd-kit** | core 6.3, sortable 10 | Accessible, performant drag-and-drop at all hierarchy levels |
| **Framer Motion** | 12 | Smooth animations — collapses, checkmarks, modals, entrance effects |
| **Lucide React** | 0.563 | Consistent, tree-shakable SVG icon system |

### Project Structure

```
codolio-assignment/
├── app/
│   ├── globals.css              # Theme variables (dark + light), animations, custom scrollbar
│   ├── layout.tsx               # Root layout with metadata & favicon
│   └── page.tsx                 # Main SPA — API fetching, DnD context, modal orchestration
│
├── components/
│   ├── Navbar.tsx               # Sticky nav — search, filters, theme toggle, collapse/expand, reset
│   ├── TopicCard.tsx            # Collapsible topic card — drag handle, inline edit, stats bar
│   ├── SubTopicSection.tsx      # Sub-topic with nested question table and DnD
│   ├── QuestionCard.tsx         # 9-column grid row — timer, notes, tags, favorite, context menu
│   ├── SheetStats.tsx           # Dashboard orchestrator — progress, difficulty, topics
│   ├── DifficultyBreakdown.tsx  # Conic-gradient donut chart for difficulty stats
│   ├── OverallProgress.tsx      # Semicircle dot-based progress visualization
│   ├── StudyTodos.tsx           # Self-contained study goals todo list
│   └── Modals.tsx               # All modal dialogs — Add, Edit, Delete, Notes
│
├── store/
│   └── sheetStore.ts            # Zustand store — single source of truth for all state & actions
│
├── lib/
│   └── transform.ts             # API response → hierarchical app data transformer
│
├── types/
│   └── sheet.ts                 # TypeScript interfaces — Question, SubTopic, Topic, API types
│
└── public/
    └── logo.png                 # Codolio app logo
```

### State Management Design

The Zustand store (`sheetStore.ts`) manages **all application state** through a flat, action-based API:

```
┌─────────────────────────────────────────────────┐
│                  Zustand Store                   │
├─────────────────┬───────────────────────────────┤
│ Hierarchical    │ addTopic, editTopic,           │
│ CRUD            │ addSubTopic, addQuestion, ...  │
├─────────────────┼───────────────────────────────┤
│ Reordering      │ reorderTopics,                 │
│                 │ reorderSubTopics,              │
│                 │ reorderQuestions               │
├─────────────────┼───────────────────────────────┤
│ Question        │ toggleFavorite, toggleComplete,│
│ Features        │ addTag, removeTag, updateNotes │
├─────────────────┼───────────────────────────────┤
│ Timer System    │ startTimer, stopTimer,         │
│                 │ resetTimer (timestamp-based)   │
├─────────────────┼───────────────────────────────┤
│ Filters         │ searchQuery, showFavoritesOnly,│
│                 │ tagFilter                      │
├─────────────────┼───────────────────────────────┤
│ Persistence     │ Zustand persist → localStorage │
│                 │ Key: 'sheet-store'             │
└─────────────────┴───────────────────────────────┘
```

A shared `updateQuestion` helper ensures all question mutations follow the same immutable update pattern through the `Topic → SubTopic → Question` hierarchy.

### Drag & Drop Architecture

Three independently nested `DndContext` providers enable drag-and-drop at each level without interference:

```
page.tsx (DndContext → Topics)
  └── TopicCard (DndContext → Sub-topics)
       └── SubTopicSection (DndContext → Questions)
```

Each level uses `PointerSensor` with activation distance constraints to prevent accidental drags. Transforms are applied via `CSS.Translate` for GPU-accelerated, 60fps animations.

### API Integration

```
GET https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet
```

The `transformAPIData()` function handles:
- Mapping flat API questions into the `Topic → SubTopic → Question` hierarchy
- Respecting the API's `topicOrder` configuration for correct display order
- Normalizing difficulty values (`Basic` → `Easy`, handling missing values)
- Extracting platform URLs and solution URLs
- Generating stable UUIDs for all entities

**Smart initialization**: If the Zustand store already has persisted data (returning user), the API response is **skipped** — preserving all user progress, notes, timers, and tags across sessions.

---

## 🧠 Notable Engineering Challenges & Solutions

| Challenge | Solution |
|----------|---------|
| **Dropdown menu clipped by `overflow-hidden` parents** | Used `createPortal` to render the menu on `document.body` with `position: fixed` + viewport-aware auto-detection for opening up vs down |
| **DnD jank at topic level** | Removed `transition-all` from sortable root elements (conflicts with `@dnd-kit`'s transform), switched to `transition-shadow` only |
| **Timer accuracy across page refreshes** | Store `timerStartedAt` as a Unix timestamp; compute `elapsed = Date.now() - timerStartedAt` on each render interval |
| **Filter-aware counts and visibility** | Memoized `filterQuestion` predicate reused across topic/sub-topic/question visibility checks — zero recalcutation waste |
| **Hydration mismatch with localStorage** | Zustand `persist` + `mounted` state guard for components like StudyTodos that read localStorage on mount |
| **Unchecking completed question doesn't reset timer** | `toggleComplete` action now conditionally resets `timeSpent`, `isTimerRunning`, and `timerStartedAt` when un-completing |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** / **yarn** / **pnpm**

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/vansh1505/codolio-assignment.git
cd codolio-assignment

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📂 Data Persistence

All user data is persisted in the browser's `localStorage` under two keys:

| Key | Data |
|-----|------|
| `sheet-store` | Topics, sub-topics, questions, progress, timers, notes, tags, favorites, theme preference |
| `codolio-study-todos` | Study goals todo list items |

No backend or database is required — the app is fully self-contained.

---

## 🎨 Design Decisions

- **Codolio-inspired aesthetic** — Dark stone palette with amber accent (`#F59E0B`), matching the platform's visual identity
- **Information-dense table layout** — 9-column grid shows all question metadata (status, difficulty, title, notes, links, timer, favorite, menu) at a glance — no hover-to-reveal patterns
- **Progressive disclosure** — Collapse/expand, `+N` tag overflow, context menus reduce visual noise while keeping everything one click away
- **Micro-interactions everywhere** — Spring-animated checkmarks, smooth height transitions, staggered scroll-in effects, portal-based dropdown menus
- **Typography** — Bricolage Grotesque for headings, Figtree for body — clean and modern
- **Custom scrollbars** — Subtle 6px scrollbars that match the theme

---

<p align="center">
  <sub>Built with ❤️ by <strong>Vansh</strong> for the Codolio Frontend Internship Assignment</sub>
</p>
