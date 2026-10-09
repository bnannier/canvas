import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassPane, paneStyle } from "../src/style/glass-surface/glass-pane.tsx";
import { GlassBlurTargetContext } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { createCaptureTarget } from "../src/style/glass-surface/capture-target.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import { resolveMaterial, type MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";
import { useMaterialResolution, useMaterialTheme } from "../src/style/glass-surface/use-material-theme.ts";
import { innerFill, withInnerFill } from "../src/style/glass-fill.ts";
import { lightColors } from "../src/style/tokens.ts";

afterEach(cleanup);
const requested = { surface: "glass", reducedTransparency: false, increasedContrast: false } as const;
const ios: MaterialCapabilities = { platform: "ios", frost: true, liquid: true, requiresTarget: false };
// A browser that renders a CSS backdrop filter. The web's one material is the frost: it
// has no liquid tier, so every role resolves to it.
const web: MaterialCapabilities = { platform: "web", frost: true, liquid: false, requiresTarget: false };
const android: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: true };

describe("material role and capability resolution", () => {
  it("separates static roles from density on iOS and the web", () => {
    for (const capabilities of [ios, web]) {
      expect(resolveMaterial(requested, { layer: "content" }, capabilities, false).renderer).toBe("frost");
      expect(resolveMaterial(requested, { layer: "control", static: true }, capabilities, false).renderer).toBe("frost");
      expect(resolveMaterial(requested, { layer: "dense", static: true }, capabilities, false).renderer).toBe("frost");
      expect(resolveMaterial(requested, { layer: "dense" }, capabilities, false).renderer).toBe(capabilities.liquid ? "liquid" : "frost");
    }
  });
  it("requires a safe live Android target and never treats tint as material", () => {
    expect(resolveMaterial(requested, {}, android, false)).toMatchObject({ renderer: "solid", fallback: "missing-target" });
    expect(resolveMaterial(requested, {}, android, true).renderer).toBe("frost");
    expect(resolveMaterial(requested, {}, { ...android, requiresTarget: false }, false).renderer).toBe("frost");
  });
  it("uses complete solid for missing peers and preference overrides", () => {
    expect(resolveMaterial(requested, { static: true }, { ...ios, frost: false }, false).renderer).toBe("solid");
    // A browser without backdrop-filter renders no material at all, whatever the role.
    for (const options of [{}, { layer: "content" as const }, { layer: "control" as const, static: true }, { layer: "dense" as const }]) {
      expect(resolveMaterial(requested, options, { ...web, frost: false }, false)).toMatchObject({ renderer: "solid", fallback: "unavailable" });
    }
    for (const capabilities of [ios, web, android]) {
      for (const flags of [{ surface: "solid" as const }, { reducedTransparency: true }, { increasedContrast: true }]) {
        expect(resolveMaterial({ ...requested, ...flags }, {}, capabilities, true).renderer).toBe("solid");
      }
    }
  });
});

// The browser's one material question: does it render a CSS backdrop filter?
function browserSupport(enabled = true) {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => enabled }, configurable: true });
  return () => {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  };
}

// The material GlassBox paints behind a surface, found by its wrapper so a clear surface
// (which frosts nothing) counts too.
const materialsIn = (root: ParentNode) => root.querySelectorAll('[data-testid="glass-material"]');

