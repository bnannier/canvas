// Which platforms the docs show, and how each is named: the one seam every platform row,
// skin switcher and platform caption in the docs reads (test/design-rules-shells.test.ts,
// "docs platform content"). Metro resolves this file per build: the web shows all three
// platforms side by side, while the iOS app (./platforms-shown.ios.ts) and the Android app
// (./platforms-shown.android.ts) show only their own. The owner's decision of 2026-10-28:
// the native docs ship to the app stores, and App Store guideline 2.3.10 rejects an app that
// shows another mobile platform's name or imagery, so another platform's label never reaches
// a native bundle.

export type DocsPlatform = "web" | "ios" | "android";

export interface PlatformLabel {
  /** The platform's name, as a row caption or a switch item prints it. */
  label: string;
  /** The metrics its skin draws (the hand-off's `PFL`). */
  metrics: string;
  /** The Skins page's column: its title, its metrics line and its foot caption (the hand-off's copy). */
  skin: { title: string; meta: string; foot: string };
  /** The device a template is framed in, as its accessible name. */
  device: string;
  /** The Templates page's switch icon and the skin's metrics line (the hand-off's SKINS labels). */
  template: { icon: "monitor" | "smartphone" | "tablet"; skin: string };
}

/** The build the docs run in. */
export const HOST: DocsPlatform = "web";

/** The platforms this build shows, in the hand-off's order. */
export const PLATFORMS_SHOWN: readonly DocsPlatform[] = ["web", "ios", "android"];

/** Each shown platform's caption. */
export const PLATFORM_LABELS: Readonly<Partial<Record<DocsPlatform, PlatformLabel>>> = {
  web: {
    label: "Web",
    metrics: "control 10 · field 10 · card 16 · Instrument Sans",
    skin: { title: "Web", meta: "Canvas · 10 / 20 · lit glass", foot: "radius 10 / 10 / 16 · switch 44×26 · press springs · sm shadow" },
    device: "Browser window",
    template: { icon: "monitor", skin: "web · control 10 · field 10 · card 16 · lit shadow" },
  },
  ios: {
    label: "iOS",
    metrics: "capsule controls · field 8 · card 12 · SF Pro · 44 pt",
    skin: { title: "iOS", meta: "capsule · 44pt · flat", foot: "radius 999 / 10 / 12 · switch 51×31 · press dims to .7" },
    device: "iPhone",
    template: { icon: "smartphone", skin: "iOS · capsule · field 10 · card 14 · flat · 44pt touch" },
  },
  android: {
    label: "Android",
    metrics: "Material 3 stadium · field 4 · card 12 · Roboto · 48 dp",
    skin: { title: "Android", meta: "Material 3 · 48dp · tonal", foot: "radius 999 / 4 / 12 · switch 52×32 · press ripples · 1dp shadow" },
    device: "Android phone",
    template: { icon: "tablet", skin: "Material 3 · stadium · field 4 · card 12 · 1dp · 48dp touch" },
  },
};

/** Whether this build shows `platform`. */
export function shows(platform: DocsPlatform): boolean {
  return PLATFORMS_SHOWN.includes(platform);
}

/** The value for the build the docs run in. */
export function pick<T>(values: { web: T; ios: T; android: T }): T {
  return values[HOST];
}
