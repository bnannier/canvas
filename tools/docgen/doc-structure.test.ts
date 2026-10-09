import { describe, it, expect } from "bun:test";
import * as path from "node:path";
import { componentPages, pageStructureViolations, type ComponentPage } from "./pages.ts";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";

// The structure gate over the real pages. docs:gen and docs:gen:check run the same
// check (tools/docgen/pages.ts) and refuse to generate when it finds anything; this
// holds every page to it in `bun run test` too, so a page that loses a section, or a
// component registered without a page, fails the unit run as well as the push.

const REPO = path.join(import.meta.dir, "..", "..");
const F = "```";

describe("component pages", () => {
  const pages = componentPages(REPO);

  it("finds one page per registered component and no page without one", () => {
    expect(pages.map((p) => p.dir).sort()).toEqual(COMPONENTS.map((c) => c.dir ?? c.slug).sort());
  });

  it("every page has the shape docgen expects (rules S1 to S6)", () => {
    expect(pageStructureViolations(pages, COMPONENTS)).toEqual([]);
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

  it("passes pages that match the registry, by dir or by slug", () => {
    const pages = [pageOf("widget", "Widget"), pageOf("layout", "Row & Column")];
    const registry = [{ slug: "widget", name: "Widget" }, { slug: "row-column", dir: "layout", name: "Row & Column" }];
    expect(pageStructureViolations(pages, registry)).toEqual([]);
  });

  it("locates a page's own findings at its source path and line", () => {
    const pages = [pageOf("widget", "Widget", body.slice(0, body.indexOf("## Do & Don't")))];
    expect(pageStructureViolations(pages, [{ slug: "widget", name: "Widget" }])).toEqual([
      `src/atoms/widget/widget.md:17 S3: "## Do & Don't" is missing; a page has Usage, Variants and Do & Don't, in that order`,
    ]);
  });

  it("checks the title against the registry name", () => {
    const [finding] = pageStructureViolations([pageOf("widget", "Gizmo")], [{ slug: "widget", name: "Widget" }]);
    expect(finding).toStartWith("src/atoms/widget/widget.md:1 S1: ");
  });

  it("rejects a page no registered component documents", () => {
    const [finding] = pageStructureViolations([pageOf("widget", "Widget")], []);
    expect(finding).toStartWith("src/atoms/widget/widget.md:1 S1: no component in docs/src/core/data/components.ts");
  });

  it("rejects a registered component with no page", () => {
    expect(pageStructureViolations([], [{ slug: "row-column", dir: "layout", name: "Row & Column" }])).toEqual([
      `docs/src/core/data/components.ts S1: "Row & Column" has no page; add src/<category>/layout/layout.md`,
    ]);
  });
});
