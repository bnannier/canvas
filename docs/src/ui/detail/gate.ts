// The v4 component detail page's pilot gate (audit/v4-redesign/PLAN.md decision P1): the
// component slugs whose docs page renders the hand-off's detail page
// (docs/src/ui/detail/detail-page.tsx). Every other component keeps the Playground page
// until Phase 6 regenerates the data and flips the gate for all of them. Plain data, with no
// React Native import, so the browser suite reads the same set (e2e/support/docs.ts).
export const DETAIL_V4: ReadonlySet<string> = new Set(["button"]);

/** Whether the component at `slug` renders the v4 detail page. */
export function isDetailV4(slug: string): boolean {
  return DETAIL_V4.has(slug);
}
