import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";
import { Collapsible } from "../src/molecules/collapsible/collapsible.tsx";
import { Carousel } from "../src/organisms/carousel/carousel.tsx";
import { Toast, ToastProvider, useToast } from "../src/organisms/toast/toast.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const click = (sel: string, c: HTMLElement) => fireEvent.click(c.querySelector(sel) as Element);

describe("Stepper", () => {
  it("increments and decrements by step, clamped, and exposes the value", () => {
    let v = 5;
    const { container, rerender } = ui(
      <Stepper value={v} min={0} max={10} step={1} onChange={(n) => { v = n; }} />,
    );
    expect(container.querySelector("[aria-valuenow]")?.getAttribute("aria-valuenow")).toBe("5");
    click('[aria-label="Increase"]', container);
    expect(v).toBe(6);
    rerender(<ThemeProvider><Stepper value={v} min={0} max={10} onChange={(n) => { v = n; }} /></ThemeProvider>);
    click('[aria-label="Decrease"]', container);
    expect(v).toBe(5);
  });

  it("disables the minus control at the lower bound", () => {
    let called = false;
    const { container } = ui(<Stepper value={0} min={0} max={10} onChange={() => { called = true; }} />);
    const minus = container.querySelector('[aria-label="Decrease"]');
    expect(minus?.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(minus as Element);
    expect(called).toBe(false);
  });
});

describe("InputOTP", () => {
  it("strips non-digits and reports the cleaned code", () => {
    let code = "";
    const { container } = ui(<InputOTP value="12" length={6} onChangeText={(c) => { code = c; }} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("One-time code");
    fireEvent.change(input, { target: { value: "12a4" } });
    expect(code).toBe("124");
  });

  it("is typeable uncontrolled: a bare field accepts input and updates its cells", () => {
    const { container } = ui(<InputOTP length={6} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "42" } });
    expect(input.value).toBe("42");
  });

  it("fires onComplete once the value fills every cell", () => {
    let done = "";
    const { rerender } = ui(<InputOTP value="123" length={4} onChangeText={() => {}} onComplete={(c) => { done = c; }} />);
    rerender(<ThemeProvider><InputOTP value="1234" length={4} onChangeText={() => {}} onComplete={(c) => { done = c; }} /></ThemeProvider>);
    expect(done).toBe("1234");
  });

  it("keeps letters when alphanumeric and asks for the text keyboard", () => {
    let code = "";
    const { container } = ui(<InputOTP alphanumeric length={6} onChangeText={(c) => { code = c; }} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("inputmode")).toBe("text");
    fireEvent.change(input, { target: { value: "G7x" } });
    expect(code).toBe("G7x");
  });

  it("seeds an uncontrolled field from defaultValue and stays typeable", () => {
    const { container } = ui(<InputOTP length={6} defaultValue="12" />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("12");
    fireEvent.change(input, { target: { value: "123" } });
    expect(input.value).toBe("123");
  });

  it("cleans the defaultValue seed the same way typed input is cleaned", () => {
    const { container } = ui(<InputOTP length={4} defaultValue="1a2b345" />);
    expect((container.querySelector("input") as HTMLInputElement).value).toBe("1234");
  });

  it("splits the run into groups with one separator between them", () => {
    const { container } = ui(<InputOTP length={6} groups={3} defaultValue="123" />);
    expect((container.textContent?.match(/–/g) ?? []).length).toBe(1);
    const ungrouped = ui(<InputOTP length={6} defaultValue="123" />);
    expect(ungrouped.container.textContent).not.toContain("–");
  });

  it("pins a stray caret back to the end so a keystroke never lands mid-code", () => {
    const { container } = ui(<InputOTP length={6} defaultValue="12" />);
    const input = container.querySelector("input") as HTMLInputElement;
    act(() => {
      input.setSelectionRange(0, 0);
      fireEvent.select(input);
    });
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);
  });

  it("leaves a select-all alone so a paste still replaces the whole code", () => {
    const { container } = ui(<InputOTP length={6} defaultValue="12" />);
    const input = container.querySelector("input") as HTMLInputElement;
    act(() => {
      input.setSelectionRange(0, 2);
      fireEvent.select(input);
    });
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2);
  });
});

