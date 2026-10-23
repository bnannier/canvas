import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENTS } from "../../docs/src/core/data/components";
import { JOURNEYS } from "../../smoke/src/catalog/journeys";
import { splitDoc } from "../../tools/docgen/parse-md";

const repo = resolve(__dirname, "../..");
const output = process.env.SMOKE_OUTPUT!;
const identity = JSON.parse(readFileSync(resolve(output, "context.json"), "utf8")).identity as { candidateRevision: string; packageVersion: string };
// Every documented component (the ones docgen generated a docs module for), with the
// labels of its examples read from the same markdown docgen generates them from.
const CATEGORIES = ["Atoms", "Molecules", "Organisms", "Charts"] as const;
const documented = COMPONENTS
  .map((component) => ({ ...component, dir: component.dir ?? component.slug }))
  .filter(({ category, dir }) => existsSync(resolve(repo, `docs/src/core/examples/${category.toLowerCase()}/${dir}/${dir}-docs.tsx`)))
  .map((component) => ({
    ...component,
    examples: splitDoc(readFileSync(resolve(repo, `src/${component.category.toLowerCase()}/${component.dir}/${component.dir}.md`), "utf8")).examples.map(({ label }) => label),
  }));

const errorLogs = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  errorLogs.set(page, errors);
});
test.afterEach(async ({ page }) => {
  expect(errorLogs.get(page) ?? [], "The smoke app emitted browser errors.").toEqual([]);
});

test.describe("App shell", () => {
  test("runs the sealed candidate it was prepared with", async ({ page }) => {
    await page.goto("/testing/diagnostics");
    await expect(page.getByTestId("smoke-candidate-revision")).toHaveText(identity.candidateRevision);
    await expect(page.getByTestId("smoke-package-version")).toHaveText(identity.packageVersion);
  });

  test("the menu leads the bar and lists the journeys and every tier", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Navigation menu" });
    const brand = page.getByText("Canvas Smoke Test").first();
    const [menuBox, brandBox] = [await menu.boundingBox(), await brand.boundingBox()];
    expect(menuBox!.x).toBeLessThan(brandBox!.x);
    await menu.click();
    const drawer = page.getByRole("dialog", { name: "Smoke test menu" });
    await expect(drawer.getByRole("button", { name: /^Journeys/ })).toBeVisible();
    for (const category of CATEGORIES) {
      const count = documented.filter((component) => component.category === category).length;
      await expect(drawer.getByText(`${count} components`)).toBeVisible();
    }
  });

  test("every menu entry opens a page headed by the same name", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
    for (const journey of JOURNEYS) {
      await page.goto(journey.route);
      await expect(page.getByTestId("screen-title")).toHaveText(journey.title);
    }
  });

  test("the catalog renders every documented component without a failure", async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto("/testing/catalog");
    await page.getByRole("button", { name: "Render every component" }).click();
    await expect(page.getByTestId("catalog-progress")).toHaveText(`Rendered: ${documented.length} of ${documented.length}`, { timeout: 200_000 });
    await expect(page.getByTestId("catalog-failures")).toHaveText("Failures: 0");
  });
});

// One test per component, grouped by tier as the app menu groups them, with a step per
// documented example: each example's block appears under its label and none failed.
for (const category of CATEGORIES) {
  test.describe(category, () => {
    for (const component of documented.filter((entry) => entry.category === category).sort((a, b) => a.name.localeCompare(b.name))) {
      test(component.name, async ({ page }) => {
        await page.goto(`/components/${component.slug}`);
        await expect(page.getByTestId("component-title")).toHaveText(component.name);
        for (const [index, label] of component.examples.entries()) {
          await test.step(label, async () => {
            const block = page.getByTestId(`example-${component.slug}-${index}`);
            await expect(block).toBeVisible();
            await expect(block.getByText(label, { exact: true }).first()).toBeVisible();
            await expect(page.getByTestId(`example-${component.slug}-${index}-error`)).toHaveCount(0);
          });
        }
        await expect(page.getByTestId(`example-${component.slug}-${component.examples.length}`)).toHaveCount(0);
      });
    }
  });
}
