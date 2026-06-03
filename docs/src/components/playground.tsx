import { useState, useCallback } from "react";
import { Code, ChevronDown } from "lucide-react";
import { CodeBlock } from "./code-block";
import type { PlaygroundConfig, PlaygroundControl } from "@/data/types";

interface PlaygroundProps {
  config: PlaygroundConfig;
}

export function Playground({ config }: PlaygroundProps) {
  const [state, setState] = useState<Record<string, unknown>>(config.defaults);
  const [showCode, setShowCode] = useState(false);

  const set = useCallback((key: string, value: unknown) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const html = config.render(state);
  const markup = config.markup(state);

  return (
    <div>
      <div className="playground-grid">
        <div className="section-card" style={{
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 180,
        }}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
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
            <CodeBlock code={markup} language="html" />
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
          color: "hsl(var(--muted-foreground))",
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
            style={{ accentColor: "hsl(var(--primary))" }}
          />
          <span style={{ color: "hsl(var(--foreground))" }}>{control.label}</span>
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
            style={{ flex: 1, accentColor: "hsl(var(--primary))" }}
          />
          <code style={{
            fontSize: "11px",
            color: "hsl(var(--muted-foreground))",
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
              border: `1px solid ${active ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
              background: active ? "hsl(var(--foreground))" : "hsl(var(--card))",
              color: active ? "hsl(var(--background))" : "hsl(var(--foreground))",
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
