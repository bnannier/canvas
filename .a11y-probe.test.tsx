import { describe, it, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./src/style/theme.tsx";
import { AvatarMenu } from "./src/atoms/avatar/avatar.tsx";
import { Dropdown } from "./src/atoms/dropdown/dropdown.tsx";

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const ITEMS = [{ label: "Profile", icon: "user" as const }, { label: "Settings" }, { label: "Sign out", destructive: true }];

function dump(title: string, html: string) {
  console.log("\n===== " + title + " =====\n" + html.replace(/></g, ">\n<"));
}

describe("probe", () => {
  it("pill closed", () => {
    const { container } = ui(<AvatarMenu name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    dump("PILL CLOSED", container.innerHTML);
  });
  it("pill with photo compact", () => {
    const { container } = ui(<AvatarMenu compact src="https://x/y.png" name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    dump("PILL COMPACT PHOTO", container.innerHTML);
  });
  it("pill disabled", () => {
    const { container } = ui(<AvatarMenu disabled name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    dump("PILL DISABLED", container.innerHTML);
    const btn = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    console.log("DISABLED trigger tabIndex:", btn.getAttribute("tabindex"), "disabled attr:", btn.getAttribute("disabled"), "tag:", btn.tagName, "aria-disabled:", btn.getAttribute("aria-disabled"));
    fireEvent.click(btn);
    console.log("after click, menu present:", !!container.querySelector('[role="menu"]'));
  });
  it("pill open", () => {
    const { container } = ui(<AvatarMenu name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    const btn = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    fireEvent.click(btn);
    dump("PILL OPEN", container.innerHTML);
    console.log("active element after open:", document.activeElement?.outerHTML?.slice(0, 200));
  });
  it("keyboard: enter on trigger", () => {
    const { container } = ui(<AvatarMenu name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    const btn = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    btn.focus();
    console.log("focused trigger === activeElement:", document.activeElement === btn, "tabindex:", btn.getAttribute("tabindex"));
    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(btn, { key: "Enter", code: "Enter" });
    console.log("after Enter keydown/up, menu open:", !!container.querySelector('[role="menu"]'));
    fireEvent.keyDown(btn, { key: " ", code: "Space" });
    fireEvent.keyUp(btn, { key: " ", code: "Space" });
    console.log("after Space, menu open:", !!container.querySelector('[role="menu"]'));
  });
  it("escape then focus", () => {
    const { container } = ui(<AvatarMenu name="Rachel Chen" email="rachel@example.com" items={ITEMS} />);
    const btn = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    btn.focus();
    fireEvent.click(btn);
    console.log("open:", !!container.querySelector('[role="menu"]'), "active:", document.activeElement?.getAttribute("role"), document.activeElement?.textContent);
    fireEvent.keyDown(document, { key: "Escape" });
    console.log("after Escape open:", !!container.querySelector('[role="menu"]'));
    console.log("activeElement after escape:", document.activeElement?.tagName, document.activeElement === btn ? "TRIGGER" : document.activeElement === document.body ? "BODY" : "other");
  });
  it("dropdown header nodes", () => {
    const { container } = ui(<Dropdown open trigger="Menu" title="Rachel Chen" description="rachel@example.com" label="Actions" items={ITEMS} />);
    dump("DROPDOWN HEADER", container.innerHTML);
  });
});
