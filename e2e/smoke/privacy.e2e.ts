import { PRIVACY_ISSUES_URL, PRIVACY_SUMMARY, PRIVACY_TITLE } from "../../docs/src/data/privacy-policy";
import { BASE_PATH, readScheme } from "../support/docs";
import { expect, test } from "../support/fixtures";

// Store reviewers must be able to read the policy without running the docs app.
test.use({ javaScriptEnabled: false });

for (const scheme of ["light", "dark"] as const) {
  for (const width of [375, 1280]) {
    test(`privacy remains readable without JavaScript at ${width}px in ${scheme}`, async ({ page }) => {
      const requests: { url: string; type: string }[] = [];
      page.on("request", (request) => requests.push({ url: request.url(), type: request.resourceType() }));
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`${BASE_PATH}/privacy/`);

      await expect(page.getByRole("heading", { name: PRIVACY_TITLE, exact: true })).toBeVisible();
      await expect(page.getByText(PRIVACY_SUMMARY, { exact: true }).filter({ visible: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Open an issue", exact: true })).toHaveAttribute("href", PRIVACY_ISSUES_URL);
      await expect(page.locator("script")).toHaveCount(0);
      expect(await readScheme(page)).toBe(scheme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

      const origin = new URL(page.url()).origin;
      expect(requests.filter((request) => new URL(request.url).origin !== origin)).toEqual([]);
      expect(requests.filter((request) => request.type === "script")).toEqual([]);
    });
  }
}
