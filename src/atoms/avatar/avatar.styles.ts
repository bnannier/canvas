import { type TextStyle } from "react-native";
import { controlRipple, platformDisabledDim, platformMinTarget, type ColorTokens } from "../../style/index.js";
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

export const webSkin: AvatarSkin = {
  // The `rounded` square, the hand-off's round(diameter x 0.28) per disc: 6 / 8 / 11 / 16.
  roundedRadius: {
    tiny: platformShape.web.avatarSquareTiny,
    small: platformShape.web.avatarSquareSmall,
    default: platformShape.web.avatarSquare,
    large: platformShape.web.avatarSquareLarge,
  },
  labelType: LABEL,
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
// The capsule that opens the account menu is Dark Factory's identity pill (its TopBar
// role switcher) on every platform, since no platform ships an identity pill: bare at
// rest, the `accent` fill (Dark Factory's hover on a card) under the pointer and while
// the menu is open, a 28px disc in the viewer's violet glow ring, the name at 12 / 700
// over the email in Dark Factory's muted micro type, and a static 14px chevron. Dark
// Factory's hover is its translucent `hover` wash; over the page that leaves the muted
// email at 4.25:1, so the pill takes the opaque `accent`, the same colour on a card. The
// menu the pill opens stays each platform's own Dropdown (the entry files inject it).
// The hand-off carries these numbers as the `--p-idpill-*` custom properties in
// styles/tokens/platforms.css; native reads them from here, never from the CSS.

export const webMenuSkin: AvatarMenuSkin = {
  ...webSkin,
  // A 28px disc with a 2px inset: 32 tall, and a little more room before the chevron.
  menuPill: { flexDirection: "row", alignItems: "center", gap: 10, height: 32, paddingStart: 2, paddingEnd: 8 },
  menuPillFill: (t, active) => ({ backgroundColor: active ? t.accent : "transparent" }),
  // The viewer's glow: a ring of the card around the disc, then 1.5px of the violet. Under
  // glass the card ring would sit as a solid band on the material, so the violet ring
  // hugs the disc on its own.
  menuDiscGlow: (t, glass) => ({
    borderRadius: 9999,
    boxShadow: glass ? `0px 0px 0px 1.5px ${t.primary}` : `0px 0px 0px 2px ${t.card}, 0px 0px 0px 3.5px ${t.primary}`,
  }),
  menuHover: webHover(true) === true,
  menuPillName: { fontSize: 12, lineHeight: 14, fontWeight: "700" },
  menuPillSecondary: { fontSize: 10.5, lineHeight: 13, fontWeight: "600" },
  menuChevronSize: 14,
  // The pill's ink dims under glass by the platform's own disabled dim, the one its
  // Dropdown gives the whole trigger in solid mode.
  menuDisabledOpacity: platformDisabledDim(),
};

// No platform identity pill: the native skins are the web skin.
export const iosMenuSkin: AvatarMenuSkin = webMenuSkin;
export const androidMenuSkin: AvatarMenuSkin = webMenuSkin;
