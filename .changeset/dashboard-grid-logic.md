---
"@nannier/canvas": patch
---

Groundwork for the DashboardGrid organism: the renderer-free layout logic module
(`orderedWidgets`, `moveWidget`, `effectiveSpan`) plus the `DashboardWidget` and
`DashboardTier` types, with unit tests.

Patch, not minor: nothing is exported from the organisms barrel yet, so the
package's public API is unchanged. The component that consumes this lands next.

The order functions reconcile rather than throw, because a consuming app persists
the widget order server-side as ids alone and that array outlives the widget list
it was captured from: ids missing from the stored order append in their declared
order, ids matching no widget drop out, and a move naming an unknown id is a
no-op.
