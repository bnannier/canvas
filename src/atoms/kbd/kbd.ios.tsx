import { createKbd } from "./kbd.shared.js";
import { iosSkin } from "./kbd.styles.js";

// iOS (HIG) Kbd. Metro resolves this file on iOS. Kbd is a "Shared" treatment: iOS has
// no native keyboard-key cap element, so the iOS skin renders the identical web look.
export const Kbd = createKbd(iosSkin);
export type { KbdProps } from "./kbd.shared.js";
