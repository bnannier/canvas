import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { DECIDED_DEPRECATIONS, findFoundation, foundationCode, foundationFacts, foundationId, foundationSources, foundations, importsFoundation, importsImplementation, k12Status, namedFor, tokenPages } from "./foundations.ts";
import { components, pages } from "./inventory.ts";
import { KitGraph, MODULE_BODY, UnreadableKitModule, consumersOf, moduleFiles, moduleStem, ownersByReaders, type ConsumerCandidate } from "./kit-graph.ts";
import { FOUNDATION_PLANS, STYLE_LAYER_RENDERABLES, TOKENS_FOUNDATION } from "./plan-specifics.ts";

/** A throwaway kit: files under a temporary root, read by the same graph the facts use. */
function fixture(files: Record<string, string>): { root: string; done: () => void } {
  const root = mkdtempSync(join(tmpdir(), "canvas-kit-graph-"));
  for (const [path, source] of Object.entries(files)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), source);
  }
  return { root, done: () => rmSync(root, { recursive: true, force: true }) };
}

const KIT = {
  // The foundation, with a platform build, behind the internal hub the components import from.
  "src/style/thing.tsx": `export interface ThingProps { tone?: string }\nexport function Thing(props: ThingProps) { return null; }\nexport const unrelated = 1;\n`,
  "src/style/thing.ios.tsx": `export interface ThingProps { tone?: string }\nexport function Thing(props: ThingProps) { return null; }\nexport const unrelated = 2;\n`,
  "src/style/helper.tsx": `import { Thing } from "./thing.js";\nexport function Helper() { return <Thing />; }\nexport const plain = 3;\n`,
  "src/style/index.ts": `export * from "./thing.js";\nexport * from "./helper.js";\n`,
  // Reads it directly, through the hub.
  "src/atoms/a/a.tsx": `import { Thing } from "../../style/index.js";\nexport const A = () => <Thing />;\n`,
  // Reaches it only through a shared module's declaration.
  "src/atoms/b/b.tsx": `import { Helper } from "../../style/index.js";\nexport function B() { return <Helper />; }\n`,
  // Reaches it only through another component.
  "src/atoms/c/c.tsx": `import { A } from "../a/a.js";\nexport const C = () => <A />;\n`,
  // A type and a sibling value of the same module: neither renders the foundation.
  "src/atoms/d/d.tsx": `import { type ThingProps, unrelated, plain } from "../../style/index.js";\nexport const D = (p: ThingProps) => unrelated + plain;\n`,
  // An import shadowed by a parameter of the same name is not read.
  "src/atoms/e/e.tsx": `import { Thing } from "../../style/index.js";\nexport function E({ Thing }: { Thing: () => null }) { return <Thing />; }\n`,
  // A member read off a namespace import.
  "src/atoms/f/f.tsx": `import * as style from "../../style/index.js";\nexport const F = () => <style.Thing />;\n`,
  // A module's top-level statement reads it: importing any of its names runs that.
  "src/atoms/g/g.tsx": `import { Thing } from "../../style/index.js";\nexport const G = 1;\n(G as unknown as { thing: unknown }).thing = Thing;\n`,
  // The iOS build alone: a platform build counts.
  "src/atoms/h/h.ios.tsx": `import { Thing } from "../../style/thing.js";\nexport const H = () => <Thing />;\n`,
};

const candidates = (dirs: string[]): ConsumerCandidate[] =>
  dirs.map((d) => ({ slug: d, modules: [`src/atoms/${d}/${d}${d === "h" ? ".ios" : ""}.tsx`], sourceDir: `src/atoms/${d}` }));

