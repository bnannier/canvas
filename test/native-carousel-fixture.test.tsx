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
import { Column, Row } from "../src/atoms/layout/layout.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Carousel, type CarouselProps } from "../src/organisms/carousel/carousel.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const root = resolve(import.meta.dir, "..");
const source = readFileSync(resolve(root, "smoke/src/testing/carousel.tsx"), "utf8");

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
    "@nannier/canvas": { Button, Card, Column, Row, Typography, Carousel: ObservedCarousel },
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
// A measurement asks the card first, then (inside its callback) the card's swipe label:
// answer the card request at `index`, then the label request it queued.
type Rect = [number, number, number, number];
function answer(requests: ((...rect: Rect) => void)[], index: number, card: Rect, label: Rect = [card[0] + card[2] - 60, card[1] + card[3] - 30, 54, 17]) {
  act(() => requests[index]!(...card));
  const labelRequest = requests.at(-1);
  if (labelRequest && labelRequest !== requests[index]) act(() => labelRequest(...label));
}

test("fresh native card measurements keep slide identity, refs and uncontrolled page intact", () => {
  const fixture = mountFixture();
  const original = fixture.renders[0]!;
  // Every card and its swipe label mount on the first frame, before the viewport
  // measures, and none is re-attached afterwards: the measured card is the one the
  // page first rendered.
  expect(fixture.attachments()).toBe(12);
  expect(fixture.requests).toHaveLength(0);
  expect(measurement()).toEqual({ generation: 0, status: "idle" });
  fireEvent.click(screen.getByRole("button", { name: "Measure current slide" }));
  expect(measurement()).toEqual({ generation: 1, status: "pending" });
  expect(fixture.requests).toHaveLength(1);
  answer(fixture.requests, 0, [24, 190, 354, 198], [300, 360, 54, 17]);
  expect(measurement()).toMatchObject({ generation: 1, status: "ready", index: 1, page: 2, x: 24, y: 190, width: 354, height: 198,
    handleX: 300, handleY: 360, handleWidth: 54, handleHeight: 17 });
  fireEvent.click(screen.getByRole("button", { name: "Measure current slide" }));
  expect(measurement()).toEqual({ generation: 2, status: "pending" });
  answer(fixture.requests, 2, [24, 210, 354, 198]);
  expect(measurement()).toMatchObject({ generation: 2, y: 210 });
  expect(fixture.attachments()).toBe(12);
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
  answer(fixture.requests, 0, [1, 2, 3, 4]);
  expect(measurement()).toEqual({ generation: 2, status: "pending" });
  fireEvent.click(screen.getByRole("button", { name: "Slide 6 of 6" }));
  answer(fixture.requests, 1, [1, 2, 3, 4]);
  expect(measurement()).toEqual({ generation: 2, status: "idle" });
  measure();
  answer(fixture.requests, fixture.requests.length - 1, [24, 190, 354, 198]);
  expect(measurement()).toMatchObject({ generation: 3, status: "ready", index: 5, page: 6 });
  expect(screen.getByTestId("carousel-current").textContent).toBe("Current page: 6");
  expect(screen.getByTestId("carousel-changes").textContent).toBe("Page changes: 1");
});
