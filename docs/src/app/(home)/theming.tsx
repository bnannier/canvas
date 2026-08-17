import { useState } from "react";
import { View, Text, ButtonGroup, useTheme } from "@nannier/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { H3, P, Rule, InlineCode } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";
import { CodeBlock } from "../../ui/code-block";
import { Callout } from "../../ui/tokens-kit";
import { geist } from "../../ui/fonts";
import { useDocsTheme } from "../../theme/docs-theme";

// Snippets ported verbatim (fence-stripped) from the previous web docs' theming snippets.
const NATIVE_PROVIDER = `import { ThemeProvider } from "@nannier/canvas";

// Wrap the app once. ThemeProvider follows the OS appearance by default;
// pass scheme to force one, and the glass boolean for the glass material.
export function App() {
  return (
    <ThemeProvider scheme="dark" glass>
      <Screens />
    </ThemeProvider>
  );
}`;
const USE_THEME = `import { useTheme } from "@nannier/canvas";

// Read the active theme anywhere under the provider.
const { scheme, surface, tokens, dark } = useTheme();
// scheme:  "light" | "dark"      surface: "solid" | "glass"
// tokens:  active color tokens   dark:    scheme === "dark"`;
const DARK_TOGGLE = `<!-- Light (default) -->
<html>

<!-- Dark -->
<html class="dark">`;
const JS_THEME = `import { getTheme, setTheme, toggleTheme } from "@nannier/canvas";

getTheme();        // "light" | "dark"
setTheme("dark");  // applies .dark to <html>, persists to localStorage
toggleTheme();     // switches and returns the new theme`;
const SYSTEM_PREF = `import { setTheme } from "@nannier/canvas";

// Web only. On native, ThemeProvider already follows the OS appearance.
const mq = window.matchMedia("(prefers-color-scheme: dark)");
setTheme(mq.matches ? "dark" : "light");
mq.addEventListener("change", (e) => setTheme(e.matches ? "dark" : "light"));`;
const GLASS = `<html data-surface="glass">
<html class="dark" data-surface="glass">`;
const JS_SURFACE = `import { getSurface, setSurface } from "@nannier/canvas";

getSurface();            // "solid" | "glass"
setSurface("glass");     // sets data-surface="glass"
setSurface("solid");     // removes the attribute`;
const DENSITY = `<!-- Regular (default, no attribute needed) -->
<html>

<!-- Compact -->
<html data-density="compact">

<!-- Comfy -->
<html data-density="comfy">`;
const JS_DENSITY = `import { getDensity, setDensity } from "@nannier/canvas";

getDensity();            // "compact" | "regular" | "comfy"
setDensity("compact");   // sets data-density="compact"
setDensity("regular");   // removes the attribute`;
const COMBINING = `<!-- Web: the three axes are independent HTML hooks -->
<html class="dark" data-surface="glass" data-density="compact">`;
const JS_COMBINE = `import { setTheme, setSurface, setDensity } from "@nannier/canvas";

setTheme("dark");
setSurface("glass");
setDensity("compact");`;

// Density levels in display order; the ButtonGroup index maps straight to this tuple.
const DENSITIES = ["compact", "regular", "comfy"] as const;

function Bullet({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Text style={{ fontFamily: geist("400"), fontSize: 14, lineHeight: 24, color: tokens["muted-foreground"] }}>•</Text>
      <Text style={{ flex: 1, fontFamily: geist("400"), fontSize: 14, lineHeight: 24, color: tokens["muted-foreground"] }}>{children}</Text>
    </View>
  );
}

