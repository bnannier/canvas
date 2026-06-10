import { type ReactNode } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./divider.styles.js";
import { type Orientation, type Emphasis } from "./divider.styles.js";

export interface DividerProps {
  /**
   * Optional middle content. With children, a horizontal divider renders a
   * flanking-line + centered-label row (the "with label" / "with action"
   * patterns). A string renders as muted label text; arbitrary nodes (e.g. a
   * button) render as-is for the action pattern. Ignored when `vertical`.
   */
  children?: ReactNode;
  // Orientation (pick one; default is horizontal).
  horizontal?: boolean;
  vertical?: boolean;
  // Emphasis (pick one; default tracks the border token).
  soft?: boolean;
  strong?: boolean;
  /** Escape hatch for layout/positioning composition (width, margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// First match wins when more than one orientation flag is passed.
function orientationOf(p: DividerProps): Orientation {
  if (p.vertical) return "vertical";
  return "horizontal";
}

// First match wins when more than one emphasis flag is passed.
function emphasisOf(p: DividerProps): Emphasis {
  if (p.soft) return "soft";
  return "strong";
}

export function Divider(props: DividerProps) {
  const { children, style } = props;
  const orientation = orientationOf(props);
  const emphasis = emphasisOf(props);
  const { tokens } = useTheme();
  const ruleFill = s.ruleFill(tokens, emphasis);

  if (orientation === "vertical") {
    // A thin vertical rule that adapts to the row height it sits in.
    return <View style={[s.verticalRule, ruleFill, style]} />;
  }

  // Horizontal with a label/action in the middle: a centered node flanked by
  // two hairlines (the sepLabel pattern: gap-3, xs muted text).
  if (children != null) {
    const isText = typeof children === "string" || typeof children === "number";
    return (
      <View style={[s.labelRow, style]}>
        <View style={[s.flankRule, ruleFill]} />
        {isText ? (
          <Text style={s.labelText(tokens)}>{children}</Text>
        ) : (
          children
        )}
        <View style={[s.flankRule, ruleFill]} />
      </View>
    );
  }

  // Plain horizontal hairline spanning the full width.
  return <View style={[s.horizontalRule, ruleFill, style]} />;
}
