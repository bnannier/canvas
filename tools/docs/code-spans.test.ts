import { describe, expect, it } from "bun:test";
import { splitCodeSpans } from "../../docs/src/lib/code-spans";

// The Do/Don't captions and titles render their code spans in the mono face
// (docs/src/ui/dont.tsx), so the split has to match how Markdown reads the .md line.

const text = (t: string) => ({ text: t, code: false });
const code = (t: string) => ({ text: t, code: true });

describe("splitCodeSpans", () => {
  it("returns a line with no backticks as one text run", () => {
    expect(splitCodeSpans("Fill the box with cover.")).toEqual([text("Fill the box with cover.")]);
  });

  it("returns nothing for an empty line", () => {
    expect(splitCodeSpans("")).toEqual([]);
  });

  it("splits out each code span, without its backticks", () => {
    expect(splitCodeSpans("Fill a box with `cover`: the photo keeps `aspectRatio`.")).toEqual([
      text("Fill a box with "),
      code("cover"),
      text(": the photo keeps "),
      code("aspectRatio"),
      text("."),
    ]);
  });

  it("reads a span at either end of the line", () => {
    expect(splitCodeSpans("`title` names the widget")).toEqual([code("title"), text(" names the widget")]);
    expect(splitCodeSpans("pass `keys`")).toEqual([text("pass "), code("keys")]);
  });

  it("keeps the code inside a span verbatim", () => {
    expect(splitCodeSpans("a style function: `({ pressed }) => style` changes it")).toEqual([
      text("a style function: "),
      code("({ pressed }) => style"),
      text(" changes it"),
    ]);
  });

  it("closes a span only on a run of the same length, so a longer run can hold a backtick", () => {
    expect(splitCodeSpans("the ``a`b`` token")).toEqual([text("the "), code("a`b"), text(" token")]);
    expect(splitCodeSpans("`` `a` ``")).toEqual([code("`a`")]);
  });

  it("leaves a backtick with no closing run as text", () => {
    expect(splitCodeSpans("a lone ` tick")).toEqual([text("a lone ` tick")]);
    expect(splitCodeSpans("``a` b")).toEqual([text("``a` b")]);
  });

  it("strips one space from each end of a padded span, never from an all-space one", () => {
    expect(splitCodeSpans("` x `")).toEqual([code("x")]);
    expect(splitCodeSpans("`  x  `")).toEqual([code(" x ")]);
    expect(splitCodeSpans("` `")).toEqual([code(" ")]);
  });
});
