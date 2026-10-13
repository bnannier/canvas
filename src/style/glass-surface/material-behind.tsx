// Whether a glass material renders behind a node, for the one press feedback it would hide:
// Android's borderless ripple. A borderless ripple (`borderless: true`, no mask) is projected
// onto the nearest ancestor that has a background, which Android draws before that
// ancestor's children. Inside a surface whose material renders (an overlay outlet's frost, a
// bridged Modal's), that ancestor is the surface's own host or one below it, and the material
// is one of its children: the press draws beneath the frost and shows nothing. GlassPane's
// hosts bring their own controls' ripples forward (`paneRipple`), since a host knows its pane
// renders; a control placed inside a surface it does not own (a Tooltip trigger, a Breadcrumb
// link, a pressable Avatar, a Carousel dot, an app's own icon button) cannot know, so the
// surfaces publish it here and the kit's Pressable reads it.
//
// The provider is present in every mode and only its value changes, so a mode switch never
// reparents or remounts the content (its refs, focus, input values and scroll survive). A
// surface that resolves solid publishes false, so a solid surface nested in a frosted one,
// whose opaque fill receives the projection above the outer frost, puts the ripple back.

import { createContext, useContext, type ReactNode } from "react";
import type { PressableAndroidRippleConfig } from "react-native";

const MaterialBehindContext = createContext(false);

/** Whether a glass material renders behind this node (false outside every glass surface). */
export function useMaterialBehind(): boolean {
  return useContext(MaterialBehindContext);
}

/**
 * Publishes whether a material renders behind `children`: a GlassSurface around its content,
 * and a pane host that holds arbitrary content (a Card, an Alert, a bordered MediaObject)
 * around that content, with `rendered` the same decision its GlassPane mounts on.
 */
export function MaterialBehind({ rendered, children }: { rendered: boolean; children?: ReactNode }) {
  return <MaterialBehindContext.Provider value={rendered}>{children}</MaterialBehindContext.Provider>;
}

/**
 * A Pressable's Android ripple under a material: a borderless ripple moved to the foreground
 * (`foreground: true`), where it is not projected and radiates on the Pressable's own canvas
 * over its content, in its own translucent colour; everything else, and every ripple where
 * no material renders behind, returned as given (the same object), so the solid tree and
 * Android's in-page glass, which resolves solid, are byte-identical. iOS and the web ignore
 * `android_ripple`.
 */
export function frontRipple<R extends PressableAndroidRippleConfig | null | undefined>(behind: boolean, ripple: R): R {
  if (!behind || ripple == null || ripple.borderless !== true || ripple.foreground === true) return ripple;
  return { ...ripple, foreground: true } as R;
}
