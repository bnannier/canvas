# Canvas application recipes

This app was created from the Canvas npm package. Its included LICENSE applies to
these distributed files; it does not license the Canvas source repository.

Run `bun install`, then `bun run web`. Run `bun run typecheck` and
`bun run build:web` before shipping changes. Commit the generated lockfile.
The scaffold pins upstream Expo Modules fixes through package-manager overrides.
Keep those overrides and the SDK's React and React Native versions together.

`bun run ios` and `bun run android` build locally. iOS needs compatible Xcode
and CocoaPods. Android needs the Android SDK and JDK 17; set JAVA_HOME accordingly.
No EAS account or backend is configured. Each application uses session state;
reloading resets data, and booking confirms only a local demonstration reservation.
Before distributing your app, choose your own name and native bundle identifiers
in `app.config.js`.

The navigation opens Settings, Dashboard and Booking. `recipe-config.json`
chooses the initial screen. All recipes share the same React Native component tree
on iOS, Android and web. Replace the sample data and connect persistence/services
for your product; the UI does not make real reservations or send email.

Use `npx --no-install canvas docs --list` for the installed package's API catalog,
`npx --no-install canvas doctor` for required-peer diagnostics, and
`npx --no-install canvas skills install --client both` for project-local guidance.
