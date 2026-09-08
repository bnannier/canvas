import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { StrictMode, createRef, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Platform, type AccessibilityActionEvent, type AccessibilityProps, type TextInput } from "react-native";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Form } from "../src/molecules/form/form.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrances, layoutHostedEntrance } from "./entrance-layout.ts";
import { useAccessibilityReturn } from "../src/style/use-accessibility-return.tsx";

afterEach(cleanup);
type Runtime = "ios" | "android";
const themed = (node: ReactNode) => <ThemeProvider>{node}</ThemeProvider>;

async function nativeRuntime(runtime: Runtime, run: (context: {
  actions: AccessibilityProps[];
  send: ReturnType<typeof mock>;
}) => void | Promise<void>) {
  const actions: AccessibilityProps[] = [];
  // RNW still renders the real component/portal tree. Only native event props
  // and the outgoing RN API are intercepted; this is not screen-reader proof.
  const select = spyOn(Platform, "select").mockImplementation((specifics) => {
    const selected = runtime in specifics ? specifics[runtime] : "native" in specifics ? specifics.native : "default" in specifics ? specifics.default : undefined;
    const props = selected as AccessibilityProps | undefined;
    if (props?.onAccessibilityTap || props?.accessibilityActions?.some(({ name }) => name === "activate")) actions.push(props);
    return selected;
  });
  const descriptor = Object.getOwnPropertyDescriptor(AccessibilityInfo, "sendAccessibilityEvent");
  const send = mock((_host: TextInput, _event: string) => {});
  Object.defineProperty(AccessibilityInfo, "sendAccessibilityEvent", { configurable: true, value: send });
  try {
    await run({ actions, send });
  } finally {
    cleanup();
    select.mockRestore();
    if (descriptor) Object.defineProperty(AccessibilityInfo, "sendAccessibilityEvent", descriptor);
    else Reflect.deleteProperty(AccessibilityInfo, "sendAccessibilityEvent");
  }
}

function activate(runtime: Runtime, props: AccessibilityProps) {
  if (runtime === "ios") props.onAccessibilityTap!();
  else props.onAccessibilityAction!({ nativeEvent: { actionName: "activate" } } as AccessibilityActionEvent);
}

