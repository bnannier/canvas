import { useMemo, type ReactNode } from "react";
import * as Canvas from "@nannier/canvas";
import { useTheme } from "@nannier/canvas";
import { AppScreen, AppShell, IconGallery, Stateful, Ticker, WithToast, applyDrop } from "../../../docs/src/core/live-state";
import { applyResolvedPhotos } from "../../../docs/src/core/photos";
import type { ExampleScope } from "../../../docs/src/core/scope";

// The docs host a screen-sized modal example outside their scrolling playground. Here
// every example already has a screen of its own under the app's root overlay host, so
// the modal renders in place.
function ViewportOverlay({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** The scope a generated docs example renders against, built from the installed package. */
export function useExampleScope(): ExampleScope {
  const { tokens } = useTheme();
  return useMemo(() => {
    const scope: Record<string, unknown> = { ...Canvas };
    applyResolvedPhotos(scope);
    Object.assign(scope, { tokens, Stateful, Ticker, applyDrop, IconGallery, WithToast, AppScreen, AppShell, ViewportOverlay });
    return scope as unknown as ExampleScope;
  }, [tokens]);
}
