import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";

// One job, different control (the design language's item 5): iOS has no radio button,
// so a single choice there is a checkmark list, the inline picker of a grouped Form:
// the label leads, the chosen row carries a trailing check, and a RadioGroup's options
// are the rows of one inset-grouped section with a hairline between two rows. The web
// and Android keep the ring and dot. The role stays `radio` everywhere.

afterEach(cleanup);

type Platform = "web" | "ios" | "android";
const load = async (platform: Platform) => {
  const suffix = platform === "web" ? "" : `.${platform}`;
  const mod = await import(`../src/atoms/radio/radio${suffix}.tsx`);
  return { Radio: mod.Radio as ElementType, RadioGroup: mod.RadioGroup as ElementType };
};

/** The trailing check glyph's cell inside a radio row (the row's first hidden node: a ring
 *  row hides nothing), or null when the row draws a ring. */
function checkOf(row: HTMLElement): HTMLElement | null {
  return row.querySelector<HTMLElement>('[aria-hidden="true"]');
}
const shown = (glyph: HTMLElement | null) => glyph != null && glyph.style.opacity !== "0";

describe("an iOS RadioGroup", () => {
  it("is a checkmark list: one section, a hairline between two rows, the check on the chosen row", async () => {
    const { Radio, RadioGroup } = await load("ios");
    const picks: unknown[] = [];
    render(
      <ThemeProvider>
        <RadioGroup label="Plan" defaultValue="pro" onChange={(value: unknown) => picks.push(value)}>
          <Radio value="hobby">Hobby</Radio>
          <Radio value="pro" description="For growing teams.">Pro</Radio>
          <Radio value="enterprise">Enterprise</Radio>
        </RadioGroup>
      </ThemeProvider>,
    );
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    // Three rows with a separator between each pair, and no ring anywhere.
    expect(group.children).toHaveLength(5);
    const rows = screen.getAllByRole("radio");
    expect(rows).toHaveLength(3);
    // The glyph is hidden from assistive technology, so the row's name is its label alone.
    expect(screen.getByRole("radio", { name: "Hobby" })).toBe(rows[0]);
    expect(rows.map((row) => shown(checkOf(row)))).toEqual([false, true, false]);
    expect(rows.map((row) => row.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);

    fireEvent.click(rows[2]);
    expect(picks).toEqual(["enterprise"]);
    expect(rows.map((row) => shown(checkOf(row)))).toEqual([false, false, true]);
  });

  it("keeps the list vertical when the group asks for a row", async () => {
    const { Radio, RadioGroup } = await load("ios");
    render(
      <ThemeProvider>
        <RadioGroup row defaultValue="hobby">
          <Radio value="hobby">Hobby</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
      </ThemeProvider>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group.style.flexDirection).not.toBe("row");
    expect(group.children).toHaveLength(3);
  });

  it("lays selectable cards out as tiles, each marking the choice with the trailing check", async () => {
    const { Radio, RadioGroup } = await load("ios");
    render(
      <ThemeProvider>
        <RadioGroup row defaultValue="pro">
          <Radio card value="pro" description="For growing teams.">Pro</Radio>
          <Radio card value="enterprise" description="Advanced security.">Enterprise</Radio>
        </RadioGroup>
      </ThemeProvider>,
    );
    const group = screen.getByRole("radiogroup");
    // No list section: the tiles sit in the row the group asked for, with no separators.
    expect(group.style.flexDirection).toBe("row");
    expect(group.children).toHaveLength(2);
    expect(screen.getAllByRole("radio").map((row) => shown(checkOf(row)))).toEqual([true, false]);
  });

  it("marks a standalone radio with the trailing check too", async () => {
    const { Radio } = await load("ios");
    render(<ThemeProvider><Radio checked description="For growing teams.">Pro</Radio></ThemeProvider>);
    const row = screen.getByRole("radio", { name: (name) => name.startsWith("Pro") && !name.includes("✓") });
    expect(shown(checkOf(row))).toBe(true);
  });
});

describe("the ring platforms", () => {
  for (const platform of ["web", "android"] as const) {
    it(`keep the ring on ${platform}, with the options stacked and no list section`, async () => {
      const { Radio, RadioGroup } = await load(platform);
      render(
        <ThemeProvider>
          <RadioGroup defaultValue="pro">
            <Radio value="hobby">Hobby</Radio>
            <Radio value="pro">Pro</Radio>
          </RadioGroup>
        </ThemeProvider>,
      );
      const group = screen.getByRole("radiogroup");
      expect(group.children).toHaveLength(2);
      for (const row of screen.getAllByRole("radio")) {
        expect(checkOf(row)).toBeNull();
        // The first child is the ring, a circle.
        expect((row.firstElementChild as HTMLElement).style.borderRadius).toBe("9999px");
      }
      // The chosen ring marks the choice: Android's holds its dot, the web's thickens to 30%
      // of its 18px around a hollow center (the hand-off's `K.def('radio')`).
      const chosen = screen.getByRole("radio", { name: "Pro" }).firstElementChild as HTMLElement;
      if (platform === "android") expect(chosen.childElementCount).toBeGreaterThan(0);
      else {
        expect(chosen.childElementCount).toBe(0);
        expect(chosen.style.borderTopWidth || chosen.style.borderWidth).toBe("5px");
        expect(chosen.style.width).toBe("18px");
      }
    });
  }
});

describe("the hand-off's Radio geometry", () => {
  it("web: an 18px ring at a 1.5px edge, 12px from the 500 14px title, options 12 apart and cards 8", async () => {
    const { Radio, RadioGroup } = await load("web");
    render(
      <ThemeProvider>
        <RadioGroup defaultValue="pro" testID="plain">
          <Radio value="hobby" description="Ships every few weeks">Hobby</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
        <RadioGroup defaultValue="a" testID="cards">
          <Radio value="a" card>A</Radio>
          <Radio value="b" card>B</Radio>
        </RadioGroup>
      </ThemeProvider>,
    );
    const hobby = screen.getByRole("radio", { name: /Hobby/ });
    const ring = hobby.firstElementChild as HTMLElement;
    expect(ring.style.width).toBe("18px");
    expect(ring.style.borderTopWidth || ring.style.borderWidth).toBe("1.5px");
    expect(hobby.style.gap).toBe("12px");
    expect(screen.getByText("Hobby").style.fontSize).toBe("14px");
    expect(screen.getByText("Hobby").style.fontWeight).toBe("500");
    expect(screen.getByText("Ships every few weeks").style.fontSize).toBe("12px");
    const groups = screen.getAllByRole("radiogroup");
    expect(groups[0].style.gap).toBe("12px");
    expect(groups[1].style.gap).toBe("8px");
    const card = screen.getByRole("radio", { name: "A" });
    expect(card.style.borderTopLeftRadius || card.style.borderRadius).toBe("12px");
    expect(card.style.paddingTop).toBe("12px");
    expect(card.style.paddingLeft || card.style.paddingInlineStart).toBe("14px");
  });

  it("iOS: the grouped section keeps the 26pt corner inside a hairline, and the check is the label size plus 4", async () => {
    const { iosSkin } = await import("../src/atoms/radio/radio.styles.ts");
    const { lightColors } = await import("../src/style/tokens.ts");
    expect(iosSkin.list!.section(lightColors)).toMatchObject({ borderRadius: 26, borderWidth: 1 });
    expect(iosSkin.mark.kind === "check" ? iosSkin.mark.glyph(lightColors, "default") : null).toMatchObject({ size: 18, width: 22 });
  });
});