describe("the consumer reader (tools/audit/kit-graph.ts)", () => {
  it("names a module on every platform, and follows a name through the hub to its declarations", () => {
    const kit = fixture(KIT);
    try {
      expect(moduleFiles(kit.root, "src/style/index.ts", "./thing.js")).toEqual(["src/style/thing.tsx", "src/style/thing.ios.tsx"]);
      expect(moduleFiles(kit.root, "src/atoms/a/a.tsx", "../../style/index.js")).toEqual(["src/style/index.ts"]);
      expect(moduleFiles(kit.root, "src/style/index.ts", "./missing.js")).toEqual([]);
      expect(moduleStem("src/style/glass-surface/glass-surface.ios.tsx")).toBe("src/style/glass-surface/glass-surface");
      const graph = new KitGraph(kit.root);
      expect(graph.exportOrigins("src/style/index.ts", "Thing")).toEqual([
        { file: "src/style/thing.tsx", name: "Thing" },
        { file: "src/style/thing.ios.tsx", name: "Thing" },
      ]);
      // A type is no value, and a type is found only when asked for.
      expect(graph.exportOrigins("src/style/index.ts", "ThingProps")).toEqual([]);
      expect(graph.exportOrigins("src/style/index.ts", "ThingProps", "type")).toEqual([
        { file: "src/style/thing.tsx", name: "ThingProps" },
        { file: "src/style/thing.ios.tsx", name: "ThingProps" },
      ]);
      expect(graph.exportChain("src/style/index.ts", "Helper")).toEqual(["src/style/helper.tsx", "src/style/index.ts"]);
      expect(graph.exportNames("src/style/index.ts")).toEqual(["Helper", "Thing", "ThingProps", "plain", "unrelated"]);
    } finally {
      kit.done();
    }
  });

  it("tiers the consumers: directly, through shared modules, through other components, and never through a type, a sibling or a shadowed name", () => {
    const kit = fixture(KIT);
    try {
      const graph = new KitGraph(kit.root);
      const targets = graph.exportOrigins("src/style/index.ts", "Thing").filter((o) => "file" in o) as { file: string; name: string }[];
      const consumers = consumersOf(graph, targets, candidates(["a", "b", "c", "d", "e", "f", "g", "h"]));
      expect(consumers).toEqual([
        { slug: "a", tier: "direct", through: ["Thing"] },
        { slug: "f", tier: "direct", through: ["Thing"] },
        { slug: "g", tier: "direct", through: ["Thing"] },
        { slug: "h", tier: "direct", through: ["Thing"] },
        { slug: "b", tier: "shared", through: ["`Helper` (src/style/helper.tsx)"] },
        { slug: "c", tier: "component", through: ["a"] },
      ]);
      // The module body is a node of its own, read by every declaration of the module.
      expect(graph.edges().get("src/atoms/g/g.tsx#G")).toContain(`src/atoms/g/g.tsx#${MODULE_BODY}`);
    } finally {
      kit.done();
    }
  });

  it("tells a foundation's own private declaration from a shared one by its readers, and lets a relay carry it", () => {
    const kit = fixture({
      // The seam: a context only its foundation provides and reads.
      "src/style/seam.ts": `import { createContext } from "react";\nexport const SeamContext = createContext<string | null>(null);\n`,
      "src/style/util.ts": `export const both = 1;\nexport const hidden = 2;\n`,
      // The foundation: provides and reads the seam, and reads two helpers.
      "src/style/thing.tsx": `import { useContext } from "react";\nimport { SeamContext } from "./seam.js";\nimport { both, hidden } from "./util.js";\nexport function Thing({ value }: { value: string }) { return <SeamContext.Provider value={value}>{both}{hidden}</SeamContext.Provider>; }\nexport function useThing() { return useContext(SeamContext); }\n`,
      // A shared layer that relays the seam into what it publishes: it reads the context and provides it again.
      "src/style/layer.tsx": `import { useContext } from "react";\nimport { SeamContext } from "./seam.js";\nexport function relay(children: unknown) { const value = useContext(SeamContext); return <SeamContext.Provider value={value}>{children}</SeamContext.Provider>; }\n`,
      // Another foundation: publishes through the layer, and reads one of the helpers too.
      "src/style/other.tsx": `import { relay } from "./layer.js";\nimport { both } from "./util.js";\nexport function Other() { return relay(both); }\n`,
      // Shared vocabulary a component reads directly, which reads the other helper.
      "src/style/vocab.ts": `import { hidden } from "./util.js";\nexport function useVocab() { return hidden; }\n`,
      "src/atoms/a/a.tsx": `import { Other } from "../../style/other.js";\nexport const A = () => <Other />;\n`,
      "src/atoms/b/b.tsx": `import { useVocab } from "../../style/vocab.js";\nexport const B = () => useVocab();\n`,
    });
    try {
      const graph = new KitGraph(kit.root);
      const id = (file: string, name: string) => `src/style/${file}#${name}`;
      expect([...graph.relays(id("layer.tsx", "relay"))]).toEqual([id("seam.ts", "SeamContext")]);
      // Providing a context without reading it is not relaying it.
      expect([...graph.relays(id("thing.tsx", "Thing"))]).toEqual([]);
      const seed = new Map([
        [id("thing.tsx", "Thing"), new Set(["thing"])],
        [id("thing.tsx", "useThing"), new Set(["thing"])],
        [id("other.tsx", "Other"), new Set(["other"])],
      ]);
      const within = new Set([id("seam.ts", "SeamContext"), id("layer.tsx", "relay"), id("util.ts", "both"), id("util.ts", "hidden")]);
      const owners = ownersByReaders(graph, seed, within);
      // The seam is the foundation's: the layer only relays it.
      expect([...owners.get(id("seam.ts", "SeamContext"))!]).toEqual(["thing"]);
      expect([...owners.get(id("layer.tsx", "relay"))!]).toEqual(["other"]);
      // Read by two foundations, or by vocabulary a component reads: nobody's.
      expect([...owners.get(id("util.ts", "both"))!]).toEqual([]);
      expect([...owners.get(id("util.ts", "hidden"))!]).toEqual([]);
      // A component reaches the foundation through the relay once the seam is a target.
      const targets = [{ file: "src/style/thing.tsx", name: "Thing" }, { file: "src/style/seam.ts", name: "SeamContext" }];
      expect(consumersOf(graph, targets, [{ slug: "a", modules: ["src/atoms/a/a.tsx"], sourceDir: "src/atoms/a" }, { slug: "b", modules: ["src/atoms/b/b.tsx"], sourceDir: "src/atoms/b" }])).toEqual([
        { slug: "a", tier: "shared", through: ["`Other` (src/style/other.tsx)"] },
      ]);
    } finally {
      kit.done();
    }
  });

  it("fails on what it cannot follow, rather than drop an edge", () => {
    const relative = fixture({ ...KIT, "src/atoms/x/x.tsx": `export const X = () => require("./y");\n` });
    try {
      expect(() => new KitGraph(relative.root).edges()).toThrow(UnreadableKitModule);
      expect(() => new KitGraph(relative.root).edges()).toThrow(/src\/atoms\/x\/x\.tsx:1: a dynamic import of "\.\/y"/);
    } finally {
      relative.done();
    }
    const missing = fixture({ ...KIT, "src/atoms/x/x.tsx": `import { Gone } from "./gone.js";\nexport const X = Gone;\n` });
    try {
      expect(() => new KitGraph(missing.root).edges()).toThrow(/"\.\/gone\.js" names no TypeScript module on any platform/);
    } finally {
      missing.done();
    }
    // A package is outside the kit, and a dynamic import of one is not the kit's.
    const pkg = fixture({ ...KIT, "src/atoms/x/x.tsx": `import { View } from "react-native";\nexport const X = () => [View, require("expo-blur")];\n` });
    try {
      expect(() => new KitGraph(pkg.root).edges()).not.toThrow();
    } finally {
      pkg.done();
    }
  });
});

