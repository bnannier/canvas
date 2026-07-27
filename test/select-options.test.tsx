import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Select } from "../src/atoms/select/select.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// Options whose stored value differs from the text shown for them: the case that
// every id-plus-name list needs (a project id, a region slug, a workspace name).
const PROJECTS = [
	{ value: "p1", label: "proj1 (p1)" },
	{ value: "p2", label: "proj2 (p2)" },
];

describe("Select with value/label options", () => {
	it("shows the label belonging to the current value", () => {
		const { getByText } = ui(<Select options={PROJECTS} value="p2" />);
		expect(getByText("proj2 (p2)")).toBeTruthy();
	});

	it("reports the value, not the label, when a row is chosen", () => {
		let picked = "";
		const { getByText } = ui(
			<Select
				open
				options={PROJECTS}
				value="p1"
				onSelect={(v) => {
					picked = v;
				}}
			/>,
		);
		fireEvent.click(getByText("proj2 (p2)"));
		expect(picked).toBe("p2");
	});

	it("marks the row matching the value as selected", () => {
		const { container } = ui(<Select open options={PROJECTS} value="p2" />);
		const selected = container.querySelectorAll('[role="option"][aria-selected="true"]');
		expect(selected.length).toBe(1);
		expect(selected[0]?.textContent).toContain("proj2 (p2)");
	});

	it("still accepts bare strings, where the value is the label", () => {
		let picked = "";
		const { getByText } = ui(
			<Select
				open
				options={["EU", "US"]}
				value="EU"
				onSelect={(v) => {
					picked = v;
				}}
			/>,
		);
		fireEvent.click(getByText("US"));
		expect(picked).toBe("US");
	});

	it("falls back to the raw value when no option matches it", () => {
		const { getByText } = ui(<Select options={PROJECTS} value="gone" />);
		expect(getByText("gone")).toBeTruthy();
	});
});
