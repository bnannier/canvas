import type { ReactNode } from "react";
import { View } from "@nannier/canvas";

// Docs-only viewport scaffolding: app-sized components need a definite parent
// height inside the page's otherwise unbounded scroller. This paints no surface.
export function PreviewViewport({ children, height = 360 }: { children: ReactNode; height?: number }) {
  // A plain host keeps the child's anatomy registry open; a Container would
  // register its own parts and close the scope before the app frame is reached.
  return <View style={{ height, width: "100%" }}>{children}</View>;
}
