import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

const SECTIONS = [{ id: "a", title: "Group A", items: [{ id: "one", label: "One" }, { id: "two", label: "Two" }] }];

describe("Sidebar active matching", () => {
  it("matches active by item id (string)", () => {
    const { container } = ui(<Sidebar sections={SECTIONS} active="two" />);
    const selected = container.querySelectorAll('[aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("Two");
  });

  it("still matches active by label (back-compat)", () => {
    const { container } = ui(<Sidebar sections={SECTIONS} active="One" />);
    const selected = container.querySelectorAll('[aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("One");
  });

  it("matches the empty-string home slug id", () => {
    const { container } = ui(<Sidebar items={[{ id: "", label: "Home" }, { id: "x", label: "Other" }]} active="" />);
    const selected = container.querySelectorAll('[aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("Home");
  });
});

describe("Sidebar collapse (mini icon-rail)", () => {
  it("hides row labels in the rail but keeps the accessible name", () => {
    ui(<Sidebar header={<Text>Brand</Text>} defaultCollapsed items={[{ id: "d", label: "Dashboard", icon: "home" }]} />);
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.getByLabelText("Dashboard")).toBeTruthy();
  });

  it("shows the collapse toggle only when collapsible, and fires onToggleCollapse", () => {
    let toggled = 0;
    const { rerender } = ui(<Sidebar header={<Text>Brand</Text>} items={[{ label: "X" }]} />);
    // Not collapsible: no toggle.
    expect(screen.queryByLabelText("Collapse sidebar")).toBeNull();
    rerender(
      <ThemeProvider>
        <Sidebar header={<Text>Brand</Text>} collapsible onToggleCollapse={() => { toggled += 1; }} items={[{ label: "X" }]} />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(toggled).toBe(1);
  });
});

describe("Sidebar accordion sections", () => {
  const ACC = [
    { id: "a", title: "Alpha", collapsible: true, items: [{ label: "a1" }] },
    { id: "b", title: "Beta", collapsible: true, items: [{ label: "b1" }] },
  ];

  it("collapsible section header carries aria-expanded and toggles open on press", () => {
    const { container } = ui(<Sidebar sections={ACC} />);
    const alpha = container.querySelector("[aria-expanded]");
    expect(alpha?.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("a1")).toBeNull();
    fireEvent.click(screen.getByText("Alpha"));
    expect(screen.getByText("a1")).toBeTruthy();
  });

  it("is one-open-at-a-time by default (opening one closes the other)", () => {
    ui(<Sidebar sections={ACC} defaultOpenSections="a" />);
    expect(screen.getByText("a1")).toBeTruthy();
    fireEvent.click(screen.getByText("Beta"));
    expect(screen.getByText("b1")).toBeTruthy();
    expect(screen.queryByText("a1")).toBeNull();
  });

  it("auto-opens the section that owns the active row", () => {
    ui(<Sidebar sections={ACC} active="b1" />);
    expect(screen.getByText("b1")).toBeTruthy();
    expect(screen.queryByText("a1")).toBeNull();
  });
});

describe("Sidebar shell slots", () => {
  it("renders the header and footer nodes", () => {
    ui(<Sidebar header={<Text>BrandRow</Text>} footer={<Text>FooterRow</Text>} items={[{ label: "X" }]} />);
    expect(screen.getByText("BrandRow")).toBeTruthy();
    expect(screen.getByText("FooterRow")).toBeTruthy();
  });
});
