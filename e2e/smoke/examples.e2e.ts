/**
 * Every component playground and documented variant route, actually rendered.
 *
 * Bare component routes show the hand-off playground; named variants render their
 * documented examples. The docs typecheck proves those examples compile against the
 * real component prop types, which is what catches a
 * prop that does not exist, but a component that throws at render still typechecks.
 *
 * The catch is that a throw here is invisible to the console gate, because
 * ExampleErrorBoundary catches it and paints "Example failed to render" in its place.
 * So this is the one suite that has to look for that text.
 *
 * It also holds three things together that would otherwise drift apart: the example
 * labels in the component's markdown, the slugs docs/src/lib/variant.ts derives from
 * them, and the canonical deep links the detail page resolves.
 */
import { componentExamples, EXAMPLE_ROUTES } from "../support/routes";
import { gotoDocs, exampleCard, stage, BASE_PATH } from "../support/docs";
import { expect, test } from "../support/fixtures";

const FAILURE = "Example failed to render";

for (const { route, examples } of componentExamples()) {
  test(`${route.name}: all ${examples.length} example(s) render`, async ({ page }) => {
    await gotoDocs(page, route.path, { scheme: "dark" });
    await expect(stage(page)).toBeVisible();
    await expect(page.getByText(FAILURE)).toHaveCount(0);

    // Bare routes show the hand-off playground. Every non-default documented
    // example has its own live route; the former example picker no longer exists.
    for (const example of EXAMPLE_ROUTES) {
      if (example.slug !== route.name || example.path === route.path) continue;
      await gotoDocs(page, example.path, { scheme: "dark" });
      await expect(page, example.label).toHaveURL(url => url.pathname === `${BASE_PATH}${example.path}`);
      await expect(exampleCard(page, example.label), example.label).toBeVisible();
      await expect(page.getByText(FAILURE), example.label).toHaveCount(0);
    }
  });
}
