// The Android app's half of ./platforms-shown.ts: it shows the Android look alone, the
// mirror of the iOS app's rule (the owner's decision of 2026-10-28).

import type { DocsPlatform, PlatformLabel } from "./platforms-shown";

export type { DocsPlatform, PlatformLabel } from "./platforms-shown";

export const HOST: DocsPlatform = "android";

export const PLATFORMS_SHOWN: readonly DocsPlatform[] = ["android"];

export const PLATFORM_LABELS: Readonly<Partial<Record<DocsPlatform, PlatformLabel>>> = {
  android: {
    label: "Android",
    metrics: "Material 3 stadium · field 4 · card 12 · Roboto · 48 dp",
    skin: { title: "Android", meta: "Material 3 · 48dp · tonal", foot: "radius 999 / 4 / 12 · switch 52×32 · press ripples · 1dp shadow" },
    device: "Android phone",
    template: { icon: "tablet", skin: "Material 3 · stadium · field 4 · card 12 · 1dp · 48dp touch" },
  },
};

export function shows(platform: DocsPlatform): boolean {
  return PLATFORMS_SHOWN.includes(platform);
}

export function pick<T>(values: { web: T; ios: T; android: T }): T {
  return values[HOST];
}
