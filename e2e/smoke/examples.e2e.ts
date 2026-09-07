/**
 * Every Playground example on every component page, actually rendered.
 *
 * The route smoke opens each component page and sees its FIRST example. The other
 * 463 are one tab click away and are otherwise never executed by anything: the docs
 * typecheck proves they compile against the real prop types, which is what catches a
 * prop that does not exist, but a component that throws at render still typechecks.
 *
 * The catch is that a throw here is invisible to the console gate, because
 * ExampleErrorBoundary catches it and paints "Example failed to render" in its place.
 * So this is the one suite that has to look for that text.
 *
 * It also holds three things together that would otherwise drift apart: the example
 * labels in the component's markdown, the slugs docs/src/lib/variant.ts derives from
 * them, and the URL component-reference.tsx replaces into the address bar.
 */
import { componentExamples } from "../support/routes";
import { gotoDocs, stage, BASE_PATH } from "../support/docs";
import { expect, test } from "../support/fixtures";

const FAILURE = "Example failed to render";

for (const { route, examples } of componentExamples()) {
  test(`${route.name}: all ${examples.length} example(s) render`, async ({ page }) => {
    await gotoDocs(page, route.path, { scheme: "dark" });
    await expect(stage(page)).toBeVisible();
    await expect(page.getByText(FAILURE)).toHaveCount(0);

    // One example means no switcher rail: the page is already showing it.
    if (examples.length === 1) return;

    const rail = page.locator('[data-testid="playground-examples"]');
    await expect(rail).toBeVisible();

    for (const example of examples) {
      const tab = rail.getByRole("tab", { name: example.label, exact: true });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      // Each example has exactly one canonical address, and selecting it puts the
      // page there (replace, not push, so the back button still leaves the page).
      expect(new URL(page.url()).pathname, example.label).toBe(`${BASE_PATH}${example.path}`);
      await expect(page.getByText(FAILURE), example.label).toHaveCount(0);
    }
  });
}
