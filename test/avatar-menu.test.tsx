import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AvatarMenu } from "../src/atoms/avatar/avatar.tsx";
import { webMenuSkin, iosMenuSkin, androidMenuSkin } from "../src/atoms/avatar/avatar.styles.ts";
import { lightColors } from "../src/style/tokens.ts";
import { alpha } from "../src/style/color.ts";
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

describe("AvatarMenu per-OS pill metrics", () => {
  // The identity pill's numbers are the web hand-off's --p-idpill-* tokens
  // (styles/tokens/platforms.css), transcribed into the RN skins so native reads
  // them from the skin and never from the CSS. These lock the transcription for
  // all three platforms without needing a native render.

  it("web: a 32px secondary capsule with a hairline that only colours when open", () => {
    expect(webMenuSkin.menuPill).toMatchObject({ height: 32, gap: 8, paddingStart: 4, paddingEnd: 10, borderWidth: 1 });
    expect(webMenuSkin.menuPillName).toMatchObject({ fontSize: 13, lineHeight: 16, fontWeight: "500" });
    // Tracking is 0 on web, so the skin sets none at all.
    expect(webMenuSkin.menuPillName.letterSpacing).toBeUndefined();

    const closed = webMenuSkin.menuPillFill(lightColors, false);
    expect(closed.backgroundColor).toBe(lightColors.secondary);
    expect(closed.borderColor).toBe("transparent");

    const open = webMenuSkin.menuPillFill(lightColors, true);
    expect(open.borderColor).toBe(lightColors.input);
    // The open fill is `secondary` lifted 6% toward `foreground` (the CSS
    // color-mix, computed here instead of with a web colour function).
    expect(open.backgroundColor).toBe("rgb(230, 230, 231)");
  });

  it("iOS: a 36pt capsule whose border hairline is always visible", () => {
    expect(iosMenuSkin.menuPill).toMatchObject({ height: 36, gap: 8, paddingStart: 5, paddingEnd: 12, borderWidth: 1 });
    expect(iosMenuSkin.menuPillName).toMatchObject({ fontSize: 15, lineHeight: 20, fontWeight: "600", letterSpacing: -0.15 });

    const closed = iosMenuSkin.menuPillFill(lightColors, false);
    expect(closed.backgroundColor).toBe("transparent");
    expect(closed.borderColor).toBe(lightColors.border);
    expect(iosMenuSkin.menuPillFill(lightColors, true).backgroundColor).toBe(lightColors.secondary);
  });

  it("Android: a 40dp tonal pill with no visible outline", () => {
    expect(androidMenuSkin.menuPill).toMatchObject({ height: 40, gap: 8, paddingStart: 6, paddingEnd: 14, borderWidth: 1 });
    expect(androidMenuSkin.menuPillName).toMatchObject({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1 });

    const closed = androidMenuSkin.menuPillFill(lightColors, false);
    // primary at 12% closed, 20% open: the M3 state-layer model.
    expect(closed.backgroundColor).toBe(alpha(lightColors.primary, 0.12));
    expect(closed.borderColor).toBe("transparent");
    expect(androidMenuSkin.menuPillFill(lightColors, true).backgroundColor).toBe(alpha(lightColors.primary, 0.2));
  });

  it("shares the 11/14 secondary line and the 14px chevron across platforms", () => {
    for (const skin of [webMenuSkin, iosMenuSkin, androidMenuSkin]) {
      expect(skin.menuPillSecondary).toMatchObject({ fontSize: 11, lineHeight: 14 });
      expect(skin.menuChevronSize).toBe(14);
    }
    // The secondary line follows its platform's name tracking.
    expect(webMenuSkin.menuPillSecondary.letterSpacing).toBeUndefined();
    expect(iosMenuSkin.menuPillSecondary.letterSpacing).toBe(-0.15);
    expect(androidMenuSkin.menuPillSecondary.letterSpacing).toBe(0.1);
  });
});
