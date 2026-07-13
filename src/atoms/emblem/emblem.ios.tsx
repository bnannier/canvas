import { createEmblem } from "./emblem.shared.js";
import { iosSkin } from "./emblem.styles.js";

// iOS (HIG) Emblem. Metro resolves this file on iOS.
export const Emblem = createEmblem(iosSkin);
export type { EmblemProps } from "./emblem.shared.js";
