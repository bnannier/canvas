import type { Page } from "@playwright/test";
import { accentOf, gotoDocs, readAccent, readScheme } from "../support/docs";
import { expect, test } from "../support/fixtures";

const mobileTop = (page: Page) => page.locator("[data-shell-mobile-top]");
const mobileTabs = (page: Page) => page.locator("[data-shell-mobile-tabs]");

for (const width of [390, 768]) {
  test.describe(`mobile web shell at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("the bars show the route title and navigate between sections", async ({ page }) => {
      await gotoDocs(page, "/foundations");
      const top = mobileTop(page);
      const tabs = mobileTabs(page);
      await expect(top).toBeVisible();
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(top.getByText("Foundations", { exact: true })).toBeVisible();
      for (const name of ["Back", "Menu"]) {
        const box = await top.getByRole("button", { name, exact: true }).boundingBox();
        expect(box!.width, `${name} needs a mobile touch target`).toBeGreaterThanOrEqual(44);
        expect(box!.height, `${name} needs a mobile touch target`).toBeGreaterThanOrEqual(44);
      }
      await expect(tabs).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toHaveCount(1);
      await expect(page.locator("[data-shell-rail]")).toHaveCount(0);

      const home = tabs.getByRole("tab", { name: "Home", exact: true });
      const components = tabs.getByRole("tab", { name: "Components", exact: true });
      const utilities = tabs.getByRole("tab", { name: "Utilities", exact: true });
      await expect(components).toHaveAttribute("aria-selected", "true");
      await components.click();
      await expect(page).toHaveURL(/\/components(?:\?|$)/);
      await expect.poll(() => page.locator("[data-page-scroll]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
      await expect(page.getByRole("main").getByRole("heading", { name: /^(Atoms|Molecules|Organisms)$/ })).toHaveCount(0);
      await expect(components).toHaveAttribute("aria-selected", "true");
      await expect(top.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
      await utilities.click();
      await expect(page).toHaveURL(/\/tokens\/colors(?:\?|$)/);
      await expect(utilities).toHaveAttribute("aria-selected", "true");
      await home.click();
      await expect(page).toHaveURL(/\/(?:\?[^/]*)?$/);
      await expect(home).toHaveAttribute("aria-selected", "true");
      const brand = top.getByRole("link", { name: "Canvas", exact: true });
      await expect(brand).toHaveAttribute("href", "/");
      await expect(brand.locator("svg")).toBeVisible();
    });

    test("Back returns a component page to the catalog that opened it", async ({ page }) => {
      await gotoDocs(page, "/components");
      const documentStarted = await page.evaluate(() => performance.timeOrigin);
      await page.getByRole("main").getByRole("link", { name: "Button", exact: true }).click();
      await expect(page).toHaveURL(/\/components\/button(?:\?|$)/);
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentStarted);
      await expect(mobileTop(page).getByText("Button", { exact: true })).toBeVisible();
      await expect(mobileTabs(page).getByRole("tab", { name: "Components", exact: true })).toHaveAttribute("aria-selected", "true");
      await mobileTop(page).getByRole("button", { name: "Back", exact: true }).click();
      await expect(page).toHaveURL(/\/components(?:\?|$)/);
      await expect(mobileTop(page).getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
    });

    test("Menu keeps appearance controls reachable and returns keyboard focus", async ({ page }) => {
      await gotoDocs(page, "/foundations", { scheme: "dark" });
      const opener = mobileTop(page).getByRole("button", { name: "Menu", exact: true });
      await opener.focus();
      await opener.press("Enter");
      const drawer = page.getByRole("dialog");
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText("Appearance", { exact: true })).toBeVisible();
      const surface = drawer.getByRole("tablist", { name: "Surface", exact: true });
      await expect(surface.getByRole("tab", { name: "Solid", exact: true })).toHaveAttribute("aria-selected", "true");
      await surface.getByRole("tab", { name: "Glass", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-look", "dark glass violet");
      const mint = drawer.getByRole("radiogroup", { name: "Palette", exact: true }).getByRole("radio", { name: "Mint", exact: true });
      await mint.click();
      await expect(mint).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => readAccent(page)).toBe(accentOf("dark", "mint"));
      await drawer.getByRole("button", { name: "Toggle color scheme", exact: true }).click();
      await expect.poll(() => readScheme(page)).toBe("light");
      await expect.poll(() => readAccent(page)).toBe(accentOf("light", "mint"));
      await page.keyboard.press("Escape");
      await expect(drawer).toHaveCount(0);
      await expect(opener).toBeFocused();

      await opener.press("Enter");
      await expect(drawer).toBeVisible();
      await drawer.getByRole("button", { name: "Back to Foundations", exact: true }).click();
      await drawer.getByRole("button", { name: "Controls", exact: true }).click();
      await drawer.getByRole("button", { name: "Controls overview", exact: true }).click();
      await expect(page).toHaveURL(/\/controls(?:\?|$)/);
      await expect(drawer).toHaveCount(0);
      await expect(mobileTabs(page).getByRole("tab", { name: "Components", exact: true })).toHaveAttribute("aria-selected", "true");
    });

    test("the drawer groups components by their v4 room and reopens at the active component", async ({ page }) => {
      await gotoDocs(page, "/");
      const menu = mobileTop(page).getByRole("button", { name: "Menu", exact: true });
      await menu.click();
      const drawer = page.getByRole("dialog");
      for (const name of ["Foundations", "Layout", "Controls", "Inputs", "Navigation", "Surfaces & data", "Charts", "Overlays & feedback"]) {
        await expect(drawer.getByRole("button", { name, exact: true })).toBeVisible();
      }
      await expect(drawer.getByText(/^(Atoms|Molecules|Organisms)$/)).toHaveCount(0);
      await drawer.getByRole("button", { name: "Controls", exact: true }).click();
      await drawer.getByRole("button", { name: "Button", exact: true }).click();
      await expect(page).toHaveURL(/\/components\/button(?:\?|$)/);
      await expect(drawer).toHaveCount(0);
      await menu.click();
      await expect(drawer.getByRole("button", { name: "Button", exact: true })).toHaveAttribute("aria-current", "page");
      await drawer.getByRole("button", { name: "Controls overview", exact: true }).click();
      await expect(page).toHaveURL(/\/controls(?:\?|$)/);
    });

    test("the Search tab opens focused search and Escape restores its opener", async ({ page }) => {
      await gotoDocs(page, "/components/button");
      const opener = mobileTabs(page).getByRole("tab", { name: "Search", exact: true });
      await opener.focus();
      await opener.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Search components", exact: true });
      const input = dialog.getByRole("textbox", { name: "Search components", exact: true });
      await expect(dialog).toBeVisible();
      await expect(input).toBeFocused();
      await input.fill("Avatar");
      await expect(dialog.getByRole("option", { name: /^Avatar\./ })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect(mobileTabs(page).getByRole("tab", { name: "Components", exact: true })).toHaveAttribute("aria-selected", "true");
    });

    test("the page's final link scrolls clear of the floating bottom bar", async ({ page }) => {
      await gotoDocs(page, "/foundations");
      const scroller = page.locator("[data-page-scroll]");
      const lastLink = page.getByRole("contentinfo").getByRole("link").last();
      await expect(lastLink).toHaveCount(1);
      await scroller.evaluate((node) => { node.scrollTop = node.scrollHeight; });
      await expect.poll(async () => {
        const link = await lastLink.boundingBox();
        const tabs = await mobileTabs(page).boundingBox();
        const top = await mobileTop(page).boundingBox();
        return !!link && !!tabs && !!top && link.y >= top.y + top.height && link.y + link.height <= tabs.y;
      }, { message: "the page's final link is covered by persistent navigation" }).toBe(true);
    });
  });
}

test("mobile bars yield to the desktop pill above 1024px", async ({ page }) => {
  await gotoDocs(page, "/foundations", { viewport: { width: 1024, height: 900 } });
  await expect(mobileTop(page)).toBeVisible();
  await expect(mobileTabs(page)).toBeVisible();
  await expect(page.locator("[data-shell-rail]")).toHaveCount(0);
  await page.setViewportSize({ width: 1025, height: 900 });
  await expect(mobileTop(page)).toHaveCount(0);
  await expect(mobileTabs(page)).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Canvas", exact: true })).toBeVisible();
});
