import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENTS } from "../../docs/src/core/data/components";

const repo = resolve(__dirname, "../..");
const output = process.env.SMOKE_OUTPUT!;
const identity = JSON.parse(readFileSync(resolve(output, "context.json"), "utf8")).identity as { candidateRevision: string; packageVersion: string };
// Every documented component: the ones docgen generated a docs module for.
const documented = COMPONENTS
  .map((component) => ({ ...component, dir: component.dir ?? component.slug }))
  .filter(({ category, dir }) => existsSync(resolve(repo, `docs/src/core/examples/${category.toLowerCase()}/${dir}/${dir}-docs.tsx`)));

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
  for (const category of ["Atoms", "Molecules", "Organisms", "Charts"]) {
    const count = documented.filter((component) => component.category === category).length;
    await expect(drawer.getByText(`${count} components`)).toBeVisible();
  }
});

test("the catalog renders every documented component without a failure", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/testing/catalog");
  await page.getByRole("button", { name: "Render every component" }).click();
  await expect(page.getByTestId("catalog-progress")).toHaveText(`Rendered: ${documented.length} of ${documented.length}`, { timeout: 200_000 });
  await expect(page.getByTestId("catalog-failures")).toHaveText("Failures: 0");
});

for (const component of documented) {
  test(`${component.name} renders every documented example`, async ({ page }) => {
    await page.goto(`/components/${component.slug}`);
    await expect(page.getByTestId("component-title")).toHaveText(component.name);
    await expect(page.locator(`[data-testid^="example-${component.slug}-"]`).first()).toBeVisible();
    await expect(page.getByText("Example failed")).toHaveCount(0);
  });
}
