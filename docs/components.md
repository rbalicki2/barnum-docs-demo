# Component Reference

This document describes each React component in the `src/components/` directory and its props interface.

## Header

**File:** `src/components/Header.tsx`

The Header component renders the app title and a text input for adding new todos. It manages its own local input state with `useState`.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onAddTodo` | `(title: string) => void` | Called when the user submits a new todo |

When the user presses Enter, the component calls `onAddTodo` with the current input value, then clears the field. Empty or whitespace-only input is ignored — the handler checks `input.length > 0` before dispatching.

The input element uses the class name `"todo-input"` for styling purposes.

## TodoList

**File:** `src/components/TodoList.tsx`

Renders the list of todos. If the list is empty, it displays a paragraph with the message "Nothing to do!" to indicate there are no matching items.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `todos` | `Todo[]` | The array of todos to display |
| `onToggle` | `(id: string) => void` | Called when a todo's checkbox is clicked |
| `onDelete` | `(id: string) => void` | Called when a todo's delete button is clicked |

Each `Todo` is rendered as a `<TodoItem>` inside a `<ul>`. The list passes both `onToggle` and `onDelete` through to each item. Items are keyed by `todo.index` to help React identify which items have changed.

## TodoItem

**File:** `src/components/TodoItem.tsx`

Renders a single todo as an `<li>` element. The item shows a checkbox, the todo title, and a delete button.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `todo` | `Todo` | The todo object to render |
| `onToggle` | `(id: string) => void` | Toggles the completion state |
| `onDelete` | `(id: string) => void` | Removes the todo |

When the todo is completed, the `<li>` receives a `"done"` CSS class that applies a line-through style to the title. The delete button renders a Unicode `×` character and fires `onDelete(todo.id)` on click.

## Footer

**File:** `src/components/Footer.tsx`

Displays the count of remaining items and filter buttons. The remaining count uses singular "item" when the count is exactly one, and "items" otherwise.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `remainingCount` | `number` | Number of incomplete todos |
| `filter` | `FilterMode` | The currently active filter |
| `onFilterChange` | `(filter: FilterMode) => void` | Called when a filter button is clicked |

The filter buttons are rendered from a hardcoded array of label/value pairs. The active filter button receives the `"active"` CSS class to visually distinguish it from the others.
