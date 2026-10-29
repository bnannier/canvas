import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { View, Text, alpha, statusColors, type ColorTokens, type ViewStyle, type LayoutStyle } from "../../style/index.js";
import { GlassPane, paneStyle } from "../../style/glass-surface/glass-pane.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { type EmblemSkin } from "./emblem.styles.js";

// Shared Emblem shell. The tinted rounded square (or circle) that holds a single
// Icon or a short monogram, recurring across cards, media objects, empty states,
// and feeds, so no call site hand-composes `borderRadius + backgroundColor + padding`
// to build an icon background. Emblem owns the surface AND the icon color: it tints
// the square from a semantic tone and clones its Icon child to paint the matching
// color, so the caller only picks the glyph.
//
// Emblem is a "Shared" platform treatment: one structure and semantic colors (here), and
// no platform ships an icon tile, so the iOS and Android skins are the web skin
// (emblem.styles.ts). The continuous corner curve is drawn only where the platform draws
// one (iOS).

export type Tone = "primary" | "destructive" | "success" | "warning" | "muted";
export type EmblemSize = "small" | "default" | "large";

export interface EmblemProps {
  /** A single `<Icon />` element; Emblem tints it to match the tone. */
  children?: ReactNode;
  /** A monogram letter (or two) instead of an icon, painted in the tone color. */
  label?: string;
  // Tone (pick one; default `muted`). Sets the tinted surface and the icon color.
  primary?: boolean;
  destructive?: boolean;
  success?: boolean;
  warning?: boolean;
  muted?: boolean;
  // Size (pick one; default medium).
  small?: boolean;
  large?: boolean;
  /** Circle instead of the default rounded square. */
  circle?: boolean;
  /**
   * The plain soft tile: the tone's own soft wash (`primary-soft`, `destructive-soft`, ...)
   * with no ring and no lit top edge, at the soft tile's own corner. The tone tile a dialog
   * draws over its title (the v4 hand-off's AlertDialog renderer, `--ion-soft` /
   * `--bad-soft`). Composes with the tone and size axes.
   */
  soft?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only (not styling): the tint, radius, and size come from props. */
  style?: LayoutStyle;
}

// Tone precedence when more than one is passed: first match wins.
export function toneOf(p: EmblemProps): Tone {
  if (p.primary) return "primary";
  if (p.destructive) return "destructive";
  if (p.success) return "success";
  if (p.warning) return "warning";
  return "muted";
}

export function sizeOf(p: EmblemProps): EmblemSize {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// The tone's base colour, the one the tile's wash and ring are mixed from (the hand-off's
// `--ion`, `--ok`, `--warn`, `--bad` and `--tx3`): the solid accent and status roles, and
// the subtle ink for `muted`.
const STATUS_TONE = { primary: "info", destructive: "error", success: "success", warning: "warning" } as const;

function toneBase(tokens: ColorTokens, tone: Tone): string {
  switch (tone) {
    case "primary": return tokens.primary;
    case "destructive": return tokens.destructive;
    case "success": return tokens.success;
    case "warning": return tokens.warning;
    case "muted": return tokens["subtle-foreground"] ?? tokens["muted-foreground"];
  }
}

// The Icon color boolean to inject per tone (so the glyph matches its tint).
const ICON_TINT: Record<Tone, Record<string, boolean>> = {
  primary: { primary: true },
  destructive: { destructive: true },
  success: { success: true },
  warning: { warning: true },
  muted: { muted: true },
};

// The monogram label's color: the tone's ink (text-grade over its wash), muted-foreground
// on the muted tile.
function labelColor(tokens: ColorTokens, tone: Tone): string {
  return tone === "muted" ? tokens["muted-foreground"] : statusColors(tokens, STATUS_TONE[tone]).ink;
}

/** Build an Emblem from a platform skin. */
export function createEmblem(skin: EmblemSkin) {
  return function Emblem(props: EmblemProps) {
    const { children, label, circle, soft, testID, style } = props;
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
    const base = toneBase(tokens, toneOf(props));
    const tone = toneOf(props);
    // The soft tile takes the tone's own soft wash token; the default tile mixes its wash
    // and ring from the tone's base colour.
    const wash = soft ? (tone === "muted" ? tokens.secondary : statusColors(tokens, STATUS_TONE[tone]).wash) : alpha(base, skin.washAlpha);
    const size = sizeOf(props);
    const box = skin.box[size];
    const glyph = skin.iconSize[size];
    const tileShape: ViewStyle = {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      width: box,
      height: box,
      borderRadius: circle ? 9999 : soft ? skin.softRadius : skin.radius[size],
      backgroundColor: wash,
      ...(soft ? null : { borderWidth: 1, borderColor: alpha(base, skin.ringAlpha) }),
      ...(!soft && tokens.highlight ? { boxShadow: `inset 0px 1px 0px ${tokens.highlight}` } : null),
      ...skin.shape,
    };

    // A monogram label paints in the tone color; otherwise own the icon color +
    // size by cloning the Icon child, so the caller writes only the glyph.
    const inner =
      label != null ? (
        <Text style={[skin.monogram, { color: labelColor(tokens, tone), fontSize: skin.monogramSize[size], lineHeight: skin.monogramSize[size] }]}>
          {label}
        </Text>
      ) : isValidElement(children) ? (
        cloneElement(children as ReactElement<Record<string, unknown>>, { ...ICON_TINT[tone], size: glyph })
      ) : (
        children
      );

    return (
      <View
        testID={testID}
        // The tone's ring is part of the tile, not a resting hairline, so under glass it
        // stays a border over the pane (the state-border form of paneStyle).
        style={[paneStyle(theme, tileShape, !soft), style]}
      >
        <GlassPane static layer="control" shape={tileShape} tint={wash} stateBorder={!soft} />
        {inner}
      </View>
    );
  };
}
