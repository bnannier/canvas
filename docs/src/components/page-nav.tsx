import { Link, useLocation } from "react-router-dom";
import { NAV_GROUPS } from "@/layout/sidebar";

const FLAT_PAGES = NAV_GROUPS.flatMap((g) =>
  g.items.map((item) => ({ label: item.label, to: item.to, group: g.label })),
);

export function PageNav() {
  const { pathname } = useLocation();
  const idx = FLAT_PAGES.findIndex((p) => p.to === pathname);
  if (idx === -1) return null;

  const prev = idx > 0 ? FLAT_PAGES[idx - 1] : null;
  const next = idx < FLAT_PAGES.length - 1 ? FLAT_PAGES[idx + 1] : null;

  return (
    <nav style={{
      marginTop: 48,
      paddingTop: 24,
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
    }}>
      {prev ? (
        <Link
          to={prev.to}
          style={{
            color: "var(--muted-foreground)",
            textDecoration: "none",
          }}
        >
          ← {prev.label}
        </Link>
      ) : <span />}
      {next ? (
        <Link
          to={next.to}
          style={{
            color: "var(--foreground)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {next.label} →
        </Link>
      ) : <span />}
    </nav>
  );
}
