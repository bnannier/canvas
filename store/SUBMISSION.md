# Store submission runbook

How the Canvas docs app ships to the App Store and Google Play. The app is the
universal Expo Router app in `docs/`, built by EAS from `docs/eas.json`.

Everything here is kept in sync with the app itself: the privacy answers below must
match `/privacy` (`docs/src/app/(home)/privacy.tsx`), which is the single source of
truth for both stores' data declarations.

## Current status

| Step | State |
| --- | --- |
| Bundle / package id `com.nannier.canvas` | Set in `docs/app.json`, free on the App Store |
| 1024 marketing icon without alpha | Done (`docs/assets/images/icon.png`) |
| Export compliance key | Done (`ios.infoPlist.ITSAppUsesNonExemptEncryption: false`) |
| Public privacy policy URL | Done, `https://bnannier.github.io/canvas/privacy` |
| Android production `.aab` | **Built and ready**, v1.0.0 versionCode 3, SDK 57, from commit `d5daa866` |
| Android upload keystore | Generated and held by EAS |
| Google Play Developer account | **BLOCKED, none exists** |
| Apple Developer Program membership | **BLOCKED, EAS reports no distribution certificate** |
| iOS production build | Blocked on the above |
| iPhone 6.9" screenshots | Done, 5 in `store/screenshots/ios` |
| iPad 13" screenshots | Done, 4 in `store/screenshots/ipad` |
| Android phone screenshots | Done, 5 in `store/screenshots/android` |

The two blocked rows are the only things standing between here and a submission, and
both need the account owner: they cost money, require identity verification, and can
only be completed interactively.

## App identity

- **On-device name**: `Canvas` (from `docs/app.json` `expo.name`; this is the home
  screen label and does not have to be unique).
- **Store listing name**: `Canvas UI Kit` is the recommendation. Plain `Canvas` has no
  exact match in App Store search, but it competes directly with Instructure's Canvas
  (education) and Canva, so it would be effectively undiscoverable. Only App Store
  Connect can confirm availability at the moment you reserve it.
- **Bundle id / package**: `com.nannier.canvas` on both platforms. This becomes
  permanent for that listing the moment anything ships, so change it now or never.
- **Version**: `1.0.0`, from `docs/app.json`. EAS holds the build numbers remotely
  (`appVersionSource: "remote"`, `autoIncrement` on the production profile).

## Listing copy

### Apple App Store

**Name** (30 max): `Canvas UI Kit`

**Subtitle** (30 max): `React Native component docs`

**Promotional text** (170 max):
> Browse every Canvas component running natively, with live examples you can tap,
> switch between light and dark, and read the full prop reference offline.

**Description**:
> Canvas is a universal React Native UI kit, and this is its reference app: the same
> component library running natively on your device rather than described in a web page.
>
> Browse the full catalog of components, from buttons and inputs through data tables,
> calendars, and charts. Every entry pairs a live, interactive example with its complete
> prop reference, so you can tap, type, drag, and toggle each control to see exactly how
> it behaves before you write any code.
>
> WHAT IS INSIDE
>
> - Live examples for every component, running as real native views
> - Full prop tables, generated from the library's own TypeScript source
> - Design tokens for color, typography, spacing, and layout
> - Templates and patterns showing how components compose into real screens
> - Instant search across the entire catalog
> - Light and dark themes, plus a glass surface mode
>
> BUILT FOR ONE API ON EVERY PLATFORM
>
> Canvas components adapt their look to the platform they run on, following iOS design
> conventions here and Material Design on Android, from a single component API. This app
> is the clearest way to see that: it is built entirely from the library it documents.
>
> Canvas is free and open source under the MIT license. No account, no sign-in, no ads,
> and no tracking of any kind.

**Keywords** (100 max, comma separated, no spaces):
`react native,ui kit,components,design system,developer,reference,ios,android,expo,mobile,design`

**Support URL**: `https://github.com/bnannier/canvas/issues`
**Marketing URL**: `https://bnannier.github.io/canvas/`
**Privacy Policy URL**: `https://bnannier.github.io/canvas/privacy`

**Category**: Primary `Developer Tools`, Secondary `Reference`
**Age rating**: 4+ (no objectionable content, no user generated content, no web browsing)

### Google Play

**App name** (30 max): `Canvas UI Kit`

**Short description** (80 max):
> Live, interactive reference for the Canvas React Native component library.

**Full description** (4000 max): reuse the App Store description above; Play renders
plain text and accepts the same copy.

**Category**: `Tools` (alternative: `Libraries & Demo`)
**Contact email**: required by Play and shown publicly, so use an address intended for
that purpose rather than a personal inbox.
**Privacy Policy URL**: `https://bnannier.github.io/canvas/privacy`

## Privacy declarations

Both answers are "nothing is collected". This is verifiable in the source: there is no
analytics, attribution, advertising, or crash reporting SDK, no account system, and no
persistence beyond a web-only theme preference in `localStorage`.

### Apple App Privacy

Select **Data Not Collected**.

The app makes exactly two outbound requests, neither of which is data collection under
Apple's definition, because nothing is stored or linked to a user:

- `registry.npmjs.org`, to read the latest published version for the header pill.
- `u.expo.dev`, to check for over-the-air updates.