describe("Collapsible", () => {
  it("toggles its single panel and exposes expanded state", () => {
    const { container } = ui(<Collapsible title="More"><Text>Body</Text></Collapsible>);
    expect(container.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByText("More"));
    expect(container.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("Carousel", () => {
  const items = [
    { key: "a", content: "A" },
    { key: "b", content: "B" },
    { key: "c", content: "C" },
  ];
  it("renders one dot per slide with the current one selected", () => {
    const { container } = ui(<Carousel index={0} onIndexChange={() => {}} items={items} />);
    const dots = container.querySelectorAll("[aria-selected]");
    expect(dots.length).toBe(3);
    expect(dots[0].getAttribute("aria-selected")).toBe("true");
  });

  it("advances the controlled index from the next arrow and the dots", () => {
    let idx = 0;
    const { container } = ui(<Carousel index={0} onIndexChange={(i) => { idx = i; }} items={items} />);
    click('[aria-label="Next slide"]', container);
    expect(idx).toBe(1);
    click('[aria-label="Go to slide 3"]', container);
    expect(idx).toBe(2);
  });
});

describe("Toast (presentational)", () => {
  it("renders the message as a polite status region", () => {
    const { container } = ui(<Toast success message="Saved" />);
    expect(screen.getByText("Saved")).toBeDefined();
    // role="status" is the polite live region (consistent with aria-live="polite");
    // role="alert" would be assertive and contradict the polite announcement.
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it("runs the action and the dismiss handlers", () => {
    let undone = false;
    let dismissed = false;
    const { container } = ui(
      <Toast message="Archived" action={{ label: "Undo", onPress: () => { undone = true; } }} onDismiss={() => { dismissed = true; }} />,
    );
    fireEvent.click(screen.getByText("Undo"));
    expect(undone).toBe(true);
    click('[aria-label="Dismiss"]', container);
    expect(dismissed).toBe(true);
  });
});

describe("Toast (imperative ToastProvider + useToast)", () => {
  function Fire({ options }: { options: Parameters<ReturnType<typeof useToast>["toast"]>[0] }) {
    const { toast } = useToast();
    return (
      <Pressable accessibilityRole="button" accessibilityLabel="fire" onPress={() => toast(options)}>
        <Text>fire</Text>
      </Pressable>
    );
  }

  it("enqueues a toast on demand and auto-dismisses it after its duration", async () => {
    const { container } = ui(
      <ToastProvider>
        <Fire options={{ message: "Hello there", duration: 40 }} />
      </ToastProvider>,
    );
    expect(screen.queryByText("Hello there")).toBeNull();
    click('[aria-label="fire"]', container);
    expect(screen.getByText("Hello there")).toBeDefined();
    // Deterministic, load-immune: the 40ms auto-dismiss timer is due before this 60ms
    // sleep, and timers on the same clock fire in due order however starved the runner
    // is (a stall delays both equally). Sleeping inside act() flushes the dismiss state
    // update before the single synchronous assertion; no DOM polling window.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(screen.queryByText("Hello there")).toBeNull();
  });

  it("keeps a zero-duration toast until dismissed", () => {
    const { container } = ui(
      <ToastProvider>
        <Fire options={{ message: "Sticky one", duration: 0 }} />
      </ToastProvider>,
    );
    click('[aria-label="fire"]', container);
    expect(screen.getByText("Sticky one")).toBeDefined();
    // The provider injects a dismiss control on every queued toast.
    click('[aria-label="Dismiss"]', container);
    expect(screen.queryByText("Sticky one")).toBeNull();
  });
});
