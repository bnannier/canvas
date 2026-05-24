import { useState, useEffect, useCallback } from "react";

interface TocItem {
  id: string;
  label: string;
}

interface TocProps {
  items: TocItem[];
}

export function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  const handleScroll = useCallback(() => {
    const offset = 120;
    let current = items[0]?.id ?? "";
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = item.id;
      }
    }
    setActiveId(current);
  }, [items]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (items.length === 0) return null;

  return (
    <nav className="docs-toc" aria-label="On this page">
      <p className="tiny" style={{ fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        On this page
      </p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`docs-toc-link${activeId === item.id ? " active" : ""}`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
