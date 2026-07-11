import { type ViewStyle } from "react-native";
import { type ChipSkin } from "./chip.shared.js";

// Co-located Chip skins. Chip is a "Light" treatment: the fully-rounded pill and
// semantic colors (in the shell) are platform-neutral; only the label type shifts
// per OS (matching Badge: iOS tightens tracking, Material uses label-small).
//
// A chip is a compact tag, so it has ONE small size — there is no size axis. The
// pill lands at ~20px tall (GitHub/Linear/Ant tag-chip scale), not a button.

const base: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  gap: 4,
  borderWidth: 1,
  borderRadius: 9999,
  paddingHorizontal: 8,
  paddingVertical: 1,
};

export const webSkin: ChipSkin = {
  base,
  labelType: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  removeSize: 12,
};

export const iosSkin: ChipSkin = {
  base,
  labelType: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: -0.08 },
  removeSize: 12,
};

// Material 3 chips use an 8dp corner radius (NOT a full pill). Give Android its own
// base so iOS + web keep the shared pill; a hair more vertical padding keeps the
// compact chip from looking cramped against the boxier corner.
const androidBase: ViewStyle = {
  ...base,
  borderRadius: 8, // M3 8dp corner (not a pill)
  paddingVertical: 2,
};

export const androidSkin: ChipSkin = {
  base: androidBase,
  labelType: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.25 },
  removeSize: 12,
};
