import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "@/data/search";
import type { SearchEntry } from "@/data/types";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    const hits = search(value);
    setResults(hits);
    setSelectedIndex(0);
  }, []);

  const go = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      go(results[selectedIndex].path);
    }
  }, [results, selectedIndex, go, onClose]);

  if (!open) return null;

  const grouped = new Map<string, SearchEntry[]>();
  for (const r of results) {
    const list = grouped.get(r.category) ?? [];
    list.push(r);
    grouped.set(r.category, list);
  }

  return (
    <>
      <div className="command-overlay" onClick={onClose} />
      <div className="command-dialog">
        <input
          ref={inputRef}
          className="command-input"
          placeholder="Search components, tokens, guides..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-list">
          {query && results.length === 0 && (
            <div className="command-empty">No results found.</div>
          )}
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category} className="command-group">
              <div className="command-group-label">{category}</div>
              {items.map((item) => {
                const idx = results.indexOf(item);
                return (
                  <button
                    key={item.path}
                    className={`command-item${idx === selectedIndex ? " selected" : ""}`}
                    onClick={() => go(item.path)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.title}</div>
                      <div className="tiny muted" style={{ marginTop: "0.125rem" }}>{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          {!query && (
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <span className="muted small">Type to search components, tokens, and guides.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
