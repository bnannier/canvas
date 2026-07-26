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
| Public privacy policy URL | **LIVE and verified HTTP 200**, `https://canvas.nannier.com/privacy/` |
| Android production `.aab` | **Built and ready**, v1.0.0 versionCode 3, SDK 57, from commit `d5daa866` |
| Android upload keystore | Generated and held by EAS |
| Google Play Developer account | **EXISTS** (checked 26 Jul 2026): "Bobby Nannier", personal, ID `7346390607155774694`. |
| Play identity verification | **PENDING with Google.** Documents uploaded, "may take a few days". Everything else is gated behind it: phone verification, package-name registration, publishing. |
| Apple Developer Program membership | Active, team `ZR2R53SLS7` |
| App Store Connect app record | Created, Apple ID `6794454098`, bundle `com.nannier.canvas` |
| ASC listing metadata | Done: name, subtitle, description, keywords, support + marketing URLs, categories |
| ASC App Privacy | Done, Data Not Collected, privacy URL set and published |
| iOS distribution certificate | **Created** (serial `3D467E74...`, expires 24 Jul 2027), stored on EAS |
| iOS provisioning profile | **Created** (`DU4S5M5QTB`), active |
| iOS production build | **BUILT** on EAS, build `93fa9f28`, queued 24 Jul 23:04 from CI |
| iOS upload to App Store Connect | **DONE, and now automatic.** No longer needs an interactive run: EAS holds the App Store Connect API key in its credentials service, so the CI job builds and submits unattended. Verified end to end, the build reached TestFlight. |
| Build attached to the App Store version | Done, build 7 (1.0.0). A processed build never appears on the in-flight version page by itself; attach it with the `+` beside Build. |
| Age rating questionnaire | Done, every answer None/No, which yields 4+ across 172 countries. |
| Screenshots uploaded to ASC | **9 of 10 on iPhone 6.9" and iPad 13".** The sign-in shot was deleted (see below); the DataTable replacement in `store/screenshots` still needs uploading by hand. 9 is valid, Apple's minimum is 1. Nothing generates these into ASC. **Never include a sign-in screen.** |
| Content rights declaration | Done, "this app has the necessary rights to its third-party content" (see the audit below). |
| App Review contact | Done, Bobby Nannier, `bobby@nannier.com`, `+14166693676`. |
| Copyright | Done, `2026 Robert Nannier`. Required to submit, and easy to miss because the field sits well above the Save button. |
| iPhone 6.9" screenshots | Done, 10 in `store/screenshots/ios` (Apple's max) |
| iPad 13" screenshots | Done, 10 in `store/screenshots/ipad` |
| Android phone screenshots | Done, 10 in `store/screenshots/android` |
| **iOS submission** | **RESUBMITTED 25 Jul 2026, "Waiting for Review"** (build 7 again). First attempt was rejected under 2.1.0 App Completeness; cause and fix below. Still set to release automatically on approval. |

### The 2.1.0 rejection, and why the screenshot was the real cause

The message was AUTOMATED, not a human reviewer: "An automated analysis of the submission
indicates the app may include a login but was submitted without a demo account." Apple's
own remedy for an app with no login is to reply to the Resolution Center message
confirming that and to add the same information to App Review Information. **No new build
is required**, which is why the resubmission reused build 7.

What almost certainly tripped it: **App Store screenshot 10 was the Sign-in template**, a
full-screen card reading "Sign in to Canvas" with email, password, Remember me, Forgot
password and a Sign in button. An automated pre-review pass reads the screenshots, and
that one is indistinguishable from a real login wall for an app named Canvas. All three
platforms carried the same shot; every one is now a DataTable screen instead, which reads
unmistakably as developer documentation (live sortable table, variant tabs, source code).

Two rules to keep:

- **Never ship a sign-in screen as a store screenshot.** It reads as an auth gate to the
  automated scan no matter what the app actually does.
- The in-app demo auth screens are branded to the fictional **Acme Corp** and subtitled
  "Demo form" so they cannot read as this app's own login either. Do not rebrand them
  back to Canvas.

Google Play is now the only blocked row, and as of 26 Jul 2026 it is waiting on GOOGLE,
not on us: the account exists and the identity documents are uploaded, but Google has not
approved them yet. Nothing can move until it does, because phone verification, package-name
registration and publishing are all gated behind that one check.

Two developer-account details need the owner's attention when the console next opens
(both are account settings):

- **Website is the stale `https://bnannier.github.io/canvas/`.** It still answers 200 but
  serves an older bundle, and `/licenses` 404s there while it is live on
  `https://canvas.nannier.com/`. Point it at the Cloudflare site so it matches the App
  Store listing.
- The **developer email shown publicly on Play** is `bobby@nannier.com`, a personal
  inbox. See the contact-email note above.

Two things cost a submission attempt each, so they are worth knowing before the next
release:

