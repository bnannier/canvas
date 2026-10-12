// The in-page row reader (e2e/support/audit-probes.ts `collectRow`) that every captured row is
// measured with, run over a DOM built here (bun's preloaded happy-dom, test/setup.ts): which
// texts it calls disabled, the state WCAG 1.4.3 exempts from contrast (an inactive control's
// text). happy-dom lays nothing out, so each text is given a line box, placed off screen so
// the reader records it without reading the paint stack under it.
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { collectRow } from "../../e2e/support/audit-probes.ts";

/** Every property the reader reads, at a browser's computed defaults, so happy-dom reports each one. */
const DEFAULTS =
  "display: block; position: static; overflow-x: visible; overflow-y: visible; visibility: visible; opacity: 1; transform: none; filter: none; font-size: 16px; font-weight: 400; color: rgb(0, 0, 0); pointer-events: auto;";

function node(tag: string, attributes: Record<string, string> = {}, children: (Element | string)[] = []): HTMLElement {
  const element = document.createElement(tag);
  element.setAttribute("style", `${DEFAULTS} ${attributes.style ?? ""}`);
  for (const [key, value] of Object.entries(attributes)) if (key !== "style") element.setAttribute(key, value);
  for (const child of children) element.append(child);
  return element;
}

/** The texts the reader records in `row`, with whether each is disabled. */
function disabledTexts(row: HTMLElement): Record<string, boolean> {
  document.body.appendChild(row);
  return Object.fromEntries(collectRow(row).texts.map((text) => [text.text, text.disabled]));
}

beforeEach(() => {
  // Every text a line box, off screen to the left, so its paint stack is not read.
  spyOn(Range.prototype, "getClientRects").mockImplementation(() => [new DOMRect(-400, 10, 120, 24)] as unknown as DOMRectList);
});
afterEach(() => {
  document.body.replaceChildren();
});

describe("the row reader's disabled texts", () => {
  it("counts a text inside a disabled control, as before", () => {
    const row = node("div", {}, [node("div", { role: "button", "aria-disabled": "true", "aria-label": "Region" }, [node("div", {}, ["Region"])])]);
    expect(disabledTexts(row)).toEqual({ Region: true });
  });

  it("counts the floating label beside a disabled field it names, in the field's host (Android Autocomplete)", () => {
    // The field host holds the disabled input and, beside it, the floating label with its star.
    const label = node("div", {}, ["Assigned to", node("span", { "aria-hidden": "true" }, [" *"])]);
    const row = node("div", {}, [
      node("div", { style: "opacity: 0.38;" }, [
        node("input", { disabled: "", "aria-disabled": "true", "aria-label": "Assigned to", role: "combobox" }),
        node("div", {}, [node("div", {}, [label])]),
      ]),
    ]);
    expect(disabledTexts(row)).toMatchObject({ "Assigned to": true });
  });

  it("counts a label a disabled field names through aria-labelledby, wherever it sits (Input)", () => {
    const row = node("div", {}, [
      node("div", { id: "email-label" }, ["Email"]),
      node("div", {}, [node("input", { disabled: "", "aria-labelledby": "email-label", "aria-label": "Email" })]),
    ]);
    expect(disabledTexts(row)).toEqual({ Email: true });
  });

  it("leaves a label of an enabled field, and a text that only shares a disabled field's name outside its host, enabled", () => {
    const row = node("div", {}, [
      node("div", {}, [node("input", { "aria-label": "Name" }), node("div", {}, ["Name"])]),
      node("div", {}, ["Assigned to"]),
      node("div", {}, [node("input", { disabled: "", "aria-label": "Assigned to" })]),
    ]);
    expect(disabledTexts(row)).toEqual({ Name: false, "Assigned to": false });
  });
});
