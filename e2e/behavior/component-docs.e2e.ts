/**
 * A component page shows every line of its .md.
 *
 * The docs generator used to keep only a page's fences, its labels and the first line of
 * each Do/Don't caption, so the guidance written around them (Button's real links and
 * touch area, a variant's note, a long intro) never reached a reader. The generator now
 * holds every page to a model that places every line (rule S8 in
 * tools/docgen/parse-md.ts); this asserts the page really renders that model, in the
 * browser, on the bytes that ship: the intro after its first paragraph shows under the
 * lead, the selected example's note sits under the Playground rail, captions read whole in the mono face for their code, a list has list semantics,
 * and the guidance sections after Do & Don't render with their live examples.
 */
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("Button's guidance sections render after Do & Don't, with a real link in the live example", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  const main = page.getByRole("main");
  const headings = await main.getByRole("heading", { level: 2 }).allTextContents();
  const dontsAt = headings.indexOf("Do & Don’t");
  expect(dontsAt, "the Do & Don't section").toBeGreaterThan(-1);
  expect(headings.slice(dontsAt + 1)).toEqual(["Real links (href)", "Touch area"]);
  await expect(main.getByText("A button that NAVIGATES should be a real link", { exact: false })).toBeVisible();
  await expect(main.getByText("keeps its size and extends only its touch area to the minimum", { exact: false })).toBeVisible();
  // The href example is live: its Button is a genuine browser link to the destination.
  await expect(main.getByRole("link", { name: "Read the docs" })).toHaveAttribute("href", "https://canvas.nannier.com");
});

test("the selected example's note sits under the rail and follows the selection", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  const main = page.getByRole("main");
  // The note on every variant, then Default's own.
  await expect(main.getByText("The variant only changes how a button looks", { exact: false })).toBeVisible();
  await expect(main.getByText("A button's whole job is to fire onPress", { exact: false })).toBeVisible();
  await page.getByTestId("playground-examples").getByRole("tab", { name: "Disabled" }).click();
  await expect(main.getByText("A disabled button ignores presses", { exact: false })).toBeVisible();
  await expect(main.getByText("A button's whole job is to fire onPress", { exact: false })).toHaveCount(0);
});

test("a deep-linked variant carries its own note", async ({ page }) => {
  await gotoDocs(page, "/components/sparkline/track");
  await expect(page.getByRole("main").getByText("paints the plot area with the muted track", { exact: false })).toBeVisible();
});

test("an intro's bullet list is a list of items, with no bullet read aloud", async ({ page }) => {
  await gotoDocs(page, "/components/chip");
  const list = page.getByRole("main").getByRole("list").filter({ hasText: "Color (pick one; default the neutral tag)" });
  await expect(list).toHaveCount(1);
  await expect(list.getByRole("listitem")).toHaveCount(2);
  // The strong run of the first item renders as text, not with its asterisks.
  await expect(list.getByRole("listitem").first()).not.toContainText("**");
  await expect(list.getByRole("listitem").nth(1)).toContainText("Emphasis. outline drops the fill");
  // The bullet glyph is presentation: the list role already says each item is one.
  expect(await list.getByRole("listitem").first().evaluate((item) => item.querySelector("[aria-hidden='true']")?.textContent)).toBe("•");
});

// Each text below holds a code span in the .md, so finding it whole also proves the page
// set the span in the mono face rather than printing its backticks.
test("a wrapped Do & Don't caption reads whole, and its code is set in the mono face", async ({ page }) => {
  await gotoDocs(page, "/components/field");
  await expect(page.getByRole("main").getByText("it drifts from the caption scale, misses the destructive tone, and is never announced as an error.", { exact: false })).toBeVisible();
  await gotoDocs(page, "/components/avatar");
  await expect(page.getByRole("main").getByText("An unbounded stack (no max) runs off the row and stops being scannable.", { exact: true })).toBeVisible();
});
