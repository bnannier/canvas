import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Select } from "../src/atoms/select/select.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrance, layoutEntrances } from "./entrance-layout.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// Options whose stored value differs from the text shown for them: the case that
// every id-plus-name list needs (a project id, a region slug, a workspace name).
const PROJECTS = [
	{ value: "p1", label: "proj1 (p1)" },
	{ value: "p2", label: "proj2 (p2)" },
];

describe("Select with value/label options", () => {
	it("names each trigger and result list and keeps their relationships unique", () => {
		const { container, getByRole } = ui(<>
			<Select open inline label="Project" accessibilityLabel="Destination project" options={PROJECTS} />
			<Select open label="Region" required options={["EU", "US"]} />
		</>);
		layoutEntrances(container, { width: 240, height: 120 });
		const project = getByRole("button", { name: "Destination project" });
		const projectList = getByRole("listbox", { name: "Destination project" });
		const region = getByRole("button", { name: "Region, required" });
		const regionList = getByRole("listbox", { name: "Region" });
		expect(project.getAttribute("aria-controls")).toBe(projectList.id);
		expect(region.getAttribute("aria-controls")).toBe(regionList.id);
		expect(projectList.id).not.toBe(regionList.id);
		expect(project.getAttribute("aria-haspopup")).toBe("listbox");
		expect(region.hasAttribute("aria-required")).toBe(false);
		expect(regionList.getAttribute("aria-required")).toBe("true");
	});

	it("keeps the prompt name after selection and removes the closed list relationship", () => {
		const { getByRole, queryByRole } = ui(<Select placeholder="Choose a region" options={["EU", "US"]} />);
		const trigger = getByRole("button", { name: "Choose a region" });
		expect(trigger.hasAttribute("aria-controls")).toBe(false);
		fireEvent.click(trigger);
		layoutEntrance(getByRole("listbox", { hidden: true }), { width: 240, height: 120 });
		expect(getByRole("listbox", { name: "Choose a region" })).toBeDefined();
		fireEvent.click(getByRole("option", { name: "US" }));
		expect(getByRole("button", { name: "Choose a region" }).textContent).toContain("US");
		expect(trigger.hasAttribute("aria-controls")).toBe(false);
		expect(queryByRole("listbox")).toBeNull();
	});

	it("announces a required field even when its purpose has no visible label", () => {
		const { getByRole } = ui(<Select open required accessibilityLabel="Billing region" options={["EU"]} />);
		layoutEntrance(getByRole("listbox", { hidden: true }), { width: 240, height: 60 });
		expect(getByRole("button", { name: "Billing region, required" }).hasAttribute("aria-required")).toBe(false);
		expect(getByRole("listbox", { name: "Billing region" }).getAttribute("aria-required")).toBe("true");
	});

	it("shows the label belonging to the current value", () => {
		const { getByText } = ui(<Select options={PROJECTS} value="p2" />);
		expect(getByText("proj2 (p2)")).toBeTruthy();
	});

	it("reports the value, not the label, when a row is chosen", () => {
		let picked = "";
		const { getByText, getByRole } = ui(
			<Select
				open
				options={PROJECTS}
				value="p1"
				onSelect={(v) => {
					picked = v;
				}}
			/>,
		);
		layoutEntrance(getByRole("listbox", { hidden: true }), { width: 240, height: 120 });
		fireEvent.click(getByText("proj2 (p2)"));
		expect(picked).toBe("p2");
	});

	it("marks the row matching the value as selected", () => {
		const { container } = ui(<Select open options={PROJECTS} value="p2" />);
		layoutEntrances(container, { width: 240, height: 120 });
		const selected = container.querySelectorAll('[role="option"][aria-selected="true"]');
		expect(selected.length).toBe(1);
		expect(selected[0]?.textContent).toContain("proj2 (p2)");
	});

	it("still accepts bare strings, where the value is the label", () => {
		let picked = "";
		const { getByText, getByRole } = ui(
			<Select
				open
				options={["EU", "US"]}
				value="EU"
				onSelect={(v) => {
					picked = v;
				}}
			/>,
		);
		layoutEntrance(getByRole("listbox", { hidden: true }), { width: 240, height: 120 });
		fireEvent.click(getByText("US"));
		expect(picked).toBe("US");
	});

	it("falls back to the raw value when no option matches it", () => {
		const { getByText } = ui(<Select options={PROJECTS} value="gone" />);
		expect(getByText("gone")).toBeTruthy();
	});
});
