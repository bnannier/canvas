import { createKbd } from "./kbd.shared.js";
import { androidSkin } from "./kbd.styles.js";

// Material 3 Kbd. Metro resolves this file on Android. Kbd is a "Shared" treatment:
// Material 3 has no keyboard-key cap component, so the Android skin renders the
// identical web look.
export const Kbd = createKbd(androidSkin);
export type { KbdProps } from "./kbd.shared.js";
