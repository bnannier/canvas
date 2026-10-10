import { afterAll, describe, it, expect } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { checklistSignOffs, componentPages, pageStructureViolations, registeredComponents, registrySlugLines, REGISTRY_SOURCE, type ComponentPage } from "./pages.ts";
import { ACCESSIBILITY_SECTION, docStructureViolations, parseDoc, splitDoc } from "./parse-md.ts";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";

// The structure gate over the real pages. docs:gen and docs:gen:check run the same
// check (tools/docgen/pages.ts) and refuse to generate when it finds anything; this
// holds every page to it in `bun run test` too, so a page that loses a section, or a
// component registered without a page, fails the unit run as well as the push.

const REPO = path.join(import.meta.dir, "..", "..");
const F = "```";

// What a page declares, read straight off its lines with none of parse-md's model: a
// page the gate passes spells every heading "## Name" / "### Name", so plain string
// matching is a fair second opinion. Examples are the Usage fence (as Default) and each
// variant's first fence, less a variant that repeats Usage; captions are each marker's
// whole paragraph, with its leading separator dropped.
function declared(md: string): { examples: { label: string; code: string }[]; titles: string[]; captions: string[] } {
  const lines = md.split("\n");
  let section = "";
  let label: string | null = null;
  let usage: string | null = null;
  const variants: { label: string; code: string }[] = [];
  const titles: string[] = [];
  const captions: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith(F)) {
      const code: string[] = [];
      for (i++; i < lines.length && lines[i] !== F; i++) code.push(lines[i]);
      if (section === "Usage" && usage === null) usage = code.join("\n");
      if (section === "Variants" && label !== null) variants.push({ label, code: code.join("\n") });
      label = null;
      continue;
    }
    if (line.startsWith("## ")) { section = line.slice(3); label = null; }
    else if (line.startsWith("### ") && section === "Variants") label = line.slice(4);
    else if (line.startsWith("### ") && section === "Do & Don't") titles.push(line.slice(4));
    else if (section === "Do & Don't") {
      const m = /^\*\*(Do|Don't)\*\*\s*(?:[:\u2013\u2014-])?\s*(.*)$/.exec(line);
      if (!m) continue;
      const words = [m[2]];
      while (i + 1 < lines.length && lines[i + 1].trim() !== "" && !lines[i + 1].startsWith(F)) words.push(lines[++i].trim());
      captions.push(`${m[1]}: ${words.join(" ")}`);
    }
  }
  const examples = [...(usage ? [{ label: "Default", code: usage }] : []), ...variants.filter((v) => v.code !== usage)];
  return { examples, titles, captions };
}

describe("component pages", () => {
  const pages = componentPages(REPO);
  const registry = registeredComponents(REPO);

  it("finds one page per registered component and no page without one", () => {
    expect(pages.map((p) => p.dir).sort()).toEqual(COMPONENTS.map((c) => c.dir ?? c.slug).sort());
  });

  it("every page has the shape docgen expects (rules S1 to S10)", () => {
    expect(pageStructureViolations(pages, registry)).toEqual([]);
  });

  // S8 straight from the model: no page has a line the docs page never shows.
  it("every non-blank line of every page reaches the page as written", () => {
    for (const page of pages) expect({ page: page.source, unconsumed: parseDoc(page.content).unconsumed }).toEqual({ page: page.source, unconsumed: [] });
  });

  // S10 against the real checklists: a page whose component the audit has signed off
  // carries its Accessibility section.
  it("every signed-off component's page carries '## Accessibility'", () => {
    for (const c of registry.filter((r) => r.signedOff.length > 0)) {
      const page = pages.find((p) => p.dir === (c.dir ?? c.slug));
      expect({ slug: c.slug, accessibility: parseDoc(page?.content ?? "").guidance.some((g) => g.title === ACCESSIBILITY_SECTION) }).toEqual({ slug: c.slug, accessibility: true });
    }
  });

  // The gate and the generator read a page through one model; this holds them to each
  // other from outside it. Every example and pair a passing page declares reaches the
  // generated docs, and every caption is read whole (no wrapped line left behind).
  it("the generator renders every example and pair each page declares, captions whole", () => {
    for (const page of pages) {
      const { examples, donts } = splitDoc(page.content);
      const want = declared(page.content);
      const got = {
        examples,
        titles: donts.map((d) => d.title),
        captions: donts.flatMap((d) => [`Do: ${d.do.caption}`, `Don't: ${d.dont.caption}`]).sort(),
      };
      expect({ page: page.source, ...got }).toEqual({ page: page.source, ...want, captions: [...want.captions].sort() });
    }
  });

  it("locates every registry entry at its own slug line", () => {
    const source = fs.readFileSync(path.join(REPO, REGISTRY_SOURCE), "utf8").split("\n");
    expect(registry).toHaveLength(COMPONENTS.length);
    for (const c of registry) expect(source[c.line - 1]).toContain(`slug: ${JSON.stringify(c.slug)}`);
  });
});

