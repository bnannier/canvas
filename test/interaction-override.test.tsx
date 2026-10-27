import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { InteractionOverride } from "../src/style/interaction-override.tsx";
import { PINNED_FOCUS_RING, FOCUS_RING_WIDTH } from "../src/style/pressable.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { ChatComposer } from "../src/organisms/chat/chat.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { DragDropProvider, Draggable, DragHandle } from "../src/organisms/drag-drop/drag-drop.tsx";

// InteractionOverride pins hover, keyboard focus and the pressed state for every kit
// control under it (src/style/interaction-override.tsx), through the three primitives the
// controls already take those states from: useHover, the kit Pressable's focus ring and
// its press state, and a field's own focused look. A pinned look must be the very look a
// pointer or a key gives, so each case compares the pinned render with the real one.

afterEach(cleanup);

const light = (ui: ReactElement) => <ThemeProvider light solid>{ui}</ThemeProvider>;
// The markup with React's generated ids made stable, so two renders compare.
const html = (root: Element): string => root.innerHTML.replace(/_r_\w+_/g, "_r_");
const markup = (ui: ReactElement): string => {
  const { container, unmount } = render(light(ui));
  const out = html(container);
  unmount();
  return out;
};
// The deepest node under `root`: a pointer entering it enters every ancestor, the hover
// target among them.
const deepest = (root: Element): Element => (root.firstElementChild ? deepest(root.firstElementChild) : root);

describe("pinned hover", () => {
  it("gives a Button the look its pointer hover gives", () => {
    const pinned = markup(<InteractionOverride hovered><Button testID="b">Save</Button></InteractionOverride>);
    const viaProp = markup(<Button testID="b" testOnly_hovered>Save</Button>);
    const rest = markup(<Button testID="b">Save</Button>);
    expect(pinned).toBe(viaProp);
    expect(pinned).not.toBe(rest);
  });

  it("matches a real pointer hover on Checkbox, Switch and the Input box", () => {
    // Whether the web skin declares a hover look there: the Switch's track glows only while on.
    for (const [ui, hasHoverLook] of [
      [<Checkbox key="c">Email me</Checkbox>, true],
      [<Switch key="s">Wi-Fi</Switch>, false],
      [<Switch key="on" defaultChecked>Wi-Fi</Switch>, true],
      [<Input key="i" label="Name" />, true],
    ] as const) {
      const pinned = markup(<InteractionOverride hovered>{ui}</InteractionOverride>);
      const { container } = render(light(ui));
      const rest = html(container);
      // A field's hover target is its box, around the native input; a row's is the row.
      fireEvent.pointerEnter(container.querySelector("input") ?? deepest(container), { pointerType: "mouse" });
      expect(pinned).toBe(html(container));
      expect(pinned !== rest).toBe(hasHoverLook);
      cleanup();
    }
  });

  it("leaves a disabled control at rest", () => {
    const pinned = markup(<InteractionOverride hovered><Button testID="b" disabled>Save</Button></InteractionOverride>);
    expect(pinned).toBe(markup(<Button testID="b" disabled>Save</Button>));
  });

  it("is given back by an inner provider with no flag", () => {
    const unpinned = markup(<InteractionOverride hovered><InteractionOverride><Button testID="b">Save</Button></InteractionOverride></InteractionOverride>);
    expect(unpinned).toBe(markup(<Button testID="b">Save</Button>));
  });
});

describe("pinned focus", () => {
  it("draws the kit's ring on a pressable control, solid at the ring width, where the browser would on :focus-visible", () => {
    render(light(<InteractionOverride focused><Button testID="b">Save</Button></InteractionOverride>));
    const button = screen.getByTestId("b");
    expect(button.style.getPropertyValue("outline-style")).toBe("solid");
    expect(button.style.getPropertyValue("outline-width")).toBe(`${FOCUS_RING_WIDTH}px`);
    cleanup();
    render(light(<Button testID="b">Save</Button>));
    expect(screen.getByTestId("b").style.getPropertyValue("outline-width")).toBe("");
  });

  it("reaches a Pagination page and a Checkbox row, but never a disabled control", () => {
    render(light(<InteractionOverride focused><Pagination page={2} total={5} onChange={() => {}} /><Checkbox disabled>Off</Checkbox></InteractionOverride>));
    const rings = [...document.querySelectorAll<HTMLElement>("[role=button], [role=checkbox]")]
      .map((node) => [node.getAttribute("aria-disabled") === "true", node.style.getPropertyValue("outline-width")] as const);
    expect(rings.some(([disabled, width]) => !disabled && width === `${FOCUS_RING_WIDTH}px`)).toBe(true);
    expect(rings.filter(([disabled]) => disabled).every(([, width]) => width !== `${FOCUS_RING_WIDTH}px`)).toBe(true);
  });

  it("gives an Input its own focused look, the one real focus gives", () => {
    const pinned = markup(<InteractionOverride focused><Input label="Name" /></InteractionOverride>);
    const { container } = render(light(<Input label="Name" />));
    const rest = html(container);
    fireEvent.focus(container.querySelector("input")!);
    expect(pinned).toBe(html(container));
    expect(pinned).not.toBe(rest);
  });

  it("spells out the ring on the web, the only platform with a kit ring", () => {
    // Natively the constant is null (iOS and Android own focus); the suite runs the web.
    expect(PINNED_FOCUS_RING).toEqual({ outlineStyle: "solid", outlineWidth: FOCUS_RING_WIDTH });
  });
});

