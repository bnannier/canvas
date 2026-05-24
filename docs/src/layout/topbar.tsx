import { useLocation } from "react-router-dom";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface TopbarProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
}

function getBreadcrumb(pathname: string): string {
  if (pathname === "/") return "Home";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "components" && parts[1]) {
    return parts[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return parts[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Topbar({ onMenuToggle, onSearchOpen }: TopbarProps) {
  const { pathname } = useLocation();
  const title = getBreadcrumb(pathname);

  return (
    <header className="topbar">
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuToggle}
        style={{ marginRight: "0.25rem" }}
        aria-label="Toggle menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <span className="small" style={{ fontWeight: 500 }}>{title}</span>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={onSearchOpen}>
          Search <kbd className="kbd" style={{ marginLeft: "0.25rem" }}>⌘K</kbd>
        </button>
        <div className="sep-v" style={{ height: "1.25rem" }} />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
