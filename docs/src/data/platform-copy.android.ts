// The Android app's half of ./platform-copy.ts: it names Android and the web, never iOS,
// the mirror of the iOS app's rule (the owner's decision of 2026-10-28).

import type { PlatformCopy } from "./platform-copy";

export type { PlatformCopy } from "./platform-copy";

export const PLATFORM_COPY: PlatformCopy = {
  heroBody:
    "One component API, native on Android. Every surface is now lit glass: a single charged accent, spring motion, and type that carries the hierarchy on its own.",
  heroSkins: "native Material 3 skin",
  indexLead: "One API. Native on Android phones and tablets. All of it ships today.",
  indexAfter: ", native on Android and at home on the web, in five accents, light and dark, glass and solid.",
  templatesBody: "Full screens built from these components, each in its native Material 3 skin.",
  skinsLead: "One tree, drawn as the Material stadium.",
  skinsCaption: "One tree · the native Android shape",
  footer:
    "One component API: each control is the platform's own where it ships one, and the Canvas look everywhere else, in the same ion accent and neutral ramps.",
  statFoot: "MIT licensed. Native Android from one tree.",
  articleSkins: { title: "Designing for the native skin", description: "One tree becomes a Material stadium and a lit web control." },
  samplePlatform: "Android",
  carouselCaption: "<Carousel> one slide per page · slides take the card radius, 28 on Android",
  slideEyebrow: "01 · Material",
  privacyStores: "the App Store and Google Play",
  touchNote: "Below the platform minimum, the touch area grows to 48 dp without moving the layout.",
};