describe("pinned press", () => {
  it("reports pressed to a Button's style and children, the web's press scale", () => {
    render(light(<InteractionOverride pressed><Button testID="b">Save</Button></InteractionOverride>));
    expect(screen.getByTestId("b").style.getPropertyValue("transform")).toContain("scale(");
    cleanup();
    render(light(<Button testID="b">Save</Button>));
    expect(screen.getByTestId("b").style.getPropertyValue("transform")).not.toContain("scale(");
  });

  it("leaves a disabled Button and a steadyPress Button at rest", () => {
    expect(markup(<InteractionOverride pressed><Button testID="b" disabled>Save</Button></InteractionOverride>)).toBe(markup(<Button testID="b" disabled>Save</Button>));
    expect(markup(<InteractionOverride pressed><Button testID="b" steadyPress>Save</Button></InteractionOverride>)).toBe(markup(<Button testID="b" steadyPress>Save</Button>));
  });

  it("combines with hover", () => {
    render(light(<InteractionOverride hovered pressed><Button testID="b">Save</Button></InteractionOverride>));
    expect(screen.getByTestId("b").style.getPropertyValue("transform")).toContain("scale(");
  });
});

describe("without a provider", () => {
  it("renders every control exactly as before", () => {
    // An empty provider resolves null, the default: the same tree as no provider at all.
    for (const ui of [<Button key="b" testID="b">Save</Button>, <Input key="i" label="Name" />, <Switch key="s">Wi-Fi</Switch>]) {
      expect(markup(<InteractionOverride>{ui}</InteractionOverride>)).toBe(markup(ui));
    }
  });
});

// The controls that keep a focus or press state of their own, outside the three
// primitives: each ORs the pin into that state (usePinnedFocus, useInteractionOverride).
// A pinned focus also rings every kit Pressable in the subtree (a Stepper's buttons, a
// PhoneInput's country segment), where a real focus marks one node, so those comparisons
// read the pinned render with the Pressable ring taken out. The Command card's list frame
// rings under a pin too (src/style/focus-frame.tsx), so its case reads the search row.
const PRESSABLE_RING = new RegExp(`outline-style: solid; outline-width: ${FOCUS_RING_WIDTH}px;\\s?`, "g");
const withoutPressableRing = (out: string): string => out.replace(PRESSABLE_RING, "");
// Each inline style's declarations in one order: a re-render lists a property it adds
// after the ones it kept, where a first render lists it in place, with the same look.
const sortedStyles = (out: string): string => out.replace(/style="([^"]*)"/g, (_, css: string) => `style="${css.split(/;\s*/).filter(Boolean).sort().join("; ")}"`);
// The pinned render and the render a real focus on the control's native field gives, of
// the node that paints the focused look (the whole control unless `look` names one).
const focusPair = (ui: ReactElement, field: string, look?: string): [pinned: string, real: string, rest: string] => {
  const of = (root: Element) => sortedStyles((look ? root.querySelector(look)!.outerHTML : root.innerHTML).replace(/_r_\w+_/g, "_r_"));
  const first = render(light(<InteractionOverride focused>{ui}</InteractionOverride>));
  const pinned = of(first.container);
  cleanup();
  const { container } = render(light(ui));
  const rest = of(container);
  fireEvent.focus(container.querySelector(field)!);
  const real = of(container);
  cleanup();
  return [pinned, real, rest];
};

