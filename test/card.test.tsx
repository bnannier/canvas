import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Card } from "../src/molecules/card/card.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The web skin's surface insets (see card.styles.ts): the `padded` default and the
// density steps. The tests pin the padding CONTRACT, not the exact pixel values, but
// reading them from one place keeps the two in sync if the skin ever moves.
const PADDED = "24px";
const COMPACT = "16px";

describe("Card surface padding", () => {
  it("pads raw children by default", () => {
    const { getByTestId } = ui(<Card testID="c"><Text>content</Text></Card>);
    expect(getByTestId("c").style.padding).toBe(PADDED);
  });

  it("`flush` removes the inset for edge-to-edge children", () => {
    const { getByTestId } = ui(<Card flush testID="c"><Text>content</Text></Card>);
    expect(getByTestId("c").style.padding).toBe("");
  });

  it("a density boolean retunes the inset and gap on the children path", () => {
    const { getByTestId } = ui(<Card compact testID="c"><Text>content</Text></Card>);
    const el = getByTestId("c");
    expect(el.style.padding).toBe(COMPACT);
    expect(el.style.gap).toBe("12px");
  });

  it("the string path pads through its sections, never the surface", () => {
    const { getByTestId } = ui(<Card title="Title" body="Body" testID="c" />);
    expect(getByTestId("c").style.padding).toBe("");
  });

  it("`padded` on the string path never double-pads the self-padding sections", () => {
    const { getByTestId } = ui(<Card padded title="Title" body="Body" testID="c" />);
    expect(getByTestId("c").style.padding).toBe("");
  });

  it("a density boolean on the string path adds neither inset nor gap", () => {
    const { getByTestId } = ui(<Card compact title="Title" body="Body" testID="c" />);
    const el = getByTestId("c");
    expect(el.style.padding).toBe("");
    expect(el.style.gap).toBe("");
  });

  it("a pressable string-path card keeps the surface bare too", () => {
    const { getByTestId } = ui(
      <Card padded onPress={() => {}} title="Title" body="Body" testID="c" />,
    );
    expect(getByTestId("c").style.padding).toBe("");
  });
});
