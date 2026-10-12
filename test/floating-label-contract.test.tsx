import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { AccessibilityInfo, Animated, I18nManager, Text as RNText, type TextStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsByScheme } from "../src/style/tokens.ts";
import type { ThemeFonts } from "../src/style/fonts.ts";
import { FLOAT, FLOAT_EASING } from "../src/style/motion.ts";
import { LabelContent, labelA11y, type FloatingLabelStyles } from "../src/style/floating-label.tsx";
import { Input } from "../src/atoms/input/input.android.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Select } from "../src/atoms/select/select.android.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import * as WebInput from "../src/atoms/input/input.tsx";
import * as IosInput from "../src/atoms/input/input.ios.tsx";
import * as WebTextarea from "../src/atoms/textarea/textarea.tsx";
import * as IosTextarea from "../src/atoms/textarea/textarea.ios.tsx";
import * as WebSelect from "../src/atoms/select/select.tsx";
import * as IosSelect from "../src/atoms/select/select.ios.tsx";
import * as WebAutocomplete from "../src/atoms/autocomplete/autocomplete.tsx";
import * as IosAutocomplete from "../src/atoms/autocomplete/autocomplete.ios.tsx";
import * as WebPhoneInput from "../src/molecules/phone-input/phone-input.tsx";
import * as IosPhoneInput from "../src/molecules/phone-input/phone-input.ios.tsx";
import * as AndroidPhoneInput from "../src/molecules/phone-input/phone-input.android.tsx";
import * as WebStepper from "../src/atoms/stepper/stepper.tsx";
import * as IosStepper from "../src/atoms/stepper/stepper.ios.tsx";
import * as AndroidStepper from "../src/atoms/stepper/stepper.android.tsx";
import * as WebField from "../src/molecules/field/field.tsx";
import * as IosField from "../src/molecules/field/field.ios.tsx";
import * as AndroidField from "../src/molecules/field/field.android.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
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

// Transform origins are physical on React Native, Fabric and CSS, while the label is pinned to
// the logical start edge, the right in a right-to-left layout. So the origin follows the
// layout direction, or the scaled label's leading edge drifts inward by a quarter of its width.
function inDirection(isRTL: boolean, run: () => void) {
  const original = I18nManager.getConstants;
  I18nManager.getConstants = () => ({ ...original.call(I18nManager), isRTL });
  try {
    run();
  } finally {
    I18nManager.getConstants = original;
  }
}
const originOf = (label: string) => screen.getByText(label).parentElement!.style.transformOrigin;

describe("the float scales around the label's leading edge", () => {
  for (const [direction, isRTL, origin] of [["left-to-right", false, "0% 50%"], ["right-to-left", true, "100% 50%"]] as const) {
    it(`${direction}: single-line and multiline labels scale around ${origin}`, () => {
      inDirection(isRTL, () => {
        render(<ThemeProvider light><Input label="Single" defaultValue="Ada" /><Textarea label="Multi" rows={3} /></ThemeProvider>);
        expect(originOf("Single")).toBe(origin);
        expect(originOf("Multi")).toBe(origin);
      });
    });
  }
});

