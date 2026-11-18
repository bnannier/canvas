// Browser treatment for the separately floating mobile navigation controls.
// Calibrated against native iOS 27 regular-glass controls, 2026-11-17; these are
// Canvas values, not Apple API constants. See ios-navigation-glass-2026 in the
// material evidence log. Native hosts keep the system's optical implementation.
// This reproduces the restrained wash and directional rim, not native lensing
// or the system's automatic classification of the content behind a control.
export const WEB_NAVIGATION_GLASS = {
  blur: 20,
  saturation: 1.4,
  light: {
    tint: "rgba(255,255,255,0.22)",
    rim: "inset 0 0.66px 0 rgba(255,255,255,1), inset 0 -0.66px 0 rgba(255,255,255,1), inset 0 0 0 0.33px rgba(0,0,0,0.40)",
    shadow: "0 3px 10px rgba(0,0,0,0.02)",
  },
  dark: {
    tint: "rgba(255,255,255,0.12)",
    rim: "inset 0 0.66px 0.33px rgba(255,255,255,0.24), inset 0 -0.66px 0.33px rgba(255,255,255,0.24), inset 0 0 0 0.33px rgba(255,255,255,0.035), inset 0 4px 8px rgba(255,255,255,0.015)",
    shadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
} as const;
