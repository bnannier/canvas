import { createHash } from "node:crypto";
import ts from "typescript";

export const ORIGIN = "https://canvas.nannier.com";
export const GLOBAL_OUTPUTS = ["agents.md", "llms.txt", "llms-full.txt"] as const;
export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
export const json = (value: unknown) => `${JSON.stringify(value)}\n`;

/** Select a Markdown section, including subheadings but excluding its next peer. */
export function section(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const level = heading.match(/^#+/)![0].length;
  let start = -1;
  let fence: string | undefined;
  for (let index = 0; index < lines.length; index++) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(lines[index])?.[1];
    if (fence) {
      if (marker?.[0] === fence[0] && marker.length >= fence.length && lines[index].trim() === marker) fence = undefined;
      continue;
    }
    if (marker) { fence = marker; continue; }
    if (start < 0) { if (lines[index] === heading) start = index; }
    else if (new RegExp(`^#{1,${level}} `).test(lines[index])) return lines.slice(start + 1, index).join("\n").trim();
  }
  if (start < 0) throw new Error(`Missing source section: ${heading}`);
  return lines.slice(start + 1).join("\n").trim();
}

/** Public excerpts must never send readers to this repository's private source. */
export function publicGuideLinks(markdown: string, version: string): string {
  const links: Record<string, { url: string; label?: string }> = {
    "#platforms": { url: `${ORIGIN}/ai/${version}/installation.md#platforms` },
    "#license": { url: `${ORIGIN}/agents.md#package-and-source-terms` },
    "./examples/starter/README.md": { url: `${ORIGIN}/agents.md#start-a-project-with-an-available-cli`, label: "packaged recipe onboarding" },
  };
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (original, label: string, target: string) => {
    const mapped = links[target];
    if (mapped) return `[${mapped.label ?? label}](${mapped.url})`;
    if (target.startsWith(".") || target.startsWith("#") || /github\.com\/bnannier\/canvas(?:\/|#|$)/.test(target)) throw new Error(`No public guide mapping for repository link: ${target}`);
    return original;
  });
}

export function renderAgents(template: string, version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`Unsafe package version: ${version}`);
  const rendered = template.replaceAll("{{VERSION}}", version);
  if (/\{\{[^}]+\}\}/.test(rendered)) throw new Error("Unresolved agents template placeholder");
  return rendered.trim() + "\n";
}

/** Rewrite only import module literals. Reject a private named import, never guess it. */
export function normalizeImports(code: string, exports: ReadonlySet<string>): string {
  const source = ts.createSourceFile("example.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits: { start: number; end: number; text: string }[] = [];
  source.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;
    const from = node.moduleSpecifier.text;
    const canvas = from.startsWith("@nannier/canvas") || /(?:^|\/)src(?:\/|$)/.test(from) || from.startsWith(".");
    if (!canvas) return;
    const clause = node.importClause;
    if (clause?.name || (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings))) {
      throw new Error(`Use named public Canvas imports: ${node.getText(source)}`);
    }
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const item of clause.namedBindings.elements) {
        const name = (item.propertyName ?? item.name).text;
        if (!exports.has(name)) throw new Error(`Unexported Canvas API in example: ${name}`);
      }
    }
    edits.push({ start: node.moduleSpecifier.getStart(source), end: node.moduleSpecifier.end, text: '"@nannier/canvas"' });
  });
  for (const edit of edits.reverse()) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  return code;
}

export function normalizeMarkdown(markdown: string, exports: ReadonlySet<string>): string {
  return markdown.replace(/```(tsx|jsx|ts|js)\n([\s\S]*?)```/g, (_, language: string, code: string) => `\`\`\`${language}\n${normalizeImports(code, exports)}\`\`\``);
}

export interface SnapshotManifest {
  schemaVersion: 1;
  package: string;
  version: string;
  status: "source-snapshot";
  sourceHash: string;
  sources: Record<string, string>;
  files: Record<string, string>;
  /** Mutable discovery pages as they were when this snapshot was generated. */
  globalFiles?: Record<string, string>;
  sealed?: boolean;
}

/** Verify retained snapshots without regenerating or repairing their released content. */
export function validateArchives(version: string, existing: ReadonlyMap<string, string>): void {
  for (const [file, content] of existing) {
    if (!/^ai\/[^/]+\/manifest\.json$/.test(file) || file.startsWith(`ai/${version}/`)) continue;
    const manifest = JSON.parse(content) as SnapshotManifest;
    const prefix = file.slice(0, -"manifest.json".length);
    if (prefix !== `ai/${manifest.version}/` || manifest.schemaVersion !== 1 || manifest.status !== "source-snapshot" || sha256(json(manifest.sources)) !== manifest.sourceHash) throw new Error(`Invalid archived manifest: ${file}`);
    for (const [name, hash] of Object.entries(manifest.files)) {
      if (name.startsWith("/") || name.split("/").some((part) => part === ".." || part === ".") || name.includes("\\")) throw new Error(`Unsafe archived path: ${name}`);
      const text = existing.get(prefix + name);
      if (text === undefined || sha256(text) !== hash) throw new Error(`Archived snapshot changed or missing: ${prefix}${name}`);
    }
    for (const name of existing.keys()) if (name.startsWith(prefix) && name !== file && !(name.slice(prefix.length) in manifest.files)) throw new Error(`Unexpected archived file: ${name}`);
  }
}

/** Old versions are immutable inputs, not regeneration targets. A seal can freeze current too. */
export function snapshotWrites(version: string, outputs: ReadonlyMap<string, string>, existing: ReadonlyMap<string, string>): string[] {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`Unsafe package version: ${version}`);
  const current = `ai/${version}/`;
  const old = existing.get(`${current}manifest.json`);
  const sealed = old && (JSON.parse(old) as SnapshotManifest).sealed;
  const drift: string[] = [];
  for (const [file, content] of outputs) {
    if (!(file.startsWith(current) || (GLOBAL_OUTPUTS as readonly string[]).includes(file))) throw new Error(`Refusing to overwrite another snapshot: ${file}`);
    let previous = existing.get(file);
    if (sealed && file === `${current}manifest.json` && previous) {
      const manifest = JSON.parse(previous) as SnapshotManifest;
      delete manifest.sealed;
      previous = json(manifest);
    }
    if (previous !== content) {
      if (sealed && file.startsWith(current)) throw new Error(`Snapshot ${version} is sealed; generate a new package version`);
      drift.push(file);
    }
  }
  for (const file of existing.keys()) if (file.startsWith(current) && !outputs.has(file)) {
    if (sealed) throw new Error(`Snapshot ${version} is sealed; cannot remove ${file}`);
    drift.push(file);
  }
  return drift.sort();
}
