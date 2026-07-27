import { createBackdrop } from "./backdrop.shared.js";
import { webSkin } from "./backdrop.styles.js";

// Web Backdrop (the base; Metro falls back to it on native, web bundlers resolve it).
export const Backdrop = createBackdrop(webSkin);
export type { BackdropProps } from "./backdrop.shared.js";
export { BackdropHost, type BackdropHostProps } from "./backdrop-host.js";
export type { Particle, ParticleSprite, GradientBlob, ParticlesProps, GradientProps, ShaderProps, CustomProps } from "./backdrop-layers.js";
// Exposed so a scene can drive its own bespoke art from the same timeline the
// engine runs on, which is what keeps a custom layer in phase with the rest.
export { backdropClock, type BackdropClock, type Energy } from "./backdrop-clock.js";
