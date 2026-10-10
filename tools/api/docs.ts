import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";
import { variantSlug } from "../../docs/src/lib/variant";
import type { DocsPage } from "./types";

// The docs app's pages and the text each one shows a reader, read from source so the
// gate needs no docs build. A page "documents" a name only when its rendered text
// names it: string literals (code snippets, prop tables, captions), template text and
// JSX text. An import, a JSX tag that merely uses a component, and a comment do not
// count, so a page cannot claim a name it only uses to lay itself out.
//
// A name that is also an ordinary word (`palette`, `spacing`, `Surface`) is named only
// where the page shows it as code: in a snippet (a CodeBlock's `code`, an example's or
// a Do & Don't's `code`), in inline code (InlineCode, mono Typography), in a generated
// prop table's names and types, or between backticks. Anywhere else the word is prose.

const APP_DIR = "docs/src/app";
const DATA_DIR = "docs/src/core/data";
const EXAMPLES_DIR = "docs/src/core/examples";

// The hidden tuning and fixture harness (docs/src/app/(home)/testing/): served, never
// linked, and not documentation.
const HARNESS_PREFIX = "testing/";

interface CatalogEntry {
  slug: string;
  name: string;
  description: string;
  category: string;
  dir?: string;
}

function parse(root: string, file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function moduleSpecifier(node: ts.Node): boolean {
  const parent = node.parent;
  if (!parent) return false;
  if ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) && parent.moduleSpecifier === node) return true;
  if (ts.isExternalModuleReference(parent)) return true;
  return ts.isCallExpression(parent) && parent.arguments[0] === node &&
    (parent.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(parent.expression) && parent.expression.text === "require"));
}

/** The text a reader can see in a subtree: literals and JSX text, never imports, tag names or comments. */
function literalText(node: ts.Node, out: string[]) {
  if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    // A quoted property key (`"name": ...` in a generated prop table) is structure, not text.
    const keyOf = node.parent && ts.isPropertyAssignment(node.parent) && node.parent.name === node;
    if (!keyOf && !moduleSpecifier(node)) out.push(node.text);
    return;
  }
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) {
    out.push(node.text);
    return;
  }
  ts.forEachChild(node, (child) => literalText(child, out));
}

/** The rendered text of a whole file: a screen, or a template that is one file. */
function fileText(source: ts.SourceFile): string {
  const out: string[] = [];
  literalText(source, out);
  return out.join("\n");
}

/** The file's top-level functions and variables by name: what an identifier in a page can reach. */
function topLevelDeclarations(source: ts.SourceFile): Map<string, ts.Node> {
  const topLevel = new Map<string, ts.Node>();
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) topLevel.set(statement.name.text, statement);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) topLevel.set(declaration.name.text, declaration);
      }
    }
  }
  return topLevel;
}

/** Visit `node` and, transitively, every top-level declaration of its file it reaches by name. */
function reaching(source: ts.SourceFile, node: ts.Node, visit: (current: ts.Node) => void) {
  const topLevel = topLevelDeclarations(source);
  const seen = new Set<ts.Node>();
  const enter = (current: ts.Node) => {
    if (seen.has(current)) return;
    seen.add(current);
    visit(current);
    const walk = (child: ts.Node) => {
      if (ts.isIdentifier(child)) {
        const target = topLevel.get(child.text);
        if (target && target !== current) enter(target);
      }
      ts.forEachChild(child, walk);
    };
    ts.forEachChild(current, walk);
  };
  enter(node);
}

/**
 * The rendered text of one entry in a file of many (a pattern), plus every top-level
 * declaration of the same file it reaches by name, transitively: a section that renders
 * `<FocusDemo />` or `{GLASS}` shows that demo's or snippet's text too.
 */
function reachableText(source: ts.SourceFile, node: ts.Node): string {
  const out: string[] = [];
  reaching(source, node, (current) => literalText(current, out));
  return out.join("\n");
}

function propertyName(node: ts.PropertyAssignment): string | undefined {
  return ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : undefined;
}

/**
 * The code a subtree shows: every literal inside a code context (and inside the
 * top-level declarations a code context names, so `<CodeBlock code={GLASS} />` shows
 * GLASS). The contexts are a `code` attribute or property (CodeBlock, an example, a Do
 * & Don't), InlineCode and mono Typography, and the names and types of a generated
 * prop table.
 */
