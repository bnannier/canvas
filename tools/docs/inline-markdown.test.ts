import { describe, expect, it } from "bun:test";
import { inlineText, parseInline, unsupportedInline } from "../../docs/src/lib/inline-markdown";

// Every line of a component's .md prose (an intro, a note, a Do/Don't caption, a guidance
// paragraph) renders through parseInline (docs/src/ui/prose.tsx), and the generator refuses
// a page whose prose holds a construct it cannot render (unsupportedInline, rule S8 in
// tools/docgen/parse-md.ts), so both have to read a line the way Markdown does.

const text = (t: string, strong = false) => ({ text: t, code: false, strong });
const code = (t: string, strong = false) => ({ text: t, code: true, strong });

describe("parseInline: code spans", () => {
  it("returns a line with no markup as one text run", () => {
    expect(parseInline("Fill the box with cover.")).toEqual([text("Fill the box with cover.")]);
  });

  it("returns nothing for an empty line", () => {
    expect(parseInline("")).toEqual([]);
  });

  it("splits out each code span, without its backticks", () => {
    expect(parseInline("Fill a box with `cover`: the photo keeps `aspectRatio`.")).toEqual([
      text("Fill a box with "),
      code("cover"),
      text(": the photo keeps "),
      code("aspectRatio"),
      text("."),
    ]);
  });

  it("reads a span at either end of the line", () => {
    expect(parseInline("`title` names the widget")).toEqual([code("title"), text(" names the widget")]);
    expect(parseInline("pass `keys`")).toEqual([text("pass "), code("keys")]);
  });

  it("keeps the code inside a span verbatim, stars and backslashes included", () => {
    expect(parseInline("a style function: `({ pressed }) => style` changes it")).toEqual([
      text("a style function: "),
      code("({ pressed }) => style"),
      text(" changes it"),
    ]);
    expect(parseInline("`**not strong**` and `a\\*b`")).toEqual([code("**not strong**"), text(" and "), code("a\\*b")]);
  });

  it("closes a span only on a run of the same length, so a longer run can hold a backtick", () => {
    expect(parseInline("the ``a`b`` token")).toEqual([text("the "), code("a`b"), text(" token")]);
    expect(parseInline("`` `a` ``")).toEqual([code("`a`")]);
  });

  it("leaves a backtick with no closing run as text", () => {
    expect(parseInline("a lone ` tick")).toEqual([text("a lone ` tick")]);
    expect(parseInline("``a` b")).toEqual([text("``a` b")]);
  });

  it("strips one space from each end of a padded span, never from an all-space one", () => {
    expect(parseInline("` x `")).toEqual([code("x")]);
    expect(parseInline("`  x  `")).toEqual([code(" x ")]);
    expect(parseInline("` `")).toEqual([code(" ")]);
  });
});

describe("parseInline: strong text and escapes", () => {
  it("reads a ** pair as strong text, code spans inside it included", () => {
    expect(parseInline("- **Color** (pick one)")).toEqual([text("- "), text("Color", true), text(" (pick one)")]);
    expect(parseInline("a **`primary` pill** here")).toEqual([text("a "), code("primary", true), text(" pill", true), text(" here")]);
  });

  it("does not open strong on a ** that a space follows, or close it on one a space precedes", () => {
    expect(parseInline("2 ** 3 is 8")).toEqual([text("2 ** 3 is 8")]);
    expect(parseInline("**open and never closed")).toEqual([text("**open and never closed")]);
    expect(parseInline("**a **b")).toEqual([text("**a **b")]);
  });

  it("never closes strong inside a code span", () => {
    expect(parseInline("**a `**` b**")).toEqual([text("a ", true), code("**", true), text(" b", true)]);
  });

  it("reads a backslash before punctuation as that character, and leaves any other backslash", () => {
    expect(parseInline("a literal \\*star\\* and \\`tick\\`")).toEqual([text("a literal *star* and `tick`")]);
    expect(parseInline("C:\\path")).toEqual([text("C:\\path")]);
  });

  it("gives the text a reader sees, with no syntax left", () => {
    expect(inlineText("Pass `onPress` to a **tappable** chip, \\*literally\\*.")).toEqual("Pass onPress to a tappable chip, *literally*.");
  });
});

describe("unsupportedInline", () => {
  it("passes what the page renders: text, code spans, strong text and escapes", () => {
    expect(unsupportedInline("A **Color** chip with `onPress`, \\*not emphasis\\* and snake_case_names.")).toEqual([]);
    expect(unsupportedInline("2 * 3 and a * b")).toEqual([]);
  });

  it("names a link, an image, raw HTML and an autolink", () => {
    expect(unsupportedInline("See [the guide](https://example.com).")).toEqual(["a link"]);
    expect(unsupportedInline("![logo](logo.png)")).toEqual(["an image"]);
    expect(unsupportedInline("Wrap it in <code>mono</code>.")).toEqual(["raw HTML or an autolink"]);
    expect(unsupportedInline("Visit <https://canvas.nannier.com>.")).toEqual(["raw HTML or an autolink"]);
  });

  it("names emphasis, with a star or an underscore", () => {
    expect(unsupportedInline("an *emphasised* word")).toEqual(["emphasis (a single *)"]);
    expect(unsupportedInline("an _emphasised_ word")).toEqual(["emphasis (a single _)"]);
  });

  it("reads nothing inside a code span or behind a backslash as a construct", () => {
    expect(unsupportedInline("`<Chip blue outline>` and `[a](b)` and `*x*`")).toEqual([]);
    expect(unsupportedInline("\\[not a link\\](x) and \\_not\\_ and \\<b>")).toEqual([]);
  });
});
