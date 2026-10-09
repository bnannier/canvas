import { useContext, type RefObject } from "react";
import type { View } from "react-native";
import { useReadyCaptureTarget } from "./capture-target.js";
import { useTheme, type ThemeValue } from "../theme.js";
import { GlassBlurTargetContext } from "./glass-surface.shared.js";
import { useMaterialCapabilities } from "./material-runtime.js";
import { resolveMaterial, type MaterialOptions, type MaterialResolution } from "./material-resolution.js";

export interface MaterialState {
  /** The theme as the provider set it: the requested surface mode, before resolution. */
  theme: ThemeValue;
  /** What the surface renders (frost, Liquid Glass or the solid skin) and why it fell back. */
  material: MaterialResolution;
  /** The capture plane the surface's context offers, ready or not: Android's demand signal. */
  requestedTarget: RefObject<View | null> | null;
  /** That plane once it can be sampled; null until then, and always off Android. */
  target: RefObject<View | null> | null;
}

/**
 * The one material decision for a surface. GlassSurface renders from it, GlassPane
 * mounts only where it is not solid, and `useMaterialTheme` hands it to the host that
 * paints around a pane, so a host and its pane always agree on whether the material
 * is there: a host that keeps its solid skin never gets a pane painted inside it.
 */
export function useMaterialResolution(options: MaterialOptions = {}): MaterialState {
  const theme = useTheme();
  const requestedTarget = useContext(GlassBlurTargetContext);
  const target = useReadyCaptureTarget(requestedTarget);
  const material = resolveMaterial(theme, options, useMaterialCapabilities(), target !== null);
  return { theme, material, requestedTarget, target };
}

/** Shared effective appearance for a surface's fill, foreground, states and motion. */
export function useMaterialTheme(options: MaterialOptions = {}): ThemeValue {
  const { theme, material } = useMaterialResolution(options);
  return material.renderer === "solid" && theme.surface !== "solid" ? { ...theme, surface: "solid" } : theme;
}
