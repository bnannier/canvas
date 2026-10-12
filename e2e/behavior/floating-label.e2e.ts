import type { Locator } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

// The Android floating label at phone width, laid out by a real browser: a label longer than
// its field stays inside it and clear of the trailing chevron or toggle, truncating on one line
// with an ellipsis, at rest and floated, while the field's accessible name stays the whole
// label. The harness page (/testing/floating-label) renders the Android builds of every field
// family that floats its label, the one place they render on the web.

const LONG = "the name of the project as it appears on every invoice we send";
// Layout rounding: a box edge may land a fraction of a pixel past the one it abuts.
const EPSILON = 0.5;

type Box = { x: number; y: number; width: number; height: number };
const right = (box: Box) => box.x + box.width;

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

/** The label's text node, whether it is truncated, and its painted box (its transform included). */
async function labelOf(page: import("@playwright/test").Page, name: string) {
  const label = page.getByText(name, { exact: true });
  await expect(label).toHaveCount(1);
  const truncated = await label.evaluate((node) => node.scrollWidth > node.clientWidth + 1);
  return { label, truncated, box: await boxOf(label) };
}

for (const scheme of ["light", "dark"] as const) {
  test(`a long floating label stays inside its field at phone width (${scheme})`, async ({ page }) => {
    await gotoDocs(page, "/testing/floating-label", { scheme, viewport: { width: 390, height: 900 } });

    // Input: clear of the field's 16 dp end padding, at rest and once focus floats it (the
    // empty field floats on focus; the filled one rests floated).
    {
      const name = `Input: ${LONG}`;
      const field = page.getByRole("textbox", { name, exact: true });
      const rest = await labelOf(page, name);
      expect(rest.truncated, name).toBe(true);
      expect(right(rest.box), name).toBeLessThanOrEqual(right(await boxOf(field)) - 16 + EPSILON);
      await field.focus();
      // Floated, the label paints smaller, at the top of the field, still inside it.
      await expect.poll(async () => (await labelOf(page, name)).box.height, { message: `${name}, floated` }).toBeLessThan(rest.box.height);
      const floated = await labelOf(page, name);
      expect(right(floated.box), `${name}, floated`).toBeLessThanOrEqual(right(await boxOf(field)) - 16 + EPSILON);
      expect(floated.box.y, `${name}, floated`).toBeGreaterThanOrEqual((await boxOf(field)).y - EPSILON);
      await field.blur();
    }
    {
      const name = `Filled input: ${LONG}`;
      const field = page.getByRole("textbox", { name, exact: true });
      const { truncated, box } = await labelOf(page, name);
      expect(truncated, name).toBe(true);
      expect(right(box), name).toBeLessThanOrEqual(right(await boxOf(field)) - 16 + EPSILON);
      expect(box.y, name).toBeGreaterThanOrEqual((await boxOf(field)).y - EPSILON);
    }

    // Select: clear of the chevron and the trigger's 8 dp gap to it.
    for (const name of [`Select: ${LONG}`, `Filled select: ${LONG}`]) {
      const trigger = page.getByRole("button", { name, exact: true });
      const chevron = trigger.getByText("⌄", { exact: true });
      const { truncated, box } = await labelOf(page, name);
      expect(truncated, name).toBe(true);
      expect(right(box), name).toBeLessThanOrEqual((await boxOf(chevron)).x - 8 + EPSILON);
      expect(box.x, name).toBeGreaterThanOrEqual((await boxOf(trigger)).x + 16 - EPSILON);
    }

    // Autocomplete: clear of the toggle, whose 48 dp target runs to the field's end edge.
    {
      const name = `Autocomplete: ${LONG}`;
      const field = page.getByRole("combobox", { name, exact: true });
      const toggle = field.locator("..").getByRole("button", { name: "Toggle options" });
      const { truncated, box } = await labelOf(page, name);
      expect(truncated, name).toBe(true);
      expect(right(box), name).toBeLessThanOrEqual((await boxOf(toggle)).x + EPSILON);
    }

    // Textarea: clear of the multiline field's 12 dp end padding.
    {
      const name = `Textarea: ${LONG}`;
      const field = page.getByRole("textbox", { name, exact: true });
      const { truncated, box } = await labelOf(page, name);
      expect(truncated, name).toBe(true);
      expect(right(box), name).toBeLessThanOrEqual(right(await boxOf(field)) - 12 + EPSILON);
    }
  });
}
