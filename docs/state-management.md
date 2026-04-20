# State Management

All application state is managed through the `useTodos` custom hook in `src/hooks/useTodos.ts`. This page explains how state flows through the app and how each operation works.

## Hook API

The `useTodos` hook returns an object with the following shape:

```ts
{
  todos: Todo[];          // the filtered list of todos
  filter: FilterMode;     // current filter ("all" | "active" | "completed")
  setFilter: (f: FilterMode) => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  remainingCount: number; // count of incomplete todos
  totalCount: number;     // total number of todos regardless of filter
}
```

## ID Generation

Todo IDs are generated using `crypto.randomUUID()`, producing unique string identifiers. This approach avoids collisions without requiring a server round-trip or an external library.

## Adding a Todo

The `addTodo` callback trims the input string and creates a new `Todo` object with `completed: false` and `createdAt` set to the current timestamp. It prepends the new todo to the front of the list so that the most recently added item appears first.

## Toggling a Todo

`toggleTodo` maps over the current array and flips the `completed` boolean for the matching ID. It uses the spread operator to produce a new object, preserving immutability. The function is wrapped in `useMemo` to keep referential stability across renders.

## Deleting a Todo

`deleteTodo` filters out the todo with the matching ID. Like `toggleTodo`, it is memoized with `useMemo` to avoid unnecessary re-renders of child components.

## Filtering

The hook maintains a `filter` state that controls which todos are returned:

- `"all"` — returns every todo
- `"active"` — returns todos where `completed` is `false`
- `"completed"` — returns todos where `completed` is `true`

Filtering is applied using `Array.prototype.reduce` to build a new array on each render. The filtered result is not memoized — it recomputes whenever `todos` or `filter` changes.

## Remaining Count

`remainingCount` is derived by counting todos where `completed === false`. This count always reflects the full todo list, not the filtered view — so switching filters does not change the remaining count.
