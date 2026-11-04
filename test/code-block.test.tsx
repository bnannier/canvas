import { describe, it, expect, afterEach } from "bun:test";
import { type ReactNode } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { CodeBlock } from "../src/molecules/code-block/code-block.tsx";
import { tokenize } from "../src/molecules/code-block/tokenize.ts";

// CodeBlock: the in-kit tokenizer (pure string-in/spans-out), and the feature
// set added in the 2026-07 build-out — clipboard copy with feedback, diff mode,
// collapsible folding, and the tabs switcher (controlled + uncontrolled).

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
afterEach(cleanup);

const kinds = (line: { text: string; kind: string }[]) =>
  Object.fromEntries(line.map((t) => [t.text, t.kind]));

describe("tokenize", () => {
  it("classifies ts keywords, strings, numbers, and comments", () => {
    const [line] = tokenize('const n = 42; // answer "x"', "ts");
    const map = kinds(line);
    expect(map["const"]).toBe("keyword");
    expect(map["42"]).toBe("number");
    expect(map['// answer "x"']).toBe("comment");
    const [strLine] = tokenize('const s = "hi";', "ts");
    expect(kinds(strLine)['"hi"']).toBe("string");
  });

  // The ts grammar is the hand-off's CodeBlock renderer (cv-kit-code3.js `hl`): `<Tag`
  // whole in cyan, an identifier inside the tag an attribute.
  it("classifies ts tags and their attributes (bare semantic booleans included)", () => {
    const [line] = tokenize("<Button primary large>", "ts");
    const map = kinds(line);
    expect(map["<Button"]).toBe("tag");
    expect(map["primary"]).toBe("attr");
    expect(map["large"]).toBe("attr");
    expect(map[">"]).toBe("tag");
  });

  // The tsx and jsx grammar is the hand-off's component-page highlighter (`hl`,
  // Component.dc.html line 324): the Capitalised name after `<` or `</` in the accent,
  // an attribute name before its `=` in cyan, a string in mint, a `//` comment in the
  // subtle ink, and everything else (brackets, slashes, boolean attributes, children,
  // keywords, numbers) neutral. The samples are the hand-off's own.
  describe("tsx and jsx follow the hand-off's component page", () => {
    const spans = (line: { text: string; kind: string }[]) => line.map((t) => `${t.kind}:${t.text}`);

    it("paints the tag name alone, so a label reads in one ink after one accent name", () => {
      const [line] = tokenize("<Button>Save changes</Button>", "tsx");
      expect(spans(line)).toEqual([
        "text:<", "component:Button", "text:>",
        "text:Save", "text: ", "text:changes",
        "text:</", "component:Button", "text:>",
      ]);
      expect(line.filter((t) => t.kind !== "text" && t.kind !== "component")).toEqual([]);
    });

    it("keeps boolean attributes neutral and hands the context back after a nested tag", () => {
      const [line] = tokenize("<Button outline small iconLeft={<Icon plus />}>Add item</Button>", "jsx");
      const map = kinds(line);
      expect(map["Button"]).toBe("component");
      expect(map["Icon"]).toBe("component");
      expect(map["outline"]).toBe("text");
      expect(map["small"]).toBe("text");
      expect(map["plus"]).toBe("text");
      expect(map["iconLeft"]).toBe("attr");
      expect(map["/>"]).toBe("text");
      expect(map["Add"]).toBe("text");
      expect(map["item"]).toBe("text");
      // An attribute after the nested tag is still inside the outer tag.
      const [after] = tokenize("<Button iconLeft={<Icon plus />} onPress={save}>Go</Button>", "tsx");
      expect(kinds(after)["onPress"]).toBe("attr");
      expect(kinds(after)["save"]).toBe("text");
    });

    it("paints a string attribute mint and its name cyan, a boolean attribute neutral", () => {
      const [line] = tokenize('<Button variant="primary" primary>Go</Button>', "tsx");
      const map = kinds(line);
      expect(map["variant"]).toBe("attr");
      expect(map['"primary"']).toBe("string");
      expect(map["primary"]).toBe("text");
      expect(map["="]).toBe("text");
    });

    it("paints a comment in the subtle ink and nothing else in a plain statement", () => {
      const lines = tokenize("// the primary action\nconst n = 42; save();", "tsx");
      expect(lines[0]).toEqual([{ text: "// the primary action", kind: "comment" }]);
      expect(lines[1].every((t) => t.kind === "text")).toBe(true);
    });

    it("leaves a lowercase tag and a dotted member name as hl draws them", () => {
      const [line] = tokenize('<div className="x"><Card.Header /></div>', "tsx");
      const map = kinds(line);
      expect(map["div"]).toBe("text");
      expect(map["className"]).toBe("attr");
      expect(map["Card.Header"]).toBe("component");
    });
  });

  it("keeps the arrow out of tag classification and spans block comments across lines", () => {
    const [arrow] = tokenize("() => 1", "ts");
    expect(kinds(arrow)["=>"]).toBe("text");
    const lines = tokenize("/* a\nb */", "ts");
    expect(lines.length).toBe(2);
    expect(lines[0][0].kind).toBe("comment");
    expect(lines[1][0].kind).toBe("comment");
  });

  it("distinguishes json keys from string values", () => {
    const [line] = tokenize('{ "name": "canvas", "beta": true }', "json");
    const map = kinds(line);
    expect(map['"name"']).toBe("attr");
    expect(map['"canvas"']).toBe("string");
    expect(map["true"]).toBe("keyword");
  });

  it("highlights shell command position, flags, and variables", () => {
    const [line] = tokenize("npm install --save-dev $PKG", "bash");
    const map = kinds(line);
    expect(map["npm"]).toBe("fn");
    expect(map["install"]).toBe("text");
    expect(map["--save-dev"]).toBe("attr");
    expect(map["$PKG"]).toBe("var");
  });

  it("falls back to monochrome for unknown languages and preserves line count", () => {
    const lines = tokenize("alpha\n\nbeta", "brainfuck");
    expect(lines.length).toBe(3);
    expect(lines[0]).toEqual([{ text: "alpha", kind: "text" }]);
    expect(lines[1]).toEqual([]);
    expect(lines.every((l) => l.every((t) => t.kind === "text"))).toBe(true);
  });
});

