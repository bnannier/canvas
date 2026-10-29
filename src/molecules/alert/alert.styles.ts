import { type ViewStyle } from "react-native";
import { platformMinTarget } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type AlertSkin } from "./alert.shared.js";

// Per-OS Alert skins. Neither iOS nor Material 3 ships an inline alert banner, so the
// Alert is the Canvas v4 hand-off's callout (`K.def('alert')` in
// tools/v4/handoff/cv-kit-overlays.js) on every platform and the native skins are the web
// skin: the callout corner, 14 by 16 padding, a 12 px gap after the 18 px tone glyph (one
// pixel down, on the title's first line), a 600 14 title over a 400 13 / 19.5 body with
// 4 px between them, the actions 6 px further down, and a 16 px dismiss glyph that dims
// on press (Android's ripple carries its press instead, see pressDim) and pads its touch
// area out to each platform's minimum (HIG 44pt, Material 3 48dp) through hitSlop, with
// none on the web.

const DISMISS_BOX = 24;
const MIN_TARGET = platformMinTarget();

// The banner's corner: the web row's callout.
const ALERT_RADIUS = platformShape.web.callout;

const CONTAINER: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
  borderWidth: 1,
  borderRadius: ALERT_RADIUS,
  paddingHorizontal: 16,
  paddingVertical: 14,
};

// The dismiss box sits on the title line: the 16 px glyph centred in a 24 px box pulled
// back by the 4 px it overhangs on each side, so the glyph lands where the hand-off's
// bare 16 px glyph does; its press and hover wash round at the dismiss corner (6).
const DISMISS: ViewStyle = {
  marginEnd: -4,
  marginTop: -3,
  height: DISMISS_BOX,
  width: DISMISS_BOX,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: platformShape.web.dismiss,
};

// The actions row: 6 px below the description, on top of the column's 4 px gap.
const ACTIONS: ViewStyle = { flexDirection: "row", gap: 8, marginTop: 6 };

// The glyph box: the 18 px icon one pixel down from the title's top (its padding-top).
const ICON_SLOT: ViewStyle = { paddingTop: 1 };

// The announcement bar (the v4 hand-off's Overlays page, `#c-alert-variants`): one row
// centred, 12 apart, padded 10 10 10 14 at the announcement corner, the accent's glow
// (`0 10px 26px -12px`), a 16 px glyph, the message in 500 13 / 1.35 and the inline action
// in 600 13, and a 24 px dismiss box at the dismiss corner holding a 14 px x.
const ANNOUNCEMENT: AlertSkin["announcement"] = {
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 14,
    paddingEnd: 10,
    borderRadius: platformShape.web.announcement,
    overflow: "hidden",
  },
  glow: (glow) => ({ boxShadow: `0px 10px 26px -12px ${glow}` }),
  iconSize: 16,
  message: { fontSize: 13, lineHeight: 17.55, fontWeight: "500" },
  action: { fontSize: 13, lineHeight: 17, fontWeight: "600" },
  dismissButton: { height: DISMISS_BOX, width: DISMISS_BOX, alignItems: "center", justifyContent: "center", borderRadius: platformShape.web.dismiss },
  dismissIconSize: 14,
};

export const webSkin: AlertSkin = {
  container: CONTAINER,
  iconSize: 18,
  iconSlot: ICON_SLOT,
  iconType: { fontSize: 18, lineHeight: 18 },
  // 600 14 at the face's normal leading (18 px).
  titleType: { fontSize: 14, lineHeight: 18, fontWeight: "600" },
  bodyType: { fontSize: 13, lineHeight: 19.5, fontWeight: "400" },
  contentGap: 4,
  dismissButton: DISMISS,
  dismissIconSize: 16,
  dismissPressedOpacity: 0.7,
  dismissHitSlop: MIN_TARGET == null ? null : (MIN_TARGET - DISMISS_BOX) / 2,
  actions: ACTIONS,
  announcement: ANNOUNCEMENT,
};

// No native inline banner on either platform: the native skins are the web skin.
export const iosSkin: AlertSkin = webSkin;
export const androidSkin: AlertSkin = webSkin;
