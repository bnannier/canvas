import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import { channelsOf } from "../src/style/color.ts";
import { pageRoles, typeRoles } from "../src/style/type-scale.ts";
import { INLINE_CODE_BOX, INLINE_CODE_SCALE, inlineCodeType } from "../src/atoms/typography/typography.styles.ts";

afterEach(cleanup);

// The v4 hand-off's component page labels and the Usage guidance card's type, and its
// prose code chip (Component.dc.html `md()`: `font:400 .88em var(--fm);padding:1px 5px;
// border-radius:5px;background:var(--sf3);border:1px solid var(--ln);color:var(--tx)`).

const dark = colorsFor("violet", "dark");
// react-native-web prints colours as rgba() with a two-decimal alpha; compare channels.
const rgb = (color: string) => channelsOf(color)?.slice(0, 3);

// The chip's rows are written out (one place per size for the reading floors); each is
// its reading role at the hand-off's .88em, size and line height alike, in the chip's box.
test("every prose chip row is .88 of its reading role in the chip's box", () => {
  const scale = (n: number) => Math.round(n * INLINE_CODE_SCALE * 100) / 100;
  const readings = { ...typeRoles, ...pageRoles };
  expect(INLINE_CODE_SCALE).toBe(0.88);
  for (const [role, row] of Object.entries(inlineCodeType)) {
    const reading = readings[role as keyof typeof readings];
    expect(row, role).toEqual({ fontSize: scale(reading.fontSize), lineHeight: scale(reading.lineHeight), ...INLINE_CODE_BOX });
  }
  expect(Object.keys(inlineCodeType).sort()).toEqual(["body", "caption", "cardBody", "guideBody", "lead", "pageBody", "pageLead", "pageNote", "sectionLead", "sectionNote", "small", "specText", "tiny"]);
});

// The reference sheet's cells (Component.dc.html line 238): the type and default cells
// `font:400 12px/1.55 var(--fm)` in `--tx2` and `--tx3`, the description `font:400 13px/1.55
// var(--ft);color:var(--tx2)`.
test("specMeta is the sheet's 400 12/1.55 meta cell in the caller's face and ink, specText its 400 13/1.55 secondary text cell", () => {
  render(
    <ThemeProvider dark solid>
      <Typography specMeta mono subtle>ReactNode</Typography>
      <Typography specMeta mono muted>false</Typography>
      <Typography specMeta>bare</Typography>
      <Typography specText>An icon before the label.</Typography>
    </ThemeProvider>,
  );
  const type = screen.getByText("ReactNode");
  expect(type.style.fontSize).toBe("12px");
  expect(type.style.lineHeight).toBe("18.6px");
  expect(type.style.fontWeight).toBe("400");
  expect(type.style.fontFamily).toContain("mono");
  expect(rgb(type.style.color)).toEqual(rgb(dark["muted-foreground"]));
  expect(rgb(screen.getByText("false").style.color)).toEqual(rgb(dark["subtle-foreground"]!));
  const bare = screen.getByText("bare");
  expect(bare.style.fontFamily).not.toContain("mono");
  expect(rgb(bare.style.color)).toEqual(rgb(dark.foreground));
  const text = screen.getByText("An icon before the label.");
  expect(text.style.fontSize).toBe("13px");
  expect(text.style.lineHeight).toBe("20.15px");
  expect(text.style.fontWeight).toBe("400");
  expect(text.style.fontFamily).not.toContain("mono");
  expect(rgb(text.style.color)).toEqual(rgb(dark["muted-foreground"]));
  expect(screen.queryByRole("heading")).toBeNull();
});

test("pageLabel is the page's 500 11/1 mono label tracked .08em in the subtle ink", () => {
  render(<ThemeProvider dark solid><Typography pageLabel mono>Props</Typography></ThemeProvider>);
  const label = screen.getByText("Props");
  expect(label.style.fontSize).toBe("11px");
  expect(label.style.lineHeight).toBe("11px");
  expect(label.style.fontWeight).toBe("500");
  expect(label.style.letterSpacing).toBe("0.88px");
  expect(label.style.textTransform).toBe("uppercase");
  expect(rgb(label.style.color)).toEqual(rgb(dark["subtle-foreground"]!));
  expect(label.style.fontFamily).toContain("mono");
  // Not a heading: a label, unlike the Typography eyebrow's accent ink.
  expect(screen.queryByRole("heading")).toBeNull();
});

