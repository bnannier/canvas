import { useState, useEffect, useCallback, useRef } from "react";
import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((mod) =>
      mod.createHighlighter({
        themes: ["github-dark", "github-light"],
        langs: ["html", "css", "javascript", "bash"],
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
      const isDark = document.documentElement.classList.contains("dark");
      const result = h.codeToHtml(code.trim(), {
        lang: language,
        theme: isDark ? "github-dark" : "github-light",
      });
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
