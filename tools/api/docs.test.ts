import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { docsPages, mentions, names, ordinaryWord } from "./docs";

const temporary: string[] = [];
afterAll(() => { for (const directory of temporary) rmSync(directory, { recursive: true, force: true }); });

function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "canvas-docs-"));
  temporary.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const GUIDE = `
import { Column, ThemeProvider } from "@nannier/canvas";
import { Section } from "../../ui/section";

const SNIPPET = \`import { useWidth } from "@nannier/canvas";
// The palette and the spacing come from the theme.
const width = useWidth(); // measured by the container
const source = "https://example.com/widths";\`;

function Demo() {
  return <Column><InlineCode>alpha()</InlineCode> mixes a token. Pick a palette, a shape and a radius.</Column>;
}

export default function Guide() {
  return (
    <ThemeProvider>
      <Section title="Measuring">
        <CodeBlock code={SNIPPET} />
        <Demo />
        <Typography mono>radius.md</Typography>
      </Section>
      <H3>Edge cases</H3>
      <Typography h2>Platform notes</Typography>
    </ThemeProvider>
  );
}
`;

const COMPONENT_DOCS = `
import type { ComponentDocs } from "../../../scope";
import e_atoms_widget_example_0 from "./example-0";

export const docs: ComponentDocs = {
  dir: "widget",
  category: "atoms",
  overview: [
    "Measure it with \`useWidgetWidth\`.",
    { list: ["A **plain** widget.", "A \`compact\` one."] },
  ],
  examples: [
    { label: "Default", code: "<Widget />", render: e_atoms_widget_example_0, note: ["Pass \`onWidgetPress\` to act on it."] },
    { label: "With icon", code: "<Widget icon=\\"plus\\" />", render: e_atoms_widget_example_0 },
  ],
  donts: [{ title: "Labels", do: { caption: "Name it.", code: "<Widget />", render: e_atoms_widget_example_0 }, dont: { caption: "Leave it.", code: "<Widget />", render: e_atoms_widget_example_0 } }],
  guidance: [
    {
      title: "Touch area",
      blocks: [
        "The touch area grows to the minimum.",
        { heading: "On Android" },
        { code: "<Widget compact />", render: e_atoms_widget_example_0 },
      ],
    },
  ],
  props: [{"name":"WidgetProps","props":[{"name":"icon","type":"IconName","required":false,"description":""}]}],
};
`;

const PATTERNS = `
function SpacingDemo() { return <Typography>Read spacing from useSpacing, or <InlineCode>spacing.md</InlineCode> directly.</Typography>; }
const PATTERNS: PatternDoc[] = [
  { slug: "spacing", name: "Spacing", description: "Rhythm.", sections: [{ title: "Scale", render: () => <SpacingDemo /> }] },
  { slug: "motion", name: "Motion", description: "Movement.", sections: [{ title: "Durations", render: () => null }] },
];
`;

const TEMPLATES = `
import type { TemplateDoc } from "./types";
import { INBOX_TEMPLATE } from "./templates/inbox";
const TEMPLATES: TemplateDoc[] = [INBOX_TEMPLATE];
`;

const INBOX = `
export const INBOX_TEMPLATE: TemplateDoc = { slug: "inbox", name: "Inbox", description: "Mail with a Feed.", sections: [{ title: "List and thread", render: () => null }] };
`;

const BASE = {
  "docs/src/app/_layout.tsx": "export default function Layout() { return null; }",
  "docs/src/app/+html.tsx": "export default function Html() { return null; }",
  "docs/src/app/(home)/index.tsx": `export default function Home() { return <Typography>Welcome</Typography>; }`,
  "docs/src/app/(home)/guide.tsx": GUIDE,
  "docs/src/app/(home)/testing/harness.tsx": `export default function Harness() { return <Typography>useHarnessOnly</Typography>; }`,
  "docs/src/app/(components)/components/[slug]/index.tsx": "export default function Reference() { return null; }",
  "docs/src/app/(components)/components/[slug]/[variant].tsx": "export default function Variant() { return null; }",
  "docs/src/app/(components)/patterns/[slug].tsx": "export default function Pattern() { return null; }",
  "docs/src/app/(components)/templates/[slug].tsx": "export default function Template() { return null; }",
  "docs/src/core/examples/atoms/widget/widget-docs.tsx": COMPONENT_DOCS,
  "docs/src/core/data/patterns.tsx": PATTERNS,
  "docs/src/core/data/templates.tsx": TEMPLATES,
  "docs/src/core/data/templates/inbox.tsx": INBOX,
};
const CATALOG = [
  { slug: "widget", name: "Widget", description: "A small control. Pair it with `Label`.", category: "Atoms" },
  { slug: "gadget", name: "Gadget", description: "Documented, but with no examples yet.", category: "Atoms" },
];

