import { useState, useCallback } from "react";
import type { Todo, FilterMode } from "../types";

let nextId = 1;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");

  const addTodo = useCallback((title: string) => {
    const todo: Todo = {
      id: String(nextId++),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, todo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const remainingCount = todos.filter((t) => !t.completed).length;

  return {
    todos: filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    remainingCount,
  };
}
