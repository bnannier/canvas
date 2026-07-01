import { type ViewStyle } from "react-native";
import { type ChipSkin } from "./chip.shared.js";

// Co-located Chip skins. Chip is a "Light" treatment: the fully-rounded pill and
// semantic colors (in the shell) are platform-neutral; only the label type shifts
// per OS (matching Badge: iOS tightens tracking, Material uses label-small).

const base: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  gap: 6,
  borderWidth: 1,
  borderRadius: 9999,
  paddingHorizontal: 12,
  paddingVertical: 5,
};

const small: ViewStyle = { gap: 4, paddingHorizontal: 10, paddingVertical: 3 };

export const webSkin: ChipSkin = {
  base,
  small,
  labelType: { fontSize: 13, lineHeight: 16, fontWeight: "500" },
  labelTypeSmall: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  removeSize: 14,
  removeSizeSmall: 12,
};

export const iosSkin: ChipSkin = {
  base,
  small,
  labelType: { fontSize: 13, lineHeight: 16, fontWeight: "600", letterSpacing: -0.08 },
  labelTypeSmall: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: -0.08 },
  removeSize: 14,
  removeSizeSmall: 12,
};

export const androidSkin: ChipSkin = {
  base,
  small,
  labelType: { fontSize: 13, lineHeight: 16, fontWeight: "500", letterSpacing: 0.25 },
  labelTypeSmall: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.25 },
  removeSize: 14,
  removeSizeSmall: 12,
};
