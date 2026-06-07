import { useState, useCallback, useMemo, useRef } from "react";
import { Code, ChevronDown } from "lucide-react";
import { CodeBlock } from "./code-block";
import type { PlaygroundConfig, PlaygroundControl } from "@/data/types";
import { registry, renderTree, type DemoApi } from "@/registry";
import { TREES } from "@/registry-trees";
import { propsToJsx, serializeTree } from "@/jsx-code";

interface PlaygroundProps {
  config: PlaygroundConfig;
  slug?: string;
}

const HTML_VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source", "area", "col", "embed", "wbr"]);
const SVG_SELF = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop", "use"]);

function serializeNode(node: Node, indent: number): string {
  const pad = "  ".repeat(indent);
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return text ? pad + text : "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`)
    .join("");
  if (HTML_VOID.has(tag)) return `${pad}<${tag}${attrs}>`;
  if (SVG_SELF.has(tag)) return `${pad}<${tag}${attrs} />`;
  const kids = Array.from(el.childNodes)
    .map((c) => serializeNode(c, indent + 1))
    .filter(Boolean);
  if (kids.length === 0) return `${pad}<${tag}${attrs}></${tag}>`;
  if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return `${pad}<${tag}${attrs}>${text}</${tag}>`;
  }
  return `${pad}<${tag}${attrs}>\n${kids.join("\n")}\n${pad}</${tag}>`;
}

/** Pretty-print the exact HTML the preview renders, so the code panel shows the
 *  real markup, never a separate hand-authored snippet that can drift from it. */
function formatHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const out = Array.from(tmp.childNodes)
    .map((n) => serializeNode(n, 0))
    .filter(Boolean)
    .join("\n");
  return out || html;
}

export function Playground({ config, slug }: PlaygroundProps) {
  const [state, setState] = useState<Record<string, unknown>>(config.defaults);
  const [showCode, setShowCode] = useState(true);

  const set = useCallback((key: string, value: unknown) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Transient "Fired:" feedback for demo clicks that have no other visible
  // result (a button press, a copy, a breadcrumb nav). Auto-clears after 1.4s.
  const [fired, setFired] = useState<string | null>(null);
  const firedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fire = useCallback((label: string) => {
    setFired(label);
    clearTimeout(firedTimer.current);
    firedTimer.current = setTimeout(() => setFired(null), 1400);
  }, []);

  // The controller handed to mapProps/treeFn so a preview can wire demo-only
  // click handlers. Handlers are function-valued props, stripped by jsx-code
  // from the code panel, so the shown code is unaffected.
  const demo = useMemo<DemoApi>(() => ({ set, fire, state }), [set, fire, state]);

  // Single source of truth: derive one description of the preview, then both
  // render it and serialize the same description into the code panel, so the
  // shown code always matches the render. An entry may expose a composite
  // `tree` (multi-component preview) which takes precedence over its single
  // Component; otherwise the resolved props drive a single <Component/>.
  const entry = slug ? registry[slug] : undefined;
  // Display components with no interaction of their own (or no affordance in
  // every variant) get a baseline: the preview surface is clickable and flashes
  // "Fired", so every component responds to a click even when purely visual.
  const STATIC_SLUGS = new Set([
    "badge", "divider", "skeleton", "spinner", "icon", "kbd", "typography",
    "stats", "charts", "description-lists", "code-block", "grid-lists", "media-objects",
    "action-panels", "field",
  ]);
  const isStatic = !!slug && STATIC_SLUGS.has(slug);
  const treeFn = slug ? TREES[slug] : undefined;
  const treeEl = treeFn ? treeFn(state, demo) : null;
  const resolvedProps = entry && !treeEl ? entry.mapProps(state, demo) : null;
  const code = treeEl
    ? serializeTree(treeEl)
    : entry && resolvedProps
      ? propsToJsx(entry.name, resolvedProps)
      : formatHtml(config.render(state));
  const codeLanguage = treeEl || entry ? "tsx" : "html";

  return (
    <div>
      {/* The grid and its stage column are raised above the later controls and
          code sections so a floating subcomponent (dropdown / popover / combobox
          / command panel) overflows the stage and paints OVER them. In glass mode
          the section cards carry a backdrop-filter, which creates stacking
          contexts; without these z-indexes the floating panel is trapped in the
          stage's context and hidden behind the code section below. */}
      <div className="playground-grid" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="section-card"
            onClick={isStatic ? () => fire(entry?.name ?? slug ?? "Component") : undefined}
            style={{
              padding: "2rem",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              minHeight: 180,
              cursor: isStatic ? "pointer" : undefined,
            }}
          >
            {treeEl ? (
              renderTree(treeEl)
            ) : entry && resolvedProps ? (
              <entry.Component {...resolvedProps} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: config.render(state) }} />
            )}
          </div>
          <div
            aria-live="polite"
            style={{
              minHeight: 18,
              marginTop: 8,
              fontSize: 12,
              color: "var(--muted-foreground)",
              opacity: fired ? 1 : 0,
              transition: "opacity 150ms ease",
            }}
          >
            {fired ? `Fired: ${fired}` : " "}
          </div>
        </div>

        <div className="section-card" style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          fontSize: "12.5px",
        }}>
          {config.controls.map(ctrl => (
            <ControlField
              key={ctrl.key}
              control={ctrl}
              value={state[ctrl.key]}
              onChange={(v) => set(ctrl.key, v)}
              disabled={ctrl.disabledWhen?.(state) ?? false}
            />
          ))}
        </div>
      </div>

      <div className="section-card" style={{ overflow: "hidden", marginTop: "1rem" }}>
        <button
          onClick={() => setShowCode((v) => !v)}
          className="docs-code-toggle"
          aria-expanded={showCode}
          style={{ borderTop: "none" }}
        >
          <Code size={13} />
          <span>{showCode ? "Hide code" : "Show code"}</span>
          <ChevronDown
            size={13}
            style={{
              marginLeft: "auto",
              transition: "transform 200ms ease",
              transform: showCode ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
        <div className={`docs-code-collapse ${showCode ? "open" : ""}`}>
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <CodeBlock code={code} language={codeLanguage} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlField({
  control,
  value,
  onChange,
  disabled,
}: {
  control: PlaygroundControl;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
}) {
  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : undefined }}>
      {control.type !== "check" && (
        <div style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted-foreground)",
          fontWeight: 500,
          marginBottom: 6,
        }}>
          {control.label}
        </div>
      )}
      {control.type === "pills" && (
        <PillGroup
          options={control.options ?? []}
          value={value as string}
          onChange={(v) => onChange(v)}
          cols={control.cols}
        />
      )}
      {control.type === "check" && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <span style={{ color: "var(--foreground)" }}>{control.label}</span>
        </label>
      )}
      {control.type === "text" && (
        <input
          className="input"
          style={{ height: 32 }}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
      {control.type === "range" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={control.min ?? 0}
            max={control.max ?? 100}
            step={control.step ?? 1}
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--primary)" }}
          />
          <code style={{
            fontSize: "11px",
            color: "var(--muted-foreground)",
            width: 48,
            textAlign: "right",
          }}>
            {String(value)}{control.suffix ?? ""}
          </code>
        </div>
      )}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
  cols,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  const colCount = cols ?? Math.min(options.length, 3);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${colCount}, 1fr)`,
      gap: 4,
    }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: "11.5px",
              border: `1px solid ${active ? "var(--foreground)" : "var(--border)"}`,
              background: active ? "var(--foreground)" : "var(--card)",
              color: active ? "var(--background)" : "var(--foreground)",
              cursor: "pointer",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              fontWeight: "inherit",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
