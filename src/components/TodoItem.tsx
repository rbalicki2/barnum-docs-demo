import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={todo.completed ? "completed" : ""}>
      <div className="todo-item">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="todo-title">{todo.title}</span>
        <button className="delete-btn" onClick={() => onDelete(todo.id)}>
          ×
        </button>
      </div>
    </li>
  );
}