test("guideTitle is the guidance card's 600 16/1.3 level-3 heading and guideBody its 400 13.5/1.6 secondary paragraph", () => {
  render(
    <ThemeProvider dark solid>
      <Typography guideTitle>Real links</Typography>
      <Typography guideBody>A button that navigates renders a real link.</Typography>
    </ThemeProvider>,
  );
  const title = screen.getByRole("heading", { name: "Real links", level: 3 });
  expect(title.style.fontSize).toBe("16px");
  expect(title.style.lineHeight).toBe("20.8px");
  expect(title.style.fontWeight).toBe("600");
  expect(rgb(title.style.color)).toEqual(rgb(dark.foreground));
  const body = screen.getByText("A button that navigates renders a real link.");
  expect(body.style.fontSize).toBe("13.5px");
  expect(body.style.lineHeight).toBe("21.6px");
  expect(body.style.fontWeight).toBe("400");
  expect(rgb(body.style.color)).toEqual(rgb(dark["muted-foreground"]));
});

test("code inline is the prose chip at .88 of the reading role, regular, 5 radius, 1 by 5 padding, the fill and a hairline rim", () => {
  render(
    <ThemeProvider dark solid>
      <Typography pageBody>
        Pass <Typography code inline pageBody semibold>secondary</Typography> down.
      </Typography>
    </ThemeProvider>,
  );
  const chip = screen.getByText("secondary");
  expect(chip.style.fontSize).toBe(`${Math.round(pageRoles.pageBody.fontSize * 0.88 * 100) / 100}px`);
  expect(chip.style.lineHeight).toBe(`${Math.round(pageRoles.pageBody.lineHeight * 0.88 * 100) / 100}px`);
  // The chip keeps its own weight and ink inside a strong run.
  expect(chip.style.fontWeight).toBe("600");
  expect(rgb(chip.style.color)).toEqual(rgb(dark.foreground));
  expect(chip.style.borderRadius).toBe("5px");
  expect(chip.style.paddingTop).toBe("1px");
  expect(chip.style.paddingLeft).toBe("5px");
  expect(chip.style.borderTopWidth).toBe("1px");
  expect(channelsOf(chip.style.borderTopColor)).toEqual(channelsOf(dark.border));
  expect(rgb(chip.style.backgroundColor)).toEqual(rgb(dark.muted));
  expect(chip.style.fontFamily).toContain("mono");
});

test("the chip follows the reading role beside it and is .88 of body when none is passed", () => {
  render(
    <ThemeProvider dark solid>
      <Typography code inline small>s</Typography>
      <Typography code inline lead>l</Typography>
      <Typography code inline>b</Typography>
    </ThemeProvider>,
  );
  expect(screen.getByText("s").style.fontSize).toBe(`${Math.round(typeRoles.small.fontSize * 0.88 * 100) / 100}px`);
  expect(screen.getByText("l").style.fontSize).toBe(`${Math.round(typeRoles.lead.fontSize * 0.88 * 100) / 100}px`);
  expect(screen.getByText("b").style.fontSize).toBe(`${Math.round(typeRoles.body.fontSize * 0.88 * 100) / 100}px`);
});

