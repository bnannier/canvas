// Single source of truth for the playground code panel.
//
// The playground renders a component with `<Component {...props} />` and shows
// example code for it. Previously those were two hand-authored functions
// (mapProps + toCode) that drifted apart. Now the SAME `props` object that is
// rendered is serialized into the JSX shown, so the code always matches the
// render by construction.

function isIdent(key: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(key);
}

// Serialize a JS value as a JSX-embeddable literal, with idiomatic (unquoted)
// object keys. `indent` is the leading whitespace of the line the value sits on.
function literal(value: unknown, indent: string): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "null";

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const hasObjects = value.some((v) => v !== null && typeof v === "object");
    const inline = "[" + value.map((v) => literal(v, indent)).join(", ") + "]";
    if (!hasObjects && inline.length <= 64) return inline;
    const inner = indent + "  ";
    return "[\n" + value.map((v) => inner + literal(v, inner)).join(",\n") + "\n" + indent + "]";
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined && typeof obj[k] !== "function");
    if (keys.length === 0) return "{}";
    const parts = keys.map((k) => `${isIdent(k) ? k : JSON.stringify(k)}: ${literal(obj[k], indent)}`);
    return "{ " + parts.join(", ") + " }";
  }

  return "null";
}

interface Attr {
  text: string;
  multiline: boolean;
}

// Format a props object into JSX attribute fragments. Shared by propsToJsx and
// the composite-tree serializer so both render boolean/string/number/object
// props identically. Skips undefined/null/false and functions (event handlers).
function formatAttrs(rest: Record<string, unknown>): Attr[] {
  const attrs: Attr[] = [];
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === "function") continue;
    if (value === true) {
      attrs.push({ text: key, multiline: false });
    } else if (typeof value === "string") {
      attrs.push({ text: `${key}=${JSON.stringify(value)}`, multiline: false });
    } else if (typeof value === "number") {
      attrs.push({ text: `${key}={${value}}`, multiline: false });
    } else {
      const lit = literal(value, "  ");
      attrs.push({ text: `${key}={${lit}}`, multiline: lit.includes("\n") });
    }
  }
  return attrs;
}

/** Serialize a component name + the exact props it renders with into JSX. */
export function propsToJsx(name: string, props: Record<string, unknown>): string {
  const { children, ...rest } = props;
  const attrs = formatAttrs(rest);

  // Components with text children are simple (no complex props); one line.
  if (typeof children === "string" || typeof children === "number") {
    const attrStr = attrs.length ? " " + attrs.map((a) => a.text).join(" ") : "";
    return `<${name}${attrStr}>${String(children)}</${name}>`;
  }

  const anyMultiline = attrs.some((a) => a.multiline);
  const singleLine = `<${name}${attrs.length ? " " + attrs.map((a) => a.text).join(" ") : ""} />`;
  if (!anyMultiline && singleLine.length <= 84) return singleLine;

  // Multi-line: one attribute per line (multiline attr values keep their own
  // internal indentation, which was generated against a two-space base).
  const lines = [`<${name}`];
  for (const a of attrs) lines.push("  " + a.text);
  lines.push("/>");
  return lines.join("\n");
}

// --- composite tree ---------------------------------------------------------
//
// Some playground previews are not a single component but a composition of
// several real Canvas components (an identity row, an avatar stack, a key
// combo). A registry entry models these as an `El` descriptor tree, which the
// playground BOTH renders (registry.renderTree) and serializes here, so the
// shown code always matches the rendered composite, the same single-source rule
// propsToJsx gives single components.

export type ElChild = string | number | El;

export interface El {
  /** Component name resolved against the registry's COMPONENT_MAP, e.g. "Box", "Badge". */
  type: string;
  props?: Record<string, unknown>;
  children?: ElChild | ElChild[];
}

function serializeEl(node: ElChild, indent: string): string {
  if (typeof node === "string" || typeof node === "number") return `${indent}${node}`;

  const attrs = formatAttrs(node.props ?? {});
  const attrStr = attrs.length ? " " + attrs.map((a) => a.text).join(" ") : "";
  const kids = node.children == null ? [] : Array.isArray(node.children) ? node.children : [node.children];

  if (kids.length === 0) return `${indent}<${node.type}${attrStr} />`;
  if (kids.length === 1 && (typeof kids[0] === "string" || typeof kids[0] === "number")) {
    return `${indent}<${node.type}${attrStr}>${kids[0]}</${node.type}>`;
  }
  const inner = kids.map((k) => serializeEl(k, indent + "  ")).join("\n");
  return `${indent}<${node.type}${attrStr}>\n${inner}\n${indent}</${node.type}>`;
}

/** Serialize a composite element tree to JSX, matching what registry.renderTree renders. */
export function serializeTree(node: El): string {
  return serializeEl(node, "");
}
