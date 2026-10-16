import type { ReactNode } from "react";
import { View } from "@nannier/canvas";

// Docs-only viewport scaffolding: app-sized components need a definite parent
// height inside the page's otherwise unbounded scroller. This paints no surface.
export function PreviewViewport({ children, height = 360 }: { children: ReactNode; height?: number }) {
  return <View style={{ height }}>{children}</View>;
}
