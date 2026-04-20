# Getting Started

This guide walks you through running the todo app locally and understanding the project layout.

## Prerequisites

- Node.js 18 or later
- pnpm (any recent version)

## Installation

```bash
pnpm install
```

## Running the Dev Server

```bash
pnpm dev
```

This starts the Vite development server. The app will be available at `http://localhost:3000` by default. Hot module replacement is enabled, so changes to components will reflect immediately without a full page reload.

## Project Structure

```
src/
├── index.html          # HTML shell
├── index.tsx           # React entry point
├── App.tsx             # Root component
├── types.ts            # Shared TypeScript interfaces
├── components/
│   ├── Header.tsx      # Title and new-todo input
│   ├── TodoList.tsx    # Renders the list of items
│   ├── TodoItem.tsx    # Single todo row
│   └── Footer.tsx      # Item count and filter controls
└── utils/
    └── storage.ts      # localStorage persistence helpers
```

## Building for Production

```bash
pnpm build
```

Output is written to the `dist/` directory. The build uses Vite's default Rollup-based bundling with tree-shaking enabled.

## Key Design Decisions

The app intentionally avoids external state management libraries. A single `useTodos` hook owns all todo state, and the `App` component distributes it via props. This keeps the dependency footprint small and makes the data flow easy to trace.

Todos are persisted to `localStorage` via helper functions in `src/utils/storage.ts`. On mount, the hook reads from storage to rehydrate state; on every change, it writes the updated list back. This gives the app offline persistence without a backend.

## TypeScript

The project uses strict TypeScript. The `Todo` interface and `FilterMode` type alias are defined in `src/types.ts` and imported wherever needed. Component props are defined as inline interfaces in each component file rather than being exported from a central location.
