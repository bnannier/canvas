// AnchoredOverlay's keyboard and screen-reader contract (the audit turn's AO-1 and AO-2,
// as the owner decided them): an open card's controls keep their place in the tab order
// right after the trigger, a menu or option list closes on a Tab out of it and focus goes
// on in the page's order, focus is never left on the body, and the menus and lists move
// focus in on open (the WAI-ARIA menu and listbox patterns). Natively every card that
// can close is modal to VoiceOver and TalkBack: its window's page is hidden, a card opened
// from it covers it, the screen reader moves in, and it goes back to the trigger on close.
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ForwardedRef, type ReactNode, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform, Text, View, type ViewProps } from "react-native";
import { Button } from "../src/atoms/button/button.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { AnchoredOverlay } from "../src/style/anchored-overlay.tsx";
import { GlassBlurTargetHost } from "../src/style/glass-surface/glass-blur-target.android.tsx";
import { OverlayProvider, useOverlayHost, type OverlayHost } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutHostedEntrance } from "./entrance-layout.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const SIZE = { width: 220, height: 160 };
const settle = async () => {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
};
// Give every node a box (happy-dom reports 0x0, and a hosted card waits for a measured
// trigger), run the case, and restore.
const withLayout = async (run: () => Promise<void>) => {
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, toJSON: () => ({}),
  } as DOMRect);
  try { await run(); } finally { measure.mockRestore(); }
};
// A page with a control before and after the component, in a window layer.
const page = (node: ReactNode) => render(
  <ThemeProvider light solid>
    <OverlayProvider>
      <Button>Before</Button>
      {node}
      <Button>After</Button>
    </OverlayProvider>
  </ThemeProvider>,
);
// Reveal every hosted card still held: deliver its card, scrollport and content
// layouts (happy-dom has no layout engine), which releases the hold.
const reveal = async () => {
  await settle();
  for (const content of document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"]')) {
    if (content.closest('[aria-hidden="true"]')) layoutHostedEntrance(content, SIZE);
  }
  await settle();
};
// Open by the trigger, then reveal the hosted card.
const openAndReveal = async (open: () => void) => {
  open();
  await reveal();
};
// A Tab as a browser performs it: the keydown first, then, unless something prevented
// it, the browser's own move to the next (or previous) tab stop in DOM order, which
// happy-dom does not perform.
const stops = () => [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')]
  .filter((element) => !element.hasAttribute("disabled") && Number(element.getAttribute("tabindex") ?? 0) >= 0 && !element.closest('[aria-hidden="true"]'));
const tab = (back = false) => act(() => {
  const active = (document.activeElement ?? document.body) as HTMLElement;
  const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: back, bubbles: true, cancelable: true });
  active.dispatchEvent(event);
  if (event.defaultPrevented) return;
  const order = stops();
  const follows = (element: HTMLElement) => (active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const next = back ? order.filter((element) => element !== active && !follows(element)).pop() : order.find((element) => element !== active && follows(element));
  next?.focus();
});
const press = (key: string) => act(() => { fireEvent.keyDown(document.activeElement!, { key }); });
const named = (name: string) => screen.getByRole("button", { name });
const focused = () => document.activeElement as HTMLElement;

