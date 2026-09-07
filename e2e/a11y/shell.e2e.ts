/**
 * The docs' own chrome, scanned whole.
 *
 * The component scans deliberately look only at the web preview row, so nothing there
 * covers the navigation, the search, the type scale on the token pages, or the
 * playground itself. Those are built out of the kit too (the repo's own rule is that
 * every element in the docs is a Canvas component), so a finding here is usually a
 * finding about the kit, reached from the other side.
 *
 * A handful of representative pages rather than all 149: whole-page scans are slower,
 * and the chrome is the same on every one of them.
 */
import { contentRoutes } from "../support/routes";
import { gotoDocs } from "../support/docs";
import { BLOCKING_IMPACTS, attach, describe as describeViolations, scan } from "../support/axe";
import { expect, test } from "../support/fixtures";

const firstOf = (kind: string) => contentRoutes().find((r) => r.kind === kind)!.path;

const PAGES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "catalog", path: "/components" },
  { name: "tokens", path: "/tokens/colors" },
  { name: "component page", path: "/components/button" },
  { name: "template", path: firstOf("template") },
  { name: "pattern", path: firstOf("pattern") },
];

/**
 * Whole-page findings that stand today, by page and rule. Same contract as the
 * component suite: an unlisted page must be clean, a listed one must not grow a new
 * rule, and an entry that stops firing has to be deleted.
 */
const KNOWN_FINDINGS: Record<string, string[]> = {};

for (const scheme of ["dark", "light"] as const) {
  for (const page of PAGES) {
    test(`${page.name} in ${scheme}`, async ({ page: browserPage }, testInfo) => {
      await gotoDocs(browserPage, page.path, {
        scheme,
        // Phone width in light, desktop in dark: the shell is a different thing at
        // each (a tab bar and a topbar rather than a sidebar), and contrast is the
        // one rule whose answer depends on the scheme.
        viewport: scheme === "light" ? { width: 375, height: 812 } : { width: 1280, height: 900 },
      });

      const findings = await scan(browserPage, "body");
      await attach(testInfo, `${page.name}-${scheme}`, findings);

      const blocking = findings.filter((f) => BLOCKING_IMPACTS.has(f.impact));
      const known = KNOWN_FINDINGS[page.name] ?? [];
      const unexpected = blocking.filter((f) => !known.includes(f.id));
      expect(
        unexpected,
        `${page.name} (${scheme}) has a NEW violation:\n${describeViolations(unexpected)}`,
      ).toEqual([]);
    });
  }
}
