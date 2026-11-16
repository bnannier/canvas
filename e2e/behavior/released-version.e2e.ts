import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";
import canvasPkg from "../../package.json";

const REGISTRY = "https://registry.npmjs.org/@nannier/canvas/latest";

test("the homepage and both footers display npm's latest release", async ({ page }) => {
  let version = "8.12.3";
  await page.route(REGISTRY, (route) => route.fulfill({ json: { version } }));
  await gotoDocs(page, "/");
  await expect(page.getByText(`Canvas v${version} · Component library`, { exact: true })).toBeVisible();
  await expect(page.getByText(`Canvas v${version} · component library`, { exact: true })).toHaveCount(1);

  // A later release must be read again when a docs screen is opened.
  version = "8.12.4";
  await gotoDocs(page, "/components/button");
  await expect(page.getByText(`Canvas v${version} · component detail · props and examples read from bnannier/canvas`, { exact: true })).toHaveCount(1);
  version = "8.12.5";
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Canvas", exact: true }).click();
  await expect(page.getByText(`Canvas v${version} · Component library`, { exact: true })).toBeVisible();
  await expect(page.getByText(`Canvas v${version} · component library`, { exact: true })).toHaveCount(1);
});

test("a registry response without a version retains the build version", async ({ page }) => {
  await page.route(REGISTRY, (route) => route.fulfill({ json: {} }));
  await gotoDocs(page, "/");
  await expect(page.getByText(`Canvas v${canvasPkg.version} · Component library`, { exact: true })).toBeVisible();
  await expect(page.getByText(`Canvas v${canvasPkg.version} · component library`, { exact: true })).toHaveCount(1);
});
