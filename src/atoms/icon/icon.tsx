import { createIcon } from "./icon.shared.js";
import { webSkin } from "./icon.styles.js";

// Web Icon (the base; Metro falls back to it on native, web bundlers resolve it).
// Icon is a "Shared" treatment, so the iOS and Android skins are identical to this one.
export const Icon = createIcon(webSkin);
export type { IconProps, IconName } from "./icon.shared.js";
