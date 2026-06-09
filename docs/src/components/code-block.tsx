import { useState, useEffect, useCallback, useRef } from "react";
import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((mod) =>
      mod.createHighlighter({
        themes: ["github-dark", "github-light"],
        // Every language the docs pass to <CodeBlock language="...">. A lang that
        // is used but not loaded here makes Shiki throw, which the effect below
        // catches; keep this list in sync so blocks highlight rather than fall
        // back to plaintext.
        langs: ["html", "css", "javascript", "jsx", "typescript", "tsx", "json", "bash"],
      }),
    );
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "html" }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((h) => {
      if (cancelled) return;
      const theme = document.documentElement.classList.contains("dark")
        ? "github-dark"
        : "github-light";
      let result: string;
      try {
        result = h.codeToHtml(code.trim(), { lang: language, theme });
      } catch {
        // Unknown / unloaded language: render as plaintext (a built-in lang,
        // always available) so the block still gets the themed container instead
        // of silently dropping to an unstyled <pre>.
        result = h.codeToHtml(code.trim(), { lang: "text", theme });
      }
      setHtml(result);
    });
    return () => { cancelled = true; };
  }, [code, language]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="docs-code-wrap">
      <button
        className="btn btn-ghost btn-sm docs-copy-btn"
        onClick={copy}
        title="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre style={{ margin: 0, padding: "1rem 1.25rem", fontSize: "0.8125rem" }}>
          <code>{code.trim()}</code>
        </pre>
      )}
    </div>
  );
}
