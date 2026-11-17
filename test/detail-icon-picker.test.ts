import { describe, expect, it } from "bun:test";
import { ICON_NAMES } from "../src/atoms/icon/icon";
import { ICON_PAGE_SIZE, iconPickerOptions } from "../docs/src/ui/detail/icon-picker-options";

describe("the playground's full icon picker", () => {
  it("finds glyphs beyond the former shortlist by name and category", () => {
    const last = ICON_NAMES[ICON_NAMES.length - 1]!;
    expect(iconPickerOptions(ICON_NAMES, last.key, 0, "").icons).toContain(last);
    const category = iconPickerOptions(ICON_NAMES, last.category, 0, "");
    expect(category.total).toBeGreaterThan(0);
    expect(category.icons.every(icon => `${icon.key} ${icon.label} ${icon.category}`.toLowerCase().includes(last.category.toLowerCase()))).toBe(true);
  });

  it("pages through the whole registry without mounting every glyph", () => {
    const first = iconPickerOptions(ICON_NAMES, "", 0, "");
    expect(first.icons).toHaveLength(ICON_PAGE_SIZE);
    const all = Array.from({ length: first.pages }, (_, page) => iconPickerOptions(ICON_NAMES, "", page, "").icons).flat();
    expect(all.map(icon => icon.key)).toEqual(ICON_NAMES.map(icon => icon.key));
  });

  it("keeps the selected glyph visible outside the search and page", () => {
    const selected = ICON_NAMES[ICON_NAMES.length - 1]!;
    const first = iconPickerOptions(ICON_NAMES, "", 0, selected.key);
    expect(first.icons[0]).toBe(selected);
    expect(first.icons.length).toBeLessThanOrEqual(ICON_PAGE_SIZE + 1);
    const empty = iconPickerOptions(ICON_NAMES, "no-such-canvas-glyph", 100, selected.key);
    expect(empty.icons).toEqual([selected]);
    expect(empty.total).toBe(0);
    expect(empty.page).toBe(0);
  });
});