function codeIn(source: ts.SourceFile, node: ts.Node, out: string[]) {
  const take = (code: ts.Node) => reaching(source, code, (current) => literalText(current, out));
  const find = (current: ts.Node) => {
    if (ts.isJsxElement(current)) {
      const tag = jsxTagName(current.openingElement);
      if (tag === "InlineCode" || (tag === "Typography" && attribute(current.openingElement, "mono"))) {
        for (const child of current.children) take(child);
        return;
      }
    }
    if (ts.isJsxAttribute(current) && current.name.getText() === "code" && current.initializer) return take(current.initializer);
    if (ts.isPropertyAssignment(current)) {
      const name = propertyName(current);
      if (name === "code") return take(current.initializer);
      // A generated prop table: `props: [{ name: "ButtonProps", props: [{ name, type, … }] }]`.
      if (name === "props" && ts.isArrayLiteralExpression(current.initializer)) {
        const table = (row: ts.Node) => {
          if (ts.isPropertyAssignment(row) && (propertyName(row) === "name" || propertyName(row) === "type")) literalText(row.initializer, out);
          ts.forEachChild(row, table);
        };
        return table(current.initializer);
      }
    }
    ts.forEachChild(current, find);
  };
  find(node);
}

/**
 * Code without its comments: a snippet's `// Density is per component` uses the word,
 * not the export. A `//` after a colon is a URL's, not a comment.
 */
function withoutComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Backtick spans in prose (Markdown inline code in an md-derived description, a caption). */
function backtickSpans(text: string): string[] {
  return [...text.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]);
}

/** A page's text and its code: the code a subtree shows, plus every backtick span in its text. */
function pageText(source: ts.SourceFile, node: ts.Node, reach: boolean): { text: string; code: string } {
  const text = reach ? reachableText(source, node) : fileText(source);
  const code: string[] = [];
  if (reach) reaching(source, node, (current) => codeIn(source, current, code));
  else codeIn(source, node, code);
  return { text, code: [withoutComments(code.join("\n")), ...backtickSpans(text)].join("\n") };
}

function jsxTagName(node: ts.JsxOpeningLikeElement): string {
  return node.tagName.getText();
}

function attribute(node: ts.JsxOpeningLikeElement, name: string): ts.JsxAttribute | undefined {
  return node.attributes.properties.find((property): property is ts.JsxAttribute =>
    ts.isJsxAttribute(property) && property.name.getText() === name);
}

// The docs frame's titled sections (docs/src/ui/section.tsx, docs/src/ui/tokens-kit.tsx):
// each renders its `title` as the section's H2.
const SECTION_TAGS = new Set(["Section", "TokenSection"]);

/** A titled section (`<Section title="…">`), `<H2>…</H2>`, `<H3>…</H3>` and `<Typography h2|h3>…</Typography>` with literal text. */
function jsxHeadings(node: ts.Node): string[] {
  const headings: string[] = [];
  const visit = (current: ts.Node) => {
    if (ts.isJsxOpeningElement(current) || ts.isJsxSelfClosingElement(current)) {
      const title = attribute(current, "title");
      const value = title?.initializer;
      if (SECTION_TAGS.has(jsxTagName(current)) && value) {
        if (ts.isStringLiteral(value)) headings.push(value.text);
        else if (ts.isJsxExpression(value) && value.expression && ts.isNoSubstitutionTemplateLiteral(value.expression)) headings.push(value.expression.text);
      }
    }
    if (ts.isJsxElement(current)) {
      const tag = jsxTagName(current.openingElement);
      const heading = tag === "H2" || tag === "H3" ||
        (tag === "Typography" && (attribute(current.openingElement, "h2") || attribute(current.openingElement, "h3")));
      const literal = current.children.filter(ts.isJsxText);
      const text = literal.length === current.children.length ? literal.map((child) => child.text).join("").trim() : "";
      if (heading && text) headings.push(text.replace(/\s+/g, " "));
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return headings;
}

function property(node: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  for (const member of node.properties) {
    if (ts.isPropertyAssignment(member) && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) && member.name.text === name) return member.initializer;
  }
  return undefined;
}

function stringProperty(node: ts.ObjectLiteralExpression, name: string): string | undefined {
  const value = property(node, name);
  return value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) ? value.text : undefined;
}

