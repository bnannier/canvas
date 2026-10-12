import { Column } from "@nannier/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, H3, InlineCode, Rule, BulletList } from "../../ui/prose";
import { CodeBlock } from "../../ui/code-block";
import { PageNav } from "../../ui/page-nav";

const INSTALL = `npm install @nannier/canvas react react-native react-native-svg`;

const OPTIONAL_INSTALL = `# add only the ones whose feature you use
npm install react-native-qrcode-svg expo-video react-native-safe-area-context expo-blur expo-glass-effect expo-clipboard

# Android 12+ capture support in an Expo SDK 57 native build
npm install @nannier/canvas-blur`;

const QUICK_START = `import { ThemeProvider, Button } from "@nannier/canvas";

// Wrap the app once in ThemeProvider; it follows the OS appearance by default
// (pass the dark or light boolean to force one). Components are React Native, so
// style them with Canvas's semantic boolean props.
export function App() {
  return (
    <ThemeProvider>
      <Button primary large>Save</Button>
    </ThemeProvider>
  );
}`;

const OVERLAY_HOST = `import { OverlayProvider, ThemeProvider } from "@nannier/canvas";

// One overlay host at the app's root: inside ThemeProvider, outside any scroller.
// It fills the window by default, so menus, popovers and sheets render above the
// whole page in its outlet.
export function App() {
  return (
    <ThemeProvider>
      <OverlayProvider>
        <Screens />
      </OverlayProvider>
    </ThemeProvider>
  );
}`;

const NATIVE_MODAL = `import { Modal } from "react-native";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Column,
  GlassModalBlurTarget, OverlayProvider,
} from "@nannier/canvas";

// Your own React Native Modal, in Drawer's order: the bridge directly inside the
// Modal's content, then an overlay host for the Modal's own window, then the content.
export function ReceiptSent({ open, onClose }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <GlassModalBlurTarget>
        <OverlayProvider separateWindow>
          <Column fill center pad>
            <Card>
              <CardHeader>
                <CardTitle>Receipt sent</CardTitle>
              </CardHeader>
              <CardContent>
                <Button primary onPress={onClose}>Done</Button>
              </CardContent>
            </Card>
          </Column>
        </OverlayProvider>
      </GlassModalBlurTarget>
    </Modal>
  );
}`;

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // react-native-web reads these globals.
  define: { __DEV__: "true", global: "globalThis" },
  resolve: {
    // The single line that makes Canvas run in the browser.
    alias: { "react-native": "react-native-web" },
    // Prefer .web.* implementations (react-native-svg ships them).
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
  optimizeDeps: {
    include: ["react-native-web", "react-native-svg"],
    esbuildOptions: {
      resolveExtensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
    },
  },
});`;

const WEB_ENTRY = `import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@nannier/canvas";
// The CSS token layer: plain custom properties, no build step. Carries the
// .dark scheme hook and the [data-platform] skin hook, for the DOM theme
// helpers and any custom CSS you write with var().
import "@nannier/canvas/styles/canvas.css";
import { App } from "./app";
import { useHtmlScheme } from "./use-html-scheme";

