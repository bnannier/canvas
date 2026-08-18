import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AvatarMenu } from "../src/atoms/avatar/avatar.tsx";
import type { DropdownItem } from "../src/atoms/dropdown/dropdown.tsx";

// AvatarMenu: the account identity pill (avatar + name/email + chevron) wired to
// the kit's Dropdown. These lock the anatomy (one capsule trigger, no nested
// pressable), the controlled/uncontrolled open duality, the pass-through of the
// menu's identity header, and the accessible name that tells a screen reader
// WHOSE account the button opens.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

const ITEMS: DropdownItem[] = [
  { label: "Profile", icon: "user" },
  { label: "Settings", icon: "settings", shortcut: "⌘," },
  { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true },
];

const NAME = "Rachel Chen";
const EMAIL = "rachel@example.com";
const LABEL = `${NAME}, ${EMAIL}`;

const trigger = (c: HTMLElement) => c.querySelector('[aria-haspopup="menu"]') as HTMLElement;

describe("AvatarMenu pill", () => {
  it("renders the name over the email inside one capsule trigger", () => {
    const { container } = ui(<AvatarMenu name={NAME} email={EMAIL} items={ITEMS} />);
    expect(screen.getByText(NAME)).toBeDefined();
    expect(screen.getByText(EMAIL)).toBeDefined();
    // The initials fallback comes from the same Avatar the kit exports.
    expect(screen.getByText("RC")).toBeDefined();
    // One trigger only: the capsule is Dropdown's children, so there is exactly
    // one button and nothing pressable nested inside it.
    expect(container.querySelectorAll("button").length).toBe(1);
  });

  it("compact drops the identity column but keeps the avatar and the account name", () => {
    const { container } = ui(<AvatarMenu compact name={NAME} email={EMAIL} items={ITEMS} />);
    expect(screen.queryByText(NAME)).toBeNull();
    expect(screen.queryByText(EMAIL)).toBeNull();
    expect(screen.getByText("RC")).toBeDefined();
    expect(container.querySelector(`[aria-label="${LABEL}"]`)).not.toBeNull();
  });

  it("carries a data-carrying accessible name, falling back when there is no email", () => {
    const { container } = ui(<AvatarMenu name={NAME} items={ITEMS} />);
    expect(container.querySelector(`[aria-label="${NAME}"]`)).not.toBeNull();
    cleanup();
    const bare = ui(<AvatarMenu items={ITEMS} />).container;
    expect(bare.querySelector('[aria-label="Account menu"]')).not.toBeNull();
  });
});

describe("AvatarMenu open state", () => {
  it("is interactive out of the box: a bare pill opens its menu and closes on select", () => {
    let picked: { label: string; index: number } | null = null;
    const { container } = ui(
      <AvatarMenu
        name={NAME}
        email={EMAIL}
        items={ITEMS}
        onSelect={(item, index) => { picked = { label: item.label, index }; }}
      />,
    );
    expect(container.querySelector('[role="menu"]')).toBeNull();

    fireEvent.click(trigger(container));
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);

    fireEvent.click(screen.getByText("Sign out"));
    expect(picked).toEqual({ label: "Sign out", index: 2 });
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("honours a controlled open prop and reports every change", () => {
    const changes: boolean[] = [];
    const { container } = ui(
      <AvatarMenu open name={NAME} email={EMAIL} items={ITEMS} onOpenChange={(o) => { changes.push(o); }} />,
    );
    expect(container.querySelector('[role="menu"]')).not.toBeNull();

    fireEvent.click(screen.getByText("Profile"));
    // Controlled: the parent owns the state, so the menu stays open until the
    // parent flips `open`, but the close is reported.
    expect(changes).toEqual([false]);
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("passes the identity through to the menu header, so name and email appear twice while open", () => {
    const { container } = ui(<AvatarMenu open name={NAME} email={EMAIL} items={ITEMS} />);
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    // Once in the pill, once in the menu's identity header.
    expect(screen.getAllByText(NAME).length).toBe(2);
    expect(screen.getAllByText(EMAIL).length).toBe(2);
  });

  it("shows the identity header even when the pill itself is compact", () => {
    ui(<AvatarMenu open compact name={NAME} email={EMAIL} items={ITEMS} />);
    expect(screen.getAllByText(NAME).length).toBe(1);
    expect(screen.getAllByText(EMAIL).length).toBe(1);
  });

  it("anchors the menu to the trailing edge with alignEnd, and to the leading edge without it", () => {
    // The inline (no OverlayProvider) fallback positions the card absolutely under
    // the trigger. The kit writes the logical `start`/`end` inset; react-native-web
    // resolves it to the physical side for the active writing direction, so an LTR
    // render reads left for the default and right for alignEnd.
    const anchorOf = (c: HTMLElement) => {
      let node = c.querySelector('[role="menu"]')!.parentElement;
      while (node && node.style.position !== "absolute") node = node.parentElement;
      return node!.style;
    };
    const start = ui(<AvatarMenu open name={NAME} items={ITEMS} />).container;
    expect(anchorOf(start).left).toBe("0px");
    expect(anchorOf(start).right).toBe("");
    cleanup();
    const end = ui(<AvatarMenu open alignEnd name={NAME} items={ITEMS} />).container;
    expect(anchorOf(end).right).toBe("0px");
    expect(anchorOf(end).left).toBe("");
  });
});

describe("AvatarMenu accessibility and disabled", () => {
  it("exposes a menu-popup button whose aria-expanded tracks the menu", () => {
    const { container } = ui(<AvatarMenu name={NAME} email={EMAIL} items={ITEMS} />);
    const button = trigger(container);
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(trigger(container).getAttribute("aria-expanded")).toBe("true");
  });

  it("never opens while disabled, and announces the disabled trigger", () => {
    let changed = false;
    const { container } = ui(
      <AvatarMenu disabled name={NAME} email={EMAIL} items={ITEMS} onOpenChange={() => { changed = true; }} />,
    );
    const button = trigger(container);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(changed).toBe(false);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps a disabled pill collapsed even when open is forced", () => {
    const { container } = ui(<AvatarMenu open disabled name={NAME} items={ITEMS} />);
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(trigger(container).getAttribute("aria-expanded")).toBe("false");
  });
});