/** The `title` (or `label`, `name`) of each object in an array-valued property: a page's section headings. */
function titlesOf(node: ts.ObjectLiteralExpression, list: string, key: string): string[] {
  const value = property(node, list);
  if (!value || !ts.isArrayLiteralExpression(value)) return [];
  return value.elements.flatMap((element) => {
    const title = ts.isObjectLiteralExpression(element) ? stringProperty(element, key) : undefined;
    return title ? [title] : [];
  });
}

/**
 * A component page's guidance sections (the `guidance` of its generated docs module): each
 * section's title, an h2, then the `{ heading }` blocks under it, its h3s.
 */
function guidanceHeadings(node: ts.ObjectLiteralExpression): string[] {
  const value = property(node, "guidance");
  if (!value || !ts.isArrayLiteralExpression(value)) return [];
  return value.elements.flatMap((section) => {
    if (!ts.isObjectLiteralExpression(section)) return [];
    const title = stringProperty(section, "title");
    const blocks = property(section, "blocks");
    const headings = blocks && ts.isArrayLiteralExpression(blocks)
      ? blocks.elements.flatMap((block) => {
        const heading = ts.isObjectLiteralExpression(block) ? stringProperty(block, "heading") : undefined;
        return heading ? [heading] : [];
      })
      : [];
    return [...(title ? [title] : []), ...headings];
  });
}

function arrayOf(source: ts.SourceFile, name: string): ts.ArrayLiteralExpression {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        return declaration.initializer;
      }
    }
  }
  throw new Error(`${source.fileName}: no array literal named ${name}`);
}

function objectOf(source: ts.SourceFile, name: string): ts.ObjectLiteralExpression {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const init = declaration.initializer;
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name && init) {
        const object = ts.isSatisfiesExpression(init) || ts.isAsExpression(init) ? init.expression : init;
        if (ts.isObjectLiteralExpression(object)) return object;
      }
    }
  }
  throw new Error(`${source.fileName}: no object literal named ${name}`);
}

function walkRoutes(root: string, directory: string, segments: string[], out: { route: string; file: string }[]) {
  for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `${directory}/${entry.name}`;
    // Route groups `(name)` organize files without adding a URL segment.
    const segment = /^\(.*\)$/.test(entry.name) ? null : entry.name;
    if (entry.isDirectory()) walkRoutes(root, path, segment ? [...segments, segment] : segments, out);
    else if (/\.tsx$/.test(entry.name) && !/^[_+]/.test(entry.name)) {
      const stem = entry.name.replace(/\.tsx$/, "");
      out.push({ route: [...segments, ...(stem === "index" ? [] : [stem])].join("/"), file: path });
    }
  }
}

// The `<dir>-docs.tsx` module docgen writes for a component: the examples, Do & Don't
// pairs and prop tables its page renders. Null for a catalog entry with no `.md`.
function componentModule(root: string, entry: CatalogEntry): string | null {
  const dir = entry.dir ?? entry.slug;
  const file = `${EXAMPLES_DIR}/${entry.category.toLowerCase()}/${dir}/${dir}-docs.tsx`;
  return existsSync(resolve(root, file)) ? file : null;
}

/**
 * Every page of the docs app by route: the static screens under docs/src/app, one
 * page per component, variant, pattern and template behind the dynamic routes. A
 * dynamic route this does not know fails, so a new kind of page is never invisible.
 */