// The reviewer's probe, on a real page: a heading Markdown still reads as the section
// (two spaces, a tab, an indent, a closing "#" run) fails the gate at its line, and the
// generator reads the page exactly as it reads the pristine one, so a typo can never
// pass the gate and drop the section.
describe("a loosely spelled heading on a real page", () => {
  const badge = componentPages(REPO).find((p) => p.dir === "badge");
  if (!badge) throw new Error("src/atoms/badge/badge.md is gone; point this probe at another page");
  const pristine = splitDoc(badge.content);
  const lineOf = (heading: string) => badge.content.split("\n").indexOf(heading) + 1;

  for (const [heading, loose] of [
    ["## Do & Don't", "##  Do & Don't"],
    ["## Variants", "##  Variants"],
    ["## Variants", "##\tVariants"],
    ["## Variants", " ## Variants"],
    ["## Usage", "## Usage ##"],
    ["## Do & Don't", "## Do & Don't "],
  ] as const) {
    it(`${JSON.stringify(loose)} fails S3 and still parses as ${JSON.stringify(heading)}`, () => {
      const line = lineOf(heading);
      expect(line).toBeGreaterThan(0);
      const md = badge.content.split("\n").map((l, i) => (i === line - 1 ? loose : l)).join("\n");
      expect(docStructureViolations(md, { name: "Badge" }).map((v) => `${v.line} ${v.rule}`)).toEqual([`${line} S3`]);
      expect(splitDoc(md)).toEqual(pristine);
    });
  }
});

// The same probe for a "##" where Do & Don't wants none: a pair's "###" title typed as
// "##", or a "##" with no name. Markdown and the parser both read it as a new section,
// which ends Do & Don't there and takes the pairs after it off the page, so the gate
// fails it at its line instead of passing a page that renders a fraction of its pairs.
describe("a stray '##' inside Do & Don't on a real page", () => {
  const badge = componentPages(REPO).find((p) => p.dir === "badge");
  if (!badge) throw new Error("src/atoms/badge/badge.md is gone; point this probe at another page");
  const lines = badge.content.split("\n");
  const pristine = splitDoc(badge.content).donts;
  // The second pair's "###" title, so a pair still precedes the stray heading.
  const dontsAt = lines.indexOf("## Do & Don't");
  const titles = lines.map((l, i) => (i > dontsAt && l.startsWith("### ") ? i : -1)).filter((i) => i !== -1);
  const second = titles[1];
  if (second === undefined) throw new Error("src/atoms/badge/badge.md has fewer than two Do & Don't pairs; point this probe at another page");

  it(`"## ${lines[second].slice(4)}" for its "###" title fails S7 at its line`, () => {
    const md = lines.map((l, i) => (i === second ? `## ${l.slice(4)}` : l)).join("\n");
    expect(splitDoc(md).donts).toEqual(pristine.slice(0, 1));
    expect(docStructureViolations(md, { name: "Badge" }).map((v) => `${v.line} ${v.rule}`)).toEqual([`${second + 1} S7`]);
  });

  it(`a "##" with no name before "${lines[second]}" fails S3 at its line`, () => {
    const md = [...lines.slice(0, second), "##", "", ...lines.slice(second)].join("\n");
    expect(splitDoc(md).donts).toEqual(pristine.slice(0, 1));
    expect(docStructureViolations(md, { name: "Badge" }).map((v) => `${v.line} ${v.rule}`)).toEqual([`${second + 1} S3`]);
  });
});

describe("pageStructureViolations", () => {
  const body =
    `A widget.\n\n## Usage\n\n${F}tsx\n<Widget />\n${F}\n\n## Variants\n\n### Small\n\n${F}tsx\n<Widget small />\n${F}\n\n` +
    `## Do & Don't\n\n### Labels\n\n**Do**: Name it.\n\n${F}tsx\n<Widget label="Name" />\n${F}\n\n` +
    `**Don't**: Leave it unnamed.\n\n${F}tsx\n<Widget />\n${F}\n`;
  const pageOf = (dir: string, title: string, text = body): ComponentPage => ({
    category: "atoms",
    dir,
    source: `src/atoms/${dir}/${dir}.md`,
    content: `# ${title}\n\n${text}`,
  });

  const widget = { slug: "widget", name: "Widget", line: 8, signedOff: [] };

  it("passes pages that match the registry, by dir or by slug", () => {
    const pages = [pageOf("widget", "Widget"), pageOf("layout", "Row & Column")];
    const registry = [widget, { slug: "row-column", dir: "layout", name: "Row & Column", line: 14, signedOff: [] }];
    expect(pageStructureViolations(pages, registry)).toEqual([]);
  });

  it("locates a page's own findings at its source path and line", () => {
    const pages = [pageOf("widget", "Widget", body.slice(0, body.indexOf("## Do & Don't")))];
    expect(pageStructureViolations(pages, [widget])).toEqual([
      `src/atoms/widget/widget.md:17 S3: "## Do & Don't" is missing; a page has Usage, Variants and Do & Don't, in that order`,
    ]);
  });

  it("checks the title against the registry name", () => {
    const [finding] = pageStructureViolations([pageOf("widget", "Gizmo")], [widget]);
    expect(finding).toStartWith("src/atoms/widget/widget.md:1 S1: ");
  });

  it("rejects a page no registered component documents", () => {
    const [finding] = pageStructureViolations([pageOf("widget", "Widget")], []);
    expect(finding).toStartWith("src/atoms/widget/widget.md:1 S1: no component in docs/src/core/data/components.ts");
  });

  it("rejects a registered component with no page, at the entry's line in the registry", () => {
    expect(pageStructureViolations([], [{ slug: "row-column", dir: "layout", name: "Row & Column", line: 47, signedOff: [] }])).toEqual([
      `docs/src/core/data/components.ts:47 S1: "Row & Column" has no page; add src/<category>/layout/layout.md`,
    ]);
  });
});

