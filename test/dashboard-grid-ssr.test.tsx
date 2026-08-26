import { describe, it, expect, afterEach } from "bun:test";
import { act, cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
// Web build (the alias serves <name>.tsx); per-OS skins are covered by skins-smoke.
import { DashboardGrid, clearStoredDashboardOrder, type DashboardWidget } from "../src/organisms/dashboard-grid/dashboard-grid.tsx";

afterEach(cleanup);

// The hydration story, end to end. A `storageKey` board is the only one that can disagree with
// the server: the saved layout is a CLIENT fact the server never saw, so reading it during the
// first client render (which IS the hydration render on the web) makes React find markup it did
// not ship. React does not patch that up: it throws the server tree away and re-renders the whole
// subtree on the client, which is exactly the flash-and-rebuild this guards against.

const KEY = "test-ssr-overview";
const items: DashboardWidget[] = [
  { id: "a", span: 6, title: "Revenue", content: <Text testID="body-a">Revenue body</Text> },
  { id: "b", span: 6, title: "Signups", content: <Text testID="body-b">Signups body</Text> },
  { id: "c", span: 4, title: "Latency", content: <Text testID="body-c">Latency body</Text> },
];

const board = (
  <ThemeProvider>
    <DashboardGrid items={items} storageKey={KEY} />
  </ThemeProvider>
);
const bodyOrder = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("[data-testid^='body-']")).map((el) => el.getAttribute("data-testid"));

/**
 * Render the board the way a server does (no storage there at all), put that markup in the
 * document, then hydrate it with the client's saved layout in place, reporting whatever React
 * recovered from along the way.
 */
function serverThenHydrate(saved: string[] | null): {
  container: HTMLElement;
  root: Root;
  recovered: string[];
  serverNodes: Element[];
} {
  clearStoredDashboardOrder(KEY);
  const html = renderToString(board);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const serverNodes = Array.from(container.querySelectorAll("[data-testid^='body-']"));

  if (saved) localStorage.setItem(`canvas-dashboard-order:${KEY}`, JSON.stringify(saved));
  const recovered: string[] = [];
  let root!: Root;
  act(() => {
    root = hydrateRoot(container, board, { onRecoverableError: (error) => { recovered.push(String(error)); } });
  });
  return { container, root, recovered, serverNodes };
}

describe("DashboardGrid hydration", () => {
  afterEach(() => clearStoredDashboardOrder(KEY));

  it("hydrates a board whose saved layout differs from the server's markup, without rebuilding it", () => {
    const { container, root, recovered, serverNodes } = serverThenHydrate(["c", "b", "a"]);
    try {
      // The server shipped the declared order, so the hydration render must reproduce exactly
      // that: no mismatch, and the very DOM nodes the server sent still on the page. React moves
      // them into the saved order in the commit after, so identity is the thing to assert (a
      // rebuilt subtree would be new nodes), not their positions.
      expect(recovered).toEqual([]);
      const live = Array.from(container.querySelectorAll("[data-testid^='body-']"));
      expect(live.length).toBe(3);
      expect(live.filter((node) => serverNodes.includes(node)).length).toBe(3);
      // And the saved layout still wins, one commit later.
      expect(bodyOrder(container)).toEqual(["body-c", "body-b", "body-a"]);
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });

  it("hydrates a board with nothing saved just as cleanly, and keeps the declared order", () => {
    const { container, root, recovered } = serverThenHydrate(null);
    try {
      expect(recovered).toEqual([]);
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });

  it("renders the declared order on the server, whatever a browser has saved", () => {
    localStorage.setItem(`canvas-dashboard-order:${KEY}`, JSON.stringify(["c", "b", "a"]));
    // A real server has no localStorage at all; the read is guarded, so it yields nothing there.
    // Here the storage IS reachable, which makes this the strictest form of the check: the
    // server render must ignore it and ship the declared order regardless.
    const html = renderToString(board);
    expect(html.indexOf("Revenue body")).toBeLessThan(html.indexOf("Latency body"));
  });
});
