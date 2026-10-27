import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ThemeProvider, useTheme, type ThemeValue } from "../src/style/theme.tsx";
import { Text, TextInput, fontStyle } from "../src/style/text.tsx";
import { resolveFontFace, weightKey, typeface, type ThemeFonts } from "../src/style/fonts.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { colorsFor } from "../src/style/tokens.ts";
import { Button } from "../src/atoms/button/button.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { Stepper as IosStepper } from "../src/atoms/stepper/stepper.ios.tsx";
import { Stepper as AndroidStepper } from "../src/atoms/stepper/stepper.android.tsx";

afterEach(cleanup);

// The faces an app registers per weight (the expo-google-fonts shape), plus a mono set.
// Family names carry no spaces: a computed style quotes a name that has one.
const FACES: ThemeFonts = {
  sans: { "400": "InstrumentSans_400Regular", "500": "InstrumentSans_500Medium", "700": "InstrumentSans_700Bold", "800": "InstrumentSans_800ExtraBold" },
  mono: { "400": "JetBrainsMono_400Regular" },
  display: { "500": "BricolageGrotesque_500Medium", "600": "BricolageGrotesque_600SemiBold" },
};
// Module constants, the way the docs tell apps to pass `fonts` (a stable reference).
const BRAND_SANS: ThemeFonts = { sans: "BrandSans" };
const OTHER_SANS: ThemeFonts = { sans: "OtherSans" };
const MONO_ONLY: ThemeFonts = { mono: "BrandMono" };
const SYSTEM_FACE: ThemeFonts = {};
const BRAND_TOKENS = { primary: "#123456" };

const family = (text: string) => getComputedStyle(screen.getByText(text)).fontFamily;

// Records the theme a subtree resolved, keyed by name.
const seen: Record<string, ThemeValue> = {};
function Probe({ name }: { name: string }) {
  seen[name] = useTheme();
  return null;
}

describe("weightKey", () => {
  it("normalizes every RN weight spelling onto the hundreds", () => {
    expect(weightKey(undefined)).toBe("400");
    expect(weightKey("normal")).toBe("400");
    expect(weightKey("bold")).toBe("700");
    expect(weightKey("600")).toBe("600");
    expect(weightKey(550)).toBe("600");
    expect(weightKey("950")).toBe("900");
  });
});

describe("resolveFontFace", () => {
  it("leaves the style alone when nothing was registered", () => {
    expect(resolveFontFace(undefined, "500")).toBeNull();
    expect(resolveFontFace({}, "500")).toBeNull();
  });

  it("returns one family verbatim and keeps the weight on the style", () => {
    expect(resolveFontFace("InstrumentSans", "700")).toEqual({ fontFamily: "InstrumentSans", dropWeight: false });
  });

  it("picks the registered face for the weight and drops the weight", () => {
    expect(resolveFontFace(FACES.sans, "500")).toEqual({ fontFamily: "InstrumentSans_500Medium", dropWeight: true });
  });

  it("falls to the nearest registered weight, heavier on a tie", () => {
    // 600 sits between 500 and 700: the heavier face reads as emphasis.
    expect(resolveFontFace(FACES.sans, "600")?.fontFamily).toBe("InstrumentSans_700Bold");
    // 300 has only heavier neighbours.
    expect(resolveFontFace(FACES.sans, "300")?.fontFamily).toBe("InstrumentSans_400Regular");
    // 900 has only lighter neighbours.
    expect(resolveFontFace(FACES.sans, "900")?.fontFamily).toBe("InstrumentSans_800ExtraBold");
  });
});

describe("fontStyle", () => {
  it("passes the style through untouched when the theme registered no faces", () => {
    const style = { fontSize: 14, fontWeight: "500" as const };
    expect(fontStyle(style, {})).toBe(style);
  });

  it("applies the sans face for the style's weight and removes the weight", () => {
    expect(fontStyle([{ fontSize: 14 }, { fontWeight: "500" }], FACES)).toEqual({ fontSize: 14, fontFamily: "InstrumentSans_500Medium" });
  });

  it("keeps the weight when one family carries every weight", () => {
    expect(fontStyle({ fontWeight: "700" }, { sans: "InstrumentSans" })).toEqual([{ fontWeight: "700" }, { fontFamily: "InstrumentSans" }]);
  });

  it("substitutes the mono face where the kit asked for MONO_FONT, and only there", () => {
    expect(fontStyle({ fontFamily: MONO_FONT, fontSize: 13 }, FACES)).toEqual({ fontSize: 13, fontFamily: "JetBrainsMono_400Regular" });
    // A caller's own explicit family is theirs.
    expect(fontStyle({ fontFamily: "Comic Sans" }, FACES)).toEqual({ fontFamily: "Comic Sans" });
    // No mono registered: the kit's alias stands.
    expect(fontStyle({ fontFamily: MONO_FONT }, { sans: "InstrumentSans" })).toEqual({ fontFamily: MONO_FONT });
  });
});

