import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Per-OS Card skins. Card is a "Light" platform treatment: one structure and one
// set of (semantic) colors live in card.shared.tsx; only the small native touches
// shift per OS on the MAIN card surface, namely the corner radius, the card's own
// content density (its padding + the gap between flat children), and the elevation
// / shadow. Press feedback (the interactive / onPress affordance) is handled in
// the shell: Android gets android_ripple, iOS/web get a pressed opacity dim.
//
// The composition subcomponents (CardHeader/CardTitle/CardContent/CardFooter/
// CardSeparator) are STATIC shared members, so their insets and type are shared
// (one value across platforms); only the main surface is skin-parameterized.
//
// - Web keeps the CURRENT look EXACTLY: 8px radius, shadow-sm resting, the
//   established Catalyst/shadcn card insets and the `padded`/density values.
// - iOS follows HIG conventions: iOS has no card control, so the structure is kept
//   and only iOS touches are applied, a larger continuous-style corner radius
//   (12). Native iOS grouped surfaces are flat, so the resting card drops to no
//   shadow (raised still lifts).
// - Android matches Material 3 cards: the M3 medium shape (12dp corner radius),
//   tighter M3 density steps, and the M3 resting elevation (level 1, our shadow-sm)
//   with raised lifting to level 3 (shadow-md); the flat / outlined card drops it.

export type Elevation = "raised" | "flat" | "default";
export type Density = "compact" | "comfortable" | "default";

export interface CardSkin {
  /** Corner radius of the card surface. */
  radius: number;
  /** Elevation -> shadow mapping (resting/raised/flat differ per OS). */
  elevation: (e: Elevation) => ViewStyle;
  /** The card's own content padding + flat-child gap, per density. */
  density: Record<Density, ViewStyle>;
  /** The standard inset applied by `padded` when no density is set. */
  padded: ViewStyle;
}

// --- web (the current, established look; preserved verbatim) -----------------

const WEB_DENSITY: Record<Density, ViewStyle> = {
  compact: { padding: 16, gap: 12 },
  comfortable: { padding: 32, gap: 24 },
  default: {},
};

export const webSkin: CardSkin = {
  radius: 8,
  elevation: (e) => (e === "raised" ? shadow("md") : e === "flat" ? shadow("none") : shadow("sm")),
  density: WEB_DENSITY,
  padded: { padding: 24 },
};

// --- iOS (HIG conventions: continuous-style radius, flat resting surface) ----

export const iosSkin: CardSkin = {
  radius: 12,
  // Native iOS grouped surfaces are flat: the resting card carries no shadow;
  // raised still lifts, flat stays flat.
  elevation: (e) => (e === "raised" ? shadow("sm") : shadow("none")),
  density: WEB_DENSITY,
  padded: { padding: 24 },
};

// --- Android (Material 3 cards: 12dp medium shape, tighter M3 density) --------

const M3_DENSITY: Record<Density, ViewStyle> = {
  compact: { padding: 12, gap: 8 },
  comfortable: { padding: 24, gap: 20 },
  default: {},
};

export const androidSkin: CardSkin = {
  // M3 medium shape token (cards).
  radius: 12,
  // M3 resting elevation = level 1 (our shadow-sm); raised = level 3 (shadow-md);
  // flat / outlined drops it.
  elevation: (e) => (e === "raised" ? shadow("md") : e === "flat" ? shadow("none") : shadow("sm")),
  density: M3_DENSITY,
  // M3 cards use 16dp content padding.
  padded: { padding: 16 },
};

// --- shared, color-bearing / layout styles (Light treatment: one set) --------
// These belong to the static composition subcomponents and to the surface fill,
// so they are platform-neutral (one value across all three skins).

export const cardBase: ViewStyle = { borderWidth: 1 };

export const cardSurface = (tokens: ColorTokens): ViewStyle => ({ borderColor: tokens.border, backgroundColor: tokens.card });

export const header: ViewStyle = { gap: 6, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 20 };

export const title = (tokens: ColorTokens): TextStyle => ({ fontSize: 20, lineHeight: 28, fontWeight: "600", letterSpacing: -0.4, color: tokens["card-foreground"] });

export const description = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] });

export const content: ViewStyle = { paddingHorizontal: 20, paddingVertical: 20 };

export const footer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 20,
  paddingBottom: 20,
  paddingTop: 16,
};

export const separator = (tokens: ColorTokens): ViewStyle => ({ height: 1, width: "100%", backgroundColor: tokens.border });

export const bodyText = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] });

export const footerText = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] });
