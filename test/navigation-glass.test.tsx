import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TextInput } from "../src/style/text.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { NavigationGlassProvider } from "../src/style/glass-surface/navigation-glass.tsx";
import { WEB_FROST, webBackdrop } from "../src/style/glass-surface/web-frost.ts";

afterEach(cleanup);

const shape = { borderRadius: 22, backgroundColor: "#ffffff", height: 44 };

describe("navigation glass material boundaries", () => {
  it("limits the optical treatment to scoped floating functional controls", async () => {
    render(<ThemeProvider light glass>
      <NavigationGlassProvider>
        <GlassSurface floating testID="navigation" style={shape} />
        <GlassSurface floating layer="dense" testID="menu" style={shape} />
        <GlassSurface testID="content" style={shape} />
      </NavigationGlassProvider>
      <GlassSurface floating testID="desktop" style={shape} />
    </ThemeProvider>);
    await waitFor(() => expect(screen.getAllByTestId("glass-navigation-optics")).toHaveLength(1));
    expect(screen.getByTestId("navigation").querySelector('[data-testid="glass-navigation-optics"]')).not.toBeNull();
    for (const id of ["menu", "desktop"]) {
      const layers = Array.from(screen.getByTestId(id).querySelector('[data-testid="glass-material"]')!.children) as HTMLElement[];
      expect(layers.some(layer => layer.style.backdropFilter === webBackdrop(WEB_FROST.blur))).toBe(true);
    }
    expect(screen.getByTestId("content").querySelector('[data-testid="glass-material"]')).toBeNull();
  });

  it("preserves the content node, focus and edits when glass falls back to solid", async () => {
    const content = <NavigationGlassProvider><GlassSurface floating style={shape}>
      <TextInput accessibilityLabel="Workspace" defaultValue="Studio" />
    </GlassSurface></NavigationGlassProvider>;
    const { rerender } = render(<ThemeProvider light glass>{content}</ThemeProvider>);
    await waitFor(() => expect(screen.getAllByTestId("glass-navigation-optics")).toHaveLength(1));
    const input = screen.getByRole("textbox", { name: "Workspace" });
    input.focus();
    fireEvent.change(input, { target: { value: "Design team" } });
    rerender(<ThemeProvider light solid>{content}</ThemeProvider>);
    expect(screen.queryByTestId("glass-navigation-optics")).toBeNull();
    expect(screen.queryByTestId("glass-material")).toBeNull();
    expect(screen.getByDisplayValue("Design team")).toBe(input);
    expect(document.activeElement).toBe(input);
    rerender(<ThemeProvider dark glass>{content}</ThemeProvider>);
    await waitFor(() => expect(screen.getAllByTestId("glass-navigation-optics")).toHaveLength(1));
    expect(screen.getByDisplayValue("Design team")).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  for (const preference of ["prefers-reduced-transparency", "prefers-contrast"]) {
    it(`keeps the complete opaque fallback under ${preference}`, async () => {
      const original = window.matchMedia.bind(window);
      const spy = spyOn(window, "matchMedia").mockImplementation(query => {
        const media = original(query);
        return { ...media, matches: query.includes(preference), media: query,
          addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {},
        } as MediaQueryList;
      });
      try {
        render(<ThemeProvider light glass><NavigationGlassProvider>
          <GlassSurface floating testID="navigation" style={shape}><TextInput accessibilityLabel="Workspace" /></GlassSurface>
        </NavigationGlassProvider></ThemeProvider>);
        await waitFor(() => expect(screen.getByTestId("navigation").style.backgroundColor).toMatch(/rgba?\(255, ?255, ?255/));
        expect(screen.queryByTestId("glass-material")).toBeNull();
        expect(screen.getByRole("textbox", { name: "Workspace" })).toBeDefined();
      } finally {
        cleanup();
        spy.mockRestore();
      }
    });
  }
});
