import { type ViewStyle } from "react-native";

export interface ActiveIndicatorOptions {
  /** Whether the field is in its active state (open / focused). */
  active: boolean;
  /** Bottom-border color at rest (the M3 on-surface-variant / iOS separator read). */
  restColor: string;
  /** Bottom-border color when active (the brand accent: primary / ring). */
  activeColor: string;
  /** Indicator thickness at rest (default 1). Use `StyleSheet.hairlineWidth` for the iOS rule. */
  restWidth?: number;
  /** Indicator thickness when active (default 2). */
  activeWidth?: number;
  /**
   * Padding kept between the content and the indicator when active (default 0). Set it to the
   * field's top padding so the value text stays vertically balanced; leave 0 when the text sits
   * directly on the rule (Select / Combobox) or when a separate inner field owns the padding.
   */
  gap?: number;
}

/**
 * The Material / iOS bottom "active indicator" as a bottom border that thickens when the field
 * becomes active, WITHOUT reflowing the field's content.
 *
 * A naive `borderBottomWidth: active ? 2 : 1` on a fixed-height, `box-sizing: border-box`,
 * vertically-centered field shrinks the content box by the extra pixel when active, nudging the
 * centered value text up (a visible layout jump on open/focus). This reserves a CONSTANT band
 * below the content — the indicator (border) plus a compensating `paddingBottom` — so
 * `borderBottomWidth + paddingBottom` never changes and the content box stays put across states.
 *
 * Spread onto the element that carries the indicator (the field/trigger, or the grouped container
 * that shares one border). One source of truth for the whole M3 field family (Select, Combobox,
 * Input); the invariant it guarantees is locked by `test/field-focus-layout.test.tsx` Part A.
 */
export function activeIndicator(o: ActiveIndicatorOptions): ViewStyle {
  const restWidth = o.restWidth ?? 1;
  const activeWidth = o.activeWidth ?? 2;
  const width = o.active ? activeWidth : restWidth;
  return {
    borderBottomWidth: width,
    borderBottomColor: o.active ? o.activeColor : o.restColor,
    // Fill the rest of the reserved band with padding: total below-content space is always
    // `gap + activeWidth`, so the content box never changes height when the border thickens.
    paddingBottom: (o.gap ?? 0) + activeWidth - width,
  };
}
