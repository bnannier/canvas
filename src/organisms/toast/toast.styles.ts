import { primaryText } from "../../style/primary-text.js";
import { inverseFill, inverseInk, inversePrimary } from "../../style/inverse.js";
import { type ViewStyle } from "react-native";
import { type ColorTokens, alpha, platformMinTarget, shadow, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type ToastSkin } from "./toast.shared.js";

// Co-located Toast skins, as the Canvas v4 hand-off draws them (`K.def('toast')` in
// tools/v4/handoff/cv-kit-overlays.js and its `K.PF` row in cv-kit-platform.js). Under
// glass the shell renders the capsule through GlassSurface as a DENSE-layer surface; the
// Android snackbar, painted on the inverse surface, takes the inverse dense tint, so its
// light ink keeps its contrast.
//
//   Web and iOS: the hand-off's toast card. The overlay panel (the `popover` fill under a
//     1 px `field-border` edge and the large shade) at the web card role, padded 12 by 14,
//     up to 380 px wide; the 18 px intent glyph (a sparkle in the accent on the neutral
//     toast) 12 px before a 500 14 message over a 400 13 / 19.5 muted description, and
//     the action in 600 13 accent ink. A `brief` toast hugs its one line, centred. iOS
//     has no toast control, so it takes this skin; its action and dismiss reach the 44pt
//     HIG target through hitSlop.
//   Android (Material 3 snackbar): a bar at the snackbar corner (M3 extra-small) in the
//     inverse fill with its own ink, 14sp body, NO leading intent glyph (the M3 snackbar
//     anatomy has none), the action in `inverse-primary`, the close x in the bar's ink at
//     the 24dp spec size, trailing padding 8dp beside a trailing control, 48dp touch
//     targets via hitSlop, press = ripple in the bar's ink.

const ICON_SIZE = 18;
// M3 snackbar close icon: 24dp (inside a 48dp trailing target).
const DISMISS_SIZE_ANDROID = 24;
const MAX_WIDTH = 400;

// hitSlop insets that lift the Android snackbar's ~32dp action button and 24dp dismiss
// box to the M3 48dp minimum (32 + 2*8, 24 + 2*12).
const ANDROID_ACTION_HIT_SLOP = 8;
const ANDROID_DISMISS_HIT_SLOP = 12;

// The capsule shape shared structure; each platform overrides radius/density.
function capsule(t: ColorTokens, radius: number): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius,
    minHeight: 48,
    maxWidth: MAX_WIDTH,
    backgroundColor: t.popover,
    boxShadow: SNACKBAR_SHADOW,
  };
}

// The hand-off's snackbar shade: a deep drop under the bar.
const SNACKBAR_SHADOW = "0px 12px 32px -10px rgba(0, 0, 0, 0.55)";

// The snackbar's text action and close icon are Material 3 buttons, stadium-shaped.
const m3ActionButton = (): ViewStyle => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: shape.android.control,
  // clip the Material ripple to the rounded outline (Android clipToOutline)
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
});

const m3DismissButton = (): ViewStyle => ({
  width: 24,
  height: 24,
  borderRadius: shape.android.control,
  // clip the Material ripple to the rounded outline (Android clipToOutline)
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
});

// ---------- The hand-off's toast card (web, and iOS, which has no toast control) ----------
const CARD_ACTION_HEIGHT = 21; // 2 + 17 + 2
const CARD_DISMISS = 24;
// The platform's minimum touch target on iOS (44pt HIG); none on the web, which is
// pointer-first. Half the shortfall on every edge keeps each control centred in its area.
const MIN_TARGET = platformMinTarget();
const slopTo = (height: number) => (MIN_TARGET == null ? null : Math.ceil((MIN_TARGET - height) / 2));
// The hand-off's toast width.
const CARD_WIDTH = 380;

// The overlay panel: the `popover` fill under a 1 px field-border edge and the large shade.
const panel = (t: ColorTokens): ViewStyle => ({
  backgroundColor: t.popover,
  borderWidth: 1,
  borderColor: t["field-border"],
  ...shadow("lg", t),
});

