import { type ReactNode } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./kbd.styles.js";

// Kbd: a keyboard shortcut indicator. Renders a single key cap, a small
// bordered, slightly raised label with monospace-ish small text. The key label
// comes from children. One cap = one key; compose multiple Kbd caps with a
// separator for a chord (e.g. ⌘ + K), per the docs.
//
// The cap has one fixed look (no size or intent variants), so there are no
// boolean axes to map: the markup mirrors the docs' kbdCls exactly.

export interface KbdProps {
  children?: ReactNode;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

export function Kbd({ children, style }: KbdProps) {
  const { tokens } = useTheme();

  return (
    <View style={[s.capBox, s.capSurface(tokens), style]}>
      {children != null ? <Text style={[s.labelType, s.labelColor(tokens)]}>{children}</Text> : null}
    </View>
  );
}
