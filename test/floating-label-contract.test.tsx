import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import { AccessibilityInfo, Animated, type TextStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsByScheme } from "../src/style/tokens.ts";
import type { ThemeFonts } from "../src/style/fonts.ts";
import { FLOAT, FLOAT_EASING } from "../src/style/motion.ts";
import type { FloatingLabelStyles } from "../src/style/floating-label.tsx";
import { Input } from "../src/atoms/input/input.android.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Select } from "../src/atoms/select/select.android.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { androidSkin as inputSkin } from "../src/atoms/input/input.styles.ts";
import { androidSkin as textareaSkin } from "../src/atoms/textarea/textarea.styles.ts";
import { androidSkin as selectSkin } from "../src/atoms/select/select.styles.ts";
import { androidSkin as autocompleteSkin } from "../src/atoms/autocomplete/autocomplete.styles.ts";

// FloatingLabel's own contract (src/style/floating-label.tsx), beside its consumers' tests
// (floating-label-color, floating-label-parity): where the Android float rests and lands, that
// Reduce Motion jumps instead of animating, the float's timings, the floated server frame.
// Every field family renders it only on its Android skin, which react-native-web renders here.

afterEach(cleanup);

const t = colorsByScheme.light;
const num = (value: unknown, fallback: number) => (typeof value === "number" ? value : fallback);

/** The label's transform as rendered: the translateY and scale of the view that floats it. */
function floatOf(label: string): { translateY: number; scale: number } {
  const transform = screen.getByText(label).parentElement!.style.transform;
  const translateY = Number(/translateY\((-?[\d.]+)px\)/.exec(transform)?.[1] ?? "0");
  const scale = Number(/scale\(([\d.]+)\)/.exec(transform)?.[1] ?? "1");
  return { translateY, scale };
}

/**
 * Where a skin's floated label lands, derived from the skin's own numbers: the label renders
 * at its resting type and scales to the floated size; floated, its bottom edge sits on the
 * reserve, where the value begins; at rest it is centered in a single-line field, or on the
 * first value line of a multiline one.
 */
function expectedFloat<S extends string>(skin: FloatingLabelStyles<S>, size: S, height: number, multiline = false) {
  const rest = skin.labelRest!(t, size) as TextStyle;
  const scale = num((skin.labelFloated!(t, size) as TextStyle).fontSize, 0) / num(rest.fontSize, 0);
  const line = num(rest.lineHeight, 0);
  const reserve = num((skin.labelReserve!(size) as TextStyle).paddingTop, 0);
  const restCenter = multiline ? reserve + line / 2 : height / 2;
  return { translateY: reserve - (line * scale) / 2 - restCenter, scale };
}

const heightOf = (style: { height?: unknown; minHeight?: unknown }) => num(style.minHeight ?? style.height, 0);

type Case = { name: string; label: string; size: string; ui: ReactElement; expected: { translateY: number; scale: number } };
const sizeProps = (size: string) => ({ small: size === "small", large: size === "large" });

// Every Android field family at every size, holding a value and unfocused: floated.
const FILLED: Case[] = [
  ...(["small", "base", "large"] as const).map((size) => ({
    name: `Input ${size}`, label: `Input ${size}`, size,
    ui: <Input label={`Input ${size}`} defaultValue="Ada" {...sizeProps(size)} />,
    expected: expectedFloat(inputSkin, size, heightOf(inputSkin.bareBox(size))),
  })),
  ...(["small", "default", "large"] as const).map((size) => ({
    name: `Select ${size}`, label: `Select ${size}`, size,
    ui: <Select label={`Select ${size}`} options={["EU", "US"]} value="EU" {...sizeProps(size)} />,
    expected: expectedFloat(selectSkin, size, heightOf(selectSkin.trigger(t, size, false))),
  })),
  ...(["small", "default", "large"] as const).map((size) => ({
    name: `Autocomplete ${size}`, label: `Autocomplete ${size}`, size,
    ui: <Autocomplete label={`Autocomplete ${size}`} options={["Ada", "Grace"]} defaultValue="Ada" {...sizeProps(size)} />,
    expected: expectedFloat(autocompleteSkin, size, heightOf(autocompleteSkin.field(t, size, false))),
  })),
  ...(["small", "default", "large"] as const).map((size) => ({
    name: `Textarea ${size}`, label: `Textarea ${size}`, size,
    ui: <Textarea label={`Textarea ${size}`} defaultValue="Notes" rows={3} {...sizeProps(size)} />,
    expected: expectedFloat(textareaSkin, size, 0, true),
  })),
];

const close = (actual: { translateY: number; scale: number }, expected: { translateY: number; scale: number }) => {
  expect(actual.translateY).toBeCloseTo(expected.translateY, 3);
  expect(actual.scale).toBeCloseTo(expected.scale, 3);
};

