// GlassBackdrop — base (web + iOS): a no-op passthrough. Only Android's frost needs
// an explicit blur target (see glass-backdrop.android.tsx): web blurs with a CSS
// backdrop-filter and iOS with UIVisualEffectView / Liquid Glass, both of which pick
// up whatever renders behind the surface on their own. Rendering no wrapper here
// keeps web and iOS layout byte-for-byte unchanged.
//
// Mounted by ThemeProvider around its children, so Android consumers get the blur
// target wired automatically; this base file is what every other platform resolves.

import { type ReactNode } from "react";

export function GlassBackdrop({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
