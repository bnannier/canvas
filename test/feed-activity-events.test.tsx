import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Feed } from "../src/molecules/feeds/feeds.tsx";
import { Feed as IOSFeed } from "../src/molecules/feeds/feeds.ios.tsx";
import { Feed as AndroidFeed } from "../src/molecules/feeds/feeds.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

test.each([["web", Feed], ["ios", IOSFeed], ["android", AndroidFeed]] as const)("%s activity events preserve actors, targets, glyphs and trailing times", (_platform, Component) => {
  let pressed = -1;
  render(<ThemeProvider><Component activity label="Changes" onItemPress={(index) => { pressed = index; }} items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "merged", target: "release/4.2", icon: "gitMerge", time: "5 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" },
  ]} /></ThemeProvider>);
  const rows = within(screen.getByRole("list", { name: "Changes" })).getAllByRole("listitem");
  expect(rows).toHaveLength(3);
  expect(rows[0]!.textContent).toBe("Rachel Chen approved the request2 hours ago");
  expect(rows[1]!.textContent).toBe("Ada Lovelace merged release/4.25 hours ago");
  expect(rows[2]!.textContent).toBe("System created the project3 days ago");
  expect(rows[1]!.querySelector('[aria-hidden="true"]')).not.toBeNull();
  const time = screen.getByText("2 hours ago");
  expect(getComputedStyle(time).whiteSpace).toBe("nowrap");
  expect(time.style.flexShrink).toBe("0");
  expect(time.style.width).toBe("");
  fireEvent.click(within(rows[1]!).getByRole("button"));
  expect(pressed).toBe(1);
});
