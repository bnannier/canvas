import { Platform } from "react-native";

/** The props an image can be named by. */
export interface ImageNameProps {
  "aria-label"?: string;
  accessibilityLabel?: string;
  alt?: string;
}

/** The name an image is announced by, in React Native's own order: aria-label, then
 * accessibilityLabel, then alt. An empty string names nothing, exactly like an empty
 * alt. Image and CardMedia both resolve through it, so the kit has one naming contract
 * for a picture. */
export function imageLabel(p: ImageNameProps): string | undefined {
  return p["aria-label"] || p.accessibilityLabel || p.alt || undefined;
}

/** The role a named image takes, chosen by the runtime rather than the skin (the
 * calendar day's rule). react-native-web already exposes a named image once, through
 * the hidden <img alt> it renders inside its root, so a role on that root would put a
 * second image with the same name in the browser's tree. Native has only the one view,
 * and the role gives it the image trait VoiceOver and TalkBack announce. */
export function namedImageRole(): "img" | undefined {
  return Platform.select<"img" | undefined>({ native: "img", default: undefined });
}
