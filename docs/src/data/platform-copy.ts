// The docs copy that names platforms, per build. The web keeps the hand-off's words, which
// set the three platforms side by side; Metro resolves ./platform-copy.ios.ts in the iOS
// app and ./platform-copy.android.ts in the Android app, which name only their own platform
// (App Store guideline 2.3.10, the owner's decision of 2026-10-28; the seam is
// ../core/platforms-shown). Copy that names no platform stays where it is used.

export interface PlatformCopy {
  /** The Library hero's paragraph. */
  heroBody: string;
  /** The hero stats row's platform entry. */
  heroSkins: string;
  /** The Index's lead line. */
  indexLead: string;
  /** The Index paragraph after the mono package name. */
  indexAfter: string;
  /** The templates call's body. */
  templatesBody: string;
  /** The Skins page's lead. */
  skinsLead: string;
  /** The Skins vignette's caption. */
  skinsCaption: string;
  /** The footer's direction paragraph. */
  footer: string;
  /** The Data section's stat card foot. */
  statFoot: string;
  /** The Data section's article row description. */
  articleSkins: { title: string; description: string };
  /**
   * The second platform the section pages' sample data names beside iOS and the web (a
   * chart series, a chip, a task): Android on the web, a platform the iOS app may name there.
   */
  samplePlatform: string;
  /** The Data section's carousel caption. */
  carouselCaption: string;
  /** The Data section's first carousel slide eyebrow. */
  slideEyebrow: string;
  /** The privacy policy's store declarations. */
  privacyStores: string;
  /** The detail page's touch-target note. */
  touchNote: string;
}

export const PLATFORM_COPY: PlatformCopy = {
  heroBody:
    "One component API, three native looks. Every surface is now lit glass: a single charged accent, functional motion, and type that carries the hierarchy on its own.",
  heroSkins: "3 platform skins",
  indexLead: "One API. Three native looks. All of it ships today.",
  indexAfter: ", native on iOS and Android and at home on the web, in five accents, light and dark, glass and solid.",
  templatesBody: "Full screens built from these components, each in web, iOS and Android skins.",
  skinsLead: "One tree. iOS capsule, Material stadium, Canvas web.",
  skinsCaption: "One tree · three native shapes",
  footer:
    "One component API for iOS, Android and the web: each platform renders its own control where it ships one, and the Canvas look everywhere else, in the same ion accent and neutral ramps.",
  statFoot: "MIT licensed. Web, iOS and Android from one tree.",
  articleSkins: { title: "Designing for three skins", description: "One tree becomes an iOS capsule, a Material stadium and a lit web control." },
  samplePlatform: "Android",
  carouselCaption: "<Carousel> one slide per page · slides take the card radius, 28 on Android",
  slideEyebrow: "01 · Material",
  privacyStores: "the App Store and Google Play",
  touchNote: "Below the platform minimum, the touch area grows to 44 pt on iOS and 48 dp on Android without moving the layout.",
};