// S10 from a checklist on disk: a copy of a real audit checklist (Button's, the format
// tools/audit/checklists.ts writes) with a run id typed into one sign-off row, in a
// fixture repo of its own, so the rule is proven on the file a reviewer would edit.
describe("the Accessibility section follows the audit's sign-off", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-docgen-signoff-"));
  afterAll(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const real = fs.readFileSync(path.join(REPO, "audit/components/button.md"), "utf8");
  if (!/^\| web \|  \|  \|  \|  \|$/m.test(real)) throw new Error("audit/components/button.md has no blank web sign-off row; point this fixture at an unsigned checklist");
  const signed = real.replace(/^\| web \|  \|  \|  \|  \|$/m, "| web | 2026-10-09T12-00-00 | reviewer | 2026-10-09 | pass |");
  fs.mkdirSync(path.join(fixture, "audit/components"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "audit/components/widget.md"), signed);
  fs.writeFileSync(path.join(fixture, "audit/components/gadget.md"), real);

  const body =
    `A widget.\n\n## Usage\n\n${F}tsx\n<Widget />\n${F}\n\n## Variants\n\n### Small\n\n${F}tsx\n<Widget small />\n${F}\n\n` +
    `## Do & Don't\n\n### Labels\n\n**Do**: Name it.\n\n${F}tsx\n<Widget label="Name" />\n${F}\n\n` +
    `**Don't**: Leave it unnamed.\n\n${F}tsx\n<Widget />\n${F}\n`;
  const page = (text: string): ComponentPage => ({ category: "atoms", dir: "widget", source: "src/atoms/widget/widget.md", content: `# Widget\n\n${text}` });
  const widget = (signedOff: readonly string[]) => [{ slug: "widget", name: "Widget", line: 8, signedOff }];

  it("reads the platforms a checklist signs off, and none from an unsigned or missing one", () => {
    expect(checklistSignOffs(fixture, "widget")).toEqual(["web"]);
    expect(checklistSignOffs(fixture, "gadget")).toEqual([]);
    expect(checklistSignOffs(fixture, "missing")).toEqual([]);
    expect(checklistSignOffs(REPO, "button")).toEqual([]);
  });

  it("fails a signed-off component's page with no '## Accessibility' (S10), at its end", () => {
    const findings = pageStructureViolations([page(body)], widget(checklistSignOffs(fixture, "widget")));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toStartWith(`src/atoms/widget/widget.md:${body.split("\n").length + 1} S10: audit/components/widget.md signs this component off (web)`);
  });

  it("passes it once the page carries the section, and asks nothing of an unsigned component", () => {
    const withSection = `${body}\n## Accessibility\n\nThe widget is a button named by its label.\n`;
    expect(pageStructureViolations([page(withSection)], widget(checklistSignOffs(fixture, "widget")))).toEqual([]);
    expect(pageStructureViolations([page(body)], widget(checklistSignOffs(fixture, "gadget")))).toEqual([]);
  });
});

describe("registrySlugLines", () => {
  it("finds each entry's slug line in the registry source, the first of a repeated slug", () => {
    const source = [
      `import type { ComponentDoc } from "./types";`,
      ``,
      `export const COMPONENTS: ComponentDoc[] = [`,
      `  {`,
      `    slug: "view",`,
      `    name: "View",`,
      `  },`,
      `  { slug: "row-column", dir: "layout", name: "Row & Column" },`,
      `  { name: "Again", slug: "view" },`,
      `];`,
    ].join("\n");
    expect([...registrySlugLines(source)]).toEqual([["view", 5], ["row-column", 8]]);
  });

  it("reads only string-literal slugs, never one in a comment or a computed one", () => {
    const source = `// slug: "ghost"\nconst s = "x";\nexport const COMPONENTS = [{ slug: s, name: "X" }, { slug: \`t\`, name: "T" }];`;
    expect(registrySlugLines(source).size).toBe(0);
  });
});
