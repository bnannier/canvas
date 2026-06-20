import { type ReactNode } from "react";
import { View, GlassSurface, alpha, useTheme, type StyleProp, type ViewStyle } from "@olympusoss/canvas";

// A docs content surface that is SOLID in solid mode and a VISIBLE FROST in frost (glass)
// mode, so the previews, tables, and cards never read as a clear hole. It leans on the
// kit's GlassSurface, which reads useTheme().surface: in solid mode it renders a plain
// View that keeps our token fill verbatim (solid card); in glass mode it strips the fill
// and paints the real blur material.
//
// The blur alone is too faint over a near-black page in dark mode (it reads as clear), so
// in glass mode we also lay a translucent tint of the fill OVER the blur. That keeps the
// surface clearly a frosted card (frost, not clear) while the blur still shows through the
// remaining translucency.
//
// `fill` picks the token used as the solid fill (and the frost tint): `card` for a content
// panel/stage/table, `muted` for a code/chip surface. `bordered` adds the standard rounded
// hairline frame. Pass extra border/radius/overflow through `style`.
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
  const { tokens, surface } = useTheme();
  return (
    <GlassSurface
      style={[
        { backgroundColor: tokens[fill] },
        bordered ? { borderWidth: 1, borderColor: tokens.border, borderRadius: 12, overflow: "hidden" } : null,
        style,
      ]}
    >
      {surface === "glass" ? (
        <View pointerEvents="none" style={[StyleSheet_absoluteFill, { backgroundColor: alpha(tokens[fill], 0.7) }]} />
      ) : null}
      {children}
    </GlassSurface>
  );
}

// Inlined to avoid a react-native StyleSheet import in a kit-primitives-only file.
const StyleSheet_absoluteFill: ViewStyle = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 };