describe("the float's geometry", () => {
  for (const { name, label, ui, expected } of FILLED) {
    it(`${name}: a filled field mounts floated, its label's bottom on the reserve`, () => {
      render(<ThemeProvider light>{ui}</ThemeProvider>);
      close(floatOf(label), expected);
    });
  }

  it("an empty field rests unscaled where the skin centers it, and floats on focus", () => {
    render(<ThemeProvider light><Input label="Email" /></ThemeProvider>);
    expect(floatOf("Email")).toEqual({ translateY: 0, scale: 1 });
    act(() => fireEvent.focus(screen.getByLabelText("Email")));
    close(floatOf("Email"), expectedFloat(inputSkin, "base", heightOf(inputSkin.bareBox("base"))));
  });

  it("a server render paints a filled field's label floated, so hydration does not move it", () => {
    const html = renderToString(<ThemeProvider light><Input label="Email" defaultValue="ada@example.com" /></ThemeProvider>);
    const { translateY, scale } = expectedFloat(inputSkin, "base", heightOf(inputSkin.bareBox("base")));
    expect(html).toContain(`transform:translateY(${translateY}px) scale(${scale})`);
    const empty = renderToString(<ThemeProvider light><Input label="Email" /></ThemeProvider>);
    expect(empty).toContain("transform:translateY(0px) scale(1)");
  });
});

describe("the float's motion", () => {
  it("runs both timings from the motion tunables: the move on the native driver where there is one, the tint on the JS driver", () => {
    render(<ThemeProvider light><Input label="Email" /></ThemeProvider>);
    const timing = spyOn(Animated, "timing");
    try {
      act(() => fireEvent.focus(screen.getByLabelText("Email")));
      const configs = timing.mock.calls.map(([, config]) => config);
      expect(configs.map(({ toValue, duration, easing }) => ({ toValue, duration, easing }))).toEqual([
        { toValue: 1, duration: FLOAT.position.duration, easing: FLOAT_EASING },
        { toValue: 1, duration: FLOAT.tint.duration, easing: FLOAT_EASING },
      ]);
      // The web has no native animated module, so both run on the JS driver here.
      expect(configs.map(({ useNativeDriver }) => useNativeDriver)).toEqual([false, false]);
      for (const { duration } of configs) {
        expect(duration).toBeGreaterThanOrEqual(100);
        expect(duration).toBeLessThanOrEqual(700);
      }
    } finally {
      timing.mockRestore();
    }
  });

  it("jumps under Reduce Motion: one write per value and no timing, and the label still floats", async () => {
    const reduced = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    const timing = spyOn(Animated, "timing");
    const write = spyOn(Animated.Value.prototype, "setValue");
    try {
      render(<ThemeProvider light><Input label="Email" /></ThemeProvider>);
      await act(async () => {});
      timing.mockClear();
      write.mockClear();
      act(() => fireEvent.focus(screen.getByLabelText("Email")));
      expect(timing).not.toHaveBeenCalled();
      // The position and the tint each take their final value in one write.
      expect(write.mock.calls.map(([value]) => value)).toEqual([1, 1]);
      close(floatOf("Email"), expectedFloat(inputSkin, "base", heightOf(inputSkin.bareBox("base"))));
    } finally {
      write.mockRestore();
      timing.mockRestore();
      reduced.mockRestore();
    }
  });
});

// The faces an app registers per weight (the expo-google-fonts shape), a module constant as
// the docs tell apps to pass it. Family names carry no spaces: a computed style quotes one.
const FACES: ThemeFonts = { sans: { "400": "Manrope_400Regular", "500": "Manrope_500Medium", "700": "Manrope_700Bold" } };
const FAMILIES = [
  ["Input", <Input label="Face" required />],
  ["Textarea", <Textarea label="Face" required rows={3} />],
  ["Select", <Select label="Face" required options={["EU"]} />],
  ["Autocomplete", <Autocomplete label="Face" required options={["Ada"]} />],
] as const;

describe("the floating label paints in the theme's face", () => {
  for (const [name, field] of FAMILIES) {
    it(`${name}: the label takes the registered sans face, as its required star does`, () => {
      render(<ThemeProvider light fonts={FACES}>{field}</ThemeProvider>);
      const label = screen.getByText("Face");
      // The label names no weight, so a weight map resolves it to the 400 face.
      expect(getComputedStyle(label).fontFamily).toBe("Manrope_400Regular");
      expect(getComputedStyle(screen.getByText("*")).fontFamily).toBe("Manrope_400Regular");
    });
  }

  it("leaves the label's style untouched when the theme registers no face", () => {
    render(<ThemeProvider light><Input label="Face" /></ThemeProvider>);
    expect(screen.getByText("Face").style.fontFamily).toBe("");
  });
});
