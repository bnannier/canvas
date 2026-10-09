import { afterEach, describe, expect, it } from "bun:test";
import { type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pressable as RNWPressable, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Pressable } from "../src/style/pressable.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";

// A link presses on Enter (the APG link pattern). react-native-web's press responder leaves
// Enter on a `link` role to the browser, whose native click only an <a href> gets, so a link
// drawn without an href (a breadcrumb crumb, a navbar link) never activated from the
// keyboard. The kit's Pressable presses that link on the Enter keyup itself.

afterEach(cleanup);

const ui = (node: ReactNode) => render(<ThemeProvider solid>{node}</ThemeProvider>);
const enter = (node: HTMLElement, init: { repeat?: boolean } = {}) => {
  fireEvent.keyDown(node, { key: "Enter", ...init });
  fireEvent.keyUp(node, { key: "Enter" });
};

function link(props: Record<string, unknown> = {}) {
  const log: string[] = [];
  ui(
    <>
      <Pressable
        testID="link"
        accessibilityRole="link"
        onPress={() => log.push("press")}
        onPressIn={() => log.push("in")}
        onPressOut={() => log.push("out")}
        {...props}
      >
        <Text>Library</Text>
      </Pressable>
      <Pressable testID="elsewhere" onPress={() => {}}>
        <Text>Elsewhere</Text>
      </Pressable>
    </>,
  );
  const node = screen.getByTestId("link");
  act(() => node.focus());
  return { log, node };
}

describe("the kit Pressable's link on Enter", () => {
  it("presses once on the Enter keyup, and react-native-web still releases its press state", () => {
    const { log, node } = link();
    fireEvent.keyDown(node, { key: "Enter" });
    expect(log).toEqual(["in"]);
    fireEvent.keyDown(node, { key: "Enter", repeat: true });
    fireEvent.keyUp(node, { key: "Enter" });
    expect(log).toEqual(["in", "press", "out"]);
    fireEvent.keyUp(node, { key: "Enter" });
    expect(log.filter((entry) => entry === "press")).toHaveLength(1);
  });

  it("does not press on Space, as a link has no Space activation", () => {
    const { log, node } = link();
    fireEvent.keyDown(node, { key: " " });
    fireEvent.keyUp(node, { key: " " });
    expect(log).not.toContain("press");
  });

  it("presses for the role prop as for accessibilityRole", () => {
    const { log, node } = link({ accessibilityRole: undefined, role: "link" });
    enter(node);
    expect(log).toContain("press");
  });

  it("does not press when disabled", () => {
    const { log, node } = link({ disabled: true });
    enter(node);
    expect(log).not.toContain("press");
  });

  it("does not press for a keyup whose Enter went down elsewhere or before a blur", () => {
    const { log, node } = link();
    fireEvent.keyUp(node, { key: "Enter" });
    fireEvent.keyDown(node, { key: "Enter" });
    act(() => screen.getByTestId("elsewhere").focus());
    act(() => node.focus());
    fireEvent.keyUp(node, { key: "Enter" });
    expect(log).not.toContain("press");
  });

  it("leaves a link with an href to the browser, which clicks it on Enter", () => {
    const { log, node } = link({ href: "/library" });
    expect(node.tagName).toBe("A");
    enter(node);
    expect(log).not.toContain("press");
    fireEvent.click(node);
    expect(log).toContain("press");
  });

  it("still runs the caller's own key and blur handlers", () => {
    const seen: string[] = [];
    const { node } = link({ onKeyDown: () => seen.push("down"), onKeyUp: () => seen.push("up"), onBlur: () => seen.push("blur") });
    enter(node);
    act(() => screen.getByTestId("elsewhere").focus());
    expect(seen).toEqual(["down", "up", "blur"]);
  });

  it("leaves every other role's Enter to react-native-web: one press, no second path", () => {
    const { log, node } = link({ accessibilityRole: "menuitem" });
    enter(node);
    expect(log.filter((entry) => entry === "press")).toHaveLength(1);
  });

  it("moves a Navbar's current link on Enter", () => {
    ui(<Navbar links={["Overview", "Projects", "Team"]} />);
    const projects = screen.getByRole("link", { name: "Projects" });
    act(() => projects.focus());
    enter(projects);
    expect(projects.getAttribute("aria-current")).toBe("page");
  });

  // The premise, checked so an upgrade that fixes it says so: when react-native-web's own
  // Pressable presses a link without an href on Enter, the kit's handler can go.
  it("compensates for react-native-web's Pressable, which leaves a link's Enter to the browser", () => {
    let presses = 0;
    render(<RNWPressable testID="upstream" accessibilityRole="link" onPress={() => (presses += 1)} />);
    const node = screen.getByTestId("upstream");
    act(() => node.focus());
    enter(node);
    expect(presses).toBe(0);
  });
});
