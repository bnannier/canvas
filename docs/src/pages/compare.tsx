import { useEffect, useState } from "react";
import { LiveExampleFor } from "@/components/live-example";
import { useDocsScheme } from "@/use-docs-scheme";
import {
  REFERENCE_STATES,
  type ComponentRefs,
  type PlatformNone,
  type PlatformRefs,
  type RefPlatform,
  type RefRow,
  type RefState,
} from "@/data/reference-states";

// QA harness: for each platform-skinned component, put our live Canvas render
// beside the real platform reference, per platform, in a table (rows = Android /
// iOS / Web, columns = Canvas | Reference), so each platform's reference sits
// directly beside that platform's Canvas render. The Reference cell holds inner
// rows, one per VARIANT the platform documents, each showing that variant's
// STATES, per the manifest in docs/src/data/reference-states.ts (iOS imagery is
// exclusively Apple iOS 27 UI Kit symbol captures). Images live in
// docs/public/refs/<platform>/<slug>/ (gitignored, captured in a browser
// session: the kit's thumbnails are signed and cannot be hotlinked). Use the
// global topbar light/dark + Solid toggles to check both schemes; reference
// panels follow the active scheme where the platform publishes both renders.

const RAW = import.meta.glob("../../../src/*/*/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const PLATFORMS: RefPlatform[] = ["android", "ios", "web"];
const PLATFORM_LABEL: Record<RefPlatform, string> = { android: "Android (Material 3)", ios: "iOS (iOS 27 UI Kit)", web: "Web" };

// Pull the first ```tsx fence under "## Usage" from a component's markdown.
function usageFence(md: string): string {
  const at = md.indexOf("## Usage");
  if (at === -1) return "";
  const m = /```tsx\n([\s\S]*?)```/.exec(md.slice(at));
  return m ? m[1].trim() : "";
}

function refImage(platform: RefPlatform, slug: string, rowKey: string, stateKey: string, scheme: "light" | "dark"): string {
  return `/refs/${platform}/${slug}/${rowKey}-${stateKey}-${scheme}.png`;
}

/**
 * One reference state: the captured image plus its platform-native state
 * label. In dark mode, falls back to the light capture (tagged "light only")
 * when the platform has no dark render; if nothing is captured, shows a hint.
 */
function StatePanel({ platform, slug, rowKey, state, scheme }: {
  platform: RefPlatform;
  slug: string;
  rowKey: string;
  state: RefState;
  scheme: "light" | "dark";
}) {
  // "exact" = scheme-matching file, "light" = light fallback in dark mode.
  const [tier, setTier] = useState<"exact" | "light" | "missing">("exact");
  useEffect(() => setTier("exact"), [scheme, slug, platform, rowKey, state.key]);

  const src = refImage(platform, slug, rowKey, state.key, tier === "exact" ? scheme : "light");
  const lightOnly = tier === "light" && scheme === "dark";

  if (tier === "missing") {
    return (
      <figure style={panelStyle} title={state.note}>
        <div style={{ ...panelImgBox, padding: "10px 8px" }}>
          <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", textAlign: "center" }}>
            not captured
          </span>
        </div>
        <figcaption style={panelLabel}>{state.label}</figcaption>
      </figure>
    );
  }

  return (
    <figure style={panelStyle} title={state.note}>
      <div style={panelImgBox}>
        <img
          src={src}
          alt={`${slug} ${platform} ${state.label} reference`}
          onError={() => setTier(tier === "exact" && scheme === "dark" ? "light" : "missing")}
          style={{ maxWidth: "100%", maxHeight: 110, display: "block" }}
        />
      </div>
      <figcaption style={panelLabel}>
        {state.label}
        {lightOnly && <span style={{ marginLeft: 5, opacity: 0.65 }}>(light only)</span>}
      </figcaption>
    </figure>
  );
}

/** One variant's inner row: variant label + that variant's state panels. */
function VariantRow({ slug, platform, row, scheme }: {
  slug: string;
  platform: RefPlatform;
  row: RefRow;
  scheme: "light" | "dark";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
        color: "var(--muted-foreground)",
      }}>
        {row.variant}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {row.states.map((s) => (
          <StatePanel key={s.key} platform={platform} slug={slug} rowKey={row.key} state={s} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}

/** The Reference cell for one platform row: variant rows + the source link. */
function RefCell({ slug, platform, refs }: { slug: string; platform: RefPlatform; refs?: PlatformRefs | PlatformNone }) {
  const scheme = useDocsScheme();
  if (!refs || "none" in refs) {
    return (
      <span style={{ fontSize: 12, color: "var(--muted-foreground)", maxWidth: 460, display: "inline-block", lineHeight: 1.55 }}>
        {refs && "none" in refs ? `(none: ${refs.none})` : "(none)"}
      </span>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      {refs.rows.map((row) => (
        <VariantRow key={row.key} slug={slug} platform={platform} row={row} scheme={scheme} />
      ))}
      {refs.note && (
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", maxWidth: 460, lineHeight: 1.5 }}>
          {refs.note}
        </span>
      )}
      <a href={refs.url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--primary)" }}>
        ↗ reference
      </a>
    </div>
  );
}

export function ComparePage() {
  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--foreground)" }}>
          Platform comparison
        </h1>
        <p style={{ marginTop: 6, fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: 720, lineHeight: 1.6 }}>
          Each skinned component's live Canvas render beside the real platform reference, per
          platform, across every variant and state the platform documents (iOS imagery comes
          straight from the Apple iOS 27 UI Kit symbols). Toggle light/dark and Solid/Glass in
          the topbar. A row's Canvas must match its Reference, and the three rows must look
          distinct.
        </p>
      </header>

      {REFERENCE_STATES.map((e: ComponentRefs) => {
        const md = RAW[`../../../src/${e.level}/${e.slug}/${e.slug}.md`] ?? "";
        const code = usageFence(md);
        return (
          <section key={e.slug} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: 18, fontWeight: 600, color: "var(--foreground)" }}>{e.name}</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={th(140)}>Platform</th>
                  <th style={th()}>Canvas</th>
                  <th style={th()}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.map((p) => (
                  <tr key={p}>
                    <td style={{ ...td, fontSize: 13, fontWeight: 600, color: "var(--foreground)", verticalAlign: "middle" }}>
                      {PLATFORM_LABEL[p]}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", minHeight: 56, padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                        {code ? <LiveExampleFor code={code} platform={p} /> : <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>no usage example</span>}
                      </div>
                    </td>
                    <td style={td}><RefCell slug={e.slug} platform={p} refs={e.refs[p]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

const panelStyle: React.CSSProperties = { margin: 0, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" };
const panelImgBox: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", minWidth: 56, minHeight: 40,
  maxWidth: 220, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", overflow: "hidden",
};
const panelLabel: React.CSSProperties = { fontSize: 10.5, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.02em" };

function th(width?: number): React.CSSProperties {
  return { width, textAlign: "left", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted-foreground)", padding: "6px 10px", borderBottom: "1px solid var(--border)" };
}
const td: React.CSSProperties = { padding: "12px 10px", borderBottom: "1px solid var(--border)", verticalAlign: "top" };
