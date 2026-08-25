import { describe, it, expect } from "bun:test";
import {
  DASHBOARD_COLUMNS,
  effectiveSpan,
  moveWidget,
  orderedWidgets,
  type DashboardWidget,
} from "../src/organisms/dashboard-grid/dashboard-grid.logic.ts";

// Pure DashboardGrid layout math (no renderer): reconciling a persisted id order against the
// current widget list, the reorder a drop produces, and the per-tier span resolution.

const widgets: DashboardWidget[] = [
  { id: "revenue", span: 6, title: "Revenue" },
  { id: "signups", span: 3, narrowSpan: 12, title: "Signups" },
  { id: "latency", span: 3, title: "Latency" },
  { id: "errors", span: 12, title: "Errors" },
];

const ids = (list: readonly DashboardWidget[]) => list.map((w) => w.id);

describe("orderedWidgets", () => {
  it("arranges the widgets by the id order", () => {
    const next = orderedWidgets(widgets, ["errors", "latency", "revenue", "signups"]);
    expect(ids(next)).toEqual(["errors", "latency", "revenue", "signups"]);
  });

  it("appends widgets missing from the order, in their original order", () => {
    // A release added `latency` and `errors` after the user last saved a layout.
    const next = orderedWidgets(widgets, ["signups", "revenue"]);
    expect(ids(next)).toEqual(["signups", "revenue", "latency", "errors"]);
  });

  it("ignores order ids that no longer match a widget", () => {
    // `retired` shipped in an earlier release and is still in the stored order.
    const next = orderedWidgets(widgets, ["retired", "errors", "gone", "revenue"]);
    expect(ids(next)).toEqual(["errors", "revenue", "signups", "latency"]);
  });

  it("reconciles both drifts at once", () => {
    const next = orderedWidgets(widgets, ["gone", "latency", "retired"]);
    expect(ids(next)).toEqual(["latency", "revenue", "signups", "errors"]);
  });

  it("places a repeated id once, at its first mention", () => {
    const next = orderedWidgets(widgets, ["errors", "revenue", "errors"]);
    expect(ids(next)).toEqual(["errors", "revenue", "signups", "latency"]);
  });

  it("keeps the widgets order when the stored order is empty", () => {
    expect(ids(orderedWidgets(widgets, []))).toEqual(["revenue", "signups", "latency", "errors"]);
  });

  it("does not mutate the input and returns a new array", () => {
    const before = widgets.map((w) => ({ ...w }));
    const next = orderedWidgets(widgets, ["errors", "revenue"]);
    expect(widgets).toEqual(before);
    expect(next).not.toBe(widgets);
    // The widget objects themselves are passed through, not copied.
    expect(next[0]).toBe(widgets[3]);
  });
});

describe("moveWidget", () => {
  const order = ["revenue", "signups", "latency", "errors"];

  it("drops a widget before its target", () => {
    expect(moveWidget(order, "errors", "signups", true)).toEqual(["revenue", "errors", "signups", "latency"]);
  });

  it("drops a widget after its target", () => {
    expect(moveWidget(order, "errors", "signups", false)).toEqual(["revenue", "signups", "errors", "latency"]);
  });

  it("reads the insertion point without the dragged widget on a forward move", () => {
    // revenue lifts out first, so "after latency" is the third slot, not the second.
    expect(moveWidget(order, "revenue", "latency", false)).toEqual(["signups", "latency", "revenue", "errors"]);
    expect(moveWidget(order, "revenue", "latency", true)).toEqual(["signups", "revenue", "latency", "errors"]);
  });

  it("moves to the head and the tail", () => {
    expect(moveWidget(order, "errors", "revenue", true)).toEqual(["errors", "revenue", "signups", "latency"]);
    expect(moveWidget(order, "revenue", "errors", false)).toEqual(["signups", "latency", "errors", "revenue"]);
  });

  it("is a no-op when a widget is dropped onto itself", () => {
    const next = moveWidget(order, "signups", "signups", true);
    expect(next).toEqual(order);
    expect(next).not.toBe(order);
  });

  it("is a no-op for an unknown dragged id", () => {
    expect(moveWidget(order, "gone", "signups", true)).toEqual(order);
  });

  it("is a no-op for an unknown target id", () => {
    expect(moveWidget(order, "signups", "gone", false)).toEqual(order);
  });

  it("does not mutate the input order", () => {
    const before = [...order];
    moveWidget(order, "errors", "revenue", true);
    expect(order).toEqual(before);
  });
});

describe("effectiveSpan", () => {
  const widget = (span: number, narrowSpan?: number): DashboardWidget => ({
    id: "w",
    span,
    narrowSpan,
    title: "W",
  });

  it("honors the declared span on the wide tier", () => {
    expect(effectiveSpan(widget(3), "wide")).toBe(3);
    expect(effectiveSpan(widget(12), "wide")).toBe(12);
  });

  it("clamps the declared span into 1..12", () => {
    expect(effectiveSpan(widget(0), "wide")).toBe(1);
    expect(effectiveSpan(widget(-4), "wide")).toBe(1);
    expect(effectiveSpan(widget(99), "wide")).toBe(DASHBOARD_COLUMNS);
  });

  it("takes narrowSpan on the narrow tier when the widget declares one", () => {
    expect(effectiveSpan(widget(3, 6), "narrow")).toBe(6);
    expect(effectiveSpan(widget(12, 4), "narrow")).toBe(4);
  });

  it("clamps narrowSpan into 1..12", () => {
    expect(effectiveSpan(widget(3, 0), "narrow")).toBe(1);
    expect(effectiveSpan(widget(3, 40), "narrow")).toBe(DASHBOARD_COLUMNS);
  });

  it("derives the narrow span from the declared span when none is given", () => {
    expect(effectiveSpan(widget(4), "narrow")).toBe(6);
    expect(effectiveSpan(widget(1), "narrow")).toBe(6);
    expect(effectiveSpan(widget(5), "narrow")).toBe(12);
    expect(effectiveSpan(widget(8), "narrow")).toBe(12);
  });

  it("derives the narrow span from the CLAMPED declared span", () => {
    expect(effectiveSpan(widget(99), "narrow")).toBe(12);
    expect(effectiveSpan(widget(0), "narrow")).toBe(6);
  });

  it("gives every widget the full width on the phone tier", () => {
    expect(effectiveSpan(widget(3), "phone")).toBe(DASHBOARD_COLUMNS);
    expect(effectiveSpan(widget(3, 4), "phone")).toBe(DASHBOARD_COLUMNS);
    expect(effectiveSpan(widget(99), "phone")).toBe(DASHBOARD_COLUMNS);
  });
});
