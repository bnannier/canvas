// Android: the modal scrim takes no blur (the owner's GS-6 decision is the web's, which Dark
// Factory's `df-frost` card records), so the scrim keeps its plain dim on its own node. Neither
// export reads a hook or adds a node, so the native tree is the one without them. The web's
// is scrim-frost.tsx.
import type { ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** The scrim's blur style: none on Android. */
export function useScrimFrost(): ViewStyle | null {
  return null;
}

/** A scrim that holds its card: its own dim on its role node, and no blur layer on Android. */
export function useHeldScrim(backdrop: StyleProp<ViewStyle>): { style: StyleProp<ViewStyle>; layer: ReactElement | null } {
  return { style: backdrop, layer: null };
}
