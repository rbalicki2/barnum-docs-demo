import { useState } from "react";

interface HeaderProps {
  onAddTodo: (title: string) => void;
}

export function Header({ onAddTodo }: HeaderProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTodo(input);
      setInput("");
    }
  };

  return (
    <header className="header">
      <h1>Todos</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="new-todo"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </header>
  );
}
