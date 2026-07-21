// Web Icon (the base; Metro falls back to it on native, web bundlers resolve it).
// Icon is a "Shared" treatment: an outline glyph is platform-neutral, so there is
// no per-OS skin and every entry point re-exports the one shared component.
export { Icon } from "./icon.shared.js";
export type { IconProps, IconName } from "./icon.shared.js";
