import { type TextStyle } from "react-native";
import { controlRipple, platformMinTarget, type ColorTokens } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type AvatarSkin, type Size } from "./avatar.shared.js";
import { type AvatarMenuSkin } from "./avatar-menu.shared.js";
import { webHover } from "../../style/hover.js";

// The Avatar skin. No platform ships an avatar control, so every platform takes the
// Canvas v4 hand-off's avatar (`K.def('avatar')` in tools/v4/handoff/cv-kit-controls.js)
// and the native skins are the web skin: initials at weight 600 and 38% of the disc (on
// the 10px source floor at `tiny`, where the hand-off draws 8), one line tall, over the
// identity hue's soft wash (avatar.shared.tsx), and a `rounded` square at 28% of the disc.
// The press feedback stays each platform's own: the ripple is Android's (a no-op
// elsewhere), the dim the rest's (the shell skips it on Android), and the touch target each
// platform's minimum (44pt HIG, 48dp Material, a 44px floor for touch on the web).

// Initials per size, one line tall: round(diameter x 0.38) on the 20/28/40/56 discs.
const LABEL: Record<Size, TextStyle> = {
  tiny: { fontWeight: "600", fontSize: 10, lineHeight: 10 },
  small: { fontWeight: "600", fontSize: 11, lineHeight: 11 },
  default: { fontWeight: "600", fontSize: 15, lineHeight: 15 },
  large: { fontWeight: "600", fontSize: 21, lineHeight: 21 },
};

// The "+N" chip's count, the AvatarGroup renderer's 600 13px on the 40px disc
// (`cv-kit-code.js`), scaled to the other discs on the 10px source floor.
const OVERFLOW: Record<Size, TextStyle> = {
  tiny: { fontWeight: "600", fontSize: 10, lineHeight: 10 },
  small: { fontWeight: "600", fontSize: 10, lineHeight: 10 },
  default: { fontWeight: "600", fontSize: 13, lineHeight: 13 },
  large: { fontWeight: "600", fontSize: 18, lineHeight: 18 },
};

export const webSkin: AvatarSkin = {
  // The `rounded` square, the hand-off's round(diameter x 0.28) per disc: 6 / 8 / 11 / 16.
  roundedRadius: {
    tiny: platformShape.web.avatarSquareTiny,
    small: platformShape.web.avatarSquareSmall,
    default: platformShape.web.avatarSquare,
    large: platformShape.web.avatarSquareLarge,
  },
  labelType: LABEL,
  overflowType: OVERFLOW,
  // The hand-off's presence dot: 12px on the 40px disc (30% of it), the `success` fill in
  // a 2px ring of the card it sits on.
  presence: (tokens: ColorTokens, diameter: number) => {
    const dot = Math.round(diameter * 0.3);
    return { width: dot, height: dot, backgroundColor: tokens.success, boxShadow: `0px 0px 0px 2px ${tokens.card}` };
  },
  ripple: (tokens: ColorTokens) => controlRipple(tokens),
  pressedOpacity: 0.9,
  minTarget: platformMinTarget() ?? 44,
};

// No platform avatar control: the native skins are the web skin.
export const iosSkin: AvatarSkin = webSkin;
export const androidSkin: AvatarSkin = webSkin;

// ---------------------------------------------------------------------------
// AvatarMenu: the identity-pill entries added to the Avatar skin.
// ---------------------------------------------------------------------------
// The capsule that opens the account menu is the hand-off's AvatarMenu trigger on every
// platform, since no platform ships an identity pill (`SUB('AvatarMenu')` in
// tools/v4/handoff/cv-kit-code.js): a 1px `border` edge round the `popover` fill, inset
// 4 10 4 4 round the disc, the name over the email, and a static 14px chevron. It takes
// the opaque `accent` under the pointer and while the menu is open. The disc keeps the
// renderer's unringed 32px disc (28px compact). The menu the pill opens stays
// each platform's own Dropdown (the entry files inject it). The hand-off carries these
// numbers as the `--p-idpill-*` custom properties in styles/tokens/platforms.css; native
// reads them from here, never from the CSS.

export const webMenuSkin: AvatarMenuSkin = {
  ...webSkin,
  // The renderer's 4 10 4 4 inset round the disc, inside the 1px edge.
  menuPill: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 4, paddingBottom: 4, paddingStart: 4, paddingEnd: 10 },
  menuPillFill: (t, active) => ({ backgroundColor: active ? t.accent : t.popover }),
  menuPillEdge: (t) => ({ borderWidth: 1, borderColor: t.border }),
  menuPillCompact: { paddingTop: 2, paddingBottom: 2, paddingStart: 2, paddingEnd: 2 },
  // The generic renderer has no disc glow; the account variant owns its own ring.
  menuDiscGlow: () => ({}),
  menuHover: webHover(true) === true,
  menuPillName: { fontSize: 13, lineHeight: 15.6, fontWeight: "500" },
  menuPillSecondary: { fontSize: 11, lineHeight: 13.2, fontWeight: "400" },
  menuChevronSize: 14,
  // The pill's ink dims under glass by the platform's own disabled dim, the one its
  // Dropdown gives the whole trigger in solid mode.
  menuDisabledOpacity: 0.45,
};

// No platform identity pill: the native skins are the web skin.
export const iosMenuSkin: AvatarMenuSkin = webMenuSkin;
export const androidMenuSkin: AvatarMenuSkin = webMenuSkin;