for (const runtime of ["ios", "android"] as const) {
  for (const hosted of [false, true]) {
    it(`${runtime} ${hosted ? "hosted" : "inline"}: one AT activation selects once and requests return after React option removal`, () => nativeRuntime(runtime, async ({ actions, send }) => {
      const measure = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        x: 20, y: 20, width: 320, height: 500, left: 20, top: 20, right: 340, bottom: 520,
        toJSON: () => ({}),
      } as DOMRect);
      const events: string[] = [];
      const ref = createRef<TextInput>();
      const control = <Form onSubmit={() => events.push("submit")}>
        <Autocomplete ref={ref} label="Fruit" options={["Apple", "Pineapple"]}
          onValueChange={(value) => events.push(`value ${value}`)}
          onSelect={(value) => events.push(`select ${value}`)}
          onQueryChange={(value) => events.push(`query ${value}`)}
          onOpenChange={(open) => events.push(`open ${open}`)} />
      </Form>;
      try {
        render(themed(<StrictMode>{hosted ? <OverlayProvider>{control}</OverlayProvider> : control}</StrictMode>));
        const field = screen.getByRole("combobox") as HTMLInputElement;
        expect(ref.current).toBe(field as unknown as TextInput);
        act(() => field.focus());
        fireEvent.change(field, { target: { value: "Ap" } });
        if (hosted) {
          let list: HTMLElement | null = null;
          await waitFor(() => {
            list = document.getElementById(field.getAttribute("aria-controls")!);
            expect(list).not.toBeNull();
          });
          layoutHostedEntrance(list!, { width: 320, height: 96 });
        } else layoutEntrances(document.body, { width: 320, height: 96 });
        const option = await screen.findByRole("option", { name: "Pineapple" });
        const props = actions.at(-1)!;
        if (runtime === "android") {
          expect(props.accessibilityActions).toEqual([{ name: "activate" }]);
          expect(props.onAccessibilityTap).toBeUndefined();
          act(() => props.onAccessibilityAction!({ nativeEvent: { actionName: "longpress" } } as AccessibilityActionEvent));
        } else {
          expect(props.onAccessibilityTap).toBeDefined();
          expect(props.onAccessibilityAction).toBeUndefined();
        }
        expect(send).not.toHaveBeenCalled();
        events.length = 0;
        const focus = spyOn(field, "focus");
        const blur = spyOn(field, "blur");
        send.mockImplementation((host, event) => {
          expect(host).toBe(ref.current);
          expect(event).toBe("focus");
          expect(option.isConnected).toBe(false);
          expect(screen.queryByRole("listbox")).toBeNull();
          expect(field.isConnected).toBe(true);
          expect(document.activeElement).toBe(field);
        });
        try {
          act(() => {
            activate(runtime, props);
            // A repeated delivery before the closing commit cannot select twice.
            activate(runtime, props);
          });
          expect(events).toEqual(["value Pineapple", "select Pineapple", "query ", "open false"]);
          expect(send).toHaveBeenCalledTimes(1);
          expect(field.value).toBe("Pineapple");
          expect(focus).not.toHaveBeenCalled();
          expect(blur).not.toHaveBeenCalled();
          act(() => activate(runtime, props));
          expect(send).toHaveBeenCalledTimes(1);
          expect(events).toHaveLength(4);
          fireEvent.change(field, { target: { value: "Pineapples" } });
          expect(field.value).toBe("Pineapples");
          expect(document.activeElement).toBe(field);
          expect(send).toHaveBeenCalledTimes(1);
        } finally {
          focus.mockRestore();
          blur.mockRestore();
        }
      } finally {
        measure.mockRestore();
      }
    }));
  }

  it(`${runtime}: pointer selection and external dismissal never request AT return`, () => nativeRuntime(runtime, ({ send }) => {
    const view = (open?: boolean) => themed(<Autocomplete label="Fruit" options={["Apple"]} open={open} />);
    const { rerender } = render(view());
    const field = screen.getByRole("combobox");
    act(() => field.focus());
    layoutEntrances(document.body, { width: 320, height: 96 });
    fireEvent.click(screen.getByRole("option", { name: "Apple" }));
    expect(send).not.toHaveBeenCalled();
    rerender(view(true));
    layoutEntrances(document.body, { width: 320, height: 96 });
    rerender(view(false));
    expect(send).not.toHaveBeenCalled();
  }));

  it(`${runtime}: controlled-open refusal expires the request before a later close`, () => nativeRuntime(runtime, ({ actions, send }) => {
    const selected: string[] = [];
    const view = (open: boolean) => themed(<Autocomplete label="Fruit" options={["Apple"]} open={open}
      value="Apple" query="" onSelect={(value) => selected.push(value)} onOpenChange={() => {}} />);
    const { rerender } = render(view(true));
    act(() => screen.getByRole("combobox").focus());
    layoutEntrances(document.body, { width: 320, height: 96 });
    const action = actions.at(-1)!;
    act(() => activate(runtime, action));
    expect(selected).toEqual(["Apple"]);
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
    rerender(view(false));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(send).not.toHaveBeenCalled();
  }));

  for (const consequence of ["unmount", "disable", "blur"] as const) {
    it(`${runtime}: selection callback ${consequence} cancels return`, () => nativeRuntime(runtime, ({ actions, send }) => {
      const selections: string[] = [];
      function Fixture() {
        const [gone, setGone] = useState(false);
        const [disabled, setDisabled] = useState(false);
        return <><Input label="Destination" />{gone ? null : <Autocomplete label="Fruit" disabled={disabled}
          options={["Apple"]} onSelect={(value) => {
            selections.push(value);
            if (consequence === "unmount") setGone(true);
            if (consequence === "disable") setDisabled(true);
            if (consequence === "blur") screen.getByRole("textbox", { name: "Destination" }).focus();
          }} />}</>;
      }
      render(themed(<Fixture />));
      act(() => screen.getByRole("combobox").focus());
      layoutEntrances(document.body, { width: 320, height: 96 });
      act(() => activate(runtime, actions.at(-1)!));
      expect(selections).toEqual(["Apple"]);
      expect(send).not.toHaveBeenCalled();
      if (consequence === "blur") expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Destination" }));
    }));
  }

  it(`${runtime}: old opening actions cannot select from a newly opened list`, () => nativeRuntime(runtime, ({ actions, send }) => {
    const selected: string[] = [];
    render(themed(<Autocomplete label="Fruit" options={["Apple"]} onSelect={(value) => selected.push(value)} />));
    act(() => screen.getByRole("combobox").focus());
    layoutEntrances(document.body, { width: 320, height: 96 });
    const stale = actions.at(-1)!;
    fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
    layoutEntrances(document.body, { width: 320, height: 96 });
    act(() => activate(runtime, stale));
    expect(selected).toEqual([]);
    expect(send).not.toHaveBeenCalled();
  }));

  it(`${runtime}: filter-only removal preserves the list boundary and never restores focus`, () => nativeRuntime(runtime, ({ actions, send }) => {
    const selected: string[] = [];
    render(themed(<Autocomplete label="Fruit" defaultOpen options={["Apple", "Pineapple", "Banana"]}
      onSelect={(value) => selected.push(value)} />));
    expect(send).not.toHaveBeenCalled();
    const field = screen.getByRole("combobox");
    layoutEntrances(document.body, { width: 320, height: 144 });
    const list = screen.getByRole("listbox");
    const pineapple = screen.getByRole("option", { name: "Pineapple" });
    act(() => field.focus());
    fireEvent.change(field, { target: { value: "Ap" } });
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
    expect(screen.getByRole("listbox")).toBe(list);
    expect(screen.getByRole("option", { name: "Pineapple" })).toBe(pineapple);
    expect(send).not.toHaveBeenCalled();
    act(() => activate(runtime, actions.at(-1)!));
    expect(selected).toEqual(["Pineapple"]);
    expect(send).toHaveBeenCalledTimes(1);
  }));

  it(`${runtime}: AT can select without forcing an unfocused input to take editing or accessibility focus`, () => nativeRuntime(runtime, ({ actions, send }) => {
    const selected: string[] = [];
    render(themed(<Autocomplete label="Fruit" defaultOpen options={["Apple"]} onSelect={(value) => selected.push(value)} />));
    const field = screen.getByRole("combobox");
    layoutEntrances(document.body, { width: 320, height: 48 });
    expect(document.activeElement).not.toBe(field);
    act(() => activate(runtime, actions.at(-1)!));
    expect(selected).toEqual(["Apple"]);
    expect(send).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(field);
  }));
}