describe("the themed primitives", () => {
  it("render every kit label in the registered face, from ThemeProvider fonts alone", () => {
    render(
      <ThemeProvider fonts={FACES}>
        <Text style={{ fontWeight: "700" }}>Plain</Text>
        <Button primary>Save</Button>
        <Typography h2>Title</Typography>
        <Typography code>--primary</Typography>
        <TextInput value="typed" onChangeText={() => {}} style={{ fontSize: 16 }} />
      </ThemeProvider>,
    );
    expect(getComputedStyle(screen.getByText("Plain")).fontFamily).toBe("InstrumentSans_700Bold");
    expect(getComputedStyle(screen.getByText("Plain")).fontWeight).not.toBe("700");
    // The call to action's label weight (the hand-off's 500) resolves to the registered face of that weight.
    expect(getComputedStyle(screen.getByText("Save")).fontFamily).toBe("InstrumentSans_500Medium");
    // Typography titles are medium display-face titles in the v4 scale: the h2 role asks for
    // DISPLAY_FONT at 500 and gets the registered display face.
    expect(getComputedStyle(screen.getByText("Title")).fontFamily).toBe("BricolageGrotesque_500Medium");
    // The code role asks for MONO_FONT and gets the registered mono face.
    expect(getComputedStyle(screen.getByText("--primary")).fontFamily).toBe("JetBrainsMono_400Regular");
    expect(getComputedStyle(screen.getByDisplayValue("typed")).fontFamily).toBe("InstrumentSans_400Regular");
  });

  it("paint a field's own value in the registered face: Stepper's number on every skin", () => {
    for (const [skin, Component] of [["web", Stepper], ["ios", IosStepper], ["android", AndroidStepper]] as const) {
      render(<ThemeProvider fonts={FACES}><Component label={`${skin} quantity`} defaultValue={30} /></ThemeProvider>);
      expect(getComputedStyle(screen.getByDisplayValue("30")).fontFamily, skin).toBe("InstrumentSans_400Regular");
      cleanup();
    }
  });

  it("render in the system face when no fonts are passed, as before", () => {
    render(<ThemeProvider><Text>Plain</Text></ThemeProvider>);
    expect(getComputedStyle(screen.getByText("Plain")).fontFamily).not.toContain("InstrumentSans");
  });

  it("name the brand faces the app is expected to register", () => {
    expect(typeface).toEqual({ sans: "Instrument Sans", display: "Bricolage Grotesque", mono: "JetBrains Mono" });
  });
});

