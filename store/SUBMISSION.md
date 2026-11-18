# Store submission runbook

The Canvas docs app is the Expo Router app in `docs/`. GitHub Actions validates
the release candidate and queues native builds on EAS. App Store Connect and Play
Console handle review, rollout, and storefront availability.

## Release procedure

1. Manually dispatch Deploy - canvas on `main`.
   Select `ios` and/or `android` with `profile=production`. To publish a new patch
   or minor from pending changesets in the same run, set `npm=true`. An authorized
   major uses `major=true` and the exact `major_version`. The native jobs require the
   `EXPO_TOKEN` secret and `EAS_ENABLED=true` repository variable.
   [Deploy workflow](../.github/workflows/deploy.yml)
2. Both native jobs restore the validated candidate and check the version that
   Expo resolves before queuing the build. EAS holds and increments platform build
   numbers remotely. GitHub reports success once EAS accepts the queue request.
   Follow the build links in the Deploy summary and check the corresponding
   submissions in EAS.
3. On iOS, the production profile uses the App Store Connect API key held by EAS
   to upload to TestFlight. After Apple processes the build, test it and attach
   it to the App Store version in App Store Connect. Check listing metadata,
   privacy, and availability, then submit for review and confirm storefront
   availability after release.
4. On Android, production uses `--auto-submit` when `PLAY_SUBMIT_ENABLED=true`
   and the Play service account key is attached to the app in EAS.
   The production submit profile uploads the app bundle to the Internal
   testing track as a draft. Open the draft in Play Console, roll
   it out to internal testers, then manage promotion and production rollout
   there. If auto-submit is disabled, download the EAS bundle and upload it in
   Play Console. The `preview` and `development` profiles use EAS internal
   distribution on both platforms. [EAS profiles](../docs/eas.json)

### Production dispatch on 17 November 2026

