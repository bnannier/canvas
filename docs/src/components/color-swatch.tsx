interface ColorSwatchProps {
  property: string;
  light: string;
  dark?: string;
  literal?: boolean;
}

export function ColorSwatch({ property, light, dark, literal }: ColorSwatchProps) {
  const previewStyle = literal
    ? { backgroundColor: light }
    : { backgroundColor: `hsl(${light})` };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-md, 6px)",
          border: "1px solid var(--border)",
          flexShrink: 0,
          ...previewStyle,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <code className="code" style={{ fontSize: "0.8125rem" }}>{property}</code>
        <div className="tiny muted" style={{ marginTop: "0.125rem" }}>
          {light}{dark ? ` / ${dark}` : ""}
        </div>
      </div>
    </div>
  );
}
