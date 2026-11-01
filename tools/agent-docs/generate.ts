// Source-only, deterministic agent documentation. No network, runtime render, or UI edits.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { componentPages } from "../docgen/pages.ts";
import { extractInherited, extractProps, isPropSource, program, type PropDoc, type PropGroup } from "../docgen/extract-props.ts";
import { parseDoc, platformView } from "../docgen/parse-md.ts";
import { moduleExports } from "../api/discover.ts";
import { publicApi } from "../api/manifest.ts";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import { GLOBAL_OUTPUTS, json, normalizeMarkdown, ORIGIN, publicGuideLinks, renderAgents, section, sha256, snapshotWrites, validateArchives, type SnapshotManifest } from "./model.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(ROOT, "docs/public");
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), "utf8");
const rel = (file: string) => path.relative(ROOT, file).replaceAll("\\", "/");
const walk = (dir: string): string[] => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]) : [];

export function generate(): Map<string, string> {
  const pkg = JSON.parse(read("package.json"));
  const version: string = pkg.version;
  const prefix = `ai/${version}/`;
  const base = `${ORIGIN}/${prefix}`;
  const prog = program();
  const checker = prog.getTypeChecker();
  const entry = prog.getSourceFile(path.join(ROOT, "src/index.ts"))!;
  const publicModule = checker.getSymbolAtLocation(entry)!;
  const exported = checker.getExportsOfModule(publicModule);
  const api = moduleExports(prog, entry.fileName, ROOT);
  const names = new Set(api.map((item) => item.name));
  const valueNames = new Set(api.filter((item) => item.value).map((item) => item.name));
  const dependencies = Object.entries(pkg.peerDependencies as Record<string, string>).map(([name, range]) => ({ name, range, optional: pkg.peerDependenciesMeta?.[name]?.optional === true }));
  const pages = componentPages(ROOT);
  const propSources = pages.flatMap((page) => fs.readdirSync(path.dirname(path.join(ROOT, page.source))).filter(isPropSource).sort().map((file) => ({ dir: page.dir, file: path.join(ROOT, path.dirname(page.source), file) })));
  const extracted = extractProps(propSources, prog);
  const inherited = extractInherited(prog);

  // Hash every authored kit source and every generator/parser input, not generated output.
  // No timestamps or Git state: the same source tree produces byte-identical snapshots.
  const sourceFiles = [...new Set([
    ...walk(path.join(ROOT, "src")).filter((file) => /\.(?:ts|tsx|md)$/.test(file)).map(rel),
    ...["tools/agent-docs", "tools/docgen", "tools/api"].flatMap((dir) => walk(path.join(ROOT, dir))).filter((file) => /\.(?:ts|md)$/.test(file) && !/\.test\.ts$/.test(file) && !file.includes("/fixtures/")).map(rel),
    "package.json", "bun.lock", "README.md", "tsconfig.json", "docs/src/core/data/components.ts", "docs/src/core/data/detail-sections.ts",
  ])].sort();
  const sources = Object.fromEntries(sourceFiles.map((file) => [file, sha256(read(file))]));
  const sourceHash = sha256(json(sources));
  const outputs = new Map<string, string>();
  const note = `Package: ${pkg.name}\nVersion: ${version}\nStatus: source-snapshot (not proof of an npm release)\nSource SHA-256: ${sourceHash}\n`;
  const put = (file: string, body: string) => outputs.set(`${prefix}${file}`, `${body.trim()}\n`);
  const pageHeader = (title: string) => `# ${title}\n\n${note}\n`;

  function typeSymbol(name: string): ts.Symbol | undefined {
    const symbol = exported.find((item) => item.name === name);
    return symbol && (symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol);
  }

  // Reuse docgen's descriptions, defaults, axis grouping and intentional internal-prop
  // omissions. Resolve complete types separately: the visual table truncates long unions.
  function fullGroup(group: PropGroup): PropGroup {
    const symbol = typeSymbol(group.name);
    if (!symbol) throw new Error(`Props are not publicly exported: ${group.name}`);
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    const axes = [...group.groups];
    const shared = group.inherits.flatMap((name) => Object.values(inherited).filter((item) => name.includes(item.name)).flatMap((item) => {
      const offset = axes.length;
      axes.push(...item.groups);
      return item.props.map((prop) => ({ ...prop, ...(prop.group === undefined ? {} : { group: prop.group + offset }) }));
    }));
    const own = [...group.props, ...shared.filter((prop) => type.getProperty(prop.name) && !group.props.some((own) => own.name === prop.name))];
    const props = own.map((prop): PropDoc => {
      const member = type.getProperty(prop.name);
      const at = member?.valueDeclaration ?? member?.declarations?.[0];
      return member && at ? { ...prop, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(member, at), at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope) } : prop;
    });
    // The visual Icon reference uses a glyph gallery rather than hundreds of
    // rows. A machine catalog needs those supported booleans as well. Preserve
    // docgen's exclusion of the explicitly internal paint channel.
    for (const member of checker.getPropertiesOfType(type)) {
      if (props.some((prop) => prop.name === member.name)) continue;
      const at = member.valueDeclaration ?? member.declarations?.[0] ?? entry;
      if (ts.isInterfaceDeclaration(at.parent) && at.parent.name.text === "IconInternalProps") continue;
      props.push({ name: member.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(member, at), at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope), required: !(member.flags & ts.SymbolFlags.Optional), description: ts.displayPartsToString(member.getDocumentationComment(checker)).replace(/\s+/g, " ") });
    }
    return { ...group, props, groups: axes };
  }

  function hostGroup(name: string): PropGroup | undefined {
    const symbol = typeSymbol(name);
    if (!symbol) return undefined;
    const at = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? entry;
    const host = checker.getTypeOfSymbolAtLocation(symbol, at);
    const signature = host.getCallSignatures()[0];
    const parameter = signature?.getParameters()[0];
    let props = parameter && checker.getTypeOfSymbolAtLocation(parameter, at);
    if (!props) {
      const instance = host.getConstructSignatures()[0]?.getReturnType();
      const member = instance?.getProperty("props");
      if (member) props = checker.getTypeOfSymbolAtLocation(member, at);
    }
    if (!props) return undefined;
    return { name: `${name} host props`, groups: [], inherits: [], props: checker.getPropertiesOfType(props).map((prop) => {
      const declaration = prop.valueDeclaration ?? prop.declarations?.[0] ?? at;
      return { name: prop.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, declaration), declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope), required: !(prop.flags & ts.SymbolFlags.Optional), description: ts.displayPartsToString(prop.getDocumentationComment(checker)).replace(/\s+/g, " ") };
    }) };
  }

  function propTable(group: PropGroup): string {
    const escape = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");
    return `### ${group.name}\n\n${group.inherits.length ? `Includes ${group.inherits.map((name) => `\`${name}\``).join(", ")}; their supported fields are expanded below.\n\n` : ""}| Prop | Type | Required | Default | Description |\n| --- | --- | --- | --- | --- |\n${group.props.map((prop) => `| ${escape(prop.name)} | ${escape(prop.type)} | ${prop.required ? "yes" : "no"} | ${escape(prop.default ?? "")} | ${escape(prop.description)} |`).join("\n")}`;
  }

  const components = pages.map((page) => {
    const registration = COMPONENTS.find((item) => (item.dir ?? item.slug) === page.dir);
    if (!registration) throw new Error(`No docs registration for ${page.source}`);
    const slug = registration.slug;
    const directory = path.dirname(page.source) + "/";
    const exports = api.filter((item) => item.files.some((file) => file.startsWith(directory)) || publicApi[item.name]?.docs === `components/${slug}`).map((item) => item.name).sort();
    const groups = (extracted[page.dir] ?? []).filter((group) => names.has(group.name)).map(fullGroup);
    // Raw RN primitives have no co-located Props source; their actual public Props
    // aliases (or host call signatures) still supply the supported prop names/types.
    if (!groups.length) for (const name of exports.filter((name) => name.endsWith("Props"))) {
      const symbol = typeSymbol(name);
      if (!symbol) continue;
      const type = checker.getDeclaredTypeOfSymbol(symbol);
      groups.push({ name, groups: [], inherits: [], props: checker.getPropertiesOfType(type).map((prop) => {
        const at = prop.valueDeclaration ?? prop.declarations?.[0] ?? entry;
        return { name: prop.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, at), at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope), required: !(prop.flags & ts.SymbolFlags.Optional), description: ts.displayPartsToString(prop.getDocumentationComment(checker)).replace(/\s+/g, " ") };
      }) });
    }
    if (!groups.length) for (const name of exports.filter((name) => api.some((item) => item.name === name && item.renderable))) {
      const group = hostGroup(name);
      if (group) groups.push(group);
    }
    const markdown = normalizeMarkdown(platformView(page.content, "web").text, names);
    const parsed = parseDoc(page.content, "web");
    const platformNotes = Object.fromEntries((["web", "ios", "android"] as const).map((platform) => {
      const text = platformView(page.content, platform).text;
      // Retain documented intro/platform behavior verbatim; do not infer guarantees
      // from filenames or confuse audit sign-off with shipped support.
      return [platform, text.split(/^## /m)[0].replace(/^# .*\n/, "").trim()];
    }));
    const body = `${pageHeader(registration.name)}Source: \`${page.source}\`\nHuman reference: ${ORIGIN}/components/${slug}\n\n## Public imports\n\n\`\`\`tsx\nimport { ${exports.filter((name) => valueNames.has(name)).join(", ")} } from "@nannier/canvas";\n\`\`\`\n\nThe following examples are source excerpts. Supply application data and handlers; snippets using \`tokens\` read \`const { tokens } = useTheme()\` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.\n\n${markdown.replace(/^# .*\n/, "").trim()}\n\n## Supported props\n\n${groups.map(propTable).join("\n\n")}\n\nSee [installation](${base}installation.md) for required peers and feature fallbacks.\n`;
    put(`components/${slug}.md`, body);
    const directPeers = new Set<string>();
    for (const file of walk(path.join(ROOT, directory)).filter((file) => /\.tsx?$/.test(file))) {
      const source = prog.getSourceFile(file);
      if (!source) continue;
      const visit = (node: ts.Node) => {
        if (ts.isStringLiteral(node) && dependencies.some((peer) => node.text === peer.name || node.text.startsWith(`${peer.name}/`))) {
          const owner = node.parent;
          if (ts.isImportDeclaration(owner) || ts.isExportDeclaration(owner) || (ts.isCallExpression(owner) && (owner.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(owner.expression) && owner.expression.text === "require")))) {
            for (const peer of dependencies) if (node.text === peer.name || node.text.startsWith(`${peer.name}/`)) directPeers.add(peer.name);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    const componentDependencies = dependencies.filter((peer) => !peer.optional || directPeers.has(peer.name));
    return { slug, name: registration.name, category: page.category, description: parsed.description, source: page.source, url: `${base}components/${slug}.md`, humanUrl: `${ORIGIN}/components/${slug}`, exports, dependencies: componentDependencies, propGroups: groups, platformNotes };
  }).sort((a, b) => a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);

  const readme = read("README.md");
  const installation = section(readme, "## Install").replace(/The \[Expo starter\]\(\.\/examples\/starter\/README\.md\) pins a released\nversion in its own manifest and lockfile\./, "The [packaged recipe onboarding](./examples/starter/README.md) explains how to create an app when your installed release provides the CLI.").replace(/The compiled npm package is MIT-licensed; the repository and\nstarter have separate \[source terms\]\(#license\)\./, "The npm package and its packaged recipes are MIT-licensed. The private repository and its development-only starter retain separate [source terms](#license).");
  const quickStart = section(readme, "## Quick start").split("### Overlay hosting")[0].replace(/For a complete runnable application,[\s\S]*?Its source follows the repository's all-rights-reserved terms\./, "For a runnable application, follow the [packaged recipe onboarding](./examples/starter/README.md). Check CLI availability in your installed release, then choose settings, dashboard or booking. Packaged recipes follow the npm package's LICENSE.");
  put("installation.md", `${pageHeader("Installation and runtime support")}${publicGuideLinks(installation, version)}\n\n## Quick start\n\n${publicGuideLinks(quickStart, version)}\n\n## Platforms\n\n${publicGuideLinks(section(readme, "## Platforms"), version)}\n\nUse the declarations installed with your dependency as the final API authority; this snapshot follows the source package version, not a registry lookup.\n`);
  put("overlays.md", `${pageHeader("Overlay hosting")}${section(readme, "### Overlay hosting")}\n\n## Dialog trigger focus\n\nKeep the trigger mounted and focusable while the dialog opens so the focus manager can capture the return target. Avoid disabling that trigger on the same render that sets \`open\`; use the modal backdrop and focus isolation to prevent background interaction. On close, return focus to the trigger.\n\nComponent behavior and controlled/uncontrolled props: [Dialog](${base}components/dialog.md), [Popover](${base}components/popover.md), [Select](${base}components/select.md).\n`);
  const themeGroups = extractProps([{ dir: "theme", file: path.join(ROOT, "src/style/theme.tsx") }], prog).theme?.filter((group) => names.has(group.name)).map(fullGroup) ?? [];
  put("theming.md", `${pageHeader("Theming and semantic props")}Wrap the application in \`ThemeProvider\`. Use flat boolean styling props; choose at most one prop per visual axis, such as \`primary\`, \`large\`, and \`loading\`.\n\nThe default accent is violet. The \`cyan\`, \`mint\`, \`rose\`, and \`amber\` palettes apply in both light and dark schemes. Omitted scheme follows the OS; omitted surface selects the platform default. Material capability and accessibility preferences can select a solid fallback.\n\n\`\`\`tsx\nimport { ThemeProvider, OverlayProvider, Button } from "@nannier/canvas";\n\nexport default function App() {\n  return <ThemeProvider dark rose><OverlayProvider><Button primary large>Save</Button></OverlayProvider></ThemeProvider>;\n}\n\`\`\`\n\n${themeGroups.map(propTable).join("\n\n")}\n`);
  put("layout.md", `${pageHeader("Layout and responsive bounds")}Parents provide bounds. Use \`Container\` measure steps, \`Row\` and \`Column\` spacing/alignment booleans, \`span\` for twelfths, and \`Grid\` for responsive tiles. A field fills its parent; a button hugs its contents unless \`block\` or a supported measure step changes it. Do not set fixed component widths or invent string variant props. Measure the component's own container for internal reflow; viewport breakpoints are for application chrome.\n\n${["container", "row-column", "grid"].map((slug) => `- [${slug}](${base}components/${slug}.md)`).join("\n")}\n\n${propTable(fullGroup(inherited.MeasureProps))}\n`);
  const catalog = { schemaVersion: 1, package: pkg.name, version, status: "source-snapshot", sourceHash, importFrom: pkg.name, dependencies, exports: api.map((item) => ({ name: item.name, kind: publicApi[item.name]?.kind ?? (item.value ? "value" : "type"), deprecated: item.deprecated, docs: publicApi[item.name]?.docs ? `${ORIGIN}/${publicApi[item.name].docs}` : null })), theme: themeGroups, sharedProps: Object.values(inherited).filter((group) => names.has(group.name)).map(fullGroup), components };
  outputs.set(`${prefix}catalog.json`, json(catalog));
  const guides = ["installation", "theming", "layout", "overlays"];
  put("index.md", `${pageHeader("Canvas agent documentation")}This generated source snapshot describes \`${pkg.name}\` at repository package version \`${version}\`. Check the application's installed package version and its declarations before using an API. A source snapshot is not a claim that npm has published this version.\n\n## Guides\n\n${guides.map((guide) => `- [${guide}](${base}${guide}.md)`).join("\n")}\n- [Machine catalog](${base}catalog.json)\n- [Content and source manifest](${base}manifest.json)\n\n## Components\n\n${components.map((item) => `- [${item.name}](${item.url}): ${item.description ?? ""}`).join("\n")}\n`);
  outputs.set("agents.md", renderAgents(read("tools/agent-docs/agents.md"), version));
  outputs.set("llms.txt", `# Canvas\n\n> Universal React Native UI kit for iOS, Android, and web. Import from @nannier/canvas.\n\nRepository source snapshot: ${version}; not proof of an npm release. Match the installed dependency version before using these APIs.\n\n## Start here\n\n- [Agent onboarding](${ORIGIN}/agents.md): recipes, local skills and installed-version checks.\n- [Versioned source reference](${base}index.md): installation, guides and all component pages.\n- [Installation](${base}installation.md): required and optional peers, fallbacks and runtime support.\n- [Theme](${base}theming.md): boolean props, palettes, surface and ThemeProvider API.\n- [Layout](${base}layout.md): parent bounds and responsive composition.\n- [Overlays](${base}overlays.md): provider hosting, windows and focus behavior.\n- [Catalog](${base}catalog.json): public exports, supported props and source platform notes.\n- [Manifest](${base}manifest.json): source hashes and snapshot content hashes.\n- [Full source reference](${ORIGIN}/llms-full.txt): concatenated Markdown for this source version.\n- [Human docs](${ORIGIN}/components): live examples.\n`);
  outputs.set("llms-full.txt", [...outputs.entries()].filter(([file]) => file.endsWith(".md")).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, content]) => `<!-- Source: ${ORIGIN}/${file} -->\n${content}`).join("\n---\n\n"));
  const manifest: SnapshotManifest = { schemaVersion: 1, package: pkg.name, version, status: "source-snapshot", sourceHash, sources, files: Object.fromEntries([...outputs.entries()].filter(([file]) => file.startsWith(prefix)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, content]) => [file.slice(prefix.length), sha256(content)])), globalFiles: Object.fromEntries(GLOBAL_OUTPUTS.map((file) => [file, sha256(outputs.get(file)!)])) };
  outputs.set(`${prefix}manifest.json`, json(manifest));
  return outputs;
}

export function run(check = false): void {
  const outputs = generate();
  const version = JSON.parse(read("package.json")).version as string;
  const files = [...walk(path.join(PUBLIC, "ai")), ...GLOBAL_OUTPUTS.map((file) => path.join(PUBLIC, file)).filter(fs.existsSync)];
  const existing = new Map(files.map((file) => [path.relative(PUBLIC, file).replaceAll("\\", "/"), fs.readFileSync(file, "utf8")]));
  // Detect archive tampering or incomplete copies; never regenerate older versions.
  validateArchives(version, existing);
  const drift = snapshotWrites(version, outputs, existing);
  if (check && drift.length) throw new Error(`Agent documentation drift; run bun tools/agent-docs/generate.ts:\n${drift.join("\n")}`);
  if (!check) for (const file of drift) {
    const target = path.join(PUBLIC, file);
    const content = outputs.get(file);
    if (content === undefined) fs.rmSync(target);
    else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); }
  }
  console.log(`Agent docs ${version}: ${outputs.size} files ${check ? "checked" : "generated"}, ${drift.length} ${check ? "drifted" : "updated"}.`);
}

if (import.meta.main) run(process.argv.includes("--check"));
