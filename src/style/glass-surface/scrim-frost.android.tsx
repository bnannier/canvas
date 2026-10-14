// Android: the modal scrim takes no blur (the owner's GS-6 decision is the web's, which Dark
// Factory's `df-frost` card records), so the scrim keeps its plain dim. Both exports render
// nothing and read no hook, so the native tree is the one without them. The web's is
// scrim-frost.tsx.
import type { StyleProp, ViewStyle } from "react-native";

/** The scrim's blur style: none on Android. */
export function useScrimFrost(): ViewStyle | null {
  return null;
}

/** The scrim's blur layer: nothing on Android. */
export function ScrimFrost(_props: { shape?: StyleProp<ViewStyle> }) {
  return null;
}
