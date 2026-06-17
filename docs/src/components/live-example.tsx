import { Component, useLayoutEffect, useRef, type ReactNode } from "react";
import * as React from "react";
import { transform } from "sucrase";
import { OverlayProvider, useTheme } from "@olympusoss/canvas";
import { LIVE_SCOPE, SCOPE_BY_PLATFORM } from "@/live-scope";

// Renders a single ```tsx example fence from a component's markdown as a real,
// live preview. The fence is the canonical source: editing the `.md` re-renders
// the page. Each fence is one JSX expression (e.g. `<Avatar ring name="AO" />` or
// a nested `<View>…</View>`); we transpile it with sucrase (classic runtime) and
// evaluate it with the real Canvas components in scope (LIVE_SCOPE), passing the
// page's own React so the rendered tree shares its hooks dispatcher and the
// package ThemeProvider context. A bad fence shows an error block, never a crash.

// Tag names are identical across platforms, so the compiled factory is shared; only
// the VALUES passed in differ. Precompute the value list per docs preview platform.
const SCOPE_KEYS = Object.keys(LIVE_SCOPE);
const SCOPE_VALUES_BY_PLATFORM = {
  web: SCOPE_KEYS.map((k) => SCOPE_BY_PLATFORM.web[k]),
  ios: SCOPE_KEYS.map((k) => SCOPE_BY_PLATFORM.ios[k]),
  android: SCOPE_KEYS.map((k) => SCOPE_BY_PLATFORM.android[k]),
} as const;
// `tokens` is a live value (the active theme), injected per render at this slot.
const TOKENS_INDEX = SCOPE_KEYS.indexOf("tokens");

type Factory = (react: typeof React, ...scope: unknown[]) => ReactNode;
type Compiled = { factory: Factory } | { error: string };

// Transpiling + compiling a fence is pure in its source string, so memoize it:
// component pages render many fences, and HMR only changes the edited one.
const cache = new Map<string, Compiled>();

function compile(code: string): Compiled {
  const hit = cache.get(code);
  if (hit) return hit;
  let result: Compiled;
  try {
    const { code: out } = transform(`(${code.trim()}\n)`, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      jsxPragma: "React.createElement",
      jsxFragmentPragma: "React.Fragment",
      production: true,
    });
    // The fence becomes a parenthesized expression; return it from a function whose
    // params are React + every scope name, so the JSX resolves against the reals.
    const factory = new Function("React", ...SCOPE_KEYS, `return ${out};`) as Factory;
    result = { factory };
  } catch (e) {
    result = { error: e instanceof Error ? e.message : String(e) };
  }
  cache.set(code, result);
  return result;
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid hsl(0 70% 60% / 0.3)",
        background: "hsl(0 70% 60% / 0.05)",
        padding: "0.75rem 1rem",
        fontSize: "12.5px",
        color: "hsl(0 84% 60%)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4 }}>Example failed to render</strong>
      <code style={{ fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", color: "inherit" }}>{message}</code>
    </div>
  );
}

// A render-phase throw (valid JSX, but a component rejects its props) can only be
// caught by an error boundary. Keyed by the fence source at the call site, so a
// fixed edit remounts it and clears a stale error on HMR.
class LiveErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.error) return <ErrorBlock message={this.state.error} />;
    return this.props.children;
  }
}

// Renders the fence as a bare element (no surrounding chrome) wrapped in the
// error boundary, so callers can place it inside a Do/Don't card without nested
// borders. Do/Don't examples are about correct usage, not platform looks, so they
// render the neutral Web look. The component playground renders all three
// platforms side by side via <LiveExampleFor>.
export function LiveExample({ code }: { code: string }) {
  return <LiveExampleFor code={code} platform="web" />;
}

const collapseSpace = (s: string) => s.replace(/\s+/g, "");

// Glass is a functional-layer surface mode: it swaps only the `popover` fill
// (overlays, menus, sheets, dialogs — plus bars/sidebar, which paint popover in
// glass) to translucent, leaving content `card` surfaces solid. The previewed
// Canvas components are react-native-web nodes with hashed atomic classes, not the
// semantic .card/.section-card the docs chrome frost targets, so this tags the
// elements that actually paint the glass `popover` fill (matched against the live
// theme token, so it tracks light/dark) with `data-glass-surface`; docs-chrome.css
// frosts those. Content cards (solid `card`) never match, so they stay opaque,
// matching Apple's "don't use glass in the content layer."
function useTagGlassSurfaces(
  ref: React.RefObject<HTMLElement | null>,
  surface: string,
  popoverFill: string,
  signal: string,
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glass = surface === "glass";
    const target = collapseSpace(popoverFill);
    root.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const isSurface = glass && collapseSpace(getComputedStyle(el).backgroundColor) === target;
      if (isSurface) el.setAttribute("data-glass-surface", "");
      else el.removeAttribute("data-glass-surface");
    });
  }, [ref, surface, popoverFill, signal]);
}

// Renders the fence at an EXPLICIT platform. Used by the component playground and
// the /compare QA view to render the same example under iOS, Android, and Web.
export function LiveExampleFor({ code, platform }: { code: string; platform: "web" | "ios" | "android" }) {
  const { tokens, surface } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  // Tag the functional glass surfaces in this preview so the docs frost reaches
  // them. `display: contents` keeps the wrapper out of layout.
  useTagGlassSurfaces(ref, surface, tokens.popover, `${platform}:${code}`);

  const compiled = compile(code);
  if ("error" in compiled) return <ErrorBlock message={compiled.error} />;

  const values = SCOPE_VALUES_BY_PLATFORM[platform].slice();
  if (TOKENS_INDEX >= 0) values[TOKENS_INDEX] = tokens;

  let element: ReactNode;
  try {
    element = compiled.factory(React, ...values);
  } catch (e) {
    return <ErrorBlock message={e instanceof Error ? e.message : String(e)} />;
  }

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <LiveErrorBoundary key={`${platform}:${code}`}>{element}</LiveErrorBoundary>
    </div>
  );
}

// The component playground renders every live fence under all three platforms at
// once, iOS / Android / Web stacked as rows, so the per-OS skins compare directly
// without a top-bar platform toggle.
export const PLAYGROUND_PLATFORMS = [
  { key: "ios", label: "iOS" },
  { key: "android", label: "Android" },
  { key: "web", label: "Web" },
] as const;

// The shared 3-platform stage: a rounded-top card with one iOS / Android / Web
// row per platform, each rendering the same fence at its own skin. Used by the
// playground (playground.tsx). Callers wrap it in `.live-example` and attach a
// <CodeBlock> below. position+zIndex raise the stage above the code so a floating
// subcomponent (dropdown, popover, tooltip) that overflows a row paints over the
// code instead of being covered.
export function PlatformPreview({ code }: { code: string }) {
  return (
    <div
      className="section-card live-example-stage playground-platforms"
      style={{ position: "relative", zIndex: 1 }}
    >
      {PLAYGROUND_PLATFORMS.map((p) => (
        <div className="playground-platform" key={p.key}>
          <div className="playground-platform-label">{p.label}</div>
          <div className="playground-platform-body">
            {/* Per-platform overlay host: a portaled overlay (e.g. an open
                dropdown menu) anchors and dismisses within this cell. */}
            <OverlayProvider style={{ alignSelf: "stretch", flex: 1, alignItems: "center", justifyContent: "center" }}>
              <LiveExampleFor code={code} platform={p.key} />
            </OverlayProvider>
          </div>
        </div>
      ))}
    </div>
  );
}
