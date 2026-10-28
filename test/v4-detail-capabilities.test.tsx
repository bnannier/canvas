import { describe, it, expect, afterEach } from "bun:test";
import { type ReactNode } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { gapOf } from "../src/atoms/layout/layout.shared.tsx";
import { Grid } from "../src/atoms/grid/grid.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { headingLevelOf } from "../src/atoms/typography/typography.shared.tsx";
import { CodeBlock } from "../src/molecules/code-block/code-block.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import { mockInPageFrost } from "./fixtures/material-platform.ts";

// The three kit capabilities the v4 component detail page needs: the `chapter` gap step
// (64, between a page's chapters), Typography's `level` (the announced heading level apart
// from the visual role), and `<CodeBlock inline copy>` (the hand-off's import chip).

afterEach(cleanup);

const ui = (node: ReactNode, light = true) => render(<ThemeProvider light={light} dark={!light} solid>{node}</ThemeProvider>);
// A colour as [r, g, b, a] from a hex or an rgb()/rgba() string, alpha to two places.
const rgba = (c: string): number[] => {
  if (c.startsWith("#")) {
    const h = c.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1);
  }
  const [r, g, b, a = 1] = (c.match(/[\d.]+/g) ?? []).map(Number);
  return [r!, g!, b!, Math.round(a * 100) / 100];
};
const at = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

describe("the chapter gap step", () => {
  it("is 64 on Row, Column and Grid", () => {
    ui(
      <>
        <Row chapter testID="row"><Typography>a</Typography></Row>
        <Column chapter testID="column"><Typography>b</Typography></Column>
        <Grid chapter testID="grid"><Typography>c</Typography></Grid>
      </>,
    );
    expect(at("row").style.gap).toBe("64px");
    expect(at("column").style.gap).toBe("64px");
    expect(at("grid").style.gap).toBe("64px");
  });

  it("wins over every other gap step", () => {
    expect(gapOf({ chapter: true, page: true })).toBe("chapter");
    expect(gapOf({ chapter: true, flush: true })).toBe("chapter");
    expect(gapOf({ page: true })).toBe("page");
  });
});

describe("Typography level", () => {
  it("announces an h3 drawn heading at level 2 without changing its look", () => {
    ui(
      <>
        <Typography h3 level={2} testID="relevelled">Playground</Typography>
        <Typography h3 testID="plain">Props</Typography>
      </>,
    );
    const relevelled = screen.getByRole("heading", { name: "Playground", level: 2 });
    expect(relevelled.tagName).toBe("H2");
    expect(screen.getByRole("heading", { name: "Props", level: 3 }).tagName).toBe("H3");
    expect(relevelled.style.fontSize).toBe(at("plain").style.fontSize);
    expect(relevelled.style.fontSize).toBe("26px");
  });

  it("makes a non-heading role a heading, and leaves a link a link", () => {
    ui(
      <>
        <Typography small level={4}>Notes</Typography>
        <Typography h2 level={3} href="/x">Docs</Typography>
      </>,
    );
    expect(screen.getByRole("heading", { name: "Notes", level: 4 })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Docs" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Docs" })).toBeNull();
  });

  it("falls back to the role's own level, then the section heading's 6, then none", () => {
    expect(headingLevelOf({ h4: true })).toBe(4);
    expect(headingLevelOf({ h4: true, level: 1 })).toBe(1);
    expect(headingLevelOf({ display: true })).toBe(1);
    expect(headingLevelOf({ section: true, subheading: true })).toBe(6);
    expect(headingLevelOf({ body: true })).toBeUndefined();
  });
});

describe("CodeBlock inline copy", () => {
  const LINE = 'import { Button } from "@nannier/canvas"';

  it("is one copy button holding the code, flipping to Copied", () => {
    let copied: string | null = null;
    ui(<CodeBlock inline copy code={LINE} onCopy={(c) => { copied = c; }} />);
    const button = screen.getByRole("button", { name: `Copy ${LINE}` });
    expect(button.textContent).toBe(LINE);
    fireEvent.click(button);
    expect(copied).toBe(LINE);
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("draws the hand-off's import chip: 34 tall, radius 10, sf2 fill, ln2 hairline, mono 12 in tx2", () => {
    for (const light of [true, false]) {
      ui(<CodeBlock inline copy code={LINE} testID="chip" />, light);
      const t = colorsFor("violet", light ? "light" : "dark");
      const chip = at("chip");
      expect(chip.style.minHeight).toBe("34px");
      expect(chip.style.borderTopLeftRadius || chip.style.borderRadius).toBe("10px");
      expect(rgba(chip.style.backgroundColor)).toEqual(rgba(t.popover));
      expect(rgba(chip.style.borderTopColor)).toEqual(rgba(t["field-border"]!));
      const text = screen.getByText(LINE);
      expect(text.style.fontSize).toBe("12px");
      expect(text.style.fontWeight).toBe("400");
      expect(rgba(text.style.color)).toEqual(rgba(t["muted-foreground"]));
      cleanup();
    }
  });

  it("is a control-layer pane under glass and paints nothing extra in solid mode", () => {
    // The chip is in the page: the web keeps its solid skin under glass (the v4 hand-off),
    // and a platform whose in-page surfaces frost paints its control-layer pane.
    const frost = mockInPageFrost();
    try {
      const glass = render(<ThemeProvider light glass><CodeBlock inline copy code={LINE} testID="chip" /></ThemeProvider>);
      expect(glass.container.querySelectorAll('[data-testid="glass-material"]').length).toBe(1);
      cleanup();
    } finally { frost.mockRestore(); }
    const solid = ui(<CodeBlock inline copy code={LINE} />);
    expect(solid.container.querySelectorAll('[data-testid="glass-material"]').length).toBe(0);
    const solidChip = solid.container.innerHTML;
    cleanup();
    const web = render(<ThemeProvider light glass><CodeBlock inline copy code={LINE} /></ThemeProvider>);
    expect(web.container.querySelectorAll('[data-testid="glass-material"]').length).toBe(0);
    expect(web.container.innerHTML).toBe(solidChip);
  });

  it("leaves the plain inline pill unchanged without copy", () => {
    ui(<CodeBlock inline code="npm i" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("npm i")).toBeTruthy();
  });
});
