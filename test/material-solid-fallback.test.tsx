import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { LOOKS, lookProps } from "./fixtures/looks.ts";
import { PANE_HOSTS as HOSTS, type PaneHost as Host } from "./fixtures/pane-hosts.tsx";

// Missing material restores the complete solid treatment (CLAUDE.md, the glass model).
// Wherever glass is requested but cannot render, every surface that paints a GlassPane
// behind its content must render exactly what `<ThemeProvider solid>` renders: its own
// fill and border, and no pane. The web reproduces the state with a browser that has no
// backdrop filter; Android reaches the same resolution for every surface in the page,
// which has no capture plane it may safely sample (missing-target), and iOS for a static
// surface without expo-blur. A pane that still mounted there painted a raw copy of its
// shape inside the host: Android's default black ring where the shape names a border
// width and no colour (Chip, Badge, Kbd), a doubled hairline where it names one.
//
// Every kit file that renders a GlassPane has a host in test/fixtures/pane-hosts.tsx, so a
// new one is held to the rule from its first commit.

afterEach(cleanup);

const ROOT = join(import.meta.dir, "..");

// The browser's one material question: does it render a CSS backdrop filter?
function browserSupport(enabled: boolean) {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => enabled }, configurable: true });
  return () => {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  };
}

// React's ids (useId) count up across mounts, so two renders of one tree differ only in
// them; number each distinct id by its first appearance before comparing.
function normalized(html: string): string {
  const ids = new Map<string, string>();
  return html.replace(/«[^»]*»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `id${ids.size}`);
    return ids.get(id)!;
  });
}

function markup(host: Host, look: (typeof LOOKS)[number], glass: boolean): { html: string; materials: number } {
  const result = render(<ThemeProvider {...lookProps(look)} glass={glass} solid={!glass}>{host.node}</ThemeProvider>);
  host.act?.(result);
  const out = { html: normalized(result.container.innerHTML), materials: result.container.querySelectorAll('[data-testid="glass-material"]').length };
  result.unmount();
  return out;
}

describe("a requested glass that cannot render restores the complete solid skin", () => {
  it("has a host for every kit file that renders a GlassPane", () => {
    const panes = [...new Glob("src/**/*.tsx").scanSync(ROOT)]
      .filter((file) => !file.endsWith("glass-pane.tsx") && readFileSync(join(ROOT, file), "utf8").includes("<GlassPane"))
      .sort();
    expect(panes.length).toBeGreaterThan(40);
    expect(panes.filter((file) => !HOSTS.some((host) => host.file === file))).toEqual([]);
  });

  for (const host of HOSTS) {
    for (const look of LOOKS) {
      it(`${host.name} in ${look.name}`, () => {
        const solid = markup(host, look, false);
        const restore = browserSupport(false);
        try {
          const fallback = markup(host, look, true);
          expect(fallback.materials).toBe(0);
          expect(fallback.html).toBe(solid.html);
        } finally { restore(); }
      });
    }
  }

  it("still mounts the material where it renders, so the comparison is not vacuous", () => {
    const restore = browserSupport(true);
    try {
      for (const host of HOSTS.filter((h) => /^(Chip|Android Chip|Badge|Kbd|Input|Card|MediaObject|Stats)$/.test(h.name))) {
        expect(markup(host, LOOKS[0]!, true).materials, host.name).toBeGreaterThan(0);
      }
    } finally { restore(); }
  });
});
