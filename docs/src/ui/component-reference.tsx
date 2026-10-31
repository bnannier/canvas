import { Suspense } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Skeleton } from "@nannier/canvas";
import { getComponent } from "../core/data/components";
import { Page } from "./page";
import { DocsHead } from "./docs-head";
import { DetailPage } from "./detail/detail-page";
import { DetailFooter } from "./detail/footer";

// The component reference page, shared by the default route (components/[slug]/index) and
// the deep-linked variant route (components/[slug]/[variant]): the v4 detail page
// (docs/src/ui/detail, audit/v4-redesign/PLAN.md decisions P1 to P3) for every component.
// The optional `variant` path segment names one example by its slugified label (see
// variantSlug): /components/checkbox/nestedgroup opens the "Nested group" example on the
// page's comparison stage. An absent segment shows the first (default) example; a segment
// that names the default, or names nothing valid, redirects to the bare component URL so
// each variant has exactly one canonical address.
export function ComponentReference() {
  const { slug, variant } = useLocalSearchParams<{ slug: string; variant?: string }>();

  const comp = slug ? getComponent(slug) : undefined;
  if (!comp) return <Redirect href="/components" />;

  // The docs module is the page's own chunk in the web export. It is on the page before
  // the bundle runs, so this never suspends on a page load; a client-side navigation to
  // another component fetches that one's chunk, and the page holds a skeleton for the
  // moment it takes.
  return (
    <Page detail footer={<DetailFooter />}>
      <DocsHead title={comp.name} />
      <Suspense fallback={<Skeleton card large animate accessibilityLabel="Loading the component" />}>
        <DetailPage comp={comp} variant={variant} />
      </Suspense>
    </Page>
  );
}
