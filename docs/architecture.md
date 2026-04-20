# Architecture Overview

The application is a client-side todo app built with React and TypeScript. It uses Vite as the build tool and development server.

## Entry Point

The app boots from `src/index.tsx`, which calls `createRoot` on a DOM element with the id `"root"` and renders the top-level `<App />` component. The HTML shell lives in `src/index.html`, which loads the entry module via a `<script type="module">` tag.

## Component Tree

The component hierarchy is straightforward:

```
App
├── Header
├── TodoList
│   └── TodoItem (one per todo)
└── Footer
```

`App` is the root component that wires together the three main sections. It delegates all state management to the `useTodos` hook, which returns an object containing the current todo list, filter state, and action callbacks.

## State Management

All state lives in a single `useReducer` call inside `src/hooks/useTodos.ts`. This centralizes the add, toggle, and delete operations in a reducer function, keeping the state transitions predictable and easy to test. The hook exposes the current filtered list, the active filter, and a `dispatch` function that components use to trigger changes.

## Styling

The app uses CSS modules co-located with each component. Each component imports its own `*.module.css` file, which keeps styles scoped and avoids global class name collisions. The build pipeline processes these modules automatically through Vite's built-in CSS module support.

## Data Flow

Props flow strictly downward. The `App` component passes callback props like `onAddTodo` and `onToggle` into child components. No component reads from a global store or context — everything is threaded through props from `App`.

## Type Definitions

Shared types are defined in `src/types.ts`. The main types are:

- `Todo` — represents a single todo with `id` (number), `title`, `completed`, and `createdAt` fields.
- `FilterMode` — a union of `"all"`, `"active"`, and `"completed"` used to control which todos are visible.
- `TodoAction` — a discriminated union representing all possible state transitions (`add`, `toggle`, `delete`, `clearCompleted`).
