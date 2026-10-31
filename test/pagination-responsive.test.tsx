import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { Pagination as IOSPagination } from "../src/atoms/pagination/pagination.ios.tsx";
import { Pagination as AndroidPagination } from "../src/atoms/pagination/pagination.android.tsx";

afterEach(cleanup);
type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
const measure = (host: LayoutHost, width: number) => act(() => host.__reactLayoutHandler!({ nativeEvent: { layout: { x: 0, y: 0, width, height: 0 } }, timeStamp: 1 }));

test.each([["web", Pagination], ["ios", IOSPagination], ["android", AndroidPagination]] as const)("%s pager keeps both arrows and its current page when its unlabelled number row cannot fit", (_platform, Component) => {
  render(<ThemeProvider><Component total={12} defaultPage={4} testID="pager" /></ThemeProvider>);
  const probe = screen.getByTestId("pager").previousElementSibling as LayoutHost;
  const end = () => screen.getByRole("button", { name: "Next page" }).parentElement as LayoutHost;
  measure(probe, 280); // the usable bounds of a 320px panel with 20px padding
  measure(end(), 390); // natural numbered row with Prev/Next labels
  expect(screen.getByRole("button", { name: "Next page" }).textContent).toBe("");
  measure(end(), 334); // chevrons alone still cannot fit
  expect(screen.getByText("Page 4 of 12")).toBeTruthy();
  expect(screen.getAllByRole("button")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Page 5 of 12")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
  expect(screen.getByText("Page 4 of 12")).toBeTruthy();
  measure(probe, 500);
  expect(screen.getByRole("button", { name: "Page 4" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("button", { name: "Next page" }).textContent).toBe("Next");
});

test("small pagers also measure their number row and adapt without shrinking their controls", () => {
  render(<ThemeProvider><Pagination small total={12} defaultPage={4} testID="pager" /></ThemeProvider>);
  const root = screen.getByTestId("pager");
  measure(root.previousElementSibling as LayoutHost, 240);
  measure(screen.getByRole("button", { name: "Next page" }).parentElement as LayoutHost, 290);
  expect(screen.getByText("Page 4 of 12")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Next page" }).style.height).toBe("28px");
});
