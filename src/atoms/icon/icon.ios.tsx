// iOS (HIG) Icon. Metro resolves this file on iOS; the docs import it for preview.
// Icon is a "Shared" treatment: an outline glyph is platform-neutral, so the iOS
// look equals the web one and this simply re-exports the shared component.
export { Icon } from "./icon.shared.js";
export type { IconProps, IconName } from "./icon.shared.js";