describe("CodeBlock copy", () => {
  it("passes the code back on press and flips the chip to Copied", () => {
    let copied: string | null = null;
    ui(<CodeBlock code="npm run build" copy onCopy={(c) => { copied = c; }} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(copied).toBe("npm run build");
    expect(screen.getByText("Copied")).toBeTruthy();
  });

  it("hosts the chip in the header when a filename is present", () => {
    const { container } = ui(<CodeBlock code="x" filename="a.ts" language="ts" copy />);
    // Header hosts the chip: nothing is absolutely pinned over the code.
    expect(screen.getByText("a.ts")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
    expect(container.textContent).toContain("ts"); // trailing language badge
  });
});

describe("CodeBlock diff", () => {
  const DIFF = "-const theme = dark;\n+const theme = getTheme();\n setTheme(theme);";

  it("renders +/- markers and copies the post-change code without them", () => {
    let copied: string | null = null;
    const { container } = ui(<CodeBlock diff code={DIFF} copy onCopy={(c) => { copied = c; }} />);
    // Both sides of the change render.
    expect(container.textContent).toContain("dark");
    expect(container.textContent).toContain("getTheme");
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    // Removed line dropped, markers stripped, context kept.
    expect(copied).toBe("const theme = getTheme();\nsetTheme(theme);");
  });
});

describe("CodeBlock collapsible", () => {
  const TEN = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join("\n");

  it("folds past collapsedLines and expands on press (uncontrolled)", () => {
    const { container } = ui(<CodeBlock collapsible collapsedLines={3} code={TEN} />);
    expect(container.textContent).toContain("line 3");
    expect(container.textContent).not.toContain("line 4");
    const expander = screen.getByRole("button", { name: /Show all 10 lines/ });
    expect(expander.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(expander);
    expect(container.textContent).toContain("line 10");
    expect(screen.getByText("Show less")).toBeTruthy();
    expect(container.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("supports the controlled expanded contract", () => {
    let next: boolean | null = null;
    const { container } = ui(
      <CodeBlock collapsible collapsedLines={3} code={TEN} expanded={false} onExpandedChange={(e) => { next = e; }} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Show all 10 lines/ }));
    expect(next).toBe(true);
    // Controlled: the parent did not update, so the block stays folded.
    expect(container.textContent).not.toContain("line 10");
  });

  it("does not fold when the code fits", () => {
    ui(<CodeBlock collapsible collapsedLines={8} code={"a\nb"} />);
    expect(screen.queryByText(/Show all/)).toBeNull();
  });
});

describe("CodeBlock tabs", () => {
  const TABS = [
    { label: "npm", code: "npm install @nannier/canvas" },
    { label: "bun", code: "bun add @nannier/canvas" },
  ];

  it("is interactive out of the box: first tab active, press switches", () => {
    const { container } = ui(<CodeBlock language="bash" tabs={TABS} />);
    expect(container.textContent).toContain("npm install");
    expect(container.textContent).not.toContain("bun add");
    fireEvent.click(screen.getByText("bun"));
    expect(container.textContent).toContain("bun add");
    expect(container.textContent).not.toContain("npm install");
  });

  it("marks exactly one tab aria-selected", () => {
    const { container } = ui(<CodeBlock language="bash" tabs={TABS} defaultActive={1} />);
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    expect(tabs.length).toBe(2);
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "true"]);
    expect(container.textContent).toContain("bun add");
  });

  it("supports the controlled active contract", () => {
    let picked: number | null = null;
    const { container } = ui(
      <CodeBlock language="bash" tabs={TABS} active={0} onTabChange={(i) => { picked = i; }} />,
    );
    fireEvent.click(screen.getByText("bun"));
    expect(picked).toBe(1);
    // Controlled: the parent did not update, so tab 0 stays active.
    expect(container.textContent).toContain("npm install");
  });
});

describe("CodeBlock terminal + numbered", () => {
  it("renders transcript output lines without a prompt and copies only commands", () => {
    let copied: string | null = null;
    const { container } = ui(
      <CodeBlock terminal copy onCopy={(c) => { copied = c; }} code={"$ npm install\nadded 12 packages"} />,
    );
    expect(container.textContent).toContain("added 12 packages");
    // Exactly one prompt: the output row carries none.
    expect(container.textContent!.split("$ ").length - 1).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(copied).toBe("npm install");
  });

  it("honors a custom prompt marker", () => {
    const { container } = ui(<CodeBlock terminal prompt=">" code={"> deploy\ndone"} />);
    expect(container.textContent).toContain("> deploy");
    expect(container.textContent).toContain("done");
  });

  it("offsets the numbered gutter by startLine", () => {
    ui(<CodeBlock numbered startLine={41} code={"a\nb"} />);
    expect(screen.getByText("41")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.queryByText("1")).toBeNull();
  });
});

// The hand-off highlights a docs snippet with no header bar; `headerless` keeps the
// highlighting `language` drives while drawing neither the language nor a filename.
describe("CodeBlock headerless", () => {
  it("highlights by language without the language header", () => {
    ui(<CodeBlock language="tsx" code="<Button primary>Save</Button>" />);
    expect(screen.getByText("tsx")).toBeDefined();
    cleanup();
    const bare = ui(<CodeBlock headerless language="tsx" filename="Button.tsx" code="<Button primary>Save</Button>" />);
    expect(bare.queryByText("tsx")).toBeNull();
    expect(bare.queryByText("Button.tsx")).toBeNull();
    // Still tokenized: the component name is its own coloured span (hl paints the name
    // alone in the accent; the bare boolean `primary` stays in the code ink).
    const tag = bare.getAllByText("Button", { exact: true })[0]!;
    expect(tag.parentElement!.textContent).toBe("<Button primary>Save</Button>");
    expect(getComputedStyle(tag).color).not.toBe(getComputedStyle(tag.parentElement!).color);
  });

  // The hand-off's playground bar (Component.dc.html lines 171 to 174) is the
  // "JSX · <Interface>" label and a Copy button only; `unbadged` keeps `language` for the
  // highlighting and draws no trailing badge beside the chip.
  it("draws no language badge beside the copy chip with unbadged", () => {
    const badged = ui(<CodeBlock copy filename="JSX · ButtonProps" language="tsx" code="<Button>Save changes</Button>" />);
    expect(badged.getByText("JSX · ButtonProps")).toBeDefined();
    expect(badged.getByText("tsx")).toBeDefined();
    cleanup();
    const bare = ui(<CodeBlock unbadged copy filename="JSX · ButtonProps" language="tsx" code="<Button>Save changes</Button>" />);
    expect(bare.getByText("JSX · ButtonProps")).toBeDefined();
    expect(bare.queryByText("tsx")).toBeNull();
    expect(bare.getByRole("button", { name: "Copy code" })).toBeDefined();
    // Still highlighted by the language: the name is its own accent span.
    const name = bare.getAllByText("Button", { exact: true })[0]!;
    expect(getComputedStyle(name).color).not.toBe(getComputedStyle(name.parentElement!).color);
    cleanup();
    // With no filename the language is the header's label, which unbadged leaves alone.
    const labelled = ui(<CodeBlock unbadged language="tsx" code="<Button />" />);
    expect(labelled.getByText("tsx")).toBeDefined();
  });

  it("floats the copy chip over the code when there is no header to host it", () => {
    ui(<CodeBlock headerless copy language="tsx" code="<Button />" />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeDefined();
    expect(screen.queryByText("tsx")).toBeNull();
  });

  it("keeps a tabs strip, which has no other home", () => {
    ui(<CodeBlock headerless tabs={[{ label: "npm", code: "npm i" }, { label: "bun", code: "bun add" }]} />);
    expect(screen.getAllByRole("tab").length).toBe(2);
  });
});

// Every run of code paints in the mono face: a highlighted token is a nested span of its
// line, and it keeps the line's registered mono face instead of the interface face.
describe("CodeBlock type face", () => {
  const FACES = { sans: "InstrumentSans_400Regular", mono: "JetBrainsMono_400Regular" };
  for (const [name, props] of [
    ["plain", {}],
    ["numbered", { numbered: true }],
    ["terminal", { terminal: true }],
    ["inline", { inline: true }],
  ] as const) {
    it(`paints highlighted tokens in the mono face (${name})`, () => {
      // The ts grammar paints the keyword and the number; the tsx grammar paints the
      // component name alone (the hand-off's component-page `hl`).
      render(
        <ThemeProvider fonts={FACES}>
          <CodeBlock {...props} language="ts" code="const theme = 42;" />
        </ThemeProvider>,
      );
      for (const text of ["const", "42"]) {
        expect(getComputedStyle(screen.getByText(text, { exact: true })).fontFamily, `${name} ${text}`).toBe("JetBrainsMono_400Regular");
      }
      cleanup();
      render(
        <ThemeProvider fonts={FACES}>
          <CodeBlock {...props} language="tsx" code="<Button />" />
        </ThemeProvider>,
      );
      expect(getComputedStyle(screen.getByText("Button", { exact: true })).fontFamily, `${name} Button`).toBe("JetBrainsMono_400Regular");
    });
  }
});


describe("CodeBlock transcript", () => {
  it("preserves the raw execution stream without chrome, syntax spans or collapse", () => {
    const output = "$ printf result\n\t+ added\n- removed\n\n" + "unbroken".repeat(200);
    ui(<CodeBlock transcript terminal numbered inline copy diff collapsible collapsedLines={1} language="bash" filename="execution.log" code={output} testID="transcript" />);
    const root = screen.getByTestId("transcript");
    expect(root.textContent).toBe(output);
    expect(root.querySelectorAll("span").length).toBe(0);
    expect(root.children.length).toBe(1);
    expect(getComputedStyle(root).backgroundColor).toMatch(/^rgba\(0, 0, 0, 0(?:\.0+)?\)$/);
    expect(getComputedStyle(root).borderTopWidth).toBe("0px");
    const text = root.firstElementChild!;
    expect(getComputedStyle(text).whiteSpace).toBe("pre-wrap");
    expect(getComputedStyle(text).fontFamily).toContain("ui-monospace, SFMono-Regular, Menlo");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders an empty stream without example code", () => {
    ui(<CodeBlock transcript testID="empty-transcript" />);
    expect(screen.getByTestId("empty-transcript").textContent).toBe("");
  });
});
