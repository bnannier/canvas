import { useLocation } from "react-router-dom";
import { Sun, Moon, Search } from "lucide-react";
import {
  getTheme,
  setTheme,
  getSurface,
  setSurface,
  type Theme,
  type Surface,
} from "../../../src/theme";
import { useState, useCallback } from "react";
import { getComponent } from "@/data/components";

interface TopbarProps {
  onMenuToggle: () => void;
  onCollapseToggle: () => void;
  onSearchOpen: () => void;
}

function getPageInfo(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/") return { title: "Canvas", subtitle: "Design System" };
  if (pathname === "/tokens") return { title: "Colors & Theme", subtitle: "Tokens" };
  if (pathname === "/tokens/spacing") return { title: "Spacing & Shape", subtitle: "Tokens" };
  if (pathname === "/tokens/typography") return { title: "Typography", subtitle: "Tokens" };
  if (pathname === "/utilities") return { title: "Layout utilities", subtitle: "Utilities" };
  if (pathname === "/theming") return { title: "Theming", subtitle: "Foundations" };
  if (pathname === "/migration") return { title: "Migration", subtitle: "Guides" };
  if (pathname === "/integration") return { title: "Integration", subtitle: "Guides" };
  if (pathname === "/browser-support") return { title: "Browser Support", subtitle: "Guides" };

  const match = pathname.match(/^\/components\/(.+)$/);
  if (match) {
    const comp = getComponent(match[1]);
    if (comp) return { title: comp.name, subtitle: comp.category };
    const name = match[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { title: name, subtitle: "Components" };
  }

  const tplMatch = pathname.match(/^\/templates\/(.+)$/);
  if (tplMatch) {
    const name = tplMatch[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { title: name, subtitle: "Templates" };
  }

  const patMatch = pathname.match(/^\/patterns\/(.+)$/);
  if (patMatch) {
    const name = patMatch[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { title: name, subtitle: "Patterns" };
  }

  return { title: "Canvas" };
}

export function Topbar({ onMenuToggle, onCollapseToggle, onSearchOpen }: TopbarProps) {
  const { pathname } = useLocation();
  const { title, subtitle } = getPageInfo(pathname);

  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [surface, setSurfaceState] = useState<Surface>(getSurface);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }, [theme]);

  const switchSurface = useCallback((s: Surface) => {
    setSurface(s);
    setSurfaceState(s);
  }, []);

  return (
    <header className="topbar">
      <button
        onClick={() => window.innerWidth >= 1024 ? onCollapseToggle() : onMenuToggle()}
        className="btn btn-ghost btn-icon topbar-hamburger"
        title="Toggle menu"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </div>
        {subtitle && (
          <div className="topbar-subtitle" style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <button className="topbar-search" onClick={onSearchOpen}>
        <Search size={13} />
        <span>Search components...</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      <div className="topbar-surface-toggle">
        <button
          onClick={() => switchSurface("default")}
          className={surface === "default" ? "active" : ""}
        >
          Solid
        </button>
        <button
          onClick={() => switchSurface("glass")}
          className={surface === "glass" ? "active" : ""}
        >
          Glass
        </button>
      </div>

      <button
        className="btn btn-ghost btn-icon"
        title={theme === "dark" ? "Light mode" : "Dark mode"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
