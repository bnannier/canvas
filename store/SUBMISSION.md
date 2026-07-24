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
| Android production `.aab` | Built on EAS from SDK 57 |
| Android upload keystore | Generated and held by EAS |
| Google Play Developer account | **BLOCKED, none exists** |
| Apple Developer Program membership | **BLOCKED, EAS reports no distribution certificate** |
| iOS production build | Blocked on the above |
| Screenshots | See "Assets" below |

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
- 1024x1024 marketing icon, no alpha channel. Comes from `docs/assets/images/icon.png`,
  which is now RGB. Note this icon is a blue chevron mark and does not match the rainbow
  "C" used throughout the docs and README; consider aligning them before launch.
- iPhone 6.9 inch screenshots, 1290x2796 portrait, at least 3.
- iPad 13 inch screenshots, 2064x2752 portrait, required because
  `ios.supportsTablet` is `true`. Setting it to `false` removes this requirement but
  also drops iPad support, which undercuts the kit's responsive story.

**Google Play**
- 512x512 app icon, 32 bit PNG.
- Feature graphic, 1024x500, no transparency.
- At least 2 phone screenshots, 1080x1920 or similar 16:9.

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
   release, so download the `.aab` from the EAS build page and upload it to the Internal
   testing track manually.
6. **Google: automate afterwards.** Create a Google Cloud service account, grant it
   "Release to testing tracks" in Play Console, then attach the JSON key to EAS so
   `npx eas-cli submit --platform android --profile production` works. The submit profile
   already targets the `internal` track with `releaseStatus: draft`.
7. **Wire the CI button last.** Set the `EXPO_TOKEN` secret and the `EAS_ENABLED=true`
   repository variable to un-skip the native job in `.github/workflows/deploy.yml`.
8. **Promote to production** only after the internal tracks look right on real devices.

## Open decisions

- **Store listing name**: `Canvas UI Kit` versus plain `Canvas`.
- **App icon**: the current blue chevron does not match the rainbow "C" brand.
- **iPad support**: keep `supportsTablet: true` and produce iPad screenshots, or drop it.
- **Public contact email** for the Play listing.
