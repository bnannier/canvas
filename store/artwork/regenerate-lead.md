# Canvas App Store lead artwork

The lead renders the Canvas kit inside a temporary React Native app. The chart, period switcher, badge, card, switch and buttons use the iOS renderers. The app uses the Canvas mark and the docs typefaces.

The captures use the visual source at `301bedd314845576cb90bbaf0ab582c38d05dfdd`, the iOS 27.0 simulator runtime and Xcode 27.2. The source archive includes a wider layout for the 13-inch iPad. The phone layouts use the same composition rendered separately at each display size.

## Prepare the source

Start at the root of a Canvas checkout with the root and docs dependencies installed and the generated iOS workspace already available. The native shell is an unsigned Release build of the regular Canvas docs app for the simulator.

```bash
canvas_repo="$(pwd -P)"
canvas_artwork_source="$canvas_repo/store/artwork"
canvas_artwork_work="$(mktemp -d /private/tmp/canvas-lead-artwork.XXXXXX)"
canvas_artwork_revision=301bedd314845576cb90bbaf0ab582c38d05dfdd
mkdir -p "$canvas_artwork_work"/{snapshot,bundle,metro-cache}

git -C "$canvas_repo" archive "$canvas_artwork_revision" |
  tar -xf - -C "$canvas_artwork_work/snapshot"

cp -cR "$canvas_repo/docs/node_modules" "$canvas_artwork_work/snapshot/docs/"
canvas_artwork_docs="$canvas_artwork_work/snapshot/docs"
canvas_artwork_package="$canvas_artwork_docs/node_modules/@nannier/canvas"
if test -L "$canvas_artwork_package"; then
  unlink "$canvas_artwork_package"
fi
mkdir -p "$canvas_artwork_package"
cp -cR "$canvas_artwork_work/snapshot/src" \
  "$canvas_artwork_work/snapshot/styles" \
  "$canvas_artwork_work/snapshot/package.json" \
  "$canvas_artwork_package/"

mkdir -p "$canvas_artwork_docs/store-artwork"
cp "$canvas_artwork_source/lead-artboard.tsx" "$canvas_artwork_docs/store-artwork/index.tsx"
```

The entry must live at `docs/store-artwork/index.tsx` so its `../src` references reach the snapshot’s fonts and Canvas mark. The entry registers its own native screen through Expo.

## Build and install

Build the native shell if a matching Release simulator product is unavailable.

```bash
xcodebuild \
  -workspace "$canvas_repo/docs/ios/Canvas.xcworkspace" \
  -scheme Canvas \
  -configuration Release \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath "$canvas_artwork_work/native-build" \
  CODE_SIGNING_ALLOWED=NO build

canvas_artwork_shell="$canvas_artwork_work/native-build/Build/Products/Release-iphonesimulator/Canvas.app"
```

Export the artwork entry and compile its JavaScript with the same Hermes compiler as the native shell.

```bash
cd "$canvas_artwork_docs"
TMPDIR="$canvas_artwork_work/metro-cache" EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 CI=1 \
  ./node_modules/.bin/expo export:embed \
  --platform ios --dev false --minify true \
  --entry-file store-artwork/index.tsx \
  --bundle-output "$canvas_artwork_work/bundle/main.jsbundle" \
  --assets-dest "$canvas_artwork_work/bundle" --max-workers 4

"$canvas_repo/docs/ios/Pods/hermes-engine/destroot/bin/hermesc" \
  -O -emit-binary -out "$canvas_artwork_work/bundle/main.hbc" \
  "$canvas_artwork_work/bundle/main.jsbundle"

canvas_artwork_app="$canvas_artwork_work/Canvas-Store-Artwork.app"
cp -cR "$canvas_artwork_shell" "$canvas_artwork_app"
cp "$canvas_artwork_work/bundle/main.hbc" "$canvas_artwork_app/main.jsbundle"
rsync -a "$canvas_artwork_work/bundle/assets/" "$canvas_artwork_app/assets/"

plutil -replace CFBundleIdentifier -string com.nannier.canvas.storeart "$canvas_artwork_app/Info.plist"
plutil -replace CFBundleDisplayName -string 'Canvas Artwork' "$canvas_artwork_app/Info.plist"
plutil -remove CFBundleURLTypes "$canvas_artwork_app/Info.plist"
plutil -replace UIViewControllerBasedStatusBarAppearance -bool true "$canvas_artwork_app/Info.plist"
plutil -insert UIStatusBarHidden -bool true "$canvas_artwork_app/Info.plist"
plutil -replace UIUserInterfaceStyle -string Dark "$canvas_artwork_app/Info.plist"
plutil -replace EXUpdatesEnabled -bool false "$canvas_artwork_app/Expo.plist"
```

The bundle identifier `com.nannier.canvas.storeart` keeps the artwork app separate from `com.nannier.canvas`. Its native screen controller hides the status bar and requests an auto-hidden home indicator.

## Capture

Choose the booted iPhone 18 Pro, iPhone 18 Pro Max or iPad Pro 13-inch (M5) in `xcrun simctl list devices booted`. Set `canvas_artwork_device` to that simulator’s identifier and `canvas_artwork_size` to `medium`, `large` or `ipad`.

```bash
xcrun simctl ui "$canvas_artwork_device" appearance dark
xcrun simctl status_bar "$canvas_artwork_device" override \
  --time '9:41' --dataNetwork wifi --wifiMode active --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState discharging --batteryLevel 100
xcrun simctl install "$canvas_artwork_device" "$canvas_artwork_app"
xcrun simctl terminate "$canvas_artwork_device" com.nannier.canvas 2>/dev/null || true
xcrun simctl launch "$canvas_artwork_device" com.nannier.canvas.storeart
sleep 8
xcrun simctl io "$canvas_artwork_device" screenshot --mask=ignored "$canvas_artwork_work/lead-native.png"
node "$canvas_artwork_source/pack-screenshot.cjs" \
  "$canvas_artwork_work/lead-native.png" "$canvas_artwork_work/01-lead.png" "$canvas_artwork_size"
```

Inspect the captured frame for the complete headline, chart and controls. The packing script verifies the display dimensions, checks that any alpha channel was fully opaque, and removes it while preserving the RGB pixels.

Use the numbered output in the matching set under [screenshots](../screenshots).
The [manifest](../screenshots/app-store-en-US.json) records the final paths and
SHA-256 digests.

## Capture the documentation slides

Slides 02–10 use the regular Canvas docs app on the same simulators. Use the
same source snapshot, dark system appearance, and the Canvas dark, violet,
glass appearance. The original captures used the local 4.8.0 (1) Release
simulator shell with an embedded production bundle for the visible source
revision above. Keep Expo Updates disabled in the local capture app so the
embedded snapshot stays in use. To prepare that app, export the snapshot with
`--entry-file node_modules/expo-router/entry.js` into a separate bundle
directory, compile the bundle with the same Hermes compiler, and copy it and
its assets into a temporary copy of the native shell. Keep the product bundle
identifier and URL types in this copy.

Open the routes in the manifest and scroll until the named specimen and its
heading are in view. Each route can be opened using the corresponding
`canvas:///` deep link, for example
`canvas:///foundations?scheme=dark&surface=glass&palette=violet`. When
capturing Input, enter `hello@example` in the example and dismiss the keyboard
to show the invalid address state. Capture the native portrait frame and pack
it with the same script. Inspect each frame and compare the composition to the
corresponding final upload. Store the selected, packed listing files only.
