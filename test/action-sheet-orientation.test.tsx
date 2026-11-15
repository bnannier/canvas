import { expect, it, spyOn } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { type ForwardedRef, type ReactNode } from "react";
import { Modal, type ModalProps, type View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.ios.tsx";

it("allows a live iOS sheet to rotate with its app rather than inheriting Modal's portrait-only default", () => {
  // Observe the native Modal contract before RNW drops orientation metadata.
  // Device rotation itself still depends on the host app's Info.plist.
  const component = Modal as unknown as { render: (props: ModalProps, ref: ForwardedRef<View>) => ReactNode };
  const original = component.render;
  const seen: ModalProps[] = [];
  const observer = spyOn(component, "render").mockImplementation((props, ref) => {
    seen.push(props);
    return original(props, ref);
  });
  try {
    render(<ThemeProvider><ActionSheet open actions={[{ label: "Save", onPress() {} }]} /></ThemeProvider>);
    expect(seen.some(props => props.visible && props.supportedOrientations?.includes("portrait") && props.supportedOrientations?.includes("landscape"))).toBe(true);
    cleanup();
    seen.length = 0;
    render(<ThemeProvider><ActionSheet embedded open actions={[]} /></ThemeProvider>);
    expect(seen).toHaveLength(0);
  } finally { cleanup(); observer.mockRestore(); }
});
