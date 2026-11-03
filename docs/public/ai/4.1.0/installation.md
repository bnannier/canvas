# Installation and runtime support

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 56e9acdcc5d59c74fa11ff4461bc2b20c5a6dee1cb6818caafd94ea390815be0

Install Canvas into an existing Expo, React Native, or React Native Web application.
For an Expo app, let Expo select the SVG version compatible with its SDK:

```bash
npx expo install @nannier/canvas react-native-svg
```

Keep the React and React Native versions supplied by your Expo SDK. For web support,
also install Expo's web dependencies if the app does not already have them:

```bash
npx expo install react-dom react-native-web
```

In an existing bare React Native or React Native Web app:

```bash
npm install @nannier/canvas react-native-svg
```

Canvas ships compiled (no Canvas build step in your app). Its **required** peer
dependencies are React 18 or later, React Native 0.74 or later, and
react-native-svg 15.8.0 or later. Use a React version compatible with your React
Native version. Web applications also need React DOM, React Native Web, and their
bundler's RNW configuration; see [Platforms](https://canvas.nannier.com/ai/4.1.0/installation.md#platforms).

### Package and documentation versions

The published package is `@nannier/canvas`; use that name for both installation
and imports. The [packaged recipe onboarding](https://canvas.nannier.com/agents.md#start-a-project-with-an-available-cli) explains how to create an app when your installed release provides the CLI. Check the registry and your installed
version when following an example:

```bash
npm view @nannier/canvas version
npm ls @nannier/canvas
```

The repository's documentation describes its current source revision. A design
preview label or a change on `main` does not establish what npm has published.
For an installed release, its package declarations and changelog describe the
available API. The npm package and its packaged recipes are MIT-licensed. The private repository and its development-only starter retain separate [source terms](https://canvas.nannier.com/agents.md#package-and-source-terms).

### Optional peers

Install the optional peers needed by your app's features. The package remains usable without them, with the following fallbacks:

| Package | Install only if | Without it |
| --- | --- | --- |
| `react-native-qrcode-svg` | you render QR codes with `QRCode` | the accessible, sized frame remains empty and warns once in development |
| `expo-glass-effect` | you want native Liquid Glass on supported iOS 26+ devices | forced glass uses `expo-blur` when available, otherwise the skin's solid fill; automatic surface mode remains solid |
| `expo-blur` | you want static frost on iOS, including content beneath iOS 26 Liquid Glass, or supported legacy Android frost | surfaces use their solid fill when no other material is available; browser frost/lenses, native Liquid Glass and the Android capture module remain independent |
| `expo-modules-core` | never by hand: every Expo app already provides it | Canvas's Android capture module is not linked (a React Native app without Expo), and surfaces use another supported material or the complete solid appearance |
| `expo-video` | you play clips with `Video` | the frame keeps its size and poster, labeled, and warns once in development |
| `expo-clipboard` | you want `CodeBlock` to copy text on native | web can use `navigator.clipboard`; native copying needs a supplied `onCopy` handler |
| `react-native-safe-area-context` | you want safe-area insets in Canvas shells, with your app's `SafeAreaProvider` | safe-area wrappers render as plain views without insets |

```bash
# add any subset you actually use
npm install react-native-qrcode-svg expo-video expo-glass-effect expo-blur expo-clipboard react-native-safe-area-context
```

### Android capture module

Canvas includes a native Android module (`android/`) that captures the backdrop behind
glass surfaces and frosts it on Android 12 and later. Expo links it into your app's
Android build automatically: rebuild the native app after installing or upgrading
Canvas (Expo Go cannot load it). It is built and verified with Expo SDK 57 and React
Native 0.86. An app on an older SDK, or one that does not want it, leaves the module out
of its native build with one line in its `package.json`:

```json
{ "expo": { "autolinking": { "exclude": ["@nannier/canvas"] } } }
```

Excluding it removes only this module, the only native code Canvas ships. Surfaces then
use `expo-blur`'s frost or their complete solid appearance, exactly as on a device where
the module is unavailable. iOS and the web are unaffected either way.

## Quick start

Wrap your app once in `ThemeProvider`, then compose components imported from `@nannier/canvas`. The provider supplies the active color scheme, surface, and token map to every component below it.

```jsx
import { ThemeProvider, Card, CardHeader, CardTitle, CardContent, Button } from "@nannier/canvas";

export default function App() {
  return (
    <ThemeProvider>
      <Card padded>
        <CardHeader>
          <CardTitle>Welcome to Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button primary large onPress={() => console.log("saved")}>
            Save
          </Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

That exact tree renders natively on iOS and Android and, through React Native Web, in the browser. There is no separate web component set to learn.

For a runnable application, follow the [packaged recipe onboarding](https://canvas.nannier.com/agents.md#start-a-project-with-an-available-cli). Check CLI availability in your installed release, then choose settings, dashboard or booking. Packaged recipes follow the npm package's LICENSE.



## Platforms

Canvas targets all three platforms from one install. The only thing that changes is which peers your app already provides.

- **Expo** apps use the required peers and any optional modules needed by their features. The docs app in this repository is a working Expo example, including native glass and blur modules.
- **Bare React Native** works the same way once the required peers are installed and linked (`react-native-svg` needs the usual autolinking / pod install). Add the optional peers if you want QRCode or full-fidelity glass.
- **Web via React Native Web** needs one bundler step: install `react-native-web` and alias `react-native` to `react-native-web`, exactly as any RNW project does. Web bundlers use the default `dist/index.js` entry. On the web you can also flip glass at runtime with the exported `setSurface("glass")` / `setSurface("solid")` DOM helper.

Metro selects `dist/native/index.js` through the `react-native` export condition
or legacy field. That compiled output preserves Metro's iOS and Android module
selection, including native material helpers. No custom Canvas resolver is needed
in consumer apps. Public declarations and the web ESM build remain in `dist/`.
`bun run dev` watches both outputs and syncs them to local consumer overlays.
`bun run verify-native-consumer` packs the build and bundles an isolated React
Native consumer for both platforms with all optional peers omitted. CI also runs
this check on the exact sealed tarball before it can be published.

Use the declarations installed with your dependency as the final API authority; this snapshot follows the source package version, not a registry lookup.
