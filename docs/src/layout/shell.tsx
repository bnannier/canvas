import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SearchDialog } from "@/components/search-dialog";

const SIDEBAR_KEY = "canvas-sidebar";

function loadSidebarState(): boolean {
  try { return localStorage.getItem(SIDEBAR_KEY) === "collapsed"; } catch { return false; }
}

function saveSidebarState(collapsed: boolean): void {
  try { localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded"); } catch {}
}

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(loadSidebarState);
  const [searchOpen, setSearchOpen] = useState(false);

  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed((v) => {
      const next = !v;
      saveSidebarState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // The home route renders the redesigned landing inside the standard docs shell
  // (sidebar + topbar) like every other page; it just gets a flush content
  // container so the landing's full-bleed bands span the main column.
  const isLanding = pathname === "/";

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={toggleCollapse}
        onSearchOpen={openSearch}
      />
      <div className={`app-main ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} onCollapseToggle={toggleCollapse} onSearchOpen={openSearch} />
        <main className={`app-content${isLanding ? " app-content--landing" : ""}`}>
          <Outlet />
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
