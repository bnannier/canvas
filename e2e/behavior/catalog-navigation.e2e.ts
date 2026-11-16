import { COMPONENTS } from "../../docs/src/core/data/components";
import { NAV_GROUPS } from "../../docs/src/data/nav";
import { SECTION_ROOMS } from "../../docs/src/data/rooms";
import { BASE_PATH, gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const templateCount = NAV_GROUPS.find((group) => group.label === "Templates")!.items.length;

for (const width of [1280, 320]) {
  test(`catalog distinguishes components from previews and links the full section (${width})`, async ({ page }) => {
    await gotoDocs(page, "/components", { viewport: { width, height: 900 } });
    const main = page.getByRole("main");
    await expect(main.getByText(`${COMPONENTS.length} components`, { exact: true })).toBeVisible();
    const chip = main.getByRole("link", { name: "Browse Foundations, 6 components", exact: true });
    const summary = main.getByRole("link", { name: "Browse Foundations: 6 components · 2 previews", exact: true });
    await expect(chip).toHaveAttribute("href", `${BASE_PATH}/foundations`);
    await expect(summary).toHaveAttribute("href", `${BASE_PATH}/foundations`);
    await expect(main.getByRole("link", { name: `Browse Templates: ${templateCount} templates · 8 previews`, exact: true })).toHaveAttribute("href", `${BASE_PATH}/templates`);
    await expect(main.getByRole("link", { name: /^Browse (Token guides|Patterns)/ })).toHaveCount(0);
    const destinations = [...new Set(await main.getByRole("link", { name: /^Browse / }).evaluateAll((links) => links.map((link) => link.getAttribute("href"))))];
    expect(destinations.sort()).toEqual([...SECTION_ROOMS.map((room) => `${BASE_PATH}${room.href}`), `${BASE_PATH}/templates`].sort());
    if (width === 320) {
      for (const href of destinations) {
        const response = await page.request.get(href!);
        expect(response.status(), `${href} must resolve to a section or template overview`).toBe(200);
      }
    }
    const scroll = page.locator("[data-page-scroll]");
    await expect.poll(() => scroll.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);

    const started = await page.evaluate(() => performance.timeOrigin);
    await chip.click();
    await expect(page).toHaveURL(/\/foundations(?:\?|$)/);
    await expect(main.getByRole("heading", { level: 1, name: "Foundations", exact: true })).toBeVisible();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
    await page.goBack();
    await expect(page).toHaveURL(/\/components(?:\?|$)/);
    await summary.focus();
    await summary.press("Enter");
    await expect(page).toHaveURL(/\/foundations(?:\?|$)/);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
  });
}