Deploy run 44136680404 succeeded for Canvas 4.7.2. EAS accepted both production
builds and queued their submissions. This records the queue outcome observed on
17 November. Build and upload completion, store review, and storefront
availability for 4.7.2 require separate confirmation.
[Deploy run 44136680404](https://github.com/bnannier/canvas/actions/runs/44136680404)

| Platform | EAS build | EAS submission ID |
| --- | --- | --- |
| iOS | [466af016](https://expo.dev/accounts/bnannier/projects/canvas-docs/builds/466af016-ab81-4c91-ae65-d5a82b9d4f56) | `9d3705d5-95e3-433f-90f4-32e130b91f75` |
| Android | [67480300](https://expo.dev/accounts/bnannier/projects/canvas-docs/builds/67480300-e8b1-4eeb-bcff-be869f6e282e) | `9aa5ae1a-7b5a-46f6-8565-65209b07ea4f` |

## App identity and version

| Setting | Value and source |
| --- | --- |
| On-device name and bundle/package ID | `Canvas`, `com.nannier.canvas` on both platforms. The static Expo config is [docs/app.json](../docs/app.json), which also sets iPad support and `ITSAppUsesNonExemptEncryption: false`. |
| Store listing name | `Canvas UI Kit` |
| App Store Connect | App ID `6794454098`, team ID `ZR2R53SLS7`, both in [docs/eas.json](../docs/eas.json). |
| App version | [docs/app.config.js](../docs/app.config.js) overlays the version from the root [package.json](../package.json) of the validated release candidate. |
| Build numbers | EAS uses `appVersionSource: remote` and the production profile uses `autoIncrement: true`. |
| OTA runtime | `runtimeVersion.policy: appVersion` in [docs/app.json](../docs/app.json). |

For the next App Store version, release a newer Canvas version through Deploy.
Auto-increment advances the build number. The approved version’s release train
stays closed, and the OTA runtime remains tied to the app version.

## Listing copy

Use this copy when preparing metadata and check it against the binary selected
for review.

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
> BUILT THE WAY iOS EXPECTS
>
> Canvas components follow iOS design conventions, driven by a single component API. This
> app is the clearest way to see that: it is built entirely from the library it documents.
>
> Canvas is free to use, with no account, no sign-in, no ads, and no tracking.
> The compiled @nannier/canvas package on npm is MIT licensed; the source
> repository remains all rights reserved.

**Keywords** (100 max, comma separated, no spaces):
`react native,ui kit,components,design system,developer,reference,ios,ipad,expo,mobile,design`

Keep the iOS description, keywords, and screenshots specific to iOS. The
native docs also build with platform-specific content. See
[platform-copy.ios.ts](../docs/src/data/platform-copy.ios.ts),
[platforms-shown.ios.ts](../docs/src/core/platforms-shown.ios.ts), and the
[platform content checks](../test/docs-platform-content.test.ts).

**Support URL**: `https://github.com/bnannier/canvas/issues`
**Marketing URL**: `https://canvas.nannier.com/`
**Privacy Policy URL**: `https://canvas.nannier.com/privacy/`

**Category**: Primary `Developer Tools`, Secondary `Reference`
**Age rating**: 4+ (no objectionable content, no user generated content, no web browsing)

### Google Play

**App name** (30 max): `Canvas UI Kit`

**Short description** (80 max):
> Live, interactive reference for the Canvas React Native component library.

**Full description** (4000 max). Use the common opening and feature list above,
then adapt the platform section for Play.

> BUILT FOR ANDROID
>
> Canvas components follow Material Design conventions on Android through a single
> component API. This app is built entirely from the library it documents.

**Category**: `Tools` (alternative: `Libraries & Demo`)
**Contact email**: required by Play and shown publicly, so use an address intended for
that purpose rather than a personal inbox.
**Privacy Policy URL**: `https://canvas.nannier.com/privacy/`

## Privacy declarations

`docs/src/data/privacy-policy.ts` is the source of truth for both store
declarations. The in-app route renders that policy, and `bun run privacy:gen`
renders the same content to `docs/public/privacy/index.html` for the public
privacy page. [Policy source](../docs/src/data/privacy-policy.ts)
· [In-app route](../docs/src/app/(home)/privacy.tsx)
· [Public privacy page](https://canvas.nannier.com/privacy/)

Both answers are "nothing is collected". This is verifiable in the source: there is no
analytics, attribution, advertising, or crash reporting SDK, no account system, and no
persistence of user data (the in-app theme choice is session-only state in memory; the
only disk write is the app's own bundle when an over-the-air update downloads, which
stores no user data).

### Apple App Privacy

Select **Data Not Collected**.

The policy records two outbound hosts. Both receive standard request metadata.

- `registry.npmjs.org` supplies the latest published version for the Home screen.
- `u.expo.dev` checks for over-the-air updates. It receives the update channel,
  runtime version, and platform.

Canvas stores no personal information from either check.

### Google Play Data Safety

- Does your app collect or share any of the required user data types? **No**
- Is all of the user data collected by your app encrypted in transit? **Not applicable**
  (no user data is collected; all outbound requests are HTTPS regardless).
- Do you provide a way for users to request that their data is deleted? **Not applicable**
- Data types collected: **none**
- Data types shared: **none**

## Notes for App Review

Check the selected binary before submitting. Explain the sample authentication
forms in the notes and leave sign-in requirements unchecked for an app with no
account system. Check the App Review contact and copyright fields in App Store
Connect.

> Canvas is the reference app for the Canvas React Native UI kit. You can open
> the component catalog immediately and interact with the live native examples.
> The app has no login or account system. The sample authentication forms
> demonstrate UI components. Submitting an example does not authenticate the
> reviewer or unlock any part of the app.

Keep sample sign-in screens out of the store screenshots. See the
[1.0.0 review history](#the-210-rejection-and-the-sign-in-screenshot) for the
automated login warning.

## Third-party content and rights

Use the generated [shipped package inventory](../tools/noticegen/shipped.json)
and [third-party notices](../docs/src/data/third-party-notices.ts) for the
current app. The initial 1.0.0 source-map audit counted 73 packages, including
Geist and Geist Mono. The inventory now includes native autolinking and baked
data alongside the bundles.

Canvas's own licensing is deliberately split. The **published npm package is MIT**, with
the licence text generated into the tarball at pack time by `tools/licensegen`; the
**source repository is all rights reserved**, so that file is gitignored rather than
committed, because a `LICENSE` at the repository root is how GitHub decides a repository's
licence. Two consequences to keep in mind: MIT on the package cannot be walked back for
versions already published, and a public repository means the source is readable whatever
the licence says, so closing it properly means making the repository private. The docs site
no longer ships JavaScript source maps for the same reason: they embedded 363 of the kit's
own source files in full.

- **Include the bundled licence texts.** The app has an Open Source Licenses
  screen at `/licenses` (`docs/src/app/(home)/licenses.tsx`) with each licence
  and its copyright notices. This covers the bundled fonts and other dependencies
  with notice requirements.

  Run `bun run notices:scan` to identify shipped packages and record them in
  `tools/noticegen/shipped.json`. Then run `bun run notices:gen` to regenerate
  `docs/src/data/third-party-notices.ts`. Release validation checks the generated
  notices with `notices:gen:check`.

  Two traps are worth knowing before touching that tool. First, do NOT compute the
  shipped set by walking the dependency closure: `expo` declares its own CLI as a regular
  dependency, so the closure returns 531 packages and attributes lightningcss (MPL-2.0)
  and node-forge (BSD-3-Clause OR GPL-2.0), neither of which is in the app. The scan
  instead unions four measured signals: what survives into the web, iOS and Android JS
  bundles (read from source-mapped exports, written to a temp directory and discarded),
  what Expo autolinking links, what classic react-native-config autolinking links
  (podspec/gradle modules such as gesture-handler and reanimated, plus react-native
  itself), and the lucide-static icon data and typefaces the generators bake in.
  Scanning only the web bundle silently missed everything that ships natively
  alone. Second, record WHERE each package shipped from, not just its name: an install
  can hold two copies of one package (a docs devDependency once hoisted entities 7 over
  dom-serializer's entities 4), so shipped.json maps each name to the directories the
  bundler and autolinking actually used, and the generator reads the licence there. Third,
  when splitting a licence file into "copyright notice" and "body", only scan the HEADER:
  licence bodies are full of lines that begin with the word copyright, and matching those
  both invents fake notices and deletes real clauses out of the OFL.
- **The sample avatars are generated, not photographed.** `docs/public/*.jpg` were
  previously seven 128x128 photographs of identifiable real people with no recorded
  source, which meant shipping two unverifiable rights at once: copyright in the image
  and the subject's likeness. They are now flat-vector cartoon characters drawn by
  `bun run avatars:gen` (`tools/avatargen`): original geometry, no traced source, no
  model. Regenerate rather than replacing by hand, and do not reintroduce photographs of
  real people without recording a licence here.

Apple's Content Rights question should therefore be answered **yes, with the necessary
rights**: the app does bundle third-party content (the fonts and Lucide's icons), and
both are permissively licensed.

## Store assets

Generate the 1024×1024 App Store icon, Android icon layers, and Play artwork
from the Canvas mark with `bun run appicon:gen`. The Play assets are the
[512×512 icon](assets/play-icon-512.png) and
[1024×500 feature graphic](assets/play-feature-graphic-1024x500.png).

The July 2026 store artwork includes ten captures per device set. Use a
current release build when refreshing the listing, and follow the upload
requirements shown in the store console.

| Device set | July 2026 artwork |
| --- | --- |
| iPhone 6.9 inch | [1320×2868 captures](screenshots/ios) from the iPhone 17 Pro Max simulator. |
| iPad 13 inch | [2064×2752 captures](screenshots/ipad) from the iPad Pro simulator. The app supports iPad. |
| Android phone | [1080×1920 captures](screenshots/android), fitted to 9:16, padded to preserve the tab bar, and flattened to remove the alpha channel. |

## Initial submission history, July–August 2026

These records describe the 1.0.0 setup and submissions. The live steps are in
the [release procedure](#release-procedure).

### Setup and submission milestones

| Step | Recorded outcome for 1.0.0 |
| --- | --- |
| Bundle / package id `com.nannier.canvas` | Set in `docs/app.json`, free on the App Store |
| 1024 marketing icon without alpha | Done (`docs/assets/images/icon.png`) |
| Export compliance key | Done (`ios.infoPlist.ITSAppUsesNonExemptEncryption: false`) |
| Public privacy policy URL | Returned HTTP 200 during initial setup. [Privacy policy](https://canvas.nannier.com/privacy/) |
| Android production `.aab` | First bundle built for 1.0.0, versionCode 3, SDK 57. [EAS build](https://expo.dev/accounts/bnannier/projects/canvas-docs/builds/2776e075-232f-4919-ab8c-f92ea919132a) |
| Android upload keystore | Generated and held by EAS |
| Google Play Developer account | **FULLY VERIFIED (29 Jul 2026).** Legal name "Robert Nannier", personal, ID `7346390607155774694`. Identity verification briefly returned to the checklist on 28 July. Both identity and phone verification cleared on 29 July. |
| Play app record | **CREATED 29 Jul 2026.** "Canvas UI Kit", package `com.nannier.canvas` (permanent), app ID `4973468766485983757`, free (cannot become paid after publishing). |
| Android build for Play | Chose EAS build `0b0e49b9`, 1.0.0 versionCode 6, production app bundle. This build included the licences screen with the Geist OFL notices missing from versionCode 5. |
| Play upload | **AUTOMATED (19 Aug 2026).** EAS uploaded versionCode 6 to the Internal testing track as a draft. |
| Play store listing | Saved on 19 Aug 2026 with the name, short and full descriptions, 512 icon, 1024x500 feature graphic, and eight 1080x1920 phone screenshots. The 7-inch and 10-inch tablet slots were left empty. |
| Play publishing automation | Enabled the Google Play Android Developer API in GCP project `canvas-play-publishing`. Granted `play-publisher@canvas-play-publishing.iam.gserviceaccount.com` app-scoped "Release apps to testing tracks", attached its key to EAS, and enabled `PLAY_SUBMIT_ENABLED`. |
| Apple Developer Program membership | Active, team `ZR2R53SLS7` |
| App Store Connect app record | Created, Apple ID `6794454098`, bundle `com.nannier.canvas` |
| ASC listing metadata | Done: name, subtitle, description, keywords, support + marketing URLs, categories |
| ASC App Privacy | Done, Data Not Collected, privacy URL set and published |
| iOS distribution certificate | **Created** (serial `3D467E74...`, expires 24 Jul 2027), stored on EAS |
| iOS provisioning profile | **Created** (`DU4S5M5QTB`), active |
| iOS production build | **BUILT** on EAS, build `93fa9f28`, queued 24 Jul 23:04 from CI |
| iOS upload to App Store Connect | After EAS was configured with the App Store Connect API key, the build reached TestFlight through automated submission. |
| Build attached to the App Store version | Done, build 7 (1.0.0). A processed build never appears on the in-flight version page by itself; attach it with the `+` beside Build. |
| Age rating questionnaire | Done, every answer None/No, which yields 4+ across 172 countries. |
| Screenshots uploaded to ASC | **9 of 10 on iPhone 6.9" and iPad 13".** The sign-in shot had been deleted. The DataTable replacement was in the repository, pending manual upload at that point. |
| Content rights declaration | Recorded as "this app has the necessary rights to its third-party content". |
| App Review contact | Done, Bobby Nannier, `bobby@nannier.com`, `+14166693676`. |
| Copyright | Done, `2026 Robert Nannier`. Required to submit, and easy to miss because the field sits well above the Save button. |
| iPhone 6.9" screenshots | Done, 10 in `store/screenshots/ios` (Apple's max) |
| iPad 13" screenshots | Done, 10 in `store/screenshots/ipad` |
| Android phone screenshots | Done, 10 in `store/screenshots/android` |
| **iOS submission** | Build 1.0.0 (7) moved to Ready for Distribution after a metadata-only fix. The previous rejections cited 2.1.0, then 2.3.10 and 4.0, then 2.3.10 alone. |
| **App Store availability** | The [U.S. listing](https://apps.apple.com/us/app/canvas-ui-kit/id6794454098) returned HTTP 200 on 24 Aug 2026 after availability was configured. 148 of 175 territories became available first. The remaining 27 followed the trader declaration. |
| **EU DSA trader status** | Declared non-trader on 24 Aug 2026. The Business tab recorded the declaration as active for 27 countries. |
| Free Apps Agreement | Recorded as active from 18 Aug 2026, with the term ending 30 Jun 2027. The Paid Apps Agreement was unsigned at the time. |

### Play auto-submit setup, August 2026

The first Play release required a manual bundle upload. This is the credential
setup used for later uploads through EAS.

1. Google Cloud: create a project, enable the **Google Play Android Developer API**.
2. Create a service account (no IAM roles; its power comes from Play, not GCP), then
   **Keys -> Add key -> JSON**. That download is a live credential with release access.
3. Play Console -> **Users and permissions -> Invite new users**: paste the service
   account email, add the app, grant **Release apps to testing tracks**. Least privilege:
   do NOT grant Admin or production. Service accounts go straight to Active, no email
   acceptance. NOTE the flow ends in a **"Send invite?" confirmation dialog** that is easy
   to miss; navigating away silently discards the whole invite.
4. `cd docs && npx eas-cli credentials --platform android`. TWO separate operations here
   and the wording is nearly identical: "Upload a Google Service Account Key" only stores
   it, and **"Manage your Google Service Account Key for Play Store Submissions" ->
   "Select an existing..."** is what BINDS it to the package. Until it is bound,
   `eas submit` keeps failing with "Google Service Account Keys cannot be set up in
   --non-interactive mode", which reads like a flag problem and is not.
5. `gh variable set PLAY_SUBMIT_ENABLED --repo bnannier/canvas --body true`.

Delete the JSON from disk afterwards; EAS holds its own copy on its servers.

### App Store availability setup, 24 August 2026

Apple approved build 7 and the version sat at **Ready for Distribution**, yet the app
was on no storefront at all: `itunes.apple.com/lookup?id=6794454098` returned
`resultCount: 0` for every country tried, and `apps.apple.com/us/app/id6794454098`
returned HTTP 404.

**App Review was never the problem.** The version page carried a banner reading "This
app was removed from sale from the App Store. Go to Pricing and Availability to add it
back", and on that page **App Availability was still in its empty state**, offering a
"Set Up Availability" button. Nobody had ever configured it.

The trap worth remembering: **a price schedule is not availability.** Prices already
covered 175 countries, which looks finished at a glance, but pricing and availability
are two independent records and an app with prices and no availability counts as
removed from sale. Check availability explicitly, do not infer it from the price table.

Fix: Set Up Availability, "All Countries or Regions", Confirm. It commits on Confirm,
with **no separate Save press** (the page's own Save button stays greyed out, which
reads as if nothing happened). Rows went "Processing to Available" and then "Available"
in about two minutes. Apple states storefront changes take **up to 24 hours** to appear,
so a 404 immediately after the flip is expected and is not evidence the fix failed.

### EU trader declaration, 24 August 2026

Only **148 of 175** territories went available. Every one of the 27 holdouts is an EU
member state, each reading "Trader Status Not Provided", because the Digital Services
Act requires Apple to verify and publicly display trader contact information before any
EU distribution.

The form is App Store Connect, **Business** tab, red banner, "Complete Compliance
Requirements". It offers exactly two choices:

- **"I'm a trader under the DSA"**: requires an address, phone number and email, which
  Apple then **publishes on the App Store product page**. Apple notes this is display
  only and does not change account or membership contact details.
- **"I'm not a trader under the DSA or I don't plan to distribute in the EU"**: no
  contact details were requested for the non-trader declaration.

**Decided 24 Aug 2026: non-trader.** Apple's own four factors all pointed that way for
this app. There is no revenue (free, no in-app purchases, no ads, and the Paid Apps
Agreement is unsigned), no commercial practice toward consumers (it showcases a free
MIT-licensed package), and the account is registered personal rather than as a company.
The declaration is recorded on the Business tab as Compliance, Digital Services Act, 27
countries, Active.

**Correct a myth before repeating it:** declaring non-trader does NOT forfeit the EU.
Apple's announcement says apps were removed "until trader status is provided and verified
if necessary", so it is the ABSENCE of any answer that blocks the EU. A non-trader answer
unblocks distribution and publishes nothing; EU consumers are instead told that consumer
protection rights do not apply to contracts with the developer. Only a trader answer
publishes an address, phone and email on every EU product page.

**Propagation, not a missing step.** For a while after the declaration the availability
page still listed the 27 as "Trader Status Not Provided" even after a hard reload. That is
lag. Manage Availability proves it: the dialog reads "Country or Region Availability (175)"
with every EU country already ticked and Next greyed out, so there is nothing left to
re-save.

### Outcome of the appeal (29 Jul 2026)

Apple accepted the Guideline 4 rebuttal and dropped it. That argument was purely factual:
their template sentence said the app "does not integrate with iOS features other than web
views, push notifications, or sharing", and the app has none of those three. It uses a
native UITabBar with SF Symbols, `sidebarAdaptable`, `minimizeBehavior`, real Liquid Glass
via UIGlassEffect, and a native pull-down UIMenu.

They did NOT accept the 2.3.10 argument, replying "We still noticed that the app or
metadata includes information about third-party platforms". Their Next Steps said the same
thing all three times: "Revise the app's DESCRIPTION to remove Android references."

The owner removed Android references from the App Store description and keywords for
that review. The 1.0.0 binary still included those references on its home screen and in
its artwork. On 28 October, v4 adopted platform-specific content for native docs,
including iOS copy and platform comparisons.

### The 2.3.10 and Guideline 4 appeal, 27 July 2026

Second rejection (27 Jul, reviewed on **iPad Air 11-inch**) cited two things:

- **2.3.10 Accurate Metadata**: "Revise the app's description to remove Android
  references." Note Apple's wording is "the app OR metadata" and the app is the worse
  half: the home screen names Android in six places and `hero-orbit.tsx` renders an
  Android logo.
- **Guideline 4 Design**: "the app does not integrate with iOS features other than web
  views, push notifications, or sharing", plus a note that iPad users expect apps to
  work properly on iPad.

**The owner decided NOT to drop Android.** Cross-platform support is what the library
IS, and removing it would make the documentation factually incomplete for its audience.
Apple's own message invites a reply "if the app's functionality and how it interacts
with third-party platforms has been misunderstood", so we took that route.

The appeal (posted 27 Jul) argues two things:

1. On 2.3.10, the references are a technical specification for a developer audience, not
   promotion. The app contains no link to another app store, no instruction to obtain
   this app anywhere but the App Store, no purchase outside Apple, and no way to acquire
   the software on another platform. We asked Apple to confirm if they still disagree,
   and committed to removing everything if so.
2. On Guideline 4, the cited sentence is factually wrong about this app. It has **no web
   view, no push notifications and no share sheet**. It uses native UITabBar via
   expo-router native tabs with SF Symbols, `sidebarAdaptable` (the iOS 26 tab bar that
   becomes an iPad sidebar), `minimizeBehavior` onScrollDown, Apple's Liquid Glass via
   UIGlassEffect on iOS 26+, and a native pull-down UIMenu. We asked which iPad screen
   failed.

Two supporting changes shipped with the appeal. The platform comparison moved
to desktop web (`dd2105953`), and the dormant Expo Go block with a Play link
was removed (`473dbf4df`).

### The 2.1.0 rejection and the sign-in screenshot

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

At the 26 July checkpoint, Google was still reviewing the uploaded identity
documents. Phone verification and app creation followed on 29 July. The old
Play developer profile website and public contact email were flagged separately
at the time.

Two things cost a submission attempt each, so they are worth knowing before the next
release:

- The **App Review phone number must carry a `+` country code**. A bare `4166693676`
  is rejected, and the field shows the generic "This field is required" in red while
  the actual reason ("please ensure your phone number is formatted correctly,
  including a `+` in front of the country code") is only in the page's error list.
- **Copyright is required and starts empty.** Apple wants the rights holder preceded
  by the year, no URL, hence `2026 Robert Nannier`, matching the holder that
  `tools/licensegen/generate.mjs` writes into the published package's LICENSE.

### Closed 1.0.0 release train

Apple rejected 1.0.0 build 10 with ITMS-90186 and ITMS-90062 after the first
1.0.0 build was approved. A later build number still used the approved App
Store version. The current release procedure takes the next app version from
the validated Canvas release candidate.