test("routes: static screens, component pages and their variants, patterns and templates; never the harness or layouts", () => {
  const pages = docsPages(fixture(BASE), CATALOG);
  expect([...pages.keys()].sort()).toEqual([
    "", "components/gadget", "components/widget", "components/widget/withicon", "guide", "patterns/motion", "patterns/spacing", "templates/inbox",
  ]);
  expect(pages.get("components/gadget")!.sources).toEqual(["docs/src/core/data/components.ts"]);
});

test("a page's text is what a reader sees: literals, snippets and JSX text, not imports or tag names", () => {
  const guide = docsPages(fixture(BASE), CATALOG).get("guide")!;
  expect(mentions(guide.text, "useWidth")).toBe(true);
  expect(mentions(guide.text, "alpha")).toBe(true);
  // Imported and used to lay the page out, never named to a reader.
  expect(mentions(guide.text, "ThemeProvider")).toBe(false);
  expect(mentions(guide.text, "Column")).toBe(false);
  expect(guide.headings).toEqual(["Measuring", "Edge cases", "Platform notes"]);
});

test("a component page reads its catalog entry and its generated docs module", () => {
  const pages = docsPages(fixture(BASE), CATALOG);
  const widget = pages.get("components/widget")!;
  for (const name of ["Widget", "Label", "WidgetProps", "IconName"]) expect(mentions(widget.text, name)).toBe(true);
  // The prose the page renders from its .md (the overview, a note, a guidance section)
  // is its text, and a code span in it is code.
  for (const name of ["useWidgetWidth", "onWidgetPress", "compact"]) {
    expect(mentions(widget.text, name)).toBe(true);
    expect(mentions(widget.code, name)).toBe(true);
  }
  expect(widget.headings).toEqual(["Default", "With icon", "Labels", "WidgetProps", "Touch area", "On Android"]);
  expect(pages.get("components/widget/withicon")!.text).toBe(widget.text);
});

test("one pattern's page carries its own entry and the demos it renders, not its neighbours'", () => {
  const pages = docsPages(fixture(BASE), CATALOG);
  expect(mentions(pages.get("patterns/spacing")!.text, "useSpacing")).toBe(true);
  expect(mentions(pages.get("patterns/motion")!.text, "useSpacing")).toBe(false);
  expect(pages.get("patterns/spacing")!.headings).toEqual(["Scale"]);
  expect(mentions(pages.get("templates/inbox")!.text, "Feed")).toBe(true);
});

test("a dynamic route the model does not know fails instead of hiding its pages", () => {
  const root = fixture({ ...BASE, "docs/src/app/(home)/blog/[post].tsx": "export default function Post() { return null; }" });
  expect(() => docsPages(root, CATALOG)).toThrow("Unknown dynamic docs route blog/[post]");
});

test("mentions match whole identifiers only", () => {
  expect(mentions("Grid and GridItem", "Grid")).toBe(true);
  expect(mentions("GridItem only", "Grid")).toBe(false);
  expect(mentions("useGrid()", "Grid")).toBe(false);
  expect(mentions("$scope.$value", "$value")).toBe(true);
});

test("a page's code is what it shows as code: snippets, inline code, prop tables and backticks, never prose or a snippet's comments", () => {
  const pages = docsPages(fixture(BASE), CATALOG);
  const guide = pages.get("guide")!;
  // A CodeBlock's `code` names a top-level snippet; inline code and mono Typography are code.
  for (const name of ["useWidth", "alpha", "radius"]) expect(mentions(guide.code, name)).toBe(true);
  // Prose, and a word inside a snippet's comment, are not.
  for (const name of ["palette", "shape", "spacing"]) {
    expect(mentions(guide.text, name)).toBe(true);
    expect(mentions(guide.code, name)).toBe(false);
  }
  // A `//` after a colon is a URL's, not a comment: the rest of the line stays code.
  expect(guide.code).toContain("https://example.com/widths");
  expect(guide.code).not.toContain("measured by the container");
  // A component page: example and Do & Don't code, the prop table's names and types, and
  // backtick spans in the catalog entry.
  const widget = pages.get("components/widget")!;
  for (const name of ["Widget", "WidgetProps", "IconName", "Label"]) expect(mentions(widget.code, name)).toBe(true);
  expect(mentions(widget.code, "small")).toBe(false);
  // A pattern's code includes the demos its sections render.
  const spacing = pages.get("patterns/spacing")!;
  expect(mentions(spacing.code, "spacing")).toBe(true);
  expect(mentions(spacing.code, "useSpacing")).toBe(false);
});

test("an ordinary word is named only in code; any other identifier anywhere in the text", () => {
  for (const word of ["palette", "spacing", "Surface", "Responsive", "FILL", "Button"]) expect(ordinaryWord(word)).toBe(true);
  for (const name of ["useTheme", "colorsByScheme", "QRCode", "HUE_WASH", "GridItem", "h1"]) expect(ordinaryWord(name)).toBe(false);
  const page = { text: "Pick a palette with useTheme.", code: "useTheme()" };
  expect(names(page, "palette")).toBe(false);
  expect(names(page, "useTheme")).toBe(true);
  expect(names({ text: "palette.blue", code: "palette.blue" }, "palette")).toBe(true);
});