describe("pinned focus on a control's own focused look", () => {
  for (const [name, ui, field] of [
    ["Textarea", <Textarea key="t" label="Notes" />, "textarea"],
    ["Autocomplete", <Autocomplete key="a" label="Fruit" options={["Apple", "Banana"]} open={false} />, "input"],
    ["PhoneInput", <PhoneInput key="p" label="Phone" />, "input"],
    ["InputOTP", <InputOTP key="o" length={4} />, "input"],
    ["Stepper", <Stepper key="s" label="Guests" defaultValue={2} />, "input"],
    ["the Chat composer", <ChatComposer key="c" value="" onChangeText={() => {}} onSend={() => {}} />, "textarea"],
    ["the Command search", <Command key="k" groups={[{ items: [{ label: "Open file" }] }]} onSelect={() => {}} />, "input"],
  ] as const) {
    it(`gives ${name} the look real focus gives`, () => {
      const [pinned, real, rest] = focusPair(ui, field, name === "the Command search" ? "[role=search]" : undefined);
      expect(withoutPressableRing(pinned)).toBe(withoutPressableRing(real));
      expect(real).not.toBe(rest);
    });
  }

  it("rings a flush Textarea and a bare Stepper field the way the browser does", () => {
    render(light(<InteractionOverride focused><Textarea flush accessibilityLabel="Notes" /></InteractionOverride>));
    expect(document.querySelector("textarea")!.style.getPropertyValue("outline-width")).toBe(`${FOCUS_RING_WIDTH}px`);
    cleanup();
    render(light(<Textarea flush accessibilityLabel="Notes" />));
    expect(document.querySelector("textarea")!.style.getPropertyValue("outline-width")).toBe("");
  });

  it("rings a Select trigger, whose focus is the kit Pressable's", () => {
    render(light(<InteractionOverride focused><Select testID="s" label="Size" options={["Small"]} /></InteractionOverride>));
    expect(screen.getByTestId("s").style.getPropertyValue("outline-width")).toBe(`${FOCUS_RING_WIDTH}px`);
  });

  it("rings the Slider thumb and a drag grip", () => {
    render(light(<InteractionOverride focused><Slider testID="v" defaultValue={40} accessibilityLabel="Volume" /></InteractionOverride>));
    expect(screen.getByTestId("v-thumb").style.getPropertyValue("outline-width")).toBe(`${FOCUS_RING_WIDTH}px`);
    cleanup();
    render(light(<InteractionOverride focused><DragDropProvider><Draggable id="a" data={{}} label="A"><DragHandle testID="g" label="Reorder A" /></Draggable></DragDropProvider></InteractionOverride>));
    expect(screen.getByTestId("g").style.getPropertyValue("outline-width")).toBe(`${FOCUS_RING_WIDTH}px`);
  });

  it("leaves every one of them at rest when disabled", () => {
    for (const ui of [
      <Textarea key="t" label="Notes" disabled />,
      <Textarea key="te" label="Notes" error disabled />,
      <Autocomplete key="a" label="Fruit" options={["Apple"]} disabled />,
      <PhoneInput key="p" label="Phone" disabled />,
      <PhoneInput key="pe" label="Phone" error disabled />,
      <InputOTP key="o" length={4} disabled />,
      <Stepper key="s" label="Guests" disabled />,
      <ChatComposer key="c" value="" onChangeText={() => {}} onSend={() => {}} disabled />,
      <Slider key="v" testID="v" defaultValue={40} accessibilityLabel="Volume" disabled />,
    ]) {
      expect(markup(<InteractionOverride focused pressed>{ui}</InteractionOverride>)).toBe(markup(ui));
    }
    const grip = <DragDropProvider><Draggable id="a" data={{}} disabled label="A"><DragHandle testID="g" label="Reorder A" /></Draggable></DragDropProvider>;
    expect(markup(<InteractionOverride focused pressed>{grip}</InteractionOverride>)).toBe(markup(grip));
  });
});

describe("pinned press on a control's own press state", () => {
  it("gives the Slider thumb the look a held pointer gives", () => {
    // At 0, so the press at the unmeasured rail's start leaves the value where it is.
    const pinned = markup(<InteractionOverride pressed><Slider testID="v" defaultValue={0} accessibilityLabel="Volume" /></InteractionOverride>);
    const { container } = render(light(<Slider testID="v" defaultValue={0} accessibilityLabel="Volume" />));
    const rest = html(container);
    fireEvent.mouseDown(container.querySelector("[role=slider]")!, { button: 0, buttons: 1, clientX: 1, clientY: 1 });
    expect(sortedStyles(pinned)).toBe(sortedStyles(html(container)));
    expect(pinned).not.toBe(rest);
  });

  it("dims a drag grip as a held pointer does", () => {
    const grip = (pinned: boolean) => {
      const ui = <DragDropProvider><Draggable id="a" data={{}} label="A"><DragHandle testID="g" label="Reorder A" /></Draggable></DragDropProvider>;
      render(light(pinned ? <InteractionOverride pressed>{ui}</InteractionOverride> : ui));
      const opacity = screen.getByTestId("g").style.getPropertyValue("opacity");
      cleanup();
      return opacity;
    };
    expect(grip(true)).not.toBe(grip(false));
  });
});

describe("the pinned controls without a provider", () => {
  it("render exactly as before", () => {
    for (const ui of [
      <Textarea key="t" label="Notes" />,
      <Autocomplete key="a" label="Fruit" options={["Apple"]} />,
      <PhoneInput key="p" label="Phone" />,
      <InputOTP key="o" length={4} />,
      <Stepper key="s" label="Guests" />,
      <ChatComposer key="c" value="" onChangeText={() => {}} onSend={() => {}} />,
      <Command key="k" groups={[{ items: [{ label: "Open file" }] }]} onSelect={() => {}} />,
      <Slider key="v" defaultValue={40} accessibilityLabel="Volume" />,
    ]) {
      expect(markup(<InteractionOverride>{ui}</InteractionOverride>)).toBe(markup(ui));
    }
  });
});
