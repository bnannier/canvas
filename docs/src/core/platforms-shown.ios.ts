// The iOS app's half of ./platforms-shown.ts: it shows the iOS look alone and names no other
// mobile platform (App Store guideline 2.3.10, the owner's decision of 2026-10-28).

import type { DocsPlatform, PlatformLabel } from "./platforms-shown";

export type { DocsPlatform, PlatformLabel } from "./platforms-shown";

export const HOST: DocsPlatform = "ios";

export const PLATFORMS_SHOWN: readonly DocsPlatform[] = ["ios"];

export const PLATFORM_LABELS: Readonly<Partial<Record<DocsPlatform, PlatformLabel>>> = {
  ios: {
    label: "iOS",
    metrics: "capsule controls · field 8 · card 12 · SF Pro · 44 pt",
    skin: { title: "iOS", meta: "capsule · 44pt · flat", foot: "radius 999 / 10 / 12 · switch 51×31 · press dims to .7" },
    device: "iPhone",
    template: { icon: "smartphone", skin: "iOS · capsule · field 10 · card 14 · flat · 44pt touch" },
  },
};

export function shows(platform: DocsPlatform): boolean {
  return PLATFORMS_SHOWN.includes(platform);
}

export function pick<T>(values: { web: T; ios: T; android: T }): T {
  return values[HOST];
}
