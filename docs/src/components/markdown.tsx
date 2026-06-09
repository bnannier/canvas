import { Fragment, createElement, type ReactNode } from "react";
import { CodeBlock } from "./code-block";

// Minimal markdown renderer. The only rich feature is fenced ```lang code blocks,
// each delegated to <CodeBlock> so Shiki highlighting, dual themes, the copy
// button, and the lazy highlighter are reused unchanged. Prose support is
// intentionally small: ATX headings, blank-line paragraphs, -/1. lists, and
// inline `code` / **bold** / [text](url). No tables, no ~~~ fences, no nested
// fences (a ``` is a delimiter only at column 0). This is the single in-app path
// for every code surface (the playground's generated JSX and the guide samples).

type Block =
  | { kind: "code"; lang: string; body: string }
  | { kind: "prose"; lines: string[] };

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let prose: string[] = [];
  const flush = () => {
    if (prose.some((l) => l.trim())) blocks.push({ kind: "prose", lines: prose });
    prose = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const open = /^```(\w+)?\s*$/.exec(lines[i]);
    if (open) {
      flush();
      const lang = open[1] || "text";
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      blocks.push({ kind: "code", lang, body: body.join("\n") });
    } else {
      prose.push(lines[i]);
    }
  }
  flush();
  return blocks;
}

const linkStyle = { color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: "2px" } as const;

// Inline spans: `code`, **bold**, [text](url). One pass; no nesting.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok[0] === "`") {
      out.push(<code key={k++} className="code">{tok.slice(1, -1)}</code>);
    } else if (tok[0] === "*") {
      out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok)!;
      out.push(<a key={k++} href={link[2]} style={linkStyle}>{link[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const HEADING_STYLE: Record<number, React.CSSProperties> = {
  1: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 0.75rem" },
  2: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", margin: "1.25rem 0 0.5rem" },
  3: { fontSize: 15, fontWeight: 600, margin: "1rem 0 0.5rem" },
  4: { fontSize: 13.5, fontWeight: 600, margin: "1rem 0 0.5rem" },
};

function Prose({ lines }: { lines: string[] }) {
  const out: ReactNode[] = [];
  let para: string[] = [];
  let items: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  const flushPara = () => {
    if (para.length) out.push(<p key={out.length} className="body" style={{ margin: "0 0 0.75rem", color: "var(--foreground)", lineHeight: 1.6 }}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (items.length) {
      const lis = items.map((it, i) => <li key={i} style={{ marginBottom: 2 }}>{inline(it)}</li>);
      out.push(listKind === "ol"
        ? <ol key={out.length} style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.75rem" }}>{lis}</ol>
        : <ul key={out.length} style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.75rem" }}>{lis}</ul>);
    }
    items = [];
    listKind = null;
  };
  for (const line of lines) {
    if (!line.trim()) { flushPara(); flushList(); continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); flushList();
      const lvl = Math.min(h[1].length, 4);
      const tag = `h${lvl}` as "h1" | "h2" | "h3" | "h4";
      out.push(createElement(tag, { key: out.length, style: { ...HEADING_STYLE[lvl], color: "var(--foreground)" } }, inline(h[2])));
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ul) { flushPara(); listKind = "ul"; items.push(ul[1]); continue; }
    if (ol) { flushPara(); listKind = "ol"; items.push(ol[1]); continue; }
    para.push(line);
  }
  flushPara();
  flushList();
  return <>{out}</>;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);
  return (
    <>
      {blocks.map((b, i) =>
        b.kind === "code"
          ? <CodeBlock key={i} code={b.body} language={b.lang} />
          : <Fragment key={i}><Prose lines={b.lines} /></Fragment>,
      )}
    </>
  );
}
