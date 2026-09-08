import { afterEach, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import * as JSX from "react/jsx-runtime";
import * as Native from "react-native";
import ts from "typescript";
import { Button } from "../src/atoms/button/button.tsx";
import { Card } from "../src/molecules/card/card.tsx";
import { Column } from "../src/atoms/layout/layout.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Carousel, type CarouselProps } from "../src/organisms/carousel/carousel.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const root = resolve(import.meta.dir, "..");
const source = readFileSync(resolve(root, "examples/starter/smoke/fixtures/carousel.tsx"), "utf8");

function mountFixture() {
  const requests: ((x: number, y: number, width: number, height: number) => void)[] = [];
  const renders: CarouselProps[] = [];
  let attachments = 0;
  // Run the authored fixture with the existing RNW render harness and a bounded
  // native measurement seam. No process-wide mocks or consumer resolver edits.
  const MeasuredHost = React.forwardRef<Pick<Native.View, "measureInWindow">, Native.ViewProps>((props, ref) => {
    React.useImperativeHandle(ref, () => {
      attachments++;
      return { measureInWindow: (callback) => { requests.push(callback); } };
    }, []);
    return <Native.View {...props} />;
  });
  function ObservedCarousel(props: CarouselProps) {
    renders.push(props);
    return <Carousel {...props} />;
  }
  const exports: { CarouselBody?: React.ComponentType } = {};
  const modules: Record<string, unknown> = {
    react: React,
    "react/jsx-runtime": JSX,
    "react-native": { ...Native, View: MeasuredHost },
    "@nannier-com/canvas": { Button, Card, Column, Typography, Carousel: ObservedCarousel },
  };
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "exports", compiled)((name: string) => {
    if (!(name in modules)) throw new Error(`Unexpected fixture import ${name}`);
    return modules[name];
  }, exports);
  const Body = exports.CarouselBody!;
  render(<ThemeProvider><Body /></ThemeProvider>);
  return { requests, renders, attachments: () => attachments };
}

const measurement = () => JSON.parse(screen.getByTestId("carousel-measurement").textContent!);

test("fresh native card measurements keep slide identity, refs and uncontrolled page intact", () => {
  const fixture = mountFixture();
  const original = fixture.renders[0]!;
  expect(fixture.requests).toHaveLength(0);
  expect(measurement()).toEqual({ generation: 0, status: "idle" });
  fireEvent.click(screen.getByRole("button", { name: "Measure current slide" }));
  expect(measurement()).toEqual({ generation: 1, status: "pending" });
  expect(fixture.requests).toHaveLength(1);
  act(() => fixture.requests[0]!(24, 190, 354, 198));
  expect(measurement()).toMatchObject({ generation: 1, status: "ready", index: 1, page: 2, x: 24, y: 190, width: 354, height: 198 });
  fireEvent.click(screen.getByRole("button", { name: "Measure current slide" }));
  expect(measurement()).toEqual({ generation: 2, status: "pending" });
  act(() => fixture.requests[1]!(24, 210, 354, 198));
  expect(measurement()).toMatchObject({ generation: 2, y: 210 });
  expect(fixture.attachments()).toBe(1);
  for (const props of fixture.renders) {
    expect(props.items).toBe(original.items);
    expect(props.onIndexChange).toBe(original.onIndexChange);
    expect(props.index).toBeUndefined();
    expect(props.defaultIndex).toBe(1);
  }
  expect(screen.getByTestId("carousel-current").textContent).toBe("Current page: 2");
  expect(screen.getByTestId("carousel-changes").textContent).toBe("Page changes: 0");
});

test("late host callbacks cannot revive an older request or a different current card", () => {
  const fixture = mountFixture();
  const measure = () => fireEvent.click(screen.getByRole("button", { name: "Measure current slide" }));
  measure();
  measure();
  act(() => fixture.requests[0]!(1, 2, 3, 4));
  expect(measurement()).toEqual({ generation: 2, status: "pending" });
  fireEvent.click(screen.getByRole("button", { name: "Slide 6 of 6" }));
  act(() => fixture.requests[1]!(1, 2, 3, 4));
  expect(measurement()).toEqual({ generation: 2, status: "idle" });
  measure();
  act(() => fixture.requests[2]!(24, 190, 354, 198));
  expect(measurement()).toMatchObject({ generation: 3, status: "ready", index: 5, page: 6 });
  expect(screen.getByTestId("carousel-current").textContent).toBe("Current page: 6");
  expect(screen.getByTestId("carousel-changes").textContent).toBe("Page changes: 1");
});

const flowText = readFileSync(resolve(root, "tools/native/flows/candidate.yaml"), "utf8");
const commands = Bun.YAML.parse(flowText.split("\n---\n")[1]!) as Record<string, unknown>[];
const expression = commands.map((command) => command.evalScript).find((value) => typeof value === "string" && value.includes("output.carouselDrag")) as string;
const evaluateDrag = new Function("maestro", "output", expression.trim().slice(2, -1));
const valid = { generation: 1, status: "ready", index: 1, page: 2, x: 24, y: 190, width: 354, height: 198,
  screenWidth: 402, screenHeight: 874, pixelRatio: 3, platform: "ios", rtl: false };
function drag(values: Record<string, unknown> = {}) {
  const output: { carouselDrag?: { start: string; end: string } } = {};
  evaluateDrag({ copiedText: JSON.stringify({ ...valid, ...values }) }, output);
  return output.carouselDrag;
}

test("the exact Maestro expression derives one in-card drag in iOS points or Android pixels", () => {
  expect(drag()).toMatchObject({ start: "307, 289", end: "95, 289" });
  expect(drag({ platform: "android", pixelRatio: 2.625 })).toMatchObject({ start: "806, 759", end: "249, 759" });
  const gesture = commands.find((command) => (command.swipe as { start?: string })?.start === "${output.carouselDrag.start}")?.swipe;
  expect(gesture).toEqual({ start: "${output.carouselDrag.start}", end: "${output.carouselDrag.end}", duration: 400 });
});

test("the actual gesture guard rejects stale, wrong-card, clipped and invalid measurements", () => {
  for (const values of [
    { generation: 0 }, { status: "pending" }, { index: 0 }, { page: 3 },
    { x: -1 }, { y: -1 }, { width: 0 }, { height: -1 }, { width: 1000 }, { height: 1000 },
    { pixelRatio: 0 }, { x: null }, { y: "190" }, { screenWidth: 0 }, { screenHeight: 0 },
    { platform: "web" }, { rtl: true }, { width: 1, height: 1 },
  ]) expect(() => drag(values)).toThrow();
});