export default function ThemingScreen() {
  const { scheme, surface, setScheme, setSurface } = useDocsTheme();
  const [density, setDensity] = useState<"compact" | "regular" | "comfy">("regular");

  return (
    <Page>
      <View style={{ gap: 28 }}>
        <PageHeader
          title="Theming"
          description="Three theming axes (light/dark, glass surface, density) on one model: ThemeProvider on native, the matching <html> hooks and helpers on the web."
        />

        <Section title="Native (ThemeProvider)">
          <P>
            On iOS and Android, wrap the app once in <InlineCode>ThemeProvider</InlineCode>. It follows the OS appearance by
            default; pass <InlineCode>scheme</InlineCode> (<InlineCode>"light"</InlineCode> or <InlineCode>"dark"</InlineCode>) to
            force one, and the <InlineCode>glass</InlineCode> boolean for the glass material. Like every Canvas axis it is a flat boolean: <InlineCode>glass</InlineCode> or <InlineCode>solid</InlineCode>, omit both for the platform default. No CSS and no <InlineCode>{"<html>"}</InlineCode>{" "}
            attributes are involved on native.
          </P>
          <CodeBlock code={NATIVE_PROVIDER} />
          <P>Read the active theme anywhere under the provider with <InlineCode>useTheme()</InlineCode>.</P>
          <CodeBlock code={USE_THEME} />
          <Callout label="Density on native">
            is a per-component choice, not a provider prop: pass a density boolean to the components that support it (for example
            {" <Card compact> or <Card comfortable>"}). The data-density hook below is the web equivalent.
          </Callout>
          <Callout label="Server rendering (SSR/SSG)">
            When the app server-renders (Next.js and the like) and the client scheme can differ from the server default (a stored
            preference, the OS), also pass <InlineCode>ssrScheme</InlineCode> with the scheme the server resolves. The provider
            repeats it for the hydration render so the HTML matches, then applies <InlineCode>scheme</InlineCode> after mount.
            Without it React keeps the server&apos;s inline colors on elements that never re-render, leaving components stuck in
            the server&apos;s scheme.
          </Callout>
        </Section>

        <Rule />

        <Section title="Light / Dark Mode">
          <P>
            Light mode is the default. On the web, dark mode is the <InlineCode>dark</InlineCode> class on <InlineCode>{"<html>"}</InlineCode>;
            the helpers toggle it and the token layer flips every color token, so components never change. (On native, pass{" "}
            <InlineCode>scheme</InlineCode> to <InlineCode>ThemeProvider</InlineCode> instead.)
          </P>
          <CodeBlock code={DARK_TOGGLE} />
          <View style={{ flexDirection: "row" }}>
            <ButtonGroup
              segmented
              small
              items={["Light", "Dark"]}
              active={scheme === "light" ? 0 : 1}
              onSelect={(i) => setScheme(i === 0 ? "light" : "dark")}
            />
          </View>
          <H3>Web helpers</H3>
          <CodeBlock code={JS_THEME} />
          <H3>Respecting system preference</H3>
          <P muted>On the web the helpers do not auto-detect <InlineCode>prefers-color-scheme</InlineCode>. Wire it yourself:</P>
          <CodeBlock code={SYSTEM_PREF} />
        </Section>

        <Rule />

        <Section title="Glass Surface">
          <P>
            Following Apple's Liquid Glass model, glass is the material for the functional layer: overlays (popovers, menus, dialogs,
            sheets) plus navbars and sidebars read as glass, while content surfaces (cards, lists, tables) stay solid ("don't use glass
            in the content layer"). It is a theming-level switch (the ThemeProvider swaps the popover surface token), not a per-component
            prop. Those functional-layer surfaces render through Canvas's GlassSurface primitive, which paints the real material per
            platform: Apple's native Liquid Glass on iOS 26+ (via expo-glass-effect), a real lens on Chromium browsers (an SVG
            displacement filter that refracts the backdrop at the rim, where the glass bends most; the centre stays optically flat), a
            genuine frosted blur on non-Chromium web and Android (via expo-blur), and a translucent fallback when no material is
            available. It defaults to the platform:{" "}
            glass on iOS 26+ (matching the OS) and solid everywhere else, when you pass neither boolean. Force it with <InlineCode>glass</InlineCode> /{" "}
            <InlineCode>solid</InlineCode> on <InlineCode>ThemeProvider</InlineCode> on native, or <InlineCode>data-surface="glass"</InlineCode> on{" "}
            <InlineCode>{"<html>"}</InlineCode> on the web.
          </P>
          <CodeBlock code={GLASS} />
          <View style={{ flexDirection: "row" }}>
            <ButtonGroup
              segmented
              small
              items={["Solid", "Glass"]}
              active={surface === "solid" ? 0 : 1}
              onSelect={(i) => setSurface(i === 0 ? "solid" : "glass")}
            />
          </View>
          <H3>What changes</H3>
          <View style={{ gap: 4 }}>
            <Bullet>Functional-layer surfaces (overlays, navbars, sidebars) render the glass material via GlassSurface: native Liquid Glass on iOS 26+, an SVG displacement lens on Chromium web, a frosted blur elsewhere on web and on Android; content cards, lists, and tables stay solid</Bullet>
            <Bullet>Border colors shift to white-alpha edges</Bullet>
            <Bullet>On the web, the body background becomes a multi-color aurora gradient that the frosted surfaces refract</Bullet>
          </View>
          <H3>Web helpers</H3>
          <CodeBlock code={JS_SURFACE} />
        </Section>

        <Rule />

        <Section title="Density">
          <P>
            Density controls spacing in content areas and data tables. Three levels: compact, regular (default), and comfy. On the web
            it is the <InlineCode>data-density</InlineCode> attribute, which your content CSS and the <InlineCode>data-density</InlineCode>-aware
            components key off; on native, components expose per-component density props (for example {"<Card compact>"}).
          </P>
          <CodeBlock code={DENSITY} />
          <View style={{ flexDirection: "row" }}>
            <ButtonGroup
              segmented
              small
              items={["Compact", "Regular", "Comfy"]}
              active={DENSITIES.indexOf(density)}
              onSelect={(i) => setDensity(DENSITIES[i])}
            />
          </View>
          <P muted>The buttons set <InlineCode>data-density</InlineCode> on this page on the web; on native, density is a per-component prop.</P>
          <H3>Web helpers</H3>
          <CodeBlock code={JS_DENSITY} />
        </Section>

        <Rule />

        <Section title="Combining Axes">
          <P>
            All three axes are independent and composable. On the web they are three separate <InlineCode>{"<html>"}</InlineCode> hooks;
            on native, scheme and surface are <InlineCode>ThemeProvider</InlineCode> props and density is per component.
          </P>
          <CodeBlock code={COMBINING} />
          <CodeBlock code={JS_COMBINE} />
        </Section>

        <PageNav />
      </View>
    </Page>
  );
}
