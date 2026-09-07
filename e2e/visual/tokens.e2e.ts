/**
 * The token stylesheet, rendered the way a consumer links it.
 *
 * test/tokens.html pulls in styles/canvas.css exactly as a web consumer would, so
 * this is the one baseline that photographs the CSS hand-off rather than the React
 * Native kit. It replaces the screenshot script that used to shoot this fixture, whose
 * 5% pixel and 1% dimension tolerances existed only to paper over the difference
 * between the macOS machine that minted its baselines and whatever machine ran it
 * next. Linux-only baselines remove the reason for the tolerance.
 *
 * Served by the second web server in playwright.config.ts, from the checkout root.
 */
import { TOKENS_URL } from "../../playwright.config";
import { expect, test } from "../support/fixtures";

for (const scheme of ["light", "dark"] as const) {
  test(`the token stylesheet in ${scheme}`, async ({ page }) => {
    await page.goto(TOKENS_URL, { waitUntil: "networkidle" });
    // The stylesheet keys dark off a `.dark` class on the root, never
    // prefers-color-scheme, so this is how a consumer switches it too.
    await page.evaluate((wantDark) => {
      document.documentElement.classList.toggle("dark", wantDark);
    }, scheme === "dark");
    await expect(page).toHaveScreenshot(`tokens--${scheme}.png`, { fullPage: true });
  });
}