describe("the Foundations tier (tools/audit/foundations.ts)", () => {
  const sources = foundationSources(ROOT);
  const facts = (name: string) => foundationFacts(findFoundation(name)!, { tests: [] }, sources);
  const consumer = (name: string, slug: string) => facts(name).consumers.find((c) => c.slug === slug);

  it("is the style-layer renderables and the design tokens, each with a kebab id no component or page takes, and a plan row", () => {
    const list = foundations();
    expect(list.map((f) => f.name)).toEqual([...STYLE_LAYER_RENDERABLES, TOKENS_FOUNDATION].sort((a, b) => a.localeCompare(b)));
    expect(list).toHaveLength(15);
    expect(foundationId("GlassModalBlurTarget")).toBe("glass-modal-blur-target");
    expect(foundationId("ThemeProvider")).toBe("theme-provider");
    expect(foundationId("Tokens")).toBe("tokens");
    expect(findFoundation("GlassPane")).toEqual(findFoundation("glass-pane"));
    const taken = new Set([...components().map((c) => c.slug), ...pages().flatMap((p) => [p.id, p.slug])]);
    for (const f of list) expect(taken.has(f.id)).toBe(false);
    expect(Object.keys(FOUNDATION_PLANS).sort()).toEqual(list.map((f) => f.name).sort());
    expect(tokenPages()).toEqual(["/tokens/colors", "/tokens/layout", "/tokens/spacing", "/tokens/typography"]);
  });

  it("finds GlassSurface's consumers in the source: Card and Dialog directly, Button through GlassPane", () => {
    expect(consumer("GlassSurface", "card")).toEqual({ slug: "card", tier: "direct", through: ["GlassSurface"] });
    expect(consumer("GlassSurface", "dialog")).toEqual({ slug: "dialog", tier: "direct", through: ["GlassSurface"] });
    expect(consumer("GlassSurface", "button")).toMatchObject({ tier: "shared", through: expect.arrayContaining(["`GlassPane` (src/style/glass-surface/glass-pane.tsx)"]) });
    // React Native's own View renders through nothing of the kit's.
    expect(consumer("GlassSurface", "view")).toBeUndefined();
    const glass = facts("GlassSurface");
    expect(glass.homes).toEqual(["src/style/glass-surface/glass-surface.android.tsx", "src/style/glass-surface/glass-surface.ios.tsx", "src/style/glass-surface/glass-surface.tsx"]);
    expect(glass.exports.map((e) => [e.name, e.k12])).toEqual([["GlassSurface", "deprecated alias to come (K12-2)"]]);
  });

  it("finds AnchoredOverlay's consumers: Popover, Dropdown and Select directly, AvatarMenu's Avatar through Dropdown", () => {
    for (const slug of ["popover", "dropdown", "select"]) expect(consumer("AnchoredOverlay", slug)).toMatchObject({ tier: "direct", through: expect.arrayContaining(["AnchoredOverlay"]) });
    expect(consumer("AnchoredOverlay", "avatar")).toEqual({ slug: "avatar", tier: "component", through: ["dropdown"] });
    // Tooltip opens in flow, not through the anchored overlay (P3e).
    expect(consumer("AnchoredOverlay", "tooltip")).toBeUndefined();
    const overlay = facts("AnchoredOverlay");
    expect(overlay.exports.map((e) => e.name)).toEqual(["AnchoredOverlay", "AnchoredOverlayProps", "placeOverlay", "useOverlayAnchor", "useOverlaySide"]);
    expect(overlay.docs).toEqual([{ route: "foundation", documents: [], planned: ["AnchoredOverlay", "AnchoredOverlayProps", "placeOverlay", "useOverlayAnchor", "useOverlaySide"], page: null, exists: false }]);
  });

  it("orders a Capture through list by tier and adds the pages whose entry names an export", () => {
    const theme = facts("ThemeProvider");
    const tiers = theme.consumers.map((c) => c.tier);
    expect(tiers).toEqual([...tiers].sort((a, b) => ["direct", "shared", "component"].indexOf(a) - ["direct", "shared", "component"].indexOf(b)));
    expect(theme.captureThrough.components).toEqual(theme.consumers.map((c) => c.slug));
    expect(theme.captureThrough.pages).toEqual(["pattern-accessibility", "pattern-glass"]);
    expect(theme.notCaptured.map((d) => d.route)).toEqual(["theming"]);
    // Two foundations of one module share its exports and its consumers.
    expect(facts("Portal").exports).toEqual(facts("OverlayProvider").exports);
    expect(facts("LabelContent").consumers).toEqual(facts("FloatingLabel").consumers);
  });

  it("reads the design tokens from the tokens/* pages the manifest routes them to", () => {
    const tokens = facts("Tokens");
    expect(tokens.homes).toEqual(tokenPages());
    expect(tokens.exports.map((e) => e.name)).toEqual(expect.arrayContaining(["spacing", "radius", "lightColors", "breakpoints", "typeface"]));
    expect(tokens.notCaptured.map((d) => d.route)).toEqual(["tokens/colors", "tokens/layout", "tokens/spacing", "tokens/typography"]);
    expect(tokens.materials).toBeNull();
    expect(consumer("Tokens", "card")?.tier).toBe("direct");
  });

  it("states the K12-2 status from the manifest and the owner's decisions", () => {
    expect(k12Status("GlassPane", { kind: "internal-by-accident" })).toBe("deprecated alias to come (K12-2)");
    expect(k12Status("shadow", { kind: "utility" })).toBe("deprecated alias to come (K12-2 OD4)");
    expect(k12Status("fontSize", { kind: "token" })).toBe("deprecated alias to come (K12-7 OD3)");
    expect(k12Status("HUE_WASH", { kind: "deprecated-alias", replacement: "statusColors" })).toBe("deprecated alias already (use `statusColors`)");
    expect(k12Status("ThemeProvider", { kind: "component" })).toBe("public");
    expect(Object.keys(DECIDED_DEPRECATIONS).sort()).toEqual(["ShadowLevel", "StyleSheet", "customShadow", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "shadow", "useWindowDimensions"]);
  });

  it("credits a test with a foundation by the names it imports, not by its module path", () => {
    expect(importsFoundation({ names: new Set(["GlassModalBlurTarget"]) }, ["GlassModalBlurTarget"])).toBe(true);
    expect(importsFoundation({ names: new Set(["brandTint"]) }, ["GlassModalBlurTarget"])).toBe(false);
  });

  it("carries BreakpointOverride's seam: the portaled overlays that resolve its override are its consumers", () => {
    const override = facts("BreakpointOverride");
    expect(override.sourceFiles).toEqual(["src/style/breakpoint-override.ts", "src/style/responsive.tsx"]);
    expect(override.seams).toContainEqual({ file: "src/style/breakpoint-override.ts", name: "BreakpointOverrideContext" });
    // The overlay layer relays the context into every portal, so what AnchoredOverlay and
    // Portal publish resolves the override too.
    const overlays = ["autocomplete", "button-group", "dropdown", "popover", "select", "alert-dialog", "phone-input", "calendar", "command", "dialog", "row-menu", "toast"];
    for (const slug of overlays) expect(consumer("BreakpointOverride", slug)?.tier).toBe("shared");
    expect(consumer("BreakpointOverride", "dropdown")?.through).toEqual(["`AnchoredOverlay` (src/style/anchored-overlay.tsx)"]);
    expect(consumer("BreakpointOverride", "dialog")?.through).toEqual(["`Portal` (src/style/portal.tsx)"]);
    for (const slug of ["avatar", "field", "board"]) expect(consumer("BreakpointOverride", slug)?.tier).toBe("component");
    expect(override.captureThrough.components).toHaveLength(29);
    // The layer itself is Portal's and AnchoredOverlay's both, so it is a seam of neither,
    // and a seam never leaks one foundation's consumers into another's.
    const code = foundationCode(sources);
    const seamNames = (id: string) => code.get(id)!.seams.map((s) => `${s.file}#${s.name}`);
    for (const id of ["portal", "anchored-overlay"]) expect(seamNames(id)).not.toContain("src/style/overlay-layer.tsx#usePortalMount");
    expect(consumer("Portal", "card")).toBeUndefined();
    expect(facts("Portal").consumers).toHaveLength(19);
  });

  it("lists a foundation's implementation under its Source files, and credits the tests of it", () => {
    const glass = facts("GlassSurface");
    for (const file of ["src/style/glass-surface/glass-surface.shared.tsx", "src/style/glass-surface/material-runtime.ts", "src/style/glass-surface/material-runtime.ios.ts", "src/style/glass-surface/material-runtime.android.ts", "src/style/glass-surface/web-frost.ts"]) {
      expect(glass.sourceFiles).toContain(file);
    }
    const code = foundationCode(sources).get("glass-surface")!;
    // test/glass-surface.test.ts tests the shell's helpers, imported by name from its module.
    expect(importsImplementation(sources.kit, { names: new Set(["specularRim", "splitSurfaceStyle"]), modules: ["src/style/glass-surface/glass-surface.shared.tsx"] }, code.implementation)).toBe(true);
    expect(importsImplementation(sources.kit, { names: new Set(["specularRim"]), modules: ["src/style/tokens.ts"] }, code.implementation)).toBe(false);
    // test/anchored-overlay-dismissal.test.tsx tests AnchoredOverlay through its consumers, and is named for it.
    expect(namedFor("test/anchored-overlay-dismissal.test.tsx", { id: "anchored-overlay" })).toBe(true);
    expect(namedFor("test/glass-surface.test.ts", { id: "glass-surface" })).toBe(true);
    expect(namedFor("test/glass-surfaces.test.ts", { id: "glass-surface" })).toBe(false);
  });
});
