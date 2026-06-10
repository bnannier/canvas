import { Component, type ReactNode } from "react";
import * as React from "react";
import { transform } from "sucrase";
import { useTheme } from "@olympusoss/canvas";
import { LIVE_SCOPE, SCOPE_BY_PLATFORM } from "@/live-scope";
import { useDocsPlatform } from "@/use-docs-scheme";

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
// error boundary, so callers can place it inside a stage card (Usage/Variants) or
// a Do/Don't card without nested borders.
export function LiveExample({ code }: { code: string }) {
  const platform = useDocsPlatform();
  const { tokens } = useTheme();
  const compiled = compile(code);
  if ("error" in compiled) return <ErrorBlock message={compiled.error} />;

  // Inject the live, theme-aware tokens at the `tokens` slot so an example that
  // reads tokens["muted-foreground"] follows the docs light/dark + glass toggles.
  const values = SCOPE_VALUES_BY_PLATFORM[platform].slice();
  if (TOKENS_INDEX >= 0) values[TOKENS_INDEX] = tokens;

  let element: ReactNode;
  try {
    element = compiled.factory(React, ...values);
  } catch (e) {
    return <ErrorBlock message={e instanceof Error ? e.message : String(e)} />;
  }

  return <LiveErrorBoundary key={`${platform}:${code}`}>{element}</LiveErrorBoundary>;
}
