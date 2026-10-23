import { createContext, useContext, type ReactNode } from "react";
import { useOverlayHost, type OverlayHost } from "@nannier/canvas";
import { PortalInto } from "../../../src/style/overlay-layer.js";

// Docs-only presentation infrastructure: a screen-sized modal cannot live in
// the playground's scrolling outlet (which includes its source-code block).
// Capture the existing app-root host above the docs chrome, then publish only
// the example's modal there. The real Canvas Dialog still owns its own portal,
// focus and layout, and PortalInto preserves the example's theme/breakpoint.
const ViewportHost = createContext<OverlayHost | null>(null);

export function ViewportOverlayProvider({ children }: { children: ReactNode }) {
  const host = useOverlayHost();
  return <ViewportHost.Provider value={host}>{children}</ViewportHost.Provider>;
}

export function ViewportOverlay({ children }: { children: ReactNode }) {
  const host = useContext(ViewportHost);
  return host ? <PortalInto host={host}>{children}</PortalInto> : children;
}
