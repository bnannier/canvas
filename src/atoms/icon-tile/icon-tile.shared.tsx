import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { View, useTheme, alpha, palette, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type IconTileSkin } from "./icon-tile.styles.js";

// Shared IconTile shell. The tinted rounded square that holds a single Icon,
// recurring across cards, media objects, empty states, and feeds, so no call site
// hand-composes `borderRadius + backgroundColor + padding` to build an icon
// background. IconTile owns the surface AND the icon color: it tints the square
// from a semantic tone and clones its Icon child to paint the matching color, so
// the caller only picks the glyph.
//
// IconTile is a "Light" platform treatment: one structure and semantic colors
// (here), with per-OS touches limited to the corner radius (Material rounds more).

export type Tone = "primary" | "destructive" | "success" | "muted";
export type TileSize = "small" | "default" | "large";

export interface IconTileProps {
  /** A single `<Icon />` element; IconTile tints it to match the tone. */
  children?: ReactNode;
  // Tone (pick one; default `muted`). Sets the tinted surface and the icon color.
  primary?: boolean;
  destructive?: boolean;
  success?: boolean;
  muted?: boolean;
  // Size (pick one; default medium).
  small?: boolean;
  large?: boolean;
  /** Circle instead of the default rounded square. */
  circle?: boolean;
  /** For layout composition only (not styling): the tint, radius, and size come from props. */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: IconTileProps): Tone {
  if (p.primary) return "primary";
  if (p.destructive) return "destructive";
  if (p.success) return "success";
  return "muted";
}

function sizeOf(p: IconTileProps): TileSize {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Tinted surface fill per tone (a soft wash of the tone color; `muted` uses the
// solid muted token).
function tintBg(tokens: ColorTokens, tone: Tone): string {
  switch (tone) {
    case "primary":
      return alpha(tokens.primary, 0.12);
    case "destructive":
      return alpha(tokens.destructive, 0.12);
    case "success":
      return alpha(palette["green-500"], 0.12);
    case "muted":
      return tokens.muted;
  }
}

// The Icon color boolean to inject per tone (so the glyph matches its tint).
const ICON_TINT: Record<Tone, Record<string, boolean>> = {
  primary: { primary: true },
  destructive: { destructive: true },
  success: { success: true },
  muted: { muted: true },
};

/** Build an IconTile from a platform skin. */
export function createIconTile(skin: IconTileSkin) {
  return function IconTile(props: IconTileProps) {
    const { children, circle, style } = props;
    const { tokens } = useTheme();
    const tone = toneOf(props);
    const size = sizeOf(props);
    const box = skin.box[size];

    // Own the icon color + size: clone the Icon child to inject the tone color and
    // the tile's icon size, so the caller writes only the glyph.
    const icon = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          ...ICON_TINT[tone],
          size: skin.iconSize[size],
        })
      : children;

    return (
      <View
        style={[
          {
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            width: box,
            height: box,
            borderRadius: circle ? 9999 : skin.radius[size],
            backgroundColor: tintBg(tokens, tone),
          },
          style,
        ]}
      >
        {icon}
      </View>
    );
  };
}
