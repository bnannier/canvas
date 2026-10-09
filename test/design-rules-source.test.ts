import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join, relative as relativePath } from "node:path";
import { Glob } from "bun";
import ts from "typescript";
import { ICON_STROKE_WIDTH } from "../src/atoms/icon/icon.stroke.ts";

// Design rules, source side: the handful that are properties of the code itself
// rather than of a token or a skin object.
//
// Each one is a defect that is easy to introduce, invisible in review, and cheap to
// detect: a font size too small to read, a z-index picked out of the air, a second
// icon stroke weight, an animation long enough to feel like a hang.
//
// Scope is src/**/*.ts(x). Markdown is excluded on purpose: a docs example is allowed
// to demonstrate the wrong thing inside a "Don't" fence, and one does (the Calendar
// page crams event titles into 7px slivers to show exactly why not).

const ROOT = join(import.meta.dir, "..");

const sources = [...new Glob("src/**/*.{ts,tsx}").scanSync(ROOT)]
  .filter((f) => !f.endsWith(".d.ts"))
  .sort()
  .map((file) => ({ file, text: readFileSync(join(ROOT, file), "utf8") }));

it("finds the kit source", () => {
  expect(sources.length).toBeGreaterThan(200);
});

describe("text stays legible", () => {
  // 10px is the floor the platforms themselves set: it is the iOS tab-bar label size
  // and sits just under Material's 12sp label-small. Below it a label stops being
  // readable at arm's length and starts being decoration. Markdown is out of scope on
  // purpose, since a docs example is allowed to demonstrate the wrong thing inside a
  // "Don't" fence, and the Calendar page does exactly that with 7px event slivers.
  const FLOOR = 10;

  it(`no rendered text is smaller than ${FLOOR}px`, () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/fontSize:\s*([\d.]+)/g)) {
          if (Number(m[1]) < FLOOR) offenders.push(`${file}:${i + 1} fontSize ${m[1]}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("tabular figures", () => {
  // react-native-web silently drops `fontVariant`, so the React Native spelling is a
  // no-op in a browser. src/style/numerals.ts is the one place that knows this; a raw
  // fontVariant anywhere else is a style that works on two platforms out of three.
  it("go through the helper, never the raw style prop", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (file === "src/style/numerals.ts") continue;
      text.split("\n").forEach((line, i) => {
        if (/\bfontVariant\b/.test(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("layering", () => {
  // The CSS hand-off documents a deliberately shallow scale (10 raised, 40 dropdown,
  // 50 overlay) and every in-tree layer uses it. The two exceptions are the portal
  // outlets, which are not on that scale at all: they are full-screen React Native
  // hosts that must sit above an app's own content, and they never coexist with a
  // CSS z-index. An arbitrary 9999 is the defect this keeps out.
  const ALLOWED = new Set([1, 10, 40, 50, 900, 1000]);
  const OUTLETS: Record<string, number> = {
    "src/style/portal.tsx": 1000,
    "src/organisms/drag-drop/drag-drop.shared.tsx": 900,
  };

  it("every z-index comes from the scale, or is a named portal outlet", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/zIndex:\s*(\d+)/g)) {
          const value = Number(m[1]);
          if (!ALLOWED.has(value)) offenders.push(`${file}:${i + 1} zIndex ${value}`);
          if (value > 50 && OUTLETS[file] !== value) {
            offenders.push(`${file}:${i + 1} zIndex ${value} is above the scale but is not a declared outlet`);
          }
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("one icon stroke", () => {
  it("is declared once and drawn nowhere else", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      // Chart marks set their own stroke widths: a series line, an axis rule and a
      // pie separator are data, not iconography.
      if (file.startsWith("src/charts/")) continue;
      if (file === "src/atoms/icon/icon.stroke.ts") continue;
      text.split("\n").forEach((line, i) => {
        if (/strokeWidth[=:]\s*\{?\s*[\d.]/.test(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("is the Lucide-matching weight the glyph set was drawn at", () => {
    expect(ICON_STROKE_WIDTH).toBe(1.75);
  });

  it("is what the raster generator bakes into the native menu glyphs", () => {
    // A native iOS UIMenu cannot render SVG, so tools/rastergen bakes PNGs. Those
    // glyphs sit beside live Icons in the same menu, so a second weight there would
    // be visible in the one place it is hardest to notice in review.
    const generator = readFileSync(join(ROOT, "tools", "rastergen", "generate.ts"), "utf8");
    expect(generator).toContain("ICON_STROKE_WIDTH");
    expect(generator).not.toMatch(/stroke-width="[\d.]/);
  });
});

describe("animation length", () => {
  // A transition under 100ms is a jump; over 700ms the interface feels like it is
  // waiting on something. Loops are a different thing entirely: a spinner revolution,
  // an indeterminate progress sweep and a caret's blink cycle are paced to read as
  // continuous motion, and a clock driver has no duration of its own.
  const LOOPS = new Set([
    "src/atoms/spinner/spinner.shared.tsx",
    "src/atoms/progress/progress.shared.tsx",
    "src/atoms/skeleton/skeleton.shared.tsx",
    "src/atoms/input-otp/input-otp.shared.tsx",
    "src/style/loop-native.ts",
  ]);

  it("every transition lands between 100ms and 700ms", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (LOOPS.has(file)) continue;
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/duration:\s*(\d+)\b/g)) {
          const ms = Number(m[1]);
          if (ms < 100 || ms > 700) offenders.push(`${file}:${i + 1} duration ${ms}ms`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it("every loop runs on the native driver and holds one timing", () => {
    // Under the New Architecture a JS-driven frame is a Fabric shadow-tree commit per
    // animated view, priced by the size of the whole tree, so a looping JS animation
    // saturates the JS thread of an idle screen (the docs app measured 150% CPU and rAF
    // near 3 frames per second before its loops moved to the native driver; see
    // src/style/motion.ts). A loop therefore gates its driver on supportsNativeDriver,
    // never a literal, and shapes its cycle with an easing: React Native refuses an
    // Animated.sequence inside a native loop and Animated.delay hardcodes the JS driver.
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (!text.includes("Animated.loop(")) continue;
      text.split("\n").forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, "");
        if (/useNativeDriver:\s*(true|false)\b/.test(code)) offenders.push(`${file}:${i + 1} literal driver flag in a looping file`);
        if (/Animated\.(sequence|delay|parallel|stagger)\(/.test(code)) offenders.push(`${file}:${i + 1} composite in a looping file`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("linear easing is reserved for the loops that need it", () => {
    // Linear on a transition reads mechanical; linear on a rotating spinner is the
    // only thing that keeps it from stuttering once per revolution.
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (LOOPS.has(file)) continue;
      if (text.includes("Easing.linear")) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("the brand is Dark Factory's", () => {
  // The kit took Dark Factory's look on 2026-09-23 (CLAUDE.md, "Design language"), and the
  // migration rewrote values while the comments describing them kept naming the brand they
  // replaced: its corners that were no longer drawn, an "indigo" primary that is violet. A
  // comment that names the old brand is wrong twice, about the brand and usually about the
  // number beside it, so neither may return. Indigo stays a palette hue: a palette step, the
  // deprecated orb key, a hue name in quotes, and Chip's `indigo` prop. This file holds the
  // patterns themselves, so it is the one file not scanned, and it spells the old brand's
  // name in two halves so that a search for the name finds nothing under src/, styles/ or
  // test/.
  const SELF = "test/design-rules-source.test.ts";
  const OLD_BRAND = new RegExp("risk" + "ora", "i");
  const files = [...new Glob("{src,styles,test}/**/*.{ts,tsx,md,css,html}").scanSync(ROOT)]
    .filter((file) => file !== SELF)
    .sort()
    .map((file) => ({ file, text: readFileSync(join(ROOT, file), "utf8") }));
  // Each hue-name form is struck from the line before looking, so a line that names the
  // hue AND calls the brand indigo still fails.
  const HUE_NAMES: [RegExp, string][] = [
    [/\bindigo-\d+/gi, ""],
    [/orb-indigo/gi, ""],
    [/["'`]indigo["'`]/gi, ""],
    [/\bindigo\?:/g, ""],
    [/(<Chip\b[^>]*?)\bindigo\b/g, "$1"],
    [/^\s*\/\/\s*indigo\s*$/gi, ""],
  ];
  const namesTheBrandIndigo = (line: string) => /indigo/i.test(HUE_NAMES.reduce((rest, [form, keep]) => rest.replace(form, keep), line));

  it("scans the kit, the hand-off and the tests", () => {
    expect(files.length).toBeGreaterThan(800);
  });

  it("tells a hue name from the brand", () => {
    expect(namesTheBrandIndigo("  \"indigo-500\": \"#6366f1\",")).toBe(false);
    expect(namesTheBrandIndigo("  --indigo-500:#6366f1;--indigo-600:#4f46e5;")).toBe(false);
    expect(namesTheBrandIndigo("  <Chip indigo>Frontend</Chip>")).toBe(false);
    expect(namesTheBrandIndigo("  indigo?: boolean;")).toBe(false);
    expect(namesTheBrandIndigo("// the selected day fills with the indigo `primary` token")).toBe(true);
    expect(namesTheBrandIndigo("// a `primary` indigo Confirm capsule beside an \"indigo\" chip")).toBe(true);
  });

  it("never names the brand it replaced", () => {
    const offenders: string[] = [];
    for (const { file, text } of files) {
      text.split("\n").forEach((line, i) => {
        if (OLD_BRAND.test(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("names indigo only as a palette hue, never as the primary", () => {
    const offenders: string[] = [];
    for (const { file, text } of files) {
      text.split("\n").forEach((line, i) => {
        if (namesTheBrandIndigo(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("widths come from the parent", () => {
  // A component never renders AT a width of its own (src/style/sizing.ts): it is
  // FILL or HUG and the parent layout container provides the bounds. The pattern
  // this keeps out is the pre-layout-tier idiom `{ width: <px>, maxWidth: "100%" }`
  // on a component root (a fixed desktop width that shrinks in narrower parents),
  // which is how every field, dialog, and chart once defended itself against a
  // content-sized parent. The exceptions are the bounds providers themselves: the
  // shells that own a rail width (Sidebar, FilterPanel), whose width IS the layout.
  const SHELLS = new Set([
    "src/organisms/sidebar/sidebar.styles.ts",
    "src/organisms/filter-panel/filter-panel.styles.ts",
  ]);

  it("no component renders at a fixed width capped at 100%", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (SHELLS.has(file)) continue;
      text.split("\n").forEach((line, i) => {
        if (/\bwidth:(?!\s*"100%")[^,}]+,\s*maxWidth:\s*"100%"/.test(line)) offenders.push(`${file}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("every numeric maxWidth in the kit is a step of the width scale", () => {
    const steps = new Set([192, 256, 320, 384, 448, 512, 576, 672, 768, 896, 1024, 1152, 1280]);
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/maxWidth:\s*(\d+)/g)) {
          if (!steps.has(Number(m[1]))) offenders.push(`${file}:${i + 1} maxWidth ${m[1]}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("a pane and its host read one material", () => {
  // A node that paints a GlassPane behind its content drops its own fill and border
  // under glass (`paneStyle`), and the pane mounts only where its material renders. Both
  // must answer from the resolved material: a host that asked `useTheme()` would drop its
  // fill on Android in the page, where glass is requested but resolves solid, and leave a
  // bare box with no pane behind it. So every `paneStyle` theme comes from
  // `useMaterialTheme` or `useTextEntryMaterial` (src/style/glass-surface/use-material-theme.ts),
  // followed through the file's own bindings (`const { theme } = entryMaterial`); a chain
  // that ends at a parameter (a chart frame handed its setup) needs the file to resolve
  // the material itself, and one that reaches `useTheme()` is the defect.
  const MATERIAL_HOOK = /^use(MaterialTheme|TextEntryMaterial)\(/;
  const REQUESTED_THEME = /^useTheme\(/;

  // The right-hand side of the nearest binding of `name` before `at`, or null.
  function bindingOf(text: string, name: string, at: number): string | null {
    const pattern = new RegExp(`const\\s+(?:${name}\\b|\\{[^}]*\\b${name}\\b[^}]*\\})\\s*=\\s*([^;\\n]+)`, "g");
    let rhs: string | null = null;
    for (const match of text.matchAll(pattern)) {
      if (match.index! < at) rhs = match[1]!.trim();
    }
    return rhs;
  }

  // Whether an argument (`theme`, `material.theme`) names a resolved material theme.
  function resolved(text: string, argument: string, at: number): boolean {
    let name = argument.split(".")[0]!;
    for (let hop = 0; hop < 4; hop++) {
      const rhs = bindingOf(text, name, at);
      if (rhs == null) return MATERIAL_HOOK.test(text.match(/\buse(MaterialTheme|TextEntryMaterial)\(/)?.[0] ?? "");
      if (MATERIAL_HOOK.test(rhs)) return true;
      if (REQUESTED_THEME.test(rhs) || !/^\w+$/.test(rhs)) return false;
      name = rhs;
    }
    return false;
  }

  it("every paneStyle theme comes from the resolved material", () => {
    const calls: string[] = [];
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (file === "src/style/glass-surface/glass-pane.tsx") continue;
      for (const match of text.matchAll(/\bpaneStyle\(\s*([\w.]+)\s*,/g)) {
        const line = text.slice(0, match.index).split("\n").length;
        calls.push(`${file}:${line}`);
        if (!resolved(text, match[1]!, match.index!)) offenders.push(`${file}:${line} paneStyle(${match[1]}, ...)`);
      }
    }
    expect(calls.length).toBeGreaterThan(60);
    expect(offenders).toEqual([]);
  });

  // Reading one hook is not enough: a GlassPane resolves its own options (`static`,
  // `layer`), so the host's paneStyle theme and its pane must ask for the same density,
  // the one thing `resolveMaterial` decides from (`static`, else the content layer).
  // Where they differ the two answers split on a platform that renders one density and
  // not the other (iOS 26 with expo-glass-effect but no expo-blur renders Liquid Glass
  // for a functional surface and the solid skin for a static one): the host drops its
  // fill with no pane behind it, or keeps its skin with a pane painted inside. A pane
  // that spreads a text-entry material's `paneProps` asks what its theme asked by
  // construction, so it only has to spread the hook's own. Each pane is read against
  // its component, the nearest enclosing function that calls a material hook, and the
  // densities that component's paneStyle themes resolve; a pane whose component calls
  // none (a chart frame handed its setup) is read against the file's hooks.
  type Hook = { call: ts.CallExpression; entry: boolean; densities: Set<string> };
  const HOOKS = new Set(["useMaterialTheme", "useTextEntryMaterial"]);
  const asHook = (node: ts.Node | undefined): ts.CallExpression | null =>
    node && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && HOOKS.has(node.expression.text) ? node : null;
  const valueOf = (expression: ts.Expression): string =>
    expression.kind === ts.SyntaxKind.TrueKeyword ? "true" : expression.kind === ts.SyntaxKind.FalseKeyword ? "false" : `expr:${expression.getText()}`;
  const layerDensities = (layer: ts.Expression | undefined): Set<string> => {
    if (!layer) return new Set(["false"]);
    if (ts.isStringLiteral(layer)) return new Set([String(layer.text === "content")]);
    if (ts.isParenthesizedExpression(layer)) return layerDensities(layer.expression);
    if (ts.isConditionalExpression(layer)) return new Set([...layerDensities(layer.whenTrue), ...layerDensities(layer.whenFalse)]);
    return new Set([`layer:${layer.getText()}`]);
  };
  function hookOf(call: ts.CallExpression): Hook {
    if ((call.expression as ts.Identifier).text === "useTextEntryMaterial") return { call, entry: true, densities: new Set(["text-entry"]) };
    const options = call.arguments[0];
    if (!options) return { call, entry: false, densities: new Set(["false"]) };
    if (!ts.isObjectLiteralExpression(options)) return { call, entry: false, densities: new Set([`expr:${options.getText()}`]) };
    const option = (name: string) => options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === name)?.initializer;
    const stable = option("static");
    return { call, entry: false, densities: stable ? new Set([valueOf(stable)]) : layerDensities(option("layer")) };
  }
  // Every `const name = init` and `const { a, b: c } = init` in `scope`, by bound name.
  function bindingsIn(scope: ts.Node): Map<string, ts.Expression> {
    const bound = new Map<string, ts.Expression>();
    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && node.initializer) {
        if (ts.isIdentifier(node.name)) bound.set(node.name.text, node.initializer);
        else if (ts.isObjectBindingPattern(node.name)) {
          for (const element of node.name.elements) if (ts.isIdentifier(element.name)) bound.set(element.name.text, node.initializer);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(scope);
    return bound;
  }
  // The material hook an expression (`theme`, `material.theme`, `entryMaterial.paneProps`)
  // comes from, followed through the scope's own bindings.
  function hookBehind(expression: ts.Expression, bound: Map<string, ts.Expression>): ts.CallExpression | null {
    let node: ts.Expression = expression;
    for (let hop = 0; hop < 6; hop++) {
      const call = asHook(node);
      if (call) return call;
      while (ts.isPropertyAccessExpression(node)) node = node.expression;
      if (!ts.isIdentifier(node)) return null;
      const next = bound.get(node.text);
      if (!next) return null;
      node = next;
    }
    return null;
  }
  function paneDensityMismatches(file: string, text: string): string[] {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fileHooks: Hook[] = [];
    const panes: ts.JsxOpeningLikeElement[] = [];
    const visit = (node: ts.Node) => {
      const call = asHook(node);
      if (call) fileHooks.push(hookOf(call));
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText() === "GlassPane") panes.push(node);
      ts.forEachChild(node, visit);
    };
    visit(source);
    const offenders: string[] = [];
    for (const pane of panes) {
      const line = source.getLineAndCharacterOfPosition(pane.getStart()).line + 1;
      // The pane's component: the nearest enclosing function that calls a material hook.
      let scope: ts.Node | undefined = pane.parent;
      while (scope && !(ts.isFunctionLike(scope) && fileHooks.some((hook) => {
        for (let up: ts.Node | undefined = hook.call.parent; up; up = up.parent) if (ts.isFunctionLike(up)) return up === scope;
        return false;
      }))) scope = scope.parent;
      const bound = bindingsIn(scope ?? source);
      let stable: string | undefined;
      let layer: ts.Expression | undefined;
      let spread: ts.Expression | undefined;
      for (const attribute of pane.attributes.properties) {
        if (ts.isJsxSpreadAttribute(attribute)) { spread = attribute.expression; continue; }
        const init = attribute.initializer;
        const value = init && (ts.isStringLiteral(init) ? init : ts.isJsxExpression(init) ? init.expression : undefined);
        if (attribute.name.getText() === "static") stable = init ? (value ? valueOf(value) : "unreadable") : "true";
        if (attribute.name.getText() === "layer") layer = value;
      }
      if (spread) {
        const hook = hookBehind(spread, bound);
        if (!hook || (hook.expression as ts.Identifier).text !== "useTextEntryMaterial" || !spread.getText().endsWith("paneProps")) {
          offenders.push(`${file}:${line} <GlassPane {...${spread.getText()}}> spreads something other than its text-entry material's paneProps`);
        }
        continue;
      }
      const wanted = stable ? new Set([stable]) : layerDensities(layer);
      // The densities this component's paneStyle themes resolve.
      const offered = new Set<string>();
      const read = (node: ts.Node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "paneStyle" && node.arguments[0]) {
          const hook = hookBehind(node.arguments[0], bound);
          if (hook) for (const density of hookOf(hook).densities) offered.add(density);
        }
        ts.forEachChild(node, read);
      };
      read(scope ?? source);
      if (offered.size === 0) for (const hook of fileHooks) for (const density of hook.densities) offered.add(density);
      const missing = [...wanted].filter((density) => !offered.has(density));
      if (missing.length > 0) offenders.push(`${file}:${line} <GlassPane> asks for static=${[...wanted].join("|")}, its host's paneStyle theme for static=${[...offered].join("|") || "nothing"}`);
    }
    return offenders;
  }

  it("every pane asks for the density its host's theme resolved", () => {
    const files = sources.filter(({ file, text }) => file !== "src/style/glass-surface/glass-pane.tsx" && text.includes("<GlassPane"));
    expect(files.length).toBeGreaterThan(40);
    expect(files.flatMap(({ file, text }) => paneDensityMismatches(file, text))).toEqual([]);
  });

  it("the density check catches a host and a pane that ask for different materials", () => {
    const host = (pane: string) => `
      function Host() {
        const theme = useMaterialTheme({ layer: "control" });
        const entry = useTextEntryMaterial(true);
        return <View style={paneStyle(theme, shape)}>${pane}</View>;
      }`;
    expect(paneDensityMismatches("host.tsx", host(`<GlassPane layer="control" shape={shape} />`))).toEqual([]);
    expect(paneDensityMismatches("host.tsx", host(`<GlassPane {...entry.paneProps} shape={shape} />`))).toEqual([]);
    expect(paneDensityMismatches("host.tsx", host(`<GlassPane static layer="control" shape={shape} />`))).toHaveLength(1);
    expect(paneDensityMismatches("host.tsx", host(`<GlassPane layer="content" shape={shape} />`))).toHaveLength(1);
    expect(paneDensityMismatches("host.tsx", host(`<GlassPane {...other} shape={shape} />`))).toHaveLength(1);
  });
});