export function docsPages(root: string, components: readonly CatalogEntry[]): Map<string, DocsPage> {
  const pages = new Map<string, DocsPage>();
  const add = (page: DocsPage) => {
    if (pages.has(page.route)) throw new Error(`Two docs pages claim the route ${page.route || "/"}`);
    pages.set(page.route, page);
  };
  const files: { route: string; file: string }[] = [];
  walkRoutes(root, APP_DIR, [], files);

  const dynamic = new Set<string>();
  for (const { route, file } of files) {
    if (route.startsWith(HARNESS_PREFIX)) continue;
    if (route.includes("[")) {
      dynamic.add(route);
      continue;
    }
    const source = parse(root, file);
    add({ route, sources: [file], ...pageText(source, source, false), headings: jsxHeadings(source) });
  }

  const known = ["components/[slug]", "components/[slug]/[variant]", "patterns/[slug]", "templates/[slug]"];
  for (const route of dynamic) if (!known.includes(route)) throw new Error(`Unknown dynamic docs route ${route}: teach tools/api/docs.ts what pages it serves`);

  if (dynamic.has("components/[slug]")) {
    for (const entry of components) {
      const file = componentModule(root, entry);
      const sources = [`${DATA_DIR}/components.ts`, ...(file ? [file] : [])];
      const catalogText = `${entry.name}\n${entry.description}`;
      let text = catalogText;
      let code = backtickSpans(catalogText).join("\n");
      let headings: string[] = [];
      let examples: string[] = [];
      if (file) {
        const source = parse(root, file);
        const docs = objectOf(source, "docs");
        const module = pageText(source, docs, true);
        text += `\n${module.text}`;
        code += `\n${module.code}`;
        examples = titlesOf(docs, "examples", "label");
        headings = [...examples, ...titlesOf(docs, "donts", "title"), ...titlesOf(docs, "props", "name"), ...guidanceHeadings(docs)];
      }
      const page: DocsPage = { route: `components/${entry.slug}`, sources, text, code, headings };
      add(page);
      // The deep link to each non-default example renders the same reference page.
      if (dynamic.has("components/[slug]/[variant]")) {
        for (const label of examples.slice(1)) add({ ...page, route: `components/${entry.slug}/${variantSlug(label)}` });
      }
    }
  }

  if (dynamic.has("patterns/[slug]")) {
    const file = `${DATA_DIR}/patterns.tsx`;
    const source = parse(root, file);
    for (const element of arrayOf(source, "PATTERNS").elements) {
      if (!ts.isObjectLiteralExpression(element)) throw new Error(`${file}: a PATTERNS entry is not an object literal`);
      const slug = stringProperty(element, "slug");
      if (!slug) throw new Error(`${file}: a PATTERNS entry has no literal slug`);
      add({ route: `patterns/${slug}`, sources: [file], ...pageText(source, element, true), headings: titlesOf(element, "sections", "title") });
    }
  }

  if (dynamic.has("templates/[slug]")) {
    const file = `${DATA_DIR}/templates.tsx`;
    const index = parse(root, file);
    const imports = new Map<string, string>();
    for (const statement of index.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      for (const element of statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings) ? statement.importClause.namedBindings.elements : []) {
        imports.set(element.name.text, statement.moduleSpecifier.text);
      }
    }
    for (const element of arrayOf(index, "TEMPLATES").elements) {
      const specifier = ts.isIdentifier(element) ? imports.get(element.text) : undefined;
      if (!specifier || !ts.isIdentifier(element)) throw new Error(`${file}: a TEMPLATES entry is not an imported template`);
      const templateFile = relative(root, resolve(root, dirname(file), `${specifier}.tsx`)).replaceAll("\\", "/");
      const source = parse(root, templateFile);
      const template = objectOf(source, element.text);
      const slug = stringProperty(template, "slug");
      if (!slug) throw new Error(`${templateFile}: ${element.text} has no literal slug`);
      add({ route: `templates/${slug}`, sources: [templateFile], ...pageText(source, source, false), headings: titlesOf(template, "sections", "title") });
    }
  }
  return pages;
}

/** Whether `text` names `name` as a whole identifier (`Grid` is not named by `GridItem`). */
export function mentions(text: string, name: string): boolean {
  const escaped = name.replace(/[$]/g, "\\$");
  return new RegExp(`(?<![\\w$])${escaped}(?![\\w$])`).test(text);
}

/**
 * Whether a name is also an ordinary word: one lowercase word, one capitalized word or
 * one all-capitals word (`palette`, `Surface`, `FILL`). Prose uses those words for their
 * meaning, so only code can name the export.
 */
export function ordinaryWord(name: string): boolean {
  return /^(?:[A-Z]?[a-z]+|[A-Z]+)$/.test(name);
}

/** Whether a page names an export: anywhere in its text, or in its code for an ordinary word. */
export function names(page: Pick<DocsPage, "text" | "code">, name: string): boolean {
  return mentions(ordinaryWord(name) ? page.code : page.text, name);
}