describe("delayed React content-removal guards", () => {
  for (const cancel of ["detach", "detach-reattach", "replace", "blur", "disable", "reopen", "owner-unmount", "new-content"] as const) {
    it(`cancels ${cancel} between accepted close and content cleanup`, () => nativeRuntime("android", ({ send }) => {
      let focused = true;
      const target = { isFocused: () => focused, focus: mock(), blur: mock() } as unknown as TextInput;
      const body = {};
      const initial = { open: true, disabled: false };
      const { result, rerender, unmount } = renderHook(({ open, disabled }) => useAccessibilityReturn(open, disabled, null), { initialProps: initial });
      act(() => { result.current.inputRef(target); result.current.onContentMount(body); });
      act(() => {
        result.current.activate(() => {});
        rerender({ open: false, disabled: false });
      });
      const remove = result.current.onContentUnmount;
      expect(send).not.toHaveBeenCalled();
      if (cancel === "detach") act(() => result.current.inputRef(null));
      if (cancel === "detach-reattach") act(() => { result.current.inputRef(null); result.current.inputRef(target); });
      if (cancel === "replace") act(() => result.current.inputRef({ isFocused: () => true } as TextInput));
      if (cancel === "blur") focused = false;
      if (cancel === "disable") rerender({ open: false, disabled: true });
      if (cancel === "reopen") rerender({ open: true, disabled: false });
      if (cancel === "owner-unmount") unmount();
      if (cancel === "new-content") act(() => result.current.onContentMount({}));
      act(() => remove(body));
      expect(send).not.toHaveBeenCalled();
      expect(target.focus).not.toHaveBeenCalled();
      expect(target.blur).not.toHaveBeenCalled();
    }));
  }

  it("preserves public cleanup refs while conservatively cancelling a changed ref owner", () => nativeRuntime("android", ({ send }) => {
    const target = { isFocused: () => true } as TextInput;
    const body = {};
    const detached: string[] = [];
    const first: Ref<TextInput> = () => () => { detached.push("first"); };
    const second = createRef<TextInput>();
    const initialProps: { open: boolean; owner: Ref<TextInput> } = { open: true, owner: first };
    const { result, rerender, unmount } = renderHook(({ open, owner }) => useAccessibilityReturn(open, false, owner), {
      initialProps,
    });
    act(() => { result.current.inputRef(target); result.current.onContentMount(body); });
    const previous = result.current.inputRef;
    act(() => {
      result.current.activate(() => {});
      rerender({ open: false, owner: second });
    });
    act(() => { previous(null); result.current.inputRef(target); result.current.onContentUnmount(body); });
    expect(detached).toEqual(["first"]);
    expect(second.current).toBe(target);
    expect(send).not.toHaveBeenCalled();
    act(() => result.current.inputRef(null));
    unmount();
    expect(second.current).toBeNull();
    expect(detached).toEqual(["first"]);
  }));
});
