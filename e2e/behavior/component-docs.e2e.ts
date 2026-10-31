/**
 * A component page shows every line of its .md.
 *
 * The docs generator used to keep only a page's fences, its labels and the first line of
 * each Do/Don't caption, so the guidance written around them (Button's real links and
 * touch area, a variant's note, a long intro) never reached a reader. The generator now
 * holds every page to a model that places every line (rule S8 in
 * tools/docgen/parse-md.ts); this asserts the page really renders that model, in the
 * browser, on the bytes that ship: the lead is the .md intro's first paragraph, the rest
 * of the intro shows under it, an example's note sits with its example, captions read whole in the mono face for their code, a list has list semantics,
 * and the guidance sections after Do & Don't render with their live examples.
 */
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

// The reference keeps guidance prose and snippets in Usage cards; Tokens follows Usage.
test("Button's guidance sections render as Usage cards before Tokens, with accurate source snippets", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  const main = page.getByRole("main");
  // The outline is read once, so wait for the last section to be on the page first.
  await expect(main.getByRole("heading", { level: 2, name: "Tokens", exact: true })).toBeVisible();
  const outline = await main.getByRole("heading").evaluateAll((nodes) =>
    nodes.map((node) => ({ level: Number(node.getAttribute("aria-level") ?? node.tagName.slice(1)), text: (node.textContent ?? "").trim() })));
  const usageAt = outline.findIndex((h) => h.level === 2 && h.text === "Usage");
  const tokensAt = outline.findIndex((h) => h.level === 2 && h.text === "Tokens");
  expect(usageAt, "the Usage section").toBeGreaterThan(-1);
  expect(tokensAt, "Tokens follows Usage").toBeGreaterThan(usageAt);
  const cards = outline.slice(usageAt + 1, tokensAt);
  expect(cards.every((h) => h.level === 3), "every Usage card title is a level-3 heading").toBe(true);
  expect(cards.map((h) => h.text)).toEqual(expect.arrayContaining(["Real links (href)", "Workflow actions", "Touch area"]));
  const usage = page.locator('[data-detail-section="use"]');
  await expect(usage.getByText("A button that NAVIGATES should be a real link", { exact: false })).toBeVisible();
  await expect(usage.getByText("keeps its size and extends only its touch area to the minimum", { exact: false })).toBeVisible();
  await expect(usage).toContainText('href="https://canvas.nannier.com"');
  await expect(usage.getByRole("link", { name: "Read the docs" })).toHaveCount(0);
});

// Each text below holds a code span in the .md, so finding it whole also proves the page
// set the span in the mono face rather than printing its backticks.
test("the lead is the .md intro's first paragraph, and the overview follows it", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  const header = page.locator('[data-detail-section="header"]');
  const usage = page.locator('[data-detail-section="use"]');
  await expect(header.getByText("Six intents × three sizes (plus the icon square)", { exact: false })).toBeVisible();
  // The second intro paragraph (the overview) and the third (the ref guidance).
  await expect(usage.getByText("The call to action fills with the accent", { exact: false })).toBeVisible();
  await expect(usage.getByText("Pass ref to access the interactive Pressable", { exact: false })).toBeVisible();
});

// The v4 detail page shows every example at once in its Variants grid, so every note is
// on the page: the note shared by every variant under the section, each example's own in
// its card, and the Usage example's in Usage.
test("every example's note is shown with its example", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  const main = page.getByRole("main");
  await expect(main.getByText("A button's whole job is to fire onPress", { exact: false })).toBeVisible();
  await expect(main.getByText("A disabled button ignores presses", { exact: false })).toBeVisible();
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

test("the component reference follows the source section order without the former extra Do and Don't section", async ({ page }) => {
  await gotoDocs(page, "/components/button");
  await expect(page.locator('[data-detail-section="prevnext"]')).toBeVisible();
  const ids = await page.locator("[data-detail-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-detail-section")));
  expect(ids).toEqual(["header", "pg", "var", "sz", "st", "an", "props", "a11y", "pf", "use", "tok", "prevnext"]);
  await expect(page.getByRole("contentinfo")).toContainText("component detail · props and examples read from bnannier/canvas");
});
