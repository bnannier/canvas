import { type TextStyle } from "react-native";
import { controlRipple, type ColorTokens } from "../../style/index.js";
import { type AvatarSkin, type Size } from "./avatar.shared.js";

// Per-OS Avatar skins. Avatar is a "Light" treatment: identical structure, box
// sizes, per-name fallback colour, circle radius, and ring outline (those live in
// avatar.shared.tsx); only the rounded-square corner radius, the initials type,
// and the press feedback shift per OS.
//
// Web keeps the current Canvas look (Catalyst-style): a 6px rounded square and a
// medium-weight (500) initials. iOS uses SF conventions: semibold (600) initials,
// SF Pro Text tracking per point size, and a softer 10px continuous-feel corner;
// press dims opacity to 0.8 (HIG). Android follows Material 3: a 12px rounded
// square (M3 medium shape token), a medium (500) label with M3's slight positive
// tracking, and a native ripple on press (no opacity dim). Each skin also carries
// its platform minimum touch target (HIG 44pt / M3 48dp) so the shell can pad a
// pressable trigger's hit area with hitSlop.

// Web initials type, ~40% of the diameter (the current Canvas look), weight 500.
const WEB_LABEL: Record<Size, TextStyle> = {
  small: { fontWeight: "500", fontSize: 12, lineHeight: 16 },
  default: { fontWeight: "500", fontSize: 16, lineHeight: 24 },
  large: { fontWeight: "500", fontSize: 18, lineHeight: 28 },
};

// iOS SF conventions: semibold initials, tracked per the SF Pro Text table for
// each point size (12pt = 0, 16pt = -0.31, 18pt = -0.43), so dense initials read
// crisply without over-tightening the small size.
const IOS_LABEL: Record<Size, TextStyle> = {
  small: { fontWeight: "600", fontSize: 12, lineHeight: 16 },
  default: { fontWeight: "600", fontSize: 16, lineHeight: 24, letterSpacing: -0.31 },
  large: { fontWeight: "600", fontSize: 18, lineHeight: 28, letterSpacing: -0.43 },
};

// Material 3: a medium (500) label with M3's slight positive tracking
// (label/title styles carry +0.1 tracking), the same proportional sizes.
const ANDROID_LABEL: Record<Size, TextStyle> = {
  small: { fontWeight: "500", fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  default: { fontWeight: "500", fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  large: { fontWeight: "500", fontSize: 18, lineHeight: 28, letterSpacing: 0.1 },
};

// Web: the current Canvas look. Rounded square at the card/menu radius (6); the
// pressable trigger dims opacity on press, no ripple.
export const webSkin: AvatarSkin = {
  roundedRadius: 6,
  labelType: WEB_LABEL,
  ripple: null,
  pressedOpacity: 0.9,
  // Inert for pointer input; keeps a touch-driven web tap area at the 44px floor.
  minTarget: 44,
};

// iOS (HIG): composed from an image view / person.crop.circle SF Symbol. A softer
// 10px continuous-feel rounded square, SF semibold initials, and a 0.8 opacity dim
// on press (the iOS pressed-state convention), no ripple.
export const iosSkin: AvatarSkin = {
  roundedRadius: 10,
  labelType: IOS_LABEL,
  ripple: null,
  pressedOpacity: 0.8,
  // HIG minimum tappable area: 44x44pt.
  minTarget: 44,
};

// Material 3: avatars live inside lists, chips, and app bars. A 12px rounded
// square (M3 medium shape token), an M3 label with positive tracking, and a native
// ripple on press (the M3 state layer carries the feedback, so no opacity dim).
export const androidSkin: AvatarSkin = {
  roundedRadius: 12,
  labelType: ANDROID_LABEL,
  ripple: (tokens: ColorTokens) => controlRipple(tokens),
  pressedOpacity: null,
  // Material 3 accessibility minimum touch target: 48x48dp.
  minTarget: 48,
};
