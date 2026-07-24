/*
 * The privacy policy's text, as pure data with no renderer attached.
 *
 * Two consumers share this module, which is why it exists apart from the screen:
 * `app/(home)/privacy.tsx` renders it with Canvas components for the app, and
 * `tools/privacygen/generate.ts` bakes the same words into a STATIC page at
 * docs/public/privacy/index.html.
 *
 * The static page exists because of how the docs are hosted. The web export is a single
 * page app, and GitHub Pages answers any unknown path with its 404 fallback, so every
 * deep route (/browser-support, /theming, and the in-app /privacy) resolves with an HTTP
 * 404 status even though the browser renders it correctly. Google Play and Apple both
 * fetch the privacy policy URL you file with the listing, so a 404 is a real submission
 * risk. A file at public/privacy/index.html is copied verbatim into the export and served
 * by Pages with a genuine 200.
 *
 * Every claim below must stay verifiable from the source: no analytics SDK, no account
 * system, no persistence beyond a web-only theme preference, and exactly two outbound
 * hosts. These words are also the source of truth for the App Privacy and Data Safety
 * answers recorded in store/SUBMISSION.md.
 */

export const PRIVACY_ISSUES_URL = "https://github.com/bnannier/canvas/issues";

// Stated rather than computed, so the policy does not silently claim to have changed on
// every rebuild.
export const PRIVACY_EFFECTIVE = "24 July 2026";

export const PRIVACY_TITLE = "Privacy Policy";

export const PRIVACY_INTRO =
  "Canvas collects no personal information. This page explains exactly what the app does and does not do, and it matches the App Privacy and Data Safety declarations filed with the App Store and Google Play.";

export const PRIVACY_SUMMARY =
  `Canvas is a free, open-source reference app for the @nannier/canvas React Native UI kit. It collects no personal information, creates no user accounts, and contains no analytics, tracking, or advertising code. Effective ${PRIVACY_EFFECTIVE}.`;

export interface PrivacyItem {
  title: string;
  description: string;
}

export const PRIVACY_NOT_DONE: PrivacyItem[] = [
  {
    title: "No accounts and no sign-in",
    description:
      "The app has no login, no user profiles, and no way to submit personal information. Every screen is available immediately on launch.",
  },
  {
    title: "No analytics and no tracking",
    description:
      "The app bundles no analytics, attribution, advertising, or crash-reporting SDK. Your usage is not measured, profiled, or shared with anyone, and nothing follows you across other apps or websites.",
  },
  {
    title: "No advertising",
    description:
      "There are no ads and no ad networks, so there is no advertising identifier and nothing to opt out of.",
  },
  {
    title: "Nothing is sold or shared",
    description:
      "Because no personal information is collected, there is none to sell, rent, or share with third parties.",
  },
];

export const PRIVACY_NETWORK_COLUMNS = ["Host", "Why it is contacted", "What it receives"];

export const PRIVACY_NETWORK_ROWS: string[][] = [
  [
    "registry.npmjs.org",
    "Reads the latest published version of @nannier/canvas for the version pill in the header.",
    "Standard web request metadata (IP address, user agent). No app data is sent.",
  ],
  [
    "u.expo.dev",
    "Checks for over-the-air updates to the app, so fixes can ship without a store release.",
    "The app's update channel, runtime version, and platform, plus standard web request metadata.",
  ],
];

export const PRIVACY_NETWORK_INTRO =
  "The app contacts exactly two hosts, both for the app itself rather than for anything about you. Like any web request, each one necessarily reveals your device's IP address to that service; neither is used to identify you, and Canvas stores nothing from either response.";

export const PRIVACY_NETWORK_OUTRO =
  "These two services are operated by npm, Inc. and Expo, respectively, and their own privacy policies govern the request logs they keep. The app works offline apart from these checks, which fail silently when the network is unavailable.";

export const PRIVACY_SECTIONS: PrivacyItem[] = [
  {
    title: "Data stored on your device",
    description:
      "On the web, your light or dark theme choice is saved in your browser's local storage so the site opens the way you left it. That value never leaves your device and is not readable by anyone else. The iOS and Android apps store no preferences at all, and the app writes no other files, cookies, or identifiers.",
  },
  {
    title: "Children",
    description:
      "Canvas is a developer reference tool rather than a children's app, and it is not directed to children. Since it collects no personal information from anyone, it collects none from children either.",
  },
  {
    title: "Changes and contact",
    description:
      "If this policy changes, the effective date above changes with it, and the revision history is public in the same repository as the app's source code. Questions, corrections, and privacy requests are all welcome as GitHub issues.",
  },
];