- The **App Review phone number must carry a `+` country code**. A bare `4166693676`
  is rejected, and the field shows the generic "This field is required" in red while
  the actual reason ("please ensure your phone number is formatted correctly,
  including a `+` in front of the country code") is only in the page's error list.
- **Copyright is required and starts empty.** Apple wants the rights holder preceded
  by the year, no URL, hence `2026 Robert Nannier`, matching the holder that
  `tools/licensegen/generate.mjs` writes into the published package's LICENSE.

## App identity

- **On-device name**: `Canvas` (from `docs/app.json` `expo.name`; this is the home
  screen label and does not have to be unique).
- **Store listing name**: `Canvas UI Kit` is the recommendation. Plain `Canvas` has no
  exact match in App Store search, but it competes directly with Instructure's Canvas
  (education) and Canva, so it would be effectively undiscoverable. Only App Store
  Connect can confirm availability at the moment you reserve it.
- **Bundle id / package**: `com.nannier.canvas` on both platforms. This becomes
  permanent for that listing the moment anything ships, so change it now or never.
- **Apple IDs**: App Store Connect Apple ID `6794454098`, Team ID `ZR2R53SLS7`. Set
`ascAppId` to the former in `eas.json` before running `eas submit -p ios`.

**Version**: `1.0.0`, from `docs/app.json`. EAS holds the build numbers remotely
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
**Marketing URL**: `https://canvas.nannier.com/`
**Privacy Policy URL**: `https://canvas.nannier.com/privacy/`

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
**Privacy Policy URL**: `https://canvas.nannier.com/privacy/`

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

Paste this into the App Review notes field.

The first submission was rejected under **2.1.0 Performance: App Completeness** by an
AUTOMATED analysis, not a human reviewer: "the app may include a login but was submitted
without a demo account". Apple's own instruction for an app with no login is to reply to
the Resolution Center message confirming that AND put the same information in the App
Review Information section. No new build is required for that, so this text must stay
true of whatever binary is attached: do NOT let it claim changes that are only on `main`.

> Canvas is the official reference app for the open-source Canvas React Native UI kit
> (https://github.com/bnannier/canvas). It is a component catalog: every screen is a
> live, interactive native view built from the library it documents, not a screenshot,
> a marketing page, or an embedded web page.
>
> THIS APP DOES NOT INCLUDE A LOGIN. Confirming that in response to the automated
> message: there is no authentication of any kind, no account system, no user data, and
> no backend. Nothing in the app is gated. Every screen is reachable immediately on
> launch, which is why "Sign-in required" is unchecked and no demo account is supplied.
>
> The automated analysis most likely matched the sample authentication screens at
> Components > Templates > Sign-in and Components > Templates > Sign-up. Those are
> DEMONSTRATIONS of UI components, not a way into the app: example layouts showing how
> the kit's Input, Button, Checkbox and Card components compose into a typical sign-in
> screen, which is one of the most common things developers build with a UI kit. The
> forms are inert. Submitting one shows a toast and does nothing else: no network
> request is made, no session is created, and no part of the app becomes newly
> available. The password fields are ordinary text inputs with the secureTextEntry prop
> set, present to document that prop.
>
> To confirm nothing is gated, launch the app and go straight to any component (Button,
> Slider, Calendar, Data Table) and interact with the live example at the top of its
> page. The theme toggle in the header switches light, dark, and glass surface modes
> across the whole app, and search filters the full catalog. The app requires no network
> connection apart from an optional version check.

## Third-party content and rights

Audited from the shipped bundle's source map, so this reflects what is actually inside
the binary rather than what package.json declares. 73 packages ship: 68 MIT, 2
`MIT AND OFL-1.1` (Geist and Geist Mono), 1 BSD-2-Clause, 1 BSD-3-Clause, plus Canvas
itself. Nothing copyleft, nothing with a field-of-use restriction.

Canvas's own licensing is deliberately split. The **published npm package is MIT**, with
the licence text generated into the tarball at pack time by `tools/licensegen`; the
**source repository is all rights reserved**, so that file is gitignored rather than
committed, because a `LICENSE` at the repository root is how GitHub decides a repository's
licence. Two consequences to keep in mind: MIT on the package cannot be walked back for
versions already published, and a public repository means the source is readable whatever
the licence says — closing it properly means making the repository private. The docs site
no longer ships JavaScript source maps for the same reason: they embedded 363 of the kit's
own source files in full.

Two obligations follow from the dependency audit and are worth not losing:

- **The Geist fonts are OFL-1.1**, which requires the licence text to travel with the
  font. RESOLVED: the app now has an Open Source Licenses screen at `/licenses`
  (`docs/src/app/(home)/licenses.tsx`) reproducing every licence in full, with each
  licence's copyright notices above it. It also satisfies MIT's notice clause, which the
  other 85 packages carry.

  The content is generated, not hand-maintained, in two steps. `bun run notices:scan`
  works out what the app actually ships and records it in `tools/noticegen/shipped.json`;
  `bun run notices:gen` turns that into `docs/src/data/third-party-notices.ts`. CI runs
  `notices:gen:check`, so a dependency change without a regenerate fails the build.

  Two traps are worth knowing before touching that tool. First, do NOT compute the
  shipped set by walking the dependency closure: `expo` declares its own CLI as a regular
  dependency, so the closure returns 531 packages and attributes lightningcss (MPL-2.0)
  and node-forge (BSD-3-Clause OR GPL-2.0), neither of which is in the app. The scan
  instead unions what survives into the JS bundle (read from a source-mapped export,
  written to a temp directory and discarded) with what autolinks native code, giving 88.
  Second, when splitting a licence file into "copyright notice" and "body", only scan the
  HEADER: licence bodies are full of lines that begin with the word copyright, and
  matching those both invents fake notices and deletes real clauses out of the OFL.
- **The sample avatars are generated, not photographed.** `docs/public/*.jpg` were
  previously seven 128x128 photographs of identifiable real people with no recorded
  source, which meant shipping two unverifiable rights at once: copyright in the image
  and the subject's likeness. They are now flat-vector cartoon characters drawn by
  `bun run avatars:gen` (`tools/avatargen`) — original geometry, no traced source, no
  model. Regenerate rather than replacing by hand, and do not reintroduce photographs of
  real people without recording a licence here.

Apple's Content Rights question should therefore be answered **yes, with the necessary
rights**: the app does bundle third-party content (the fonts and Lucide's icons), and
both are permissively licensed.

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