const cardSkin = (radius: number): ToastSkin => ({
  container: (t) => ({
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius,
    width: "100%",
    maxWidth: CARD_WIDTH,
    ...panel(t),
  }),
  briefContainer: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius,
    maxWidth: "100%",
    ...panel(t),
  }),
  briefMessage: (t) => ({ fontSize: 14, lineHeight: 18, fontWeight: "500", color: t.foreground }),
  intentIcon: true,
  neutralIcon: true,
  iconSize: 18,
  iconSlot: { paddingTop: 1 },
  intentColor: (t, intent) =>
    intent === "info" ? primaryText(t) : intent === "success" ? t.success : intent === "warning" ? t.warning : t.destructive,
  message: (t) => ({ fontSize: 14, lineHeight: 18, fontWeight: "500", color: t.foreground }),
  description: (t) => ({ fontSize: 13, lineHeight: 19.5, fontWeight: "400", color: t["muted-foreground"] }),
  textGap: 0,
  actionButton: () => ({ paddingHorizontal: 4, paddingVertical: 2, borderRadius: shape.web.control, alignItems: "center", justifyContent: "center" }),
  actionLabel: (t) => ({ fontSize: 13, lineHeight: 17, fontWeight: "600", color: primaryText(t) }),
  actionHitSlop: slopTo(CARD_ACTION_HEIGHT),
  dismissButton: () => ({ width: CARD_DISMISS, height: CARD_DISMISS, borderRadius: shape.web.control, marginTop: -3, alignItems: "center", justifyContent: "center" }),
  dismissIconSize: 16,
  dismissColor: (t) => t["subtle-foreground"] ?? t["muted-foreground"],
  dismissHitSlop: slopTo(CARD_DISMISS),
  pressedOpacity: 0.7,
  ripple: null,
});

/** The web toast: the card at the web card role. */
export const webSkin: ToastSkin = cardSkin(shape.web.card);

// iOS has no toast control (PLATFORM-REFERENCES.md): the web skin.
export const iosSkin: ToastSkin = webSkin;

// ---------- Android (Material 3 snackbar): a small-radius bar ----------
// M3 snackbars use the INVERSE surface, and in Dark Factory's colors that is its toast
// pill: `inverse` as the bar with `inverse-foreground` text, the same dark pill in the
// light and the dark scheme, as Dark Factory paints its toasts. The 4dp corner is M3's
// extra-small snackbar radius. Color roles on the bar follow M3 (the inverse primary
// action, the supporting text and close icon in the bar's ink); the ripple ink is the
// bar's ink too, since the foreground-ink ripple helpers would paint bar-on-bar here,
// invisible. Leading padding stays 16dp; the trailing edge drops to 8dp when a trailing
// action/dismiss is present (M3 measurements).
export const androidSkin: ToastSkin = {
  container: (t, hasTrailing) => ({
    ...capsule(t, platformShape.android.snackbar),
    gap: 8,
    backgroundColor: inverseFill(t),
    paddingStart: 16,
    paddingEnd: hasTrailing ? 8 : 16,
  }),
  // The M3 snackbar anatomy has NO leading icon slot: suppress the auto intent
  // glyph (an explicit `icon` prop still renders; intent survives via wording).
  intentIcon: false,
  iconSize: ICON_SIZE + 2,
  intentColor: null,
  message: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: inverseInk(t) }),
  description: (t) => ({ fontSize: 13, lineHeight: 18, color: alpha(inverseInk(t), 0.7) }),
  actionButton: m3ActionButton,
  actionLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: inversePrimary(t) }),
  actionHitSlop: ANDROID_ACTION_HIT_SLOP,
  dismissButton: m3DismissButton,
  dismissIconSize: DISMISS_SIZE_ANDROID,
  dismissColor: (t) => inverseInk(t),
  dismissHitSlop: ANDROID_DISMISS_HIT_SLOP,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(inverseInk(t), 0.12), borderless: false }),
};
