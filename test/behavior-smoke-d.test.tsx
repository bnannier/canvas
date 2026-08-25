import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";

// Behavior coverage for two organisms that previously had only mount-smoke tests.
// These drive the real logic: Navbar's active-link selection (controlled and
// uncontrolled) plus its action/avatar clusters, and Steps' per-step state
// derivation, its layout-axis precedence, and the pressable-step contract (which
// differs between the horizontal and vertical layouts).

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

describe("Navbar — active link selection", () => {
  const links = ["Home", "Docs", "Pricing"];

  it("renders the brand + links and marks the default-active (first) link aria-current=page", () => {
    const { container } = ui(<Navbar brand="Acme" links={links} />);
    expect(screen.getByText("Acme")).toBeDefined();
    for (const l of links) expect(screen.getByText(l)).toBeDefined();
    // The active link (index 0 by default) is the sole aria-current="page" node.
    const current = container.querySelectorAll('[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toBe("Home");
  });

  it("moves the active link on press and reports the index (uncontrolled)", () => {
    let picked = -1;
    const { container } = ui(<Navbar brand="Acme" links={links} onSelect={(i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Docs"));
    expect(picked).toBe(1);
    // Uncontrolled: the active marker follows the press to "Docs".
    const current = container.querySelectorAll('[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toBe("Docs");
  });

  it("respects a controlled active index: onSelect fires but the marker does not self-advance", () => {
    let picked = -1;
    const { container } = ui(<Navbar brand="Acme" links={links} active={2} onSelect={(i) => { picked = i; }} />);
    // Pinned to index 2 ("Pricing").
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("Pricing");
    fireEvent.click(screen.getByText("Home"));
    // The callback reports the pressed index, but the controlled marker stays put.
    expect(picked).toBe(0);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("Pricing");
  });
});

describe("Navbar — action + avatar clusters", () => {
  it("fires onAction when the primary action button is pressed", () => {
    let acted = false;
    ui(<Navbar brand="Acme" links={["Home"]} actionLabel="Sign up" onAction={() => { acted = true; }} />);
    fireEvent.click(screen.getByText("Sign up"));
    expect(acted).toBe(true);
  });

  it("renders an account avatar from the provided name (its initials)", () => {
    ui(<Navbar brand="Acme" links={["Home"]} avatar="Ada Lovelace" />);
    // Avatar reduces "Ada Lovelace" to the initials "AL".
    expect(screen.getByText("AL")).toBeDefined();
  });
});

// The console topbar shape: a logo mark for a brand, arbitrary trailing controls,
// and no middle nav at all. Both slots are additive, so the built-in brand
// wordmark, action button and avatar keep rendering exactly where they did.
describe("Navbar: brand element and trailing actions slots", () => {
  const follows = (first: Element, second: Element) =>
    Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

  it("leads the left cluster with brandContent and keeps brand as the wordmark beside it", () => {
    ui(<Navbar brand="Acme" brandContent={<Text testID="logo">◆</Text>} links={["Home"]} />);
    const logo = screen.getByTestId("logo");
    expect(follows(logo, screen.getByText("Acme"))).toBe(true);
    // The links row still trails the whole brand group.
    expect(follows(screen.getByText("Acme"), screen.getByText("Home"))).toBe(true);
  });

  it("renders brandContent as the whole brand when no wordmark is given", () => {
    ui(<Navbar brandContent={<Text testID="logo">◆</Text>} />);
    expect(screen.getByTestId("logo")).toBeDefined();
    expect(screen.queryByText("Acme")).toBeNull();
  });

  it("leads the right cluster with actions, ahead of the built-in action button and avatar", () => {
    ui(
      <Navbar
        brand="Acme"
        links={["Home"]}
        actions={<Text testID="search">Search</Text>}
        actionLabel="Sign up"
        avatar="Ada Lovelace"
      />,
    );
    const search = screen.getByTestId("search");
    expect(follows(search, screen.getByText("Sign up"))).toBe(true);
    expect(follows(screen.getByText("Sign up"), screen.getByText("AL"))).toBe(true);
  });

  it("renders no links row for a bar with no middle nav, and leaves the slots rendering", () => {
    ui(<Navbar brandContent={<Text testID="logo">◆</Text>} actions={<Text testID="search">Search</Text>} />);
    expect(screen.getByTestId("logo")).toBeDefined();
    expect(screen.getByTestId("search")).toBeDefined();
    // No link tile, and no menu button standing in for one.
    expect(document.querySelectorAll('[aria-current="page"]').length).toBe(0);
    expect(screen.queryByLabelText("Navigation menu")).toBeNull();
  });
});

describe("Steps — per-step state (horizontal default)", () => {
  const steps = [{ label: "A" }, { label: "B" }, { label: "C" }, { label: "D" }];

  it("shows a check for completed steps and the number for current/upcoming", () => {
    ui(<Steps current={2} steps={steps} />);
    for (const s of steps) expect(screen.getByText(s.label)).toBeDefined();
    // Steps 0,1 are completed -> two "✓" glyphs (their numbers are replaced).
    expect(screen.getAllByText("✓").length).toBe(2);
    expect(screen.queryByText("1")).toBeNull();
    expect(screen.queryByText("2")).toBeNull();
    // Step 2 is current -> "3"; step 3 is upcoming -> "4".
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });
});

describe("Steps — pressable step contract", () => {
  it("horizontal: a step press reports its index WITHOUT moving the active step", () => {
    let pressed = -1;
    ui(<Steps defaultCurrent={0} onStepPress={(i) => { pressed = i; }} steps={[{ label: "A" }, { label: "B" }, { label: "C" }]} />);
    // Default current is 0 -> step 0 shows "1"; no completed checks yet.
    expect(screen.queryByText("✓")).toBeNull();
    // Press step 2 (glyph "3").
    fireEvent.click(screen.getByText("3"));
    expect(pressed).toBe(2);
    // Horizontal steps do not self-advance: still no completed checks.
    expect(screen.queryByText("✓")).toBeNull();
  });

  it("vertical: a step press reports its index AND advances the active step", () => {
    let pressed = -1;
    ui(<Steps vertical defaultCurrent={0} onStepPress={(i) => { pressed = i; }} steps={[{ label: "One" }, { label: "Two" }, { label: "Three" }]} />);
    expect(screen.queryByText("✓")).toBeNull();
    // Press step 2 (its circle glyph is "3").
    fireEvent.click(screen.getByText("3"));
    expect(pressed).toBe(2);
    // Vertical steps advance: steps 0 and 1 are now completed -> two checks.
    expect(screen.getAllByText("✓").length).toBe(2);
  });
});

describe("Steps — progress layout", () => {
  it("renders the caption and clamps the percentage to [0,100]", () => {
    ui(<Steps progress value={140} label="Upload" steps={[]} />);
    expect(screen.getByText("Upload")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("defaults the caption and floors a negative value to 0%", () => {
    ui(<Steps progress value={-10} steps={[]} />);
    expect(screen.getByText("Setup progress")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("progress wins the layout axis over vertical (first-match precedence)", () => {
    ui(<Steps progress vertical value={50} steps={[{ label: "StepLabel" }]} />);
    // Progress mode renders the bar, not the discrete steps.
    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.queryByText("StepLabel")).toBeNull();
  });
});

describe("Steps — vertical layout", () => {
  it("renders each step label and its optional description", () => {
    ui(<Steps vertical current={1} steps={[{ label: "Ship", description: "Deploy the build" }, { label: "Verify" }]} />);
    expect(screen.getByText("Ship")).toBeDefined();
    expect(screen.getByText("Deploy the build")).toBeDefined();
    expect(screen.getByText("Verify")).toBeDefined();
  });
});
