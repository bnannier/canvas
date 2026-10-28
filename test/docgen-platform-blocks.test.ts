// The docs app ships to the App Store and Google Play, and App Store guideline 2.3.10
// rejects an app that shows another mobile platform's name, so a component page scopes
// platform-specific lines with `<!-- only: web android -->` ... `<!-- /only -->` blocks
// (tools/docgen/parse-md.ts, "Platform blocks"). These tests hold the parser's three
// views of a page, the block grammar (S11), the platform-word lint (S12), and the native
// registries docgen writes from them.

import { describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { docStructureViolations, hasPlatformBlocks, parseDoc, platformView, platformWordViolations } from "../tools/docgen/parse-md.ts";

const F = "```";
const REPO = path.resolve(import.meta.dir, "..");

// A page that forks one sentence of its intro, scopes a list item and a whole variant,
// and gives the native builds their own fence for one variant.
const PAGE = [
  "# Widget",
  "",
  "A widget for tests.",
  "",
  "Pass `label` to name it:",
  "<!-- only: web -->",
  "iOS and web render the label above it, while Android floats it.",
  "<!-- /only -->",
  "<!-- only: ios -->",
  "iOS renders the label above it.",
  "<!-- /only -->",
  "<!-- only: android -->",
  "Android floats the label.",
  "<!-- /only -->",
  "The label is its accessible name.",
  "",
  "- Every build shows this item.",
  "<!-- only: web ios -->",
  "- On iOS the row is inset.",
  "<!-- /only -->",
  "",
  "## Usage",
  "",
  `${F}tsx`,
  "<Widget />",
  F,
  "",
  "## Variants",
  "",
  "### Data",
  "",
  "<!-- only: web -->",
  `${F}tsx`,
  '<Widget items={["iOS", "Android"]} />',
  F,
  "<!-- /only -->",
  "<!-- only: ios android -->",
  `${F}tsx`,
  '<Widget items={["Phone", "Tablet"]} />',
  F,
  "<!-- /only -->",
  "",
  "<!-- only: web android -->",
  "### Dense",
  "",
  "On Android the rows are 48dp.",
  "",
  `${F}tsx`,
  "<Widget dense />",
  F,
  "<!-- /only -->",
  "",
  "## Do & Don't",
  "",
  "### Labels",
  "",
  "**Do**: Name it.",
  "",
  `${F}tsx`,
  '<Widget label="Name" />',
  F,
  "",
  "**Don't**: Leave it unnamed.",
  "",
  `${F}tsx`,
  "<Widget />",
  F,
  "",
].join("\n");

const prose = (platform: "web" | "ios" | "android") => {
  const doc = parseDoc(PAGE, platform);
  return { description: doc.description, overview: doc.overview, examples: doc.examples.map((e) => ({ label: e.label, code: e.code, note: e.note })) };
};

describe("platform views", () => {
  it("the web reads the page as if the native lines and every marker were not there", () => {
    expect(prose("web")).toEqual({
      description: "A widget for tests.",
      overview: [
        { kind: "paragraph", text: "Pass `label` to name it: iOS and web render the label above it, while Android floats it. The label is its accessible name." },
        { kind: "list", items: ["Every build shows this item.", "On iOS the row is inset."] },
      ],
      examples: [
        { label: "Default", code: "<Widget />", note: [] },
        { label: "Data", code: '<Widget items={["iOS", "Android"]} />', note: [] },
        { label: "Dense", code: "<Widget dense />", note: [{ kind: "paragraph", text: "On Android the rows are 48dp." }] },
      ],
    });
  });

  it("the iOS app reads its own sentence, keeps its list item, and drops the Android-only variant", () => {
    expect(prose("ios")).toEqual({
      description: "A widget for tests.",
      overview: [
        { kind: "paragraph", text: "Pass `label` to name it: iOS renders the label above it. The label is its accessible name." },
        { kind: "list", items: ["Every build shows this item.", "On iOS the row is inset."] },
      ],
      examples: [
        { label: "Default", code: "<Widget />", note: [] },
        { label: "Data", code: '<Widget items={["Phone", "Tablet"]} />', note: [] },
      ],
    });
  });

  it("the Android app reads its own sentence and variant, without the iOS list item", () => {
    expect(prose("android")).toEqual({
      description: "A widget for tests.",
      overview: [
        { kind: "paragraph", text: "Pass `label` to name it: Android floats the label. The label is its accessible name." },
        { kind: "list", items: ["Every build shows this item."] },
      ],
      examples: [
        { label: "Default", code: "<Widget />", note: [] },
        { label: "Data", code: '<Widget items={["Phone", "Tablet"]} />', note: [] },
        { label: "Dense", code: "<Widget dense />", note: [{ kind: "paragraph", text: "On Android the rows are 48dp." }] },
      ],
    });
  });

  it("a page with no block reads the same in every build, and the views number lines in the source", () => {
    const plain = "# Widget\n\nA widget.\n";
    expect(hasPlatformBlocks(plain)).toBe(false);
    expect(platformView(plain, "ios").text).toBe(plain);
    expect(hasPlatformBlocks(PAGE)).toBe(true);
    const ios = platformView(PAGE, "ios");
    expect(ios.lines[ios.text.split("\n").indexOf("iOS renders the label above it.")]).toBe(10);
  });

  it("the fixture passes the whole gate, in every build", () => {
    expect(docStructureViolations(PAGE, { name: "Widget" })).toEqual([]);
  });
});

describe("the block grammar (S11)", () => {
  const rule = (src: string) => docStructureViolations(src, { name: "Widget" }).filter((v) => v.rule === "S11");
  const page = (intro: string) => `# Widget\n\nA widget.\n\n${intro}\n\n## Usage\n\n${F}tsx\n<Widget />\n${F}\n`;

  it("names an unknown build, a block that names every build, a nested block and an unclosed one", () => {
    expect(rule(page("<!-- only: web macos -->\nText.\n<!-- /only -->"))[0].message).toContain('"macos" is not a build');
    expect(rule(page("<!-- only: web ios android -->\nText.\n<!-- /only -->"))[0].message).toContain("names every build");
    expect(rule(page("<!-- only: web -->\n<!-- only: ios -->\nText.\n<!-- /only -->")).map((v) => v.message).join(" ")).toContain("do not nest");
    expect(rule(page("<!-- only: web -->\nText."))[0].message).toContain("never closes");
  });

  it("names a stray close, an empty block, a marker inside a fence and a misspelt marker", () => {
    expect(rule(page("Text.\n<!-- /only -->"))[0].message).toContain("closes no block");
    expect(rule(page("<!-- only: web -->\n<!-- /only -->"))[0].message).toContain("holds nothing");
    expect(rule(`${page("Text.")}\n${F}tsx\n<!-- only: web -->\n${F}\n`)[0].message).toContain("inside a fence");
    expect(rule(page("<!-- only web -->\nText."))[0].message).toContain("alone on its line");
  });

  it("names a build that loses a required part, saying which build", () => {
    const src = `# Widget\n\nA widget.\n\n## Usage\n\n<!-- only: web -->\n${F}tsx\n<Widget />\n${F}\n<!-- /only -->\n\n## Variants\n\n### A\n\n${F}tsx\n<Widget a />\n${F}\n\n## Do & Don't\n\n### T\n\n**Do**: a.\n\n${F}tsx\n<Widget a />\n${F}\n\n**Don't**: b.\n\n${F}tsx\n<Widget b />\n${F}\n`;
    const usage = docStructureViolations(src, { name: "Widget" }).find((v) => v.rule === "S4");
    expect(usage?.message).toContain("(in the iOS and Android build)");
  });
});

describe("the platform-word lint (S12)", () => {
  it("catches another platform's name in a line every build shows, in prose and in a fence", () => {
    const found = platformWordViolations('On Android the field floats.\n\n```tsx\n<Chart data={[{ label: "iOS" }]} />\n```\n');
    expect(found.map((f) => f.line)).toEqual([1, 4]);
    expect(found[0].message).toContain('"Android" would show in the iOS app');
    expect(found[0].message).toContain("<!-- only: web android -->");
    expect(found[1].message).toContain('"iOS" would show in the Android app');
  });

  it("catches every banned word, in any case for platform names and capitalized for Material and Pixel", () => {
    const words = (line: string) => platformWordViolations(line).length;
    for (const line of ["Material 3 tabs", "an M3 bar", "the Roboto face", "Pixel phones", "google", "Platform.OS === \"android\""]) expect(words(line)).toBe(1);
    for (const line of ["an iPhone", "the iPad popover", "SF Pro", "Liquid Glass", "a `.ios.tsx` file"]) expect(words(line)).toBe(1);
    for (const line of ["the glass material", "a 1 pixel hairline", "radios and checkboxes"]) expect(words(line)).toBe(0);
  });

  it("allows a name only inside a block that leaves the other build out", () => {
    expect(platformWordViolations("<!-- only: web android -->\nOn Android the field floats.\n<!-- /only -->")).toEqual([]);
    expect(platformWordViolations("<!-- only: web ios -->\nOn iOS the field is boxed.\n<!-- /only -->")).toEqual([]);
    const leak = platformWordViolations("<!-- only: ios android -->\nOn Android the field floats.\n<!-- /only -->");
    expect(leak).toHaveLength(1);
    expect(leak[0].line).toBe(2);
  });

  it("fails the page gate as rule S12", () => {
    const v = docStructureViolations(`# Widget\n\nA widget for iOS.\n`, { name: "Widget" }).find((x) => x.rule === "S12");
    expect(v?.line).toBe(3);
  });

  it("finds nothing on any component page", () => {
    const pages: string[] = [];
    for (const category of ["atoms", "molecules", "organisms", "charts"]) {
      for (const dir of fs.readdirSync(path.join(REPO, "src", category))) {
        const file = path.join(REPO, "src", category, dir, `${dir}.md`);
        if (fs.existsSync(file)) pages.push(...platformWordViolations(fs.readFileSync(file, "utf8")).map((f) => `src/${category}/${dir}/${dir}.md:${f.line} ${f.message}`));
      }
    }
    expect(pages).toEqual([]);
  });
});

describe("the native registries", () => {
  // A require.context matches files, not resolved imports, so each native registry's
  // pattern must take exactly the modules its keys name: the build's own docs module for
  // a page it reads differently, the web one for every other page.
  for (const platform of ["ios", "android"] as const) {
    it(`registry.${platform}.ts loads exactly the modules its keys name`, () => {
      const core = path.join(REPO, "docs", "src", "core");
      const source = fs.readFileSync(path.join(core, `registry.${platform}.ts`), "utf8");
      const literal = /require\.context\("\.\/examples", true, \/(.*)\/, "lazy"\)/.exec(source);
      expect(literal).not.toBeNull();
      const pattern = new RegExp(literal![1]);
      const keyed = [...source.matchAll(/^ {2}"[^"]+": "\.\/([^"]+)",$/gm)].map((m) => m[1]).sort();
      const onDisk: string[] = [];
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (pattern.test(`/${path.relative(core, full)}`)) onDisk.push(path.relative(path.join(core, "examples"), full));
        }
      };
      walk(path.join(core, "examples"));
      expect(onDisk.sort()).toEqual(keyed);
      expect(keyed.some((k) => k.endsWith(`-docs.${platform}.tsx`))).toBe(true);
      expect(keyed.some((k) => /-docs\.(ios|android)\.tsx$/.test(k) && !k.endsWith(`.${platform}.tsx`))).toBe(false);
    });
  }
});
