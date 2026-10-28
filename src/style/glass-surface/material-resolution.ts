import type { ThemeValue } from "../theme.js";
import type { GlassLayer } from "./glass-surface.shared.js";

export interface MaterialOptions {
  /** Explicit stable frame frost, independent of descendant control material. */
  frosted?: boolean;
  /** A lightly frosted modal dim layer. */
  veil?: boolean;
  /** Stable frost instead of functional Liquid Glass. Content defaults to frost. */
  static?: boolean;
  layer?: GlassLayer;
  /**
   * A surface floating over the page (a bar, a dialog, a sheet, a popover, a toast). On
   * the web only these take the material: the v4 hand-off draws its glass on the chrome
   * and overlays that float, and paints every surface in the page opaque in either mode.
   */
  floating?: boolean;
}

export interface MaterialCapabilities {
  platform: "web" | "ios" | "android" | "other";
  frost: boolean;
  liquid: boolean;
  requiresTarget: boolean;
}

export type MaterialRenderer = "solid" | "frost" | "liquid";
export type MaterialFallback = "preference" | "design" | "contrast" | "transparency" | "missing-target" | "unavailable";
export interface MaterialResolution {
  renderer: MaterialRenderer;
  static: boolean;
  fallback?: MaterialFallback;
}

/** The modal veil takes precedence over the normal frame frost. */
export function frostedKindOf(options: Pick<MaterialOptions, "veil" | "frosted">): "veil" | "frame" | null {
  if (options.veil) return "veil";
  if (options.frosted) return "frame";
  return null;
}

/** Role, density and renderer are separate decisions. This never acquires resources. */
export function resolveMaterial(
  theme: Pick<ThemeValue, "surface" | "increasedContrast" | "reducedTransparency">,
  options: MaterialOptions,
  capabilities: MaterialCapabilities,
  hasSafeTarget: boolean,
): MaterialResolution {
  const frosted = frostedKindOf(options);
  const stable = frosted != null || (options.static ?? options.layer === "content");
  const solid = (fallback: MaterialFallback): MaterialResolution => ({ renderer: "solid", static: stable, fallback });
  if (theme.increasedContrast) return solid("contrast");
  if (theme.reducedTransparency) return solid("transparency");
  if (theme.surface !== "glass" && frosted == null) return solid("preference");
  // The web's glass is the hand-off's (design-language item 7): a surface in the page keeps
  // its complete solid skin under glass, and only what floats over it is frosted.
  if (capabilities.platform === "web" && frosted == null && !options.floating) return solid("design");
  if (!stable && capabilities.liquid) return { renderer: "liquid", static: false };
  if (!capabilities.frost) return solid("unavailable");
  if (capabilities.requiresTarget && !hasSafeTarget) return solid("missing-target");
  return { renderer: "frost", static: stable };
}