// What a field's visible label is to assistive technology. On iOS and Android the label Text
// names itself with the bare label, since React Native makes the required star a span of the
// label's paragraph, out of reach of the star's own hiding props; where the control takes its
// name from the label, the label is also hidden there, so VoiceOver and TalkBack stop once, on
// the field. The web keeps the label in the DOM unchanged: the field's aria-labelledby target,
// its star aria-hidden.
describe("the visible label's accessibility", () => {
  it("resolves per platform: the bare name natively, and hidden natively where the control names itself", () => {
    const hidden = { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" };
    for (const os of ["ios", "android"]) {
      expect(labelA11y("Country", true, os)).toEqual({ accessibilityLabel: "Country", ...hidden });
      expect(labelA11y("Country", false, os)).toEqual({ accessibilityLabel: "Country" });
    }
    // react-native-web drops both hiding props, so the web label keeps its markup.
    expect(labelA11y("Country", true, "web")).toEqual(hidden);
    expect(labelA11y("Country", false, "web")).toEqual({});
  });

  const A11Y_KEYS = ["accessibilityLabel", "accessibilityElementsHidden", "importantForAccessibility", "aria-label", "aria-hidden"] as const;
  type A11yProps = Partial<Record<(typeof A11Y_KEYS)[number], unknown>>;
  /**
   * The accessibility props each label Text (the Text holding LabelContent) was handed, by
   * label, before react-native-web drops the native-only ones. Picked, so a failure prints them
   * rather than the React tree the props hold.
   */
  function labelProps(ui: ReactElement): Map<string, A11yProps> {
    const component = RNText as unknown as { render: (props: Record<string, unknown>, ref: unknown) => ReactNode };
    const original = component.render;
    const seen = new Map<string, A11yProps>();
    const spy = spyOn(component, "render").mockImplementation((props, ref) => {
      const child = props.children;
      if (isValidElement<{ label: string }>(child) && child.type === LabelContent) {
        seen.set(child.props.label, Object.fromEntries(A11Y_KEYS.filter((key) => props[key] !== undefined).map((key) => [key, props[key]])));
      }
      return original(props, ref);
    });
    try {
      render(<ThemeProvider light>{ui}</ThemeProvider>);
    } finally {
      spy.mockRestore();
    }
    return seen;
  }

  const SKINS = [
    ["web", WebInput, WebTextarea, WebSelect, WebAutocomplete, WebPhoneInput, WebStepper, WebField],
    ["ios", IosInput, IosTextarea, IosSelect, IosAutocomplete, IosPhoneInput, IosStepper, IosField],
    ["android", { Input }, { Textarea }, { Select }, { Autocomplete }, AndroidPhoneInput, AndroidStepper, AndroidField],
  ] as const;
  for (const [skin, I, T, S, A, P, St, F] of SKINS) {
    it(`${skin}: every field family's label is hidden natively beside the field it names, and Field's heading is not`, () => {
      const seen = labelProps(<>
        <I.Input label="Input label" required />
        <T.Textarea label="Textarea label" required />
        <S.Select label="Select label" required options={["EU"]} />
        <A.Autocomplete label="Autocomplete label" required options={["Ada"]} />
        <P.PhoneInput label="Phone label" required />
        <St.Stepper label="Stepper label" required />
        <F.Field label="Field label" required><Switch accessibilityLabel="Notify me" /></F.Field>
        <I.Input label="Overridden label" accessibilityLabel="Named by the caller" />
      </>);
      for (const label of ["Input label", "Textarea label", "Select label", "Autocomplete label", "Phone label", "Stepper label"]) {
        expect(seen.get(label), label).toEqual({ accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
      }
      // A heading for a self-named control, and a label the caller's name replaces, stay stops.
      // Under test the platform is the web, so no label carries a name of its own.
      for (const label of ["Field label", "Overridden label"]) expect(seen.get(label), label).toEqual({});
    });
  }

  it("keeps the web markup: the label in the DOM unnamed and unhidden, the star hidden, the field named without it", () => {
    render(<ThemeProvider light><Input label="Email" required /><WebInput.Input label="Web email" required /></ThemeProvider>);
    for (const label of ["Email", "Web email"]) {
      const node = screen.getByText(label);
      expect(node.getAttribute("aria-label")).toBeNull();
      expect(node.getAttribute("aria-hidden")).toBeNull();
      expect(node.querySelector("[aria-hidden='true']")?.textContent).toBe(" *");
      // getByLabelText is exact: the field resolves only by the bare label.
      expect(screen.getByLabelText(label).getAttribute("aria-labelledby")).toBe(node.id);
    }
  });
});
