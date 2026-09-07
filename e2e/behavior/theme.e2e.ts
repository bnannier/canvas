/**
 * The scheme toggle repaints the page.
 *
 * Worth its own test because of how it failed before: scripts/capture-ui.ts used to
 * set a `canvas-theme` localStorage key that no part of the docs app reads (it
 * belongs to the kit's web CSS hand-off, which the docs do not use), so an entire
 * "light" screenshot set was really dark and nothing said so. Reading the scheme back
 * off the painted pixels is what makes a silent no-op fail.
 */
import { gotoDocs, readScheme } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("the toggle really changes what is painted", async ({ page }) => {
  await gotoDocs(page, "/components/button", { scheme: "dark" });
  const toggle = page.getByLabel("Toggle color scheme").first();
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect.poll(() => readScheme(page)).toBe("light");

  await toggle.click();
  await expect.poll(() => readScheme(page)).toBe("dark");
});

test("the launch URL seeds the scheme on a fresh load", async ({ page }) => {
  // The docs store nothing by privacy declaration, so ?scheme is the only way to
  // open a shared link, or a capture, in a chosen look. It is read once, at launch.
  await gotoDocs(page, "/components/button", { scheme: "light" });
  expect(await readScheme(page)).toBe("light");
});