### Google Play Data Safety

- Does your app collect or share any of the required user data types? **No**
- Is all of the user data collected by your app encrypted in transit? **Not applicable**
  (no user data is collected; all outbound requests are HTTPS regardless).
- Do you provide a way for users to request that their data is deleted? **Not applicable**
- Data types collected: **none**
- Data types shared: **none**

## Notes for App Review

Paste this into the App Review notes field. It pre-empts a Guideline 4.2 (minimum
functionality) question, which is the most likely rejection reason for a developer
reference app:

> Canvas is the official reference app for the open-source Canvas React Native UI kit
> (https://github.com/bnannier/canvas). It is not a marketing page or a web wrapper: the
> entire app is built from the native component library it documents, and every example
> is a live, interactive native view rather than a screenshot or an embedded web page.
>
> Reviewers can exercise the interactivity directly: open any component (for example
> Button, Slider, Calendar, or Data Table) and interact with the live example at the top
> of the page. The theme toggle in the header switches light, dark, and glass surface
> modes across the whole app, and search filters the full catalog. The app requires no
> account and works without a network connection apart from an optional version check.

## Assets

Requirements as of this writing. Regenerate rather than upscale; both stores reject
stretched images.

**Apple**
- 1024x1024 marketing icon, no alpha channel. Generated from the Canvas C mark by
  `bun run appicon:gen`, which also writes the Android layers and the Play artwork. Never
  hand-edit these files; change the mark geometry and regenerate, so the icons cannot
  drift from the brand.
- iPhone 6.9 inch screenshots. Five are in `store/screenshots/ios` at 1320x2868,
  captured on the iPhone 17 Pro Max simulator.
- iPad 13 inch screenshots, required because `ios.supportsTablet` is `true`. Four are
  in `store/screenshots/ipad` at 2064x2752, captured on the iPad Pro 13-inch simulator.
  Setting `supportsTablet` to `false` would remove this requirement but also drop iPad
  support, which undercuts the kit's responsive story.

Both screenshot sets come from a debug simulator build served by Metro, so they are
pixel-accurate for layout but were not taken from a release binary. They are good enough
to submit; retake them from a production build if you want the version pill and any
development-only affordances to match exactly what ships.

**Google Play**
- 512x512 app icon, `store/assets/play-icon-512.png`.
- Feature graphic 1024x500, `store/assets/play-feature-graphic-1024x500.png`.
- Phone screenshots: five 1080x1920 in `store/screenshots/android`. Two Play rules bite
  here and both are already handled. Play caps the aspect at 2:1, and the emulator's
  native 1080x2400 is 2.22:1, so each capture is scaled to fit 9:16 and padded on the
  brand's near black rather than cropped, which would have cut off the tab bar. Play also
  rejects PNGs carrying an alpha channel, which `adb screencap` always writes, so each one
  is flattened. Regenerate with the same two steps if you retake them.

## Runbook

1. **Enrol in both programs** (owner only). Apple Developer Program is 99 USD per year
   and takes 24 to 48 hours; Google Play is a one time 25 USD plus identity verification
   that can take several days. Start both before anything else, since everything below
   waits on them.
2. **Apple: create the app record.** In App Store Connect, create an app with bundle id
   `com.nannier.canvas` and reserve the listing name. Then run
   `cd docs && npx eas-cli build --platform ios --profile production` interactively once,
   so EAS can create the distribution certificate and provisioning profile against the
   new team.
3. **Apple: ship to TestFlight first.** Internal TestFlight testing needs no App Review,
   so it validates the build end to end before any review risk. Add
   `submit.production.ios.ascAppId` to `docs/eas.json` and submit with
   `npx eas-cli submit --platform ios --profile production`.
4. **Google: create the app record** for `com.nannier.canvas` and complete the store
   listing, content rating, data safety, and target audience sections.
5. **Google: upload the first bundle by hand.** The Play API cannot create the very first
   release, so download the `.aab` and upload it to the Internal testing track manually.
   The current artifact (v1.0.0, versionCode 3, SDK 57) is on its EAS build page:
   `https://expo.dev/accounts/bnannier/projects/canvas-docs/builds/2776e075-232f-4919-ab8c-f92ea919132a`
   Rebuild with `cd docs && npx eas-cli build --platform android --profile production`
   if the app changes before you upload; versionCode auto-increments.
6. **Google: automate afterwards.** Create a Google Cloud service account, grant it
   "Release to testing tracks" in Play Console, then attach the JSON key to EAS so
   `npx eas-cli submit --platform android --profile production` works. The submit profile
   already targets the `internal` track with `releaseStatus: draft`.
7. **Wire the CI button last.** Set the `EXPO_TOKEN` secret and the `EAS_ENABLED=true`
   repository variable to un-skip the native job in `.github/workflows/deploy.yml`.
8. **Promote to production** only after the internal tracks look right on real devices.

## Open decisions

- **Store listing name**: `Canvas UI Kit` versus plain `Canvas`.
- **Public contact email** for the Play listing.

Settled: the app icon is now the Canvas C mark on the brand's near black, generated
from the shared geometry; `supportsTablet` stays `true` and the iPad screenshots exist.
