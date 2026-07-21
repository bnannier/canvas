// Image is skin-less (fitting is platform-neutral), so the one shell re-exports unchanged
// on every platform; Metro falls back to it on native and web bundlers resolve it.
export { Image } from "./image.shared.js";
export type { ImageProps } from "./image.shared.js";
