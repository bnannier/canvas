import { type ReactNode } from "react";
import { GlassSurface, useTheme, type StyleProp, type ViewStyle } from "@olympusoss/canvas";

// A docs content surface that is SOLID in solid mode and FROSTED in frost (glass) mode,
// so the previews, tables, and cards in the docs never read as a clear hole. It leans on
// the kit's GlassSurface, which already reads useTheme().surface: in solid mode it renders
// a plain View that keeps our token fill verbatim; in glass mode it strips the fill and
// paints the real frost material (Liquid Glass on iOS 26, a blur on web/Android). So one
// idiom gives "solid fill in solid, frost in glass" for free, per platform.
//
// `fill` picks the solid token used in solid mode (and the conceptual base in glass):
// `card` for a content panel/stage/table, `muted` for a code/chip surface. `bordered`
// adds the standard rounded hairline frame (so a table/panel reads as a contained card).
// Pass extra border/radius/overflow through `style`.
export function DocsSurface({
  children,
  style,
  fill = "card",
  bordered = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fill?: "card" | "muted";
  bordered?: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <GlassSurface
      style={[
        { backgroundColor: tokens[fill] },
        bordered ? { borderWidth: 1, borderColor: tokens.border, borderRadius: 12, overflow: "hidden" } : null,
        style,
      ]}
    >
      {children}
    </GlassSurface>
  );
}