// The pager card's name (Component.dc.html lines 303 and 304, `font:500 18px var(--fd)`): the
// display face at 500 18 on the face's own line, which the hand-off leaves to the browser
// (`normal`, 22 px for Bricolage Grotesque at 18, measured on the served hand-off page).
test("pagerName is the pager card's 500 18 display name on the face's own 22 line in the foreground ink", () => {
  const faces = { display: { "500": "BricolageGrotesque_500Medium" } };
  render(
    <ThemeProvider dark solid fonts={faces}>
      <Typography pagerName>ButtonGroup</Typography>
      <Typography pageLabel mono>Next</Typography>
    </ThemeProvider>,
  );
  const name = screen.getByText("ButtonGroup");
  expect(name.style.fontSize).toBe("18px");
  expect(name.style.lineHeight).toBe("22px");
  expect(name.style.letterSpacing).toBe("");
  expect(rgb(name.style.color)).toEqual(rgb(dark.foreground));
  // The display face, as the titles take it (the registered face carries the weight).
  expect(getComputedStyle(name).fontFamily).toBe("BricolageGrotesque_500Medium");
  // A name, not a heading: it sits under the card's page label.
  expect(screen.queryByRole("heading")).toBeNull();
  // Beside its label the name wins the role when both are passed.
  cleanup();
  render(<ThemeProvider dark solid><Typography pagerName pageLabel>Both</Typography></ThemeProvider>);
  expect(screen.getByText("Both").style.fontSize).toBe("18px");
});

test("code without inline is the standalone pill it always was, and inline without code does nothing", () => {
  render(
    <ThemeProvider dark solid>
      <Typography code>pill</Typography>
      <Typography inline>plain</Typography>
    </ThemeProvider>,
  );
  const pill = screen.getByText("pill");
  expect(pill.style.fontSize).toBe("13px");
  expect(pill.style.borderRadius).toBe("6px");
  expect(pill.style.paddingTop).toBe("2px");
  expect(pill.style.paddingLeft).toBe("6px");
  expect(pill.style.borderTopWidth).toBe("");
  const plain = screen.getByText("plain");
  expect(plain.style.fontSize).toBe("15px");
  expect(plain.style.borderTopWidth).toBe("");
  expect(plain.style.backgroundColor).toBe("");
});

// The component page's Variants and Tokens sections (Component.dc.html lines 185, 296 and
// 297): the variant card's title `font:500 14px/1.3 var(--ft)` in the page's foreground, the
// related tile's name `font:600 14px var(--ft)` on its face's own 18 px line (the hand-off
// sets no ratio; Instrument Sans's `normal` measured on the served page) and the section's
// h3 `font:600 16px var(--ft)` on its own 20 px line, all in the interface face.
test("variantTitle, linkName and subsectionTitle are the page's 500 14/1.3 title, 600 14 name on an 18 line and 600 16 heading on a 20 line, in the foreground ink", () => {
  const faces = { display: { "500": "BricolageGrotesque_500Medium", "600": "BricolageGrotesque_600SemiBold" } };
  render(
    <ThemeProvider dark solid fonts={faces}>
      <Typography variantTitle>Attention required</Typography>
      <Typography linkName>Row & Column</Typography>
      <Typography subsectionTitle>Related components</Typography>
    </ThemeProvider>,
  );
  const title = screen.getByText("Attention required");
  expect(title.style.fontSize).toBe("14px");
  expect(title.style.lineHeight).toBe("18.2px");
  expect(title.style.fontWeight).toBe("500");
  expect(rgb(title.style.color)).toEqual(rgb(dark.foreground));
  const name = screen.getByText("Row & Column");
  expect(name.style.fontSize).toBe("14px");
  expect(name.style.lineHeight).toBe("18px");
  expect(name.style.fontWeight).toBe("600");
  expect(rgb(name.style.color)).toEqual(rgb(dark.foreground));
  const heading = screen.getByText("Related components");
  expect(heading.style.fontSize).toBe("16px");
  expect(heading.style.lineHeight).toBe("20px");
  expect(heading.style.fontWeight).toBe("600");
  expect(rgb(heading.style.color)).toEqual(rgb(dark.foreground));
  // The interface face, never the display face (the hand-off sets each in `var(--ft)`).
  for (const el of [title, name, heading]) expect(getComputedStyle(el).fontFamily).not.toContain("Bricolage");
  // The sub-heading is a level-3 heading; the title and the name are plain text.
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Related components"]);
});
