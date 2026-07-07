import { type ReactNode } from "react";
import { View, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Kbd shell. Kbd is a keyboard shortcut indicator: a single key cap, a small
// bordered, slightly raised label with monospace-ish small text. The key label comes
// from children. One cap = one key; compose multiple Kbd caps with a separator for a
// chord (e.g. ⌘ + K), per the docs.
//
// The cap has one fixed look (no size or intent variants), so there are no boolean
// axes to map: the structure, accessibility, and token-driven colors live here once,
// and a platform file supplies only its skin (cap geometry + label type) and calls
// createKbd.
//
// Kbd is a "Shared" platform treatment: neither iOS (no native keyboard-key cap
// element) nor Material 3 (no keyboard-key cap component) has a native control, so all
// three platforms render ONE look. The per-OS skins reference the same values as the
// web skin; only the cross-platform shape and token-driven surface remain.

export interface KbdSkin {
  /** The key-cap box geometry: a centered row, fixed cap height, min width, radius, border width, padding. */
  capBox: ViewStyle;
  /** The key label type (size / line-height / weight / tracking). */
  labelType: TextStyle;
}

export interface KbdProps {
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// The cap surface: the muted fill and the hairline border color (platform-neutral,
// token-driven so the cap follows light/dark and reads as glass at the theming level).
function capSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.muted };
}

// The label color: muted foreground (platform-neutral, token-driven).
function labelColor(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

/** Build a Kbd component from a platform skin. */
export function createKbd(skin: KbdSkin) {
  return function Kbd({ children, testID, style }: KbdProps) {
    const { tokens } = useTheme();

    return (
      <View testID={testID} style={[skin.capBox, capSurface(tokens), style]}>
        {children != null ? <Text style={[skin.labelType, labelColor(tokens)]}>{children}</Text> : null}
      </View>
    );
  };
}
