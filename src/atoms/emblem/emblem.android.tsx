import { createEmblem } from "./emblem.shared.js";
import { androidSkin } from "./emblem.styles.js";

// Material 3 Emblem. Metro resolves this file on Android (more-rounded container).
export const Emblem = createEmblem(androidSkin);
export type { EmblemProps } from "./emblem.shared.js";