describe("the tab order and Tab in an open card (AO-1)", () => {
  it("enters a menu at its first row; Tab closes it and goes on to the control after the trigger", async () => {
    await withLayout(async () => {
      page(<Dropdown trigger="Actions" items={[{ label: "Edit profile" }, { label: "Sign out" }]} />);
      act(() => named("Actions").focus());
      await openAndReveal(() => fireEvent.click(named("Actions")));
      expect(focused().textContent).toBe("Edit profile");
      tab();
      // On to the next control in the page's order, never the body, and the menu closed.
      expect(focused()).toBe(named("After"));
      await settle();
      expect(screen.queryByRole("menu")).toBeNull();
      expect(named("Actions").getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("Shift+Tab from a menu closes it and lands on its trigger", async () => {
    await withLayout(async () => {
      page(<Dropdown trigger="Actions" items={[{ label: "Edit profile" }, { label: "Sign out" }]} />);
      await openAndReveal(() => fireEvent.click(named("Actions")));
      expect(focused().textContent).toBe("Edit profile");
      tab(true);
      expect(focused()).toBe(named("Actions"));
      await settle();
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("keeps a non-modal popover open while Tab carries focus through it in the trigger's place", async () => {
    await withLayout(async () => {
      page(<Popover trigger="Rename" title="Rename project" actionLabel="Save" />);
      act(() => named("Rename").focus());
      await openAndReveal(() => fireEvent.click(named("Rename")));
      // The panel took focus; Tab enters its controls, then goes on after the trigger.
      expect(focused().getAttribute("role")).toBe("dialog");
      // Anchored, it is a non-modal dialog (the owner's AO-2 decision for the web).
      expect(focused().getAttribute("aria-modal")).toBeNull();
      tab();
      expect(focused()).toBe(named("Save"));
      tab();
      expect(focused()).toBe(named("After"));
      expect(screen.getByRole("dialog")).toBeTruthy();
      // And back: Shift+Tab from the control after the trigger re-enters the card at its end.
      tab(true);
      expect(focused()).toBe(named("Save"));
      // Shift+Tab out of the card's first stop lands on the trigger.
      tab(true);
      expect(focused()).toBe(named("Rename"));
      // Tab from the trigger goes into the card, which sits right after it.
      tab();
      expect(focused()).toBe(named("Save"));
    });
  });

  it("moves focus into a RowMenu, roves its rows with the arrows, and closes on Tab", async () => {
    await withLayout(async () => {
      page(<RowMenu items={[{ label: "Edit" }, { label: "Duplicate" }, { label: "Delete", destructive: true }]} />);
      await openAndReveal(() => fireEvent.click(named("More options")));
      expect(focused().textContent).toBe("Edit");
      press("ArrowDown");
      expect(focused().textContent).toBe("Duplicate");
      press("End");
      expect(focused().textContent).toBe("Delete");
      tab();
      expect(focused()).toBe(named("After"));
      await settle();
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("enters a Select at its selected option and chooses with the keys, returning focus to the trigger", async () => {
    const chosen: string[] = [];
    await withLayout(async () => {
      page(<Select options={["Small", "Medium", "Large"]} defaultValue="Medium" onSelect={(value) => chosen.push(value)} />);
      const trigger = screen.getByRole("button", { expanded: false });
      act(() => trigger.focus());
      await openAndReveal(() => fireEvent.click(trigger));
      expect(focused().textContent).toContain("Medium");
      press("ArrowDown");
      expect(focused().textContent).toContain("Large");
      press("Enter");
      await settle();
      expect(chosen).toEqual(["Large"]);
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(focused()).toBe(trigger);
    });
  });

  it("enters the split button's overflow menu and activates a row with Enter", async () => {
    const picked: number[] = [];
    await withLayout(async () => {
      page(<ButtonGroup split items={["Save"]} menu={["Save as draft", "Save a copy"]} onSelect={(index) => picked.push(index)} />);
      await openAndReveal(() => fireEvent.click(named("More actions")));
      expect(focused().textContent).toBe("Save as draft");
      press("ArrowDown");
      press("Enter");
      await settle();
      expect(picked).toEqual([2]);
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("enters the PhoneInput country list at the selected country, its one stop, right after the country segment", async () => {
    await withLayout(async () => {
      page(<PhoneInput label="Phone" defaultCountry="GB" />);
      const segment = screen.getByRole("button", { name: /Country/ });
      await openAndReveal(() => fireEvent.click(segment));
      expect(focused().getAttribute("aria-selected")).toBe("true");
      expect(focused().getAttribute("aria-label")).toContain("United Kingdom");
      // The rows are the list's one stop (the WAI-ARIA listbox): its overflowing port takes none.
      const list = screen.getByRole("listbox");
      expect([...stops()].filter((stop) => list.contains(stop) || stop.contains(list))).toEqual([focused()]);
      // The list opened from the country segment, so it sits right after it, before the
      // number field the anchoring box also holds: Shift+Tab closes it on the segment.
      tab(true);
      expect(focused()).toBe(segment);
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
      await openAndReveal(() => fireEvent.click(segment));
      tab();
      expect(focused()).toBe(screen.getByRole("textbox", { name: "Phone" }));
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("moves from a focused node in the card that is no stop to the card's stops around it", async () => {
    // A card's panel, or a row the roving stop is not on, is focused without being a stop:
    // Tab and Shift+Tab go to the card's own stops on either side of it in document order
    // (an overflowing list's scrollport before its rows), never back to the trigger past them.
    function Card() {
      const trigger = useRef<View>(null);
      return (
        <>
          <View ref={trigger}><Button>Open</Button></View>
          <AnchoredOverlay open dismissOnTab onDismiss={() => {}} triggerRef={trigger}>
            <View role="dialog">
              <Button>First</Button>
              <View tabIndex={-1} testID="row"><Text>Row</Text></View>
              <Button>Last</Button>
            </View>
          </AnchoredOverlay>
        </>
      );
    }
    await withLayout(async () => {
      page(<Card />);
      await reveal();
      const row = screen.getByTestId("row");
      act(() => row.focus());
      tab(true);
      expect(focused()).toBe(named("First"));
      act(() => row.focus());
      tab();
      expect(focused()).toBe(named("Last"));
      // And past the card's ends, on in the trigger's place as before.
      tab();
      expect(focused()).toBe(named("After"));
    });
  });

  it("keeps Tab out of a list inside a modal Dialog within the dialog", async () => {
    // The list's trigger is the dialog's last stop: Tab out of the list closes it and wraps
    // to the dialog's first stop, as the dialog's own trap does, never to the page behind.
    await withLayout(async () => {
      page(
        <Dialog open title="Order">
          <Input accessibilityLabel="Name" />
          <Select options={["Small", "Medium", "Large"]} defaultValue="Medium" />
        </Dialog>,
      );
      const dialog = screen.getByRole("dialog");
      const trigger = screen.getByRole("button", { expanded: false });
      await openAndReveal(() => fireEvent.click(trigger));
      expect(focused().textContent).toContain("Medium");
      tab();
      expect(dialog.contains(focused())).toBe(true);
      expect(focused()).toBe(screen.getByRole("textbox", { name: "Name" }));
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
      // Shift+Tab from the dialog's first stop wraps to its last, the trigger, as before.
      tab(true);
      expect(focused()).toBe(trigger);
    });
  });

  it("places a list opened inside a popover right after its own trigger in the popover's run", async () => {
    // The list's trigger sits in the popover's card, so the list's run goes inside the
    // popover's, right after the trigger there: Shift+Tab from the list lands on its trigger,
    // and Tab closes it and goes on to the popover's next stop, never to the page past it.
    await withLayout(async () => {
      page(
        <Popover trigger="Rename" title="Rename project" actionLabel="Save">
          <Select options={["Small", "Medium", "Large"]} defaultValue="Medium" />
        </Popover>,
      );
      act(() => named("Rename").focus());
      await openAndReveal(() => fireEvent.click(named("Rename")));
      tab();
      const select = screen.getByRole("button", { expanded: false });
      expect(focused()).toBe(select);
      await openAndReveal(() => fireEvent.click(select));
      expect(focused().textContent).toContain("Medium");
      tab(true);
      expect(focused()).toBe(select);
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
      await openAndReveal(() => fireEvent.click(select));
      expect(focused().textContent).toContain("Medium");
      tab();
      expect(focused()).toBe(named("Save"));
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });

  it("moves a focused page node that is no stop to the page's next stop, not into a card placed before it", async () => {
    // The card's run stands at its trigger, which comes before the heading: Tab from the
    // heading goes on to the control after it, though the card's controls follow it in the
    // document, and Shift+Tab goes back into the card's run, the last stop placed before it.
    function Card() {
      const trigger = useRef<View>(null);
      return (
        <>
          <View ref={trigger}><Button>Open</Button></View>
          <View tabIndex={-1} testID="heading"><Text>Heading</Text></View>
          <Button>Next</Button>
          <AnchoredOverlay open onDismiss={() => {}} triggerRef={trigger}>
            <View role="dialog"><Button>Inside</Button></View>
          </AnchoredOverlay>
        </>
      );
    }
    await withLayout(async () => {
      page(<Card />);
      await reveal();
      const heading = screen.getByTestId("heading");
      act(() => heading.focus());
      tab();
      expect(focused()).toBe(named("Next"));
      act(() => heading.focus());
      tab(true);
      expect(focused()).toBe(named("Inside"));
    });
  });

  it("takes no focus into a card pinned open: the page keeps it as the cards are revealed", async () => {
    // A card that cannot close (a controlled `open` with no change handler, a docs example)
    // is content on the page that nobody opened. Its reveal moves no focus, so a page whose
    // examples render menus, lists and a popover pinned open keeps the focus it had.
    await withLayout(async () => {
      page(
        <>
          <RowMenu open items={[{ label: "Edit" }, { label: "Delete" }]} />
          <Dropdown open trigger="Actions" items={[{ label: "Edit profile" }]} />
          <Select open options={["Small", "Medium"]} defaultValue="Small" />
          <Popover open trigger="Rename" title="Rename project" actionLabel="Save" />
        </>,
      );
      act(() => named("Before").focus());
      await reveal();
      expect(screen.getAllByRole("menu")).toHaveLength(2);
      expect(screen.getByRole("listbox")).toBeTruthy();
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(focused()).toBe(named("Before"));
    });
  });

  it("steers a Tab from one trigger into its own card only, never into a card pinned open further down", async () => {
    // The audit's RowMenu focus cell: the control before a RowMenu trigger is another RowMenu's
    // trigger, and menus pinned open sit further down the page. Tab from the first trigger
    // reaches the next, Tab from a pinned menu's trigger enters that menu, and Tab from its
    // rows goes on to the control after its trigger.
    await withLayout(async () => {
      page(
        <>
          <RowMenu triggerLabel="First options" items={[{ label: "Edit" }]} />
          <RowMenu triggerLabel="Second options" items={[{ label: "Edit" }]} />
          <RowMenu triggerLabel="Pinned options" open items={[{ label: "Rename" }, { label: "Archive" }]} />
        </>,
      );
      await reveal();
      act(() => named("First options").focus());
      tab();
      expect(focused()).toBe(named("Second options"));
      tab();
      expect(focused()).toBe(named("Pinned options"));
      tab();
      expect(focused().textContent).toBe("Rename");
      tab();
      expect(focused()).toBe(named("After"));
      expect(screen.getByRole("menu")).toBeTruthy();
    });
  });

  it("gives back to the trigger the focus a closing menu held, and leaves a combobox's field alone", async () => {
    await withLayout(async () => {
      page(<Dropdown trigger="Actions" items={[{ label: "Edit profile" }]} />);
      await openAndReveal(() => fireEvent.click(named("Actions")));
      expect(focused().textContent).toBe("Edit profile");
      press("Escape");
      await settle();
      expect(focused()).toBe(named("Actions"));
    });
    cleanup();
    await withLayout(async () => {
      page(<Autocomplete options={["Apple", "Banana"]} />);
      const field = screen.getByRole("combobox");
      act(() => field.focus());
      await reveal();
      press("Escape");
      await settle();
      // The field kept focus and the list stayed closed: nothing handed focus back to it.
      expect(focused()).toBe(field);
      expect(field.getAttribute("aria-expanded")).toBe("false");
    });
  });
});

// Observe the native-only accessibility props at React Native's View boundary, before
// react-native-web drops them, keyed by the DOM node each lands on.
async function withNativeProps(run: (props: (node: Element) => ViewProps | undefined) => Promise<void>) {
  const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
  const original = component.render;
  type Record = { props: ViewProps; callback: (node: unknown) => void };
  const byNode = new WeakMap<Element, Record>();
  const forwards = new Map<unknown, Record>();
  const observed = (props: ViewProps) => "accessibilityViewIsModal" in props || "importantForAccessibility" in props;
  const spy = spyOn(component, "render").mockImplementation((props, ref) => {
    if (!observed(props)) return original(props, ref);
    // A view with no ref of its own is recorded through a fresh callback each render.
    if (ref == null) {
      const record: Record = { props, callback: () => {} };
      return original(props, (node: unknown) => { if (node instanceof Element) byNode.set(node, record); });
    }
    let forward = forwards.get(ref);
    if (!forward) {
      const record: Record = { props, callback: () => {} };
      record.callback = (node: unknown) => {
        if (node instanceof Element) byNode.set(node, record);
        if (typeof ref === "function") ref(node);
        else ref.current = node;
      };
      forward = record;
      forwards.set(ref, record);
    }
    forward.props = props;
    return original(props, forward.callback);
  });
  try {
    await run((node) => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        const record = byNode.get(current);
        if (record) return record.props;
      }
      return undefined;
    });
  } finally { spy.mockRestore(); }
}
const outletOf = () => [...document.querySelectorAll("div")].find((node) => getComputedStyle(node).zIndex === "1000")!;

describe("the phone sheet is modal on the web too (AO-6)", () => {
  // A sheet dims the page and takes every press off it; the keyboard and screen readers
  // keep to it as well, as HIG and Material 3 modal sheets and Dark Factory's sheets over
  // a dimmed page do, so focus never lands on a control the sheet covers (WCAG 2.4.11).
  it("keeps Tab inside an open sheet, wrapping at its ends, and its dialog is aria-modal", async () => {
    act(() => resizeViewport(390, 844));
    await withLayout(async () => {
      page(<Popover trigger="Rename" title="Rename project" actionLabel="Save"><Input placeholder="Project name" /></Popover>);
      act(() => named("Rename").focus());
      await openAndReveal(() => fireEvent.click(named("Rename")));
      const dialog = screen.getByRole("dialog");
      expect(focused()).toBe(dialog);
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      const field = screen.getByRole("textbox");
      tab();
      expect(focused()).toBe(field);
      tab();
      expect(focused()).toBe(named("Save"));
      // Past its last control focus wraps to its first, never on to the page it covers.
      tab();
      expect(focused()).toBe(field);
      tab(true);
      expect(focused()).toBe(named("Save"));
      // A Tab from the page behind it (focus put there by a script) enters the sheet.
      act(() => named("After").focus());
      tab();
      expect(focused()).toBe(field);
      act(() => named("Before").focus());
      tab(true);
      expect(focused()).toBe(named("Save"));
      expect(screen.getByRole("dialog")).toBeTruthy();
      // Escape closes it, and the focus it held goes back to its trigger.
      press("Escape");
      await settle();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(focused()).toBe(named("Rename"));
    });
  });

  it("leaves a Dialog opened from the sheet its own order, and a sheet over another holds the focus", async () => {
    act(() => resizeViewport(390, 844));
    function SheetWithDialog() {
      const [confirming, setConfirming] = useState(false);
      return <>
        <Popover trigger="Rename" title="Rename project">
          <Button onPress={() => setConfirming(true)}>Delete</Button>
          <Popover trigger="Details" title="Project details" actionLabel="Done" />
        </Popover>
        <Dialog open={confirming} onOpenChange={setConfirming} title="Delete project?">
          <Input accessibilityLabel="Project to delete" />
        </Dialog>
      </>;
    }
    await withLayout(async () => {
      page(<SheetWithDialog />);
      act(() => named("Rename").focus());
      await openAndReveal(() => fireEvent.click(named("Rename")));
      tab();
      expect(focused()).toBe(named("Delete"));
      // A Dialog opened from the sheet: Tab stays in the Dialog, never back in the sheet.
      fireEvent.click(named("Delete"));
      await settle();
      const field = screen.getByRole("textbox", { name: "Project to delete" });
      const confirm = screen.getAllByRole("dialog").find((dialog) => dialog.contains(field))!;
      act(() => field.focus());
      for (let step = 0; step < 4; step += 1) {
        tab();
        expect(confirm.contains(focused())).toBe(true);
      }
      press("Escape");
      await settle();
      expect(screen.queryByRole("textbox", { name: "Project to delete" })).toBeNull();
      // A sheet opened from the sheet holds the focus over it: a Tab from the sheet under
      // it (focus put there by a script) goes into the top one.
      act(() => named("Details").focus());
      await openAndReveal(() => fireEvent.click(named("Details")));
      const details = screen.getAllByRole("dialog").find((dialog) => dialog.getAttribute("aria-label") == null && dialog.textContent?.includes("Project details"))!;
      expect(details.getAttribute("aria-modal")).toBe("true");
      act(() => named("Delete").focus());
      tab();
      expect(focused()).toBe(named("Done"));
      tab();
      expect(focused()).toBe(named("Done"));
    });
  });

  it("keeps a list opened inside the sheet in the sheet's run", async () => {
    act(() => resizeViewport(390, 844));
    await withLayout(async () => {
      page(
        <Popover trigger="Rename" title="Rename project" actionLabel="Save">
          <Select options={["Small", "Medium", "Large"]} defaultValue="Medium" />
        </Popover>,
      );
      act(() => named("Rename").focus());
      await openAndReveal(() => fireEvent.click(named("Rename")));
      tab();
      const select = screen.getByRole("button", { expanded: false });
      expect(focused()).toBe(select);
      await openAndReveal(() => fireEvent.click(select));
      expect(focused().textContent).toContain("Medium");
      // Tab closes the list and goes on to the sheet's next stop, then wraps in the sheet.
      tab();
      expect(focused()).toBe(named("Save"));
      await settle();
      expect(screen.queryByRole("listbox")).toBeNull();
      tab();
      expect(focused()).toBe(select);
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });
});

describe("an open card is modal to VoiceOver and TalkBack (AO-2)", () => {
  it("hides the window's page behind a card that can close, and only while it is open", async () => {
    await withNativeProps(async (props) => withLayout(async () => {
      page(<Dropdown trigger="Actions" items={[{ label: "Edit profile" }]} />);
      // The window layer's outlet is the page's sibling: VoiceOver ignores the page while
      // the outlet is modal.
      expect(props(outletOf())?.accessibilityViewIsModal).toBe(false);
      await openAndReveal(() => fireEvent.click(named("Actions")));
      expect(props(outletOf())?.accessibilityViewIsModal).toBe(true);
      expect(props(screen.getByRole("menu"))?.accessibilityViewIsModal).toBe(true);
      press("Escape");
      await settle();
      expect(props(outletOf())?.accessibilityViewIsModal).toBe(false);
    }));
  });

  it("covers a card with the one opened from it", async () => {
    let host: OverlayHost | null = null;
    function Capture() {
      const value = useOverlayHost();
      useEffect(() => { host = value; }, [value]);
      return null;
    }
    await withNativeProps(async (props) => withLayout(async () => {
      page(<><Capture /><Popover trigger="Settings" title="Settings">
        <Select options={["Small", "Large"]} placeholder="Choose a size" />
      </Popover></>);
      await openAndReveal(() => fireEvent.click(named("Settings")));
      const first = host!.topModal!();
      expect(first).not.toBeNull();
      await openAndReveal(() => fireEvent.click(screen.getByText("Choose a size")));
      expect(host!.topModal!()).not.toBe(first);
      const dialog = props(screen.getByRole("dialog"));
      const list = props(screen.getByRole("listbox"));
      expect(dialog?.accessibilityViewIsModal).toBe(false);
      expect(dialog?.importantForAccessibility).toBe("no-hide-descendants");
      expect(list?.accessibilityViewIsModal).toBe(true);
      expect(list?.importantForAccessibility).toBe("auto");
    }));
  });

  it("leaves the page alone for a card pinned open and for a combobox's list", async () => {
    await withNativeProps(async (props) => withLayout(async () => {
      page(<Dropdown open trigger="Actions" items={[{ label: "Edit profile" }]} />);
      await reveal();
      expect(props(outletOf())?.accessibilityViewIsModal).toBe(false);
    }));
    cleanup();
    await withNativeProps(async (props) => withLayout(async () => {
      page(<Autocomplete options={["Apple", "Banana"]} defaultOpen />);
      await reveal();
      expect(screen.getByRole("listbox")).toBeTruthy();
      expect(props(outletOf())?.accessibilityViewIsModal).toBe(false);
    }));
  });

  it("gives Android's window layer a page node of its own to hide, laid out like the capture split", async () => {
    await withNativeProps(async (props) => {
      const host = (pageHidden?: boolean) => (
        <GlassBlurTargetHost style={{ flex: 1 }} targetRef={{ current: null }} outlet={<View testID="outlet" />} pageHidden={pageHidden}>
          <Text testID="page">Page</Text>
        </GlassBlurTargetHost>
      );
      const view = render(host(true));
      const pageNode = screen.getByTestId("page").parentElement!;
      // The page sits in its own node, apart from the outlet, filling the wrapper as the
      // capture host does, and that node is hidden from TalkBack.
      expect(pageNode.contains(screen.getByTestId("outlet"))).toBe(false);
      expect(pageNode.getAttribute("style")).toContain("flex-grow: 1");
      expect(props(pageNode)?.importantForAccessibility).toBe("no-hide-descendants");
      view.rerender(host(false));
      expect(props(screen.getByTestId("page").parentElement!)?.importantForAccessibility).toBe("auto");
      view.rerender(host(undefined));
      // A host that is no window layer keeps the single wrapper.
      expect(screen.getByTestId("page").parentElement!.contains(screen.getByTestId("outlet"))).toBe(true);
    });
  });

  it("moves the screen reader into the card on open and back to the trigger on close", async () => {
    const platform = Object.getOwnPropertyDescriptor(Platform, "OS")!;
    const sent: [unknown, string][] = [];
    // React Native Web has no sendAccessibilityEvent; stand one in to observe the call.
    const info = AccessibilityInfo as unknown as { sendAccessibilityEvent?: (node: unknown, event: string) => void };
    const had = Object.prototype.hasOwnProperty.call(info, "sendAccessibilityEvent");
    info.sendAccessibilityEvent ??= () => {};
    const send = spyOn(info as Required<typeof info>, "sendAccessibilityEvent").mockImplementation((node, event) => { sent.push([node, event]); });
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    try {
      await withLayout(async () => {
        page(<Dropdown trigger="Actions" items={[{ label: "Edit profile" }, { label: "Sign out" }]} />);
        await openAndReveal(() => fireEvent.click(named("Actions")));
        await waitFor(() => expect(sent.length).toBe(1));
        expect((sent[0]![0] as HTMLElement).textContent).toBe("Edit profile");
        expect(sent[0]![1]).toBe("focus");
        fireEvent.click(named("Actions"));
        await waitFor(() => expect(sent.length).toBe(2));
        // The trigger control itself, not the wrapper it is anchored by.
        expect(sent[1]![0]).toBe(named("Actions"));
      });
    } finally {
      send.mockRestore();
      if (!had) delete info.sendAccessibilityEvent;
      Object.defineProperty(Platform, "OS", platform);
    }
  });
});

describe("the inline (unhosted) card", () => {
  it("is already in flow after its trigger, and a menu still closes on a Tab out of it", () => {
    let dismissed = 0;
    function Menu() {
      const ref = useRef<View>(null);
      return <>
        <View ref={ref}><Button>Trigger</Button></View>
        <AnchoredOverlay open onDismiss={() => { dismissed += 1; }} triggerRef={ref} dismissOnTab>
          <Button>Row</Button>
        </AnchoredOverlay>
      </>;
    }
    render(<ThemeProvider><Menu /><Button>After</Button></ThemeProvider>);
    act(() => named("Row").focus());
    // The browser's own order is the logical one here, so nothing steers the move...
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => { named("Row").dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(false);
    // ...and the Tab out of the menu closes it.
    expect(dismissed).toBe(1);
  });
});