function Root() {
  // Keep the RN ThemeProvider in sync with the <html> theme (see the hook below).
  const scheme = useHtmlScheme();
  return (
    <ThemeProvider scheme={scheme}>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);`;

const SCHEME_HOOK = `import { useSyncExternalStore } from "react";

// setTheme() toggles <html class="dark">. Mirror that class into the value the
// ThemeProvider consumes, so the React Native components re-theme with the page.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export function useHtmlScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}`;

const THEME_API = `import { setTheme, toggleTheme, setSurface, setDensity } from "@nannier/canvas";

setTheme("dark");       // toggles <html class="dark"> (the class the CSS reads) and persists
toggleTheme();          // flips light <-> dark, returns the next theme
setSurface("glass");    // persists, stamps <html data-surface="glass">  (solid is the default)
setDensity("compact");  // persists, stamps <html data-density="compact"> (regular is the default)`;

const TOKEN = `import { token, hsl } from "@nannier/canvas";

// Web only: reads a CSS custom property off <html>, so it reflects the live theme.
// Requires canvas.css to be loaded; on native, theme values come from ThemeProvider.
token("primary");     // "oklch(0.511 0.262 276.966)"
token("radius-md");   // "6px"

// Color tokens are complete oklch colors. The hsl() helper (the name is
// historical) passes them through untouched; give it an alpha for a
// translucent variant, mixed the same way the token layer does it:
hsl("primary", 0.5);  // "color-mix(in oklab, oklch(0.511 0.262 276.966) 50%, transparent)"`;

const BUILDING = `import { Alert, Button, Column, Typography } from "@nannier/canvas";

// Compose existing kit components with their semantic APIs.
export function AccountNotice({ onReview }) {
  return (
    <Alert info title="Review your account">
      <Column snug>
        <Typography small>Keep your contact details up to date.</Typography>
        <Button small onPress={onReview}>Review details</Button>
      </Column>
    </Alert>
  );
}`;

const EXPORTS = [
  {
    path: "@nannier/canvas",
    content:
      "Components, the style foundation (ThemeProvider, useTheme, useResponsive, shadow, alpha, and the View / Text / Pressable / TextInput / ScrollView primitives), and the token / theme utilities. Ships as compiled JavaScript with TypeScript declarations.",
  },
  {
    path: "@nannier/canvas/styles/canvas.css",
    content:
      "The CSS token layer: plain custom properties, plus the .dark scheme hook and the [data-platform] skin hook. Web only, no build step.",
  },
];

export default function IntegrationScreen() {
  return (
    <Page>
      <Column loose>
        <PageHeader
          title="Integration"
          description="Consume Canvas, a universal React Native UI kit, on native and on the web."
        />

        <Section title="Installation">
          <P muted>
            Canvas is published as <InlineCode>@nannier/canvas</InlineCode> and lists{" "}
            <InlineCode>react</InlineCode>, <InlineCode>react-native</InlineCode>, and{" "}
            <InlineCode>react-native-svg</InlineCode> as peer dependencies.
          </P>
          <CodeBlock code={INSTALL} />
        </Section>

        <Rule />

        <Section title="Optional peers">
          <P muted>
            These back specific features. Skip any you don't use; Canvas still works and degrades gracefully.
          </P>
          <P muted>
            <InlineCode>react-native-qrcode-svg</InlineCode>: renders the <InlineCode>QRCode</InlineCode> component;
            without it, <InlineCode>QRCode</InlineCode> shows an empty labeled frame.
          </P>
          <P muted>
            <InlineCode>expo-video</InlineCode>: plays clips in the <InlineCode>Video</InlineCode> component (a native
            module: rebuild the app after installing it). Without it, <InlineCode>Video</InlineCode> keeps its size and
            poster in a labeled frame.
          </P>
          <P muted>
            <InlineCode>expo-glass-effect</InlineCode>: native Liquid Glass for eligible functional surfaces on supported
            iOS 26+. Without it, shared rendering uses available frost or the complete opaque solid skin.
          </P>
          <P muted>
            <InlineCode>expo-blur</InlineCode>: static frost on iOS, including content below iOS 26 Liquid Glass, and
            supported legacy Android frost. The browser frost is built in and does not need this peer.
          </P>
          <P muted>
            <InlineCode>@nannier/canvas-blur</InlineCode>: optional Android 12+ capture and frost for Expo SDK 57 native
            builds, sampling a safe live backdrop: the page behind an overlay or a native Modal (see Overlay hosting).
            Install it in the native app and rebuild so Expo autolinks the module. Capture runs only while needed.
            Missing or unsafe material restores the complete opaque solid skin.
          </P>
          <P muted>
            <InlineCode>react-native-safe-area-context</InlineCode>: safe-area insets for the overlays that use them
            (Drawer, sheets); without it, they fall back to fixed insets.
          </P>
          <P muted>
            <InlineCode>expo-clipboard</InlineCode>: backs the <InlineCode>CodeBlock</InlineCode> copy chip on native;
            the web covers copy with <InlineCode>navigator.clipboard</InlineCode> either way.
          </P>
          <CodeBlock code={OPTIONAL_INSTALL} />
        </Section>

        <Rule />

        <Section title="Quick start">
          <P muted>
            Wrap the app once in <InlineCode>ThemeProvider</InlineCode> and use the components. This is the whole usage
            API, and it is the same code on iOS, Android, and the web, the component props never change per platform. On
            native (Expo or React Native CLI) it is all you need beyond your normal RN bundler; the web adds two setup
            steps, the <InlineCode>react-native-web</InlineCode> alias and <InlineCode>canvas.css</InlineCode>, shown
            below.
          </P>
          <CodeBlock code={QUICK_START} />
        </Section>

        <Rule />

        <Section title="Overlay hosting">
          <P muted>
            Mount one <InlineCode>OverlayProvider</InlineCode> inside <InlineCode>ThemeProvider</InlineCode> at the
            app's root, outside any scroller. It fills the window by default, and menus, selects, popovers and other
            floating content render above the whole page in its outlet, placed against the window. Without one, they
            render inline where they are declared. On Android with <InlineCode>@nannier/canvas-blur</InlineCode>, the
            root provider's page content is also the capture plane that glass overlays and native modals sample for
            their frost; a provider that does not fill its window has none, and glass there keeps its solid skin.
          </P>
          <CodeBlock code={OVERLAY_HOST} />
          <H3>Native modals</H3>
          <P muted>
            A React Native <InlineCode>Modal</InlineCode> is a native window of its own on Android, outside the root
            provider's page. <InlineCode>GlassModalBlurTarget</InlineCode> is the bridge that hands that page to the
            Modal, so the glass inside it frosts the page behind the Modal. Canvas <InlineCode>Drawer</InlineCode> and{" "}
            <InlineCode>ActionSheet</InlineCode> use it already. An app hosting its own Modal wraps the Modal's
            content in it; it renders no view of its own.
          </P>
          <CodeBlock code={NATIVE_MODAL} />
          <BulletList
            subtle
            items={[
              "Put it directly inside the Modal's content, outside the Modal's own OverlayProvider separateWindow, which gives the menus and popovers inside the Modal a host in its window",
              "It frosts on Android 12 or newer with @nannier/canvas-blur in an Expo SDK 57 native build, under an app-root OverlayProvider that fills the window. iOS (Liquid Glass and its frost) and the web (a backdrop filter) need no plane, so there it provides nothing, as it does on Android with no root provider: the Modal's surfaces render as they would without it",
              "It belongs only in a Modal. Placed in the main window, around page content or in a react-native-screens or expo-router modal screen (which shares the main window on Android), it hands its surfaces the plane they sit inside, which can never be sampled: @nannier/canvas-blur 0.2 or newer reports that, and every surface under the bridge keeps its complete solid skin (an older module shows a tint with no blur)",
              "On Android a Modal's frost samples the outermost OverlayProvider's page content only. It leaves out what is stacked above the page: the root outlet's toasts and pinned cards, any Modal beneath (a drawer opened from a drawer frosts the page, not the first drawer) and the Modal's own scrim and surfaces. iOS and the web blur the whole stack behind the Modal",
            ]}
          />
          <H3>Accessibility</H3>
          <P muted>
            The bridge adds nothing to the accessibility tree: the Modal's content reaches VoiceOver, TalkBack and
            the keyboard exactly as without it. The Modal's own semantics stay yours to give: its{" "}
            <InlineCode>onRequestClose</InlineCode> for Android's Back and the Escape key, and{" "}
            <InlineCode>accessibilityViewIsModal</InlineCode> so VoiceOver ignores the page behind it, as Drawer and
            ActionSheet set them. Reduce Transparency and Increase Contrast give every surface inside the Modal its
            opaque skin, as they do in the page.
          </P>
        </Section>

        <Rule />

        <Section title="Web setup: react-native-web">
          <P muted>
            The component code above does not change on the web; this is build configuration only. In the browser Canvas
            runs through react-native-web, so alias <InlineCode>react-native</InlineCode> to{" "}
            <InlineCode>react-native-web</InlineCode> in your bundler. Here is a Vite config (Metro and webpack take the
            same alias). <InlineCode>canvas.css</InlineCode> needs no plugin: it is plain CSS that any bundler resolves
            (next section).
          </P>
          <CodeBlock code={VITE_CONFIG} />
        </Section>

        <Rule />

        <Section title="Theming on the web">
          <P muted>
            Components theme themselves through <InlineCode>ThemeProvider</InlineCode> (they read the active scheme's
            tokens with <InlineCode>useTheme</InlineCode>). On the web you also import the CSS token layer so the DOM
            theme helpers and any custom CSS you write stay in sync. The helpers toggle attributes on{" "}
            <InlineCode>&lt;html&gt;</InlineCode>; a small hook mirrors the <InlineCode>.dark</InlineCode> class back into
            the provider so the React Native components follow the page.
          </P>
          <CodeBlock code={WEB_ENTRY} />
          <H3>The scheme-sync hook</H3>
          <CodeBlock code={SCHEME_HOOK} />
          <H3>Theme, surface, density helpers</H3>
          <P muted>
            <InlineCode>setTheme</InlineCode> and <InlineCode>toggleTheme</InlineCode> toggle the{" "}
            <InlineCode>.dark</InlineCode> class to update the CSS color tokens. <InlineCode>setSurface</InlineCode> and
            <InlineCode>setDensity</InlineCode> persist preferences and set the CSS handoff attributes for material mode,
            page backdrop, and supported card/table spacing. Read the choices back
            (<InlineCode>getSurface</InlineCode>, <InlineCode>getDensity</InlineCode>) and sync them into your{" "}
            <InlineCode>ThemeProvider</InlineCode> and component props, the way the hook above syncs the scheme. All four
            are web-only (they touch <InlineCode>document</InlineCode> and <InlineCode>localStorage</InlineCode>).
          </P>
          <CodeBlock code={THEME_API} />
        </Section>

        <Rule />

        <Section title="Reading tokens (web)">
          <P muted>
            <InlineCode>token()</InlineCode> reads the live computed value of a CSS custom property off{" "}
            <InlineCode>document.documentElement</InlineCode>, so it reflects the current theme. It needs{" "}
            <InlineCode>canvas.css</InlineCode> loaded and is web-only; on native, read theme values from{" "}
            <InlineCode>useTheme()</InlineCode> instead.
          </P>
          <CodeBlock code={TOKEN} />
        </Section>

        <Rule />

        <Section title="Building on Canvas">
          <P>
            Compose existing Canvas components and use their semantic boolean props.
            Use Row, Column, Container, and Grid for arrangement. If a component lacks
            a real functional capability, extend it in the kit so every consumer gets
            the same behavior, accessibility, and platform skin.
          </P>
          <CodeBlock code={BUILDING} />
        </Section>

        <Rule />

        <Section title="Package exports">
          {EXPORTS.map((e) => (
            <Column key={e.path} tight>
              <P>
                <InlineCode>{e.path}</InlineCode>
              </P>
              <P muted>{e.content}</P>
            </Column>
          ))}
        </Section>

        <PageNav />
      </Column>
    </Page>
  );
}
