import { BASE_PATH, gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const SECTIONS = [
  { label: "Foundations", path: "foundations", title: "Foundations" },
  { label: "Layout", path: "layout", title: "Layout" },
  { label: "Controls", path: "controls", title: "Controls" },
  { label: "Inputs", path: "inputs", title: "Inputs" },
  { label: "Navigation", path: "navigation", title: "Navigation" },
  { label: "Data", path: "data", title: "Surfaces & data" },
  { label: "Charts", path: "charts", title: "Charts" },
  { label: "Overlays", path: "overlays", title: "Overlays & feedback" },
];

for (const width of [1280, 390]) {
  test(`home links open section pages without reloading (${width})`, async ({ page }) => {
    await gotoDocs(page, "/", { viewport: { width, height: 900 } });
    const primary = page.getByRole("navigation", { name: "Primary", exact: true });
    const documents: string[] = [];
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.resourceType() === "document") documents.push(request.url());
    });

    for (const section of SECTIONS) {
      // Start in the home group each time: a catch-all nested there used to win
      // over the components group's dynamic section route on client navigation.
      if (width > 1024) {
        await primary.getByRole("link", { name: section.label, exact: true }).click();
      } else {
        // The mobile bar switches root sections; the home index links every room.
        await page.getByRole("main").locator(`[href="${BASE_PATH}/${section.path}"]`).first().click();
      }
      await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/${section.path}(?:\\?|$)`));
      await expect(page.getByRole("main").getByRole("heading", { level: 1, name: section.title, exact: true })).toBeVisible();
      await expect(page.getByText("Page not found", { exact: true })).toHaveCount(0);

      if (width > 1024) await primary.getByRole("link", { name: "Canvas", exact: true }).click();
      else await primary.getByRole("tab", { name: "Home", exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: "One UI Kit.", exact: true })).toBeVisible();
    }

    expect(documents, "section links should navigate within the running app").toEqual([]);
  });
}

for (const width of [1280, 390]) {
  test(`the Foundations heading and count open the section (${width})`, async ({ page }) => {
    await gotoDocs(page, "/components/typography", { viewport: { width, height: 900 } });
    if (width < 1025) await page.getByRole("button", { name: "Components in this section", exact: true }).click();
    const navigation = page.getByRole("navigation", { name: "Foundations components", exact: true });
    const heading = navigation.getByRole("link", { name: /Foundations.*6/ });
    await expect(heading).toHaveAttribute("href", `${BASE_PATH}/foundations`);
    await expect(heading).toBeVisible();
    const target = await heading.boundingBox();
    expect(target?.width).toBeGreaterThanOrEqual(24);
    expect(target?.height).toBeGreaterThanOrEqual(24);
    const firstRow = await navigation.getByRole("button").first().boundingBox();
    expect(firstRow?.y).toBeGreaterThanOrEqual(target!.y + target!.height);
    const documentStarted = await page.evaluate(() => performance.timeOrigin);
    await heading.focus();
    await heading.press("Enter");
    await expect(page).toHaveURL(/\/foundations(?:\?|$)/);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentStarted);
    await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Foundations", exact: true })).toBeVisible();
  });
}
