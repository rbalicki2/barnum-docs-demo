import { Header } from "./components/Header";
import { TodoList } from "./components/TodoList";
import { Footer } from "./components/Footer";
import { useTodos } from "./hooks/useTodos";

export function App() {
  const { todos, filter, setFilter, addTodo, toggleTodo, deleteTodo, remainingCount } =
    useTodos();

  return (
    <div className="app">
      <Header onAddTodo={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      <Footer
        remainingCount={remainingCount}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
}
