import type { FilterMode } from "../types";

interface FooterProps {
  remainingCount: number;
  filter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
}

const FILTERS: { label: string; value: FilterMode }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function Footer({ remainingCount, filter, onFilterChange }: FooterProps) {
  return (
    <footer className="footer">
      <span className="todo-count">
        {remainingCount} {remainingCount === 1 ? "item" : "items"} left
      </span>
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? "selected" : ""}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </footer>
  );
}