describe("material mode changes", () => {
  it("keeps the same live editor, local state, caret and scroll in both directions", () => {
    const restore = browserSupport();
    let mounts = 0;
    function Editor() {
      const [value, setValue] = useState("draft");
      useEffect(() => { mounts += 1; }, []);
      return <TextInput accessibilityLabel="Draft" value={value} onChangeText={setValue} />;
    }
    const tree = (glass: boolean) => <ThemeProvider glass={glass} solid={!glass}>
      <GlassSurface testID="surface" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", padding: 8 }}>
        <View testID="scroller"><Editor /></View>
      </GlassSurface>
    </ThemeProvider>;
    try {
      const result = render(tree(false));
      const editor = screen.getByRole("textbox", { name: "Draft" }) as HTMLInputElement;
      const scroller = screen.getByTestId("scroller");
      editor.focus();
      fireEvent.change(editor, { target: { value: "unsaved work" } });
      editor.setSelectionRange(2, 7);
      scroller.scrollTop = 83;
      for (const glass of [true, false, true, false]) {
        result.rerender(tree(glass));
        expect(screen.getByRole("textbox", { name: "Draft" })).toBe(editor);
        expect(document.activeElement).toBe(editor);
        expect(editor.value).toBe("unsaved work");
        expect([editor.selectionStart, editor.selectionEnd]).toEqual([2, 7]);
        expect(scroller.scrollTop).toBe(83);
        expect(mounts).toBe(1);
        expect(materialsIn(result.container).length).toBe(glass ? 1 : 0);
      }
    } finally { restore(); }
  });

  // A host and its pane read one resolution: where glass is requested but cannot render,
  // the host keeps its complete solid skin and the pane renders nothing, so no raw copy of
  // the shape is painted inside it. The shape names a border width without a colour, the
  // way the Android chip skin's does: a pane that painted it would draw Android's default
  // black ring one hairline inside the host.
  function PaneHost() {
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const shape = { borderRadius: 12, borderWidth: 1 };
    const chrome = [shape, { backgroundColor: "#123456", borderColor: "#abcdef" }];
    return <View testID="host" style={paneStyle(theme, chrome)}><GlassPane static layer="control" shape={shape} testID="pane" /><Text>Readable</Text></View>;
  }

  it("keeps the host's own skin and mounts no pane when no material can render", () => {
    const restore = browserSupport(false);
    try {
      render(<ThemeProvider glass><PaneHost /></ThemeProvider>);
      const host = screen.getByTestId("host");
      expect(host.style.backgroundColor).toMatch(/18, ?52, ?86/);
      expect(host.style.borderWidth).toBe("1px");
      expect(host.style.borderColor).toMatch(/171, ?205, ?239/);
      expect(screen.queryByTestId("pane")).toBeNull();
      expect(materialsIn(host).length).toBe(0);
      expect(host.children.length).toBe(1);
    } finally { restore(); }
  });

  it("mounts exactly one material behind a host whose glass renders", () => {
    const restore = browserSupport();
    try {
      render(<ThemeProvider glass><PaneHost /></ThemeProvider>);
      const host = screen.getByTestId("host");
      // react-native-web writes `transparent` as a zero-alpha rgba.
      expect(host.style.backgroundColor).toMatch(/^rgba\(0, 0, 0, 0(\.0+)?\)$/);
      expect(host.style.borderColor).toMatch(/^rgba\(0, 0, 0, 0(\.0+)?\)$/);
      expect(screen.getByTestId("pane")).toBeDefined();
      expect(materialsIn(host).length).toBe(1);
    } finally { restore(); }
  });

  // Android's frost samples a capture target, and only an overlay outlet or a modal
  // publishes one (GlassBlurTargetContext), so an in-page surface resolves solid
  // (missing-target). Its pane must then render nothing, or the Android chip, badge and
  // kbd shapes (a border width with no colour) draw the platform's default black ring
  // inside their host; once a target is attached and can be sampled, the same host
  // mounts exactly one frost. The runtime is the web's under test, so the hook that reads
  // the platform's capabilities is handed Android's.
  it("renders no pane on Android until a capture target is ready, then mounts the frost", () => {
    const capabilities = spyOn(runtime, "useMaterialCapabilities").mockReturnValue(android);
    try {
      render(<ThemeProvider glass><PaneHost /></ThemeProvider>);
      let host = screen.getByTestId("host");
      expect(screen.queryByTestId("pane")).toBeNull();
      expect(host.style.borderColor).toMatch(/171, ?205, ?239/);
      expect(host.children.length).toBe(1);
      cleanup();

      const target = createCaptureTarget();
      render(<ThemeProvider glass><GlassBlurTargetContext.Provider value={target.ref}><PaneHost /></GlassBlurTargetContext.Provider></ThemeProvider>);
      host = screen.getByTestId("host");
      // A target that is published but not yet attached and available is no target.
      expect(screen.queryByTestId("pane")).toBeNull();
      expect(host.style.backgroundColor).toMatch(/18, ?52, ?86/);
      act(() => {
        const plane = {} as View;
        target.attach(plane);
        target.setAvailable(plane, true);
      });
      host = screen.getByTestId("host");
      expect(screen.getByTestId("pane")).toBeDefined();
      expect(materialsIn(host).length).toBe(1);
      expect(host.style.backgroundColor).toMatch(/^rgba\(0, 0, 0, 0(\.0+)?\)$/);
      // The plane going away takes the frost with it and restores the host's own skin.
      act(() => { target.attach(null); });
      expect(screen.queryByTestId("pane")).toBeNull();
      expect(screen.getByTestId("host").style.borderColor).toMatch(/171, ?205, ?239/);
    } finally { capabilities.mockRestore(); }
  });

  it("hands the host the same decision its pane and surface render from", () => {
    const seen: string[] = [];
    function Probe() {
      const options = { static: true, layer: "control" } as const;
      seen.push(`${useMaterialResolution(options).material.renderer}:${useMaterialTheme(options).surface}`);
      return <GlassSurface static layer="control" testID="surface" />;
    }
    for (const [supported, expected, materials] of [[true, "frost:glass", 1], [false, "solid:solid", 0]] as const) {
      const restore = browserSupport(supported);
      try {
        seen.length = 0;
        render(<ThemeProvider glass><Probe /></ThemeProvider>);
        expect(seen.at(-1)).toBe(expected);
        expect(materialsIn(screen.getByTestId("surface")).length).toBe(materials);
        cleanup();
      } finally { restore(); }
    }
  });

  it("uses the solid foreground/state recipe when capability is absent", () => {
    const restore = browserSupport(false);
    function Probe() {
      const theme = useMaterialTheme({ static: true });
      return <Text>{`${theme.surface}:${innerFill(theme, "muted")}`}</Text>;
    }
    try {
      render(<ThemeProvider glass><Probe /></ThemeProvider>);
      expect(screen.getByText(`solid:${lightColors.muted}`)).toBeDefined();
    } finally { restore(); }
  });

  it("keeps inner fills opaque under accessibility preferences", () => {
    const theme = { ...requested, dark: false, tokens: lightColors, increasedContrast: true };
    expect(innerFill(theme, "muted")).toBe(lightColors.muted);
    expect(withInnerFill(theme, { backgroundColor: lightColors.secondary }).backgroundColor).toBe(lightColors.secondary);
  });

  it("adds contrast boundaries to pane hosts without mounting decoration", () => {
    const media = spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("prefers-contrast"), addEventListener() {}, removeEventListener() {},
    }) as unknown as MediaQueryList);
    function Probe() {
      const theme = useTheme();
      return <View testID="host" style={paneStyle(theme, { backgroundColor: theme.tokens.card })}><GlassPane shape={{ backgroundColor: theme.tokens.card }} /></View>;
    }
    try {
      render(<ThemeProvider glass><Probe /></ThemeProvider>);
      const host = screen.getByTestId("host");
      expect(host.style.borderWidth).toBe("1px");
      expect(host.style.backgroundColor).toMatch(/255, ?255, ?255/);
      expect(host.children.length).toBe(0);
    } finally { media.mockRestore(); }
  });
});
