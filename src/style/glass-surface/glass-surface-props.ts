// GlassSurface's props, in a module of their own: the platform hosts and the shared internals
// all read them, and they leave the kit beside GlassSurface (glass-surface.tsx re-exports
// them), not through the shared module, which is GlassModalBlurTarget's home.

import type { ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";

/**
 * The layer of the glass model a surface belongs to, which picks its tint (see
 * GlassTokens): `functional` (bars, sheets, popovers, dialogs; the default),
 * `content` (cards, tables, lists, tiles, stages), `control` (fields, buttons,
 * chips, badges, pucks) and `dense` (option lists, alert dialogs, toasts).
 */
export type GlassLayer = "functional" | "content" | "control" | "dense";

export interface GlassSurfaceProps {
  /** Original Argus frame frost. Its tint and blur apply to this surface while
   * descendants retain their own material preference. Shape, exterior shadow,
   * and the opaque accessibility fallback come from the frame’s skin style. */
  frosted?: boolean;
  /** Original lightly frosted modal dim layer; takes precedence over frosted. */
  veil?: boolean;
  /**
   * Which layer of the glass model this surface is, so it takes that layer's tint
   * and blur: nested glass reads as distinct planes only because a control puck is
   * brighter than the content pane it sits on, and a pane denser than the bar
   * floating over it. Defaults to `functional`.
   */
  layer?: GlassLayer;
  /** Stable frost independent of density. Content defaults to static material. */
  static?: boolean;
  /** Clear refractive material with restrained tint and minimal frost. */
  clear?: boolean;
  /**
   * Tint the material with a colour: the brand-tinted glass of a primary control (a
   * primary Button, a split button's call to action). On iOS 26's Liquid Glass it
   * is passed to the native glass as its tintColor and no fill is painted for it; on the
   * frost paths (the web, Android, iOS's frost) it is the fill, the colour at the sheerest
   * alpha at which the ink painted on it keeps 4.5:1 (`brandTint`), painted over the blur
   * as every frost fill is (`frostFill`), so the solved colour is the rendered one. It wins
   * over the layer's tint, and `tint` wins over it.
   */
  brand?: string;
  /**
   * The skin's own surface style: shape, padding, border, shadow and its opaque fill, the
   * whole box solid mode renders. Under glass the fill gives way to the material and a
   * resting border becomes padding of the same width, so the host keeps its size and its
   * content's place while the material covers its whole solid footprint, the material's
   * rim its edge (the owner's GP-1 decision). It is the kit's skin style, not a styling
   * prop for an app: every kit surface hands it its own.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The style's border currently shows a state (a selected card's primary border, a
   * pressed knob's halo): under glass it stays a border in its own colour over the
   * material, which sits flush inside it on concentric corners, where a resting border
   * becomes padding and gives way to the material's rim; and under Increase Contrast it
   * keeps its colour instead of taking the contrasting border (`contrastBorderFor`).
   * Defaults to false.
   */
  stateBorder?: boolean;
  children?: ReactNode;
  /**
   * Whether the surface and its children take touches, as React Native's `pointerEvents`
   * means it on every platform: `none` passes every tap through (a decorative puck),
   * `box-none` passes the surface's own taps through to what lies behind while its
   * children take theirs. Defaults to `auto`.
   */
  pointerEvents?: ViewProps["pointerEvents"];
  /** Layout callback forwarded to the ROOT element of every material branch, so
   *  a shell built on GlassSurface (a navbar measuring itself for its narrow
   *  collapse) can use the container-measurement hooks. */
  onLayout?: ViewProps["onLayout"];
  /** Native accessibility escape, handled by the existing outer content host. */
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /**
   * Landmark role for the root element, e.g. `"navigation"` for a sidebar shell or
   * `"banner"` for a top bar. Glass surfaces ARE the app's bar and sidebar shells, so
   * without this the chrome is an unlabelled stack of divs and every control inside it
   * fails axe's `region` rule for living outside a landmark. Spelled with RN's universal
   * `role` prop, which React Native Web turns into the matching HTML element and native
   * maps onto its own traits, so it needs no per-platform branch. Omit for decorative
   * surfaces such as popovers and menus, which already carry their own role.
   */
  role?: ViewProps["role"];
  /**
   * The name of the root's landmark (`role`), set on the root as both React Native's
   * `accessibilityLabel` and its `aria-label` alias, so a page holding two surfaces of
   * one role (two `"navigation"` shells) can tell them apart in a landmark list. Omit it
   * and the root stays unnamed, as before.
   */
  accessibilityLabel?: string;
  /**
   * Ask iOS 26's Liquid Glass to answer touch with its own press response (Apple's
   * `isInteractive`, forwarded to the native glass view). The glass answers only a touch
   * delivered to the glass view itself, and it never is one: the material layer passes
   * every touch through to the surface's content, and a surface under
   * `pointerEvents="none"` takes none at all, where React Native disables user interaction
   * on the view. So no kit surface asks for it; a pressed control shows its own press
   * feedback (its dim, its Android ripple). Ignored on the frost and solid paths, which
   * have no interactive material. Defaults to false.
   */
  interactive?: boolean;
  /**
   * A sheer content pane: its layer's tint drawn thinner and, on the native frost, a
   * lighter blur, so what lies behind reads through it. It acts on the `content` layer
   * only and never thins a menu, dialog or other floating surface, which must occlude what
   * it opens over; no kit surface asks for it. Defaults to false (the full frost).
   */
  sheer?: boolean;
  /**
   * The translucent fill the material carries in place of the layer's own tint
   * (`glass-tint`, `glass-tint-content`, `glass-tint-control` or `glass-tint-dense` for the
   * surface's `layer`), behind the surface's content and over the frost's blur (beneath the
   * glass on iOS 26's Liquid Glass): a toned or selected pane's wash, or a control's own fill
   * (the Slider knob passes its knob colour, so the knob reads as a bright puck). It wins
   * over `brand`. Not painted where the material resolves solid, where the skin's own opaque
   * fill shows.
   */
  tint?: string;
}
