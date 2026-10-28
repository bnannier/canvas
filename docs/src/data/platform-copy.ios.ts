// The iOS app's half of ./platform-copy.ts: it names iOS and the web, never another mobile
// platform (App Store guideline 2.3.10, the owner's decision of 2026-10-28).

import type { PlatformCopy } from "./platform-copy";

export type { PlatformCopy } from "./platform-copy";

export const PLATFORM_COPY: PlatformCopy = {
  heroBody:
    "One component API, native on iOS. Every surface is now lit glass: a single charged accent, functional motion, and type that carries the hierarchy on its own.",
  heroSkins: "native iOS skin",
  indexLead: "One API. Native on iPhone and iPad. All of it ships today.",
  indexAfter: ", native on iOS and at home on the web, in five accents, light and dark, glass and solid.",
  templatesBody: "Full screens built from these components, each in its native iOS skin.",
  skinsLead: "One tree, drawn as the iOS capsule.",
  skinsCaption: "One tree · the native iOS shape",
  footer:
    "One component API: each control is the platform's own where it ships one, and the Canvas look everywhere else, in the same ion accent and neutral ramps.",
  statFoot: "MIT licensed. Native iOS from one tree.",
  articleSkins: { title: "Designing for the native skin", description: "One tree becomes an iOS capsule and a lit web control." },
  samplePlatform: "iPadOS",
  carouselCaption: "<Carousel> one slide per page · slides take the card radius",
  slideEyebrow: "01 · Light",
  privacyStores: "the App Store",
  touchNote: "Below the platform minimum, the touch area grows to 44 pt without moving the layout.",
};
