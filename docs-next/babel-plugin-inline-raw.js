// Inline Vite-style `?raw` imports at build time so the reused docs pages
// (`import md from "./snippet.md?raw"`) work under Metro, which has no `?raw`.
// Replaces the import with `const md = "<file contents>";`.
const fs = require("fs");
const path = require("path");

module.exports = function inlineRaw({ types: t }) {
  return {
    name: "inline-raw-imports",
    visitor: {
      ImportDeclaration(p, state) {
        const source = p.node.source.value;
        if (typeof source !== "string" || !source.endsWith("?raw")) return;

        const rel = source.slice(0, -"?raw".length);
        const fromDir = path.dirname(state.file.opts.filename);
        const abs = path.resolve(fromDir, rel);

        let content;
        try {
          content = fs.readFileSync(abs, "utf8");
        } catch {
          throw p.buildCodeFrameError(`?raw import could not be read: ${abs}`);
        }

        const def = p.node.specifiers.find((s) => s.type === "ImportDefaultSpecifier");
        if (!def) {
          p.remove();
          return;
        }
        p.replaceWith(
          t.variableDeclaration("const", [t.variableDeclarator(t.identifier(def.local.name), t.stringLiteral(content))]),
        );
      },
    },
  };
};
