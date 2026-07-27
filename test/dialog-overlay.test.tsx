import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The contained default is what the docs catalogue needs: a dialog that sits in
// an example stage. An application confirming a destructive action needs the
// opposite, and the contained form is wrong there, because it appends a scrim
// wherever the component is mounted while still claiming aria-modal.
describe("Dialog presentation", () => {
	it("keeps the contained default in normal flow", () => {
		const { container } = ui(
			<Dialog open title="Contained">
				<Text>body</Text>
			</Dialog>,
		);
		const panel = container.querySelector('[role="dialog"]') as HTMLElement;
		expect(panel).toBeTruthy();
		// No absolute positioning: it takes part in layout where it is mounted.
		expect(panel.style.position).not.toBe("absolute");
	});

	it("fills its host when presented as an overlay", () => {
		const { container } = ui(
			<OverlayProvider>
				<Dialog open overlay title="Overlaid">
					<Text>body</Text>
				</Dialog>
			</OverlayProvider>,
		);
		const panel = container.querySelector('[role="dialog"]') as HTMLElement;
		expect(panel).toBeTruthy();
		expect(panel.style.position).toBe("absolute");
	});

	it("still announces a destructive confirm as an alertdialog when overlaid", () => {
		const { container } = ui(
			<OverlayProvider>
				<Dialog open overlay destructive title="Delete">
					<Text>body</Text>
				</Dialog>
			</OverlayProvider>,
		);
		expect(container.querySelector('[role="alertdialog"]')).toBeTruthy();
	});

	it("renders in place when overlaid with no provider, rather than disappearing", () => {
		const { container } = ui(
			<Dialog open overlay title="Unhosted">
				<Text>body</Text>
			</Dialog>,
		);
		expect(container.querySelector('[role="dialog"]')).toBeTruthy();
	});
});

// Children replace the built-in title, so a dialog built from children has no
// element for aria-labelledby to reference. Without a name a destructive
// confirm renders an alertdialog that assistive tech cannot announce.
describe("Dialog accessible name with children", () => {
	it("names a children-based dialog from accessibilityLabel", () => {
		const { container } = ui(
			<Dialog open accessibilityLabel="Delete identity">
				<Text>body</Text>
			</Dialog>,
		);
		const panel = container.querySelector('[role="dialog"]') as HTMLElement;
		expect(panel.getAttribute("aria-label")).toBe("Delete identity");
	});

	it("names a destructive children-based alertdialog", () => {
		const { container } = ui(
			<Dialog open destructive accessibilityLabel="Delete credential">
				<Text>body</Text>
			</Dialog>,
		);
		const panel = container.querySelector('[role="alertdialog"]') as HTMLElement;
		expect(panel.getAttribute("aria-label")).toBe("Delete credential");
	});
});