// The faces are an app-level registration, so a nested provider that omits `fonts`
// keeps the nearest parent's; everything else (tokens, scheme, palette, surface)
// stays per provider, as before.
describe("nested providers", () => {
  it("keep the parent's faces when they omit fonts, whatever their own axes", () => {
    render(
      <ThemeProvider fonts={FACES}>
        <ThemeProvider dark mint glass>
          <Probe name="inner" />
          <Text style={{ fontWeight: "700" }}>Inner</Text>
          <Button primary>Save</Button>
          <Typography code>--inner</Typography>
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(family("Inner")).toBe("InstrumentSans_700Bold");
    expect(family("Save")).toBe("InstrumentSans_500Medium");
    // The whole map inherits, the mono role included.
    expect(family("--inner")).toBe("JetBrainsMono_400Regular");
    expect(seen.inner?.fonts).toBe(FACES);
    expect(seen.inner?.scheme).toBe("dark");
  });

  it("inherit through several levels from the nearest provider that passed fonts", () => {
    render(
      <ThemeProvider fonts={FACES}>
        <ThemeProvider light>
          <ThemeProvider glass>
            <Text>Deep</Text>
          </ThemeProvider>
        </ThemeProvider>
        <ThemeProvider fonts={BRAND_SANS}>
          <ThemeProvider dark>
            <Text>Nearest</Text>
          </ThemeProvider>
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(family("Deep")).toBe("InstrumentSans_400Regular");
    expect(family("Nearest")).toBe("BrandSans");
  });

  it("let an explicit fonts win, and an empty map return the subtree to the system face", () => {
    render(
      <ThemeProvider fonts={FACES}>
        <ThemeProvider fonts={BRAND_SANS}>
          <Text>Explicit</Text>
        </ThemeProvider>
        <ThemeProvider fonts={SYSTEM_FACE}>
          <Probe name="optOut" />
          <Text>System</Text>
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(family("Explicit")).toBe("BrandSans");
    expect(family("System")).not.toContain("InstrumentSans");
    expect(seen.optOut?.fonts).toBe(SYSTEM_FACE);
  });

  it("replace the inherited map wholesale with a partial one, never merging the roles", () => {
    render(
      <ThemeProvider fonts={FACES}>
        <ThemeProvider fonts={MONO_ONLY}>
          <Text>Plain</Text>
          <Typography code>--mono</Typography>
        </ThemeProvider>
      </ThemeProvider>,
    );
    // The nested map names no sans, so plain text is back in the system face.
    expect(family("Plain")).not.toContain("InstrumentSans");
    expect(family("--mono")).toBe("BrandMono");
  });

  it("give the root without a parent an empty map", () => {
    render(
      <ThemeProvider dark>
        <Probe name="root" />
        <Text>Root</Text>
      </ThemeProvider>,
    );
    expect(seen.root?.fonts).toEqual({});
    expect(family("Root")).not.toContain("InstrumentSans");
  });

  it("follow the parent's fonts when they change, and keep their value when only the parent's axes change", () => {
    const tree = (fonts: ThemeFonts, dark: boolean) => (
      <ThemeProvider fonts={fonts} dark={dark} light={!dark}>
        <ThemeProvider solid light>
          <Probe name="live" />
          <Text>Live</Text>
        </ThemeProvider>
      </ThemeProvider>
    );
    const { rerender } = render(tree(FACES, false));
    const first = seen.live;
    expect(family("Live")).toBe("InstrumentSans_400Regular");
    // A parent scheme flip re-creates no nested value: the memo keys on the resolved faces.
    rerender(tree(FACES, true));
    expect(seen.live).toBe(first!);
    rerender(tree(OTHER_SANS, true));
    expect(family("Live")).toBe("OtherSans");
    expect(seen.live?.fonts).toBe(OTHER_SANS);
  });

  it("follow their own fonts as they toggle between set and unset", () => {
    const tree = (fonts?: ThemeFonts) => (
      <ThemeProvider fonts={FACES}>
        <ThemeProvider dark fonts={fonts}>
          <Probe name="toggled" />
          <Text>Toggled</Text>
        </ThemeProvider>
      </ThemeProvider>
    );
    const { rerender } = render(tree(BRAND_SANS));
    expect(family("Toggled")).toBe("BrandSans");
    rerender(tree(undefined));
    expect(family("Toggled")).toBe("InstrumentSans_400Regular");
    expect(seen.toggled?.fonts).toBe(FACES);
    rerender(tree(BRAND_SANS));
    expect(family("Toggled")).toBe("BrandSans");
    rerender(tree(SYSTEM_FACE));
    expect(family("Toggled")).not.toContain("InstrumentSans");
    rerender(tree(undefined));
    expect(family("Toggled")).toBe("InstrumentSans_400Regular");
  });

  it("do not inherit the parent's tokens", () => {
    render(
      <ThemeProvider fonts={FACES} light tokens={BRAND_TOKENS}>
        <Probe name="outer" />
        <ThemeProvider light>
          <Probe name="nested" />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(seen.outer?.tokens.primary).toBe(BRAND_TOKENS.primary);
    expect(seen.nested?.fonts).toBe(FACES);
    expect(seen.nested?.tokens.primary).toBe(colorsFor("blush", "light").primary);
  });

  it("server-render the inherited faces", () => {
    function Faces() {
      return <Text>{`faces:${JSON.stringify(useTheme().fonts)}`}</Text>;
    }
    const html = renderToString(
      <ThemeProvider fonts={FACES}>
        <ThemeProvider dark ssrScheme="light">
          <Faces />
          <Text>Server</Text>
        </ThemeProvider>
      </ThemeProvider>,
    );
    // Fonts do not depend on the hydration state: the server pass already has them.
    expect(html).toContain("InstrumentSans_400Regular");
    expect(html).toContain("JetBrainsMono_400Regular");
  });
});
