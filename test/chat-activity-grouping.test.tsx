import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChatThread, type ChatMessageData } from "../src/organisms/chat/chat.tsx";
import { chatThreadRows } from "../src/organisms/chat/chat.logic.ts";
import { BLOCK_GAP, TURN_GAP } from "../src/organisms/chat/chat.styles.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const activity = (id: string, role: ChatMessageData["role"] = "system"): ChatMessageData => ({ id, role, activity: true, author: id, content: `${id} details` });
const spoken = (id: string, role: ChatMessageData["role"] = "assistant"): ChatMessageData => ({ id, role, content: id });

test("activity runs retain original indices, object identity and singleton rows", () => {
  const messages = [spoken("user", "user"), activity("one"), spoken("reply"), activity("two"), activity("three", "user"), spoken("next"), activity("four"), activity("five")];
  const rows = chatThreadRows(messages);
  expect(rows.map(row => row.index)).toEqual([0, 1, 2, 3, 5, 6]);
  expect(rows.map(row => row.message)).toEqual([messages[0], messages[1], messages[2], messages[3], messages[5], messages[6]]);
  expect(rows[1]!.items).toBeUndefined();
  expect(rows[3]!.items).toEqual(messages.slice(3, 5));
  expect(rows[5]!.items).toEqual(messages.slice(6));
  for (const row of rows) expect(row.message).toBe(messages[row.index]);
  expect(chatThreadRows([])).toEqual([]);
  expect(chatThreadRows([messages[1]!])[0]!.items).toBeUndefined();
  expect(chatThreadRows(messages.slice(3, 5))).toEqual([{ message: messages[3], index: 0, items: messages.slice(3, 5) }]);
  expect(chatThreadRows(messages, true).map(row => row.index)).toEqual(messages.map((_, index) => index));
});

test("activity inspection stays linear for long and alternating transcripts, and terminal bypasses it", () => {
  for (const size of [2000, 4000]) {
    for (const alternating of [false, true]) {
      let reads = 0;
      const messages = Array.from({ length: size }, (_, index) => ({
        get activity() { reads += 1; return !alternating || index % 2 === 0; },
      }));
      chatThreadRows(messages);
      expect(reads).toBeLessThanOrEqual(size * 2);
      reads = 0;
      expect(chatThreadRows(messages, true)).toHaveLength(size);
      expect(reads).toBe(0);
    }
  }
});

test("mixed rendered runs preserve summaries, singleton details, original-speaker gaps and action IDs", () => {
  const calls: (string | number)[][] = [];
  const messages = [spoken("Start", "user"), activity("Read"), activity("Check", "user"), { ...spoken("Answer"), actions: [{ id: "apply", label: "Apply" }] }, activity("Inspect"), spoken("Done")];
  const { container } = render(<ThemeProvider light solid><ChatThread assistant messages={messages} onAction={(id, action) => calls.push([id, action])} /></ThemeProvider>);
  const group = screen.getByRole("button", { name: "2 steps: Read, Check, show details" });
  const groupRow = group.closest('[role="listitem"]')!;
  expect((groupRow.parentElement as HTMLElement).style.marginTop).toBe(`${TURN_GAP}px`);
  const answerRow = screen.getByText("Answer").closest('[role="listitem"]')!;
  expect((answerRow.parentElement as HTMLElement).style.marginTop).toBe(`${TURN_GAP}px`);
  const single = screen.getByRole("button", { name: "Inspect, show details" });
  expect((single.closest('[role="listitem"]')!.parentElement as HTMLElement).style.marginTop).toBe(`${BLOCK_GAP}px`);
  expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(5);
  fireEvent.click(group);
  expect(screen.getByRole("button", { name: "Read, show details" })).toBeTruthy();
  expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(5);
  fireEvent.click(single);
  expect(screen.getByText("Inspect details")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(calls).toEqual([["Answer", "apply"]]);
});

test("open all-activity groups and nested details retain identity while streaming grows", () => {
  const first = activity("Read");
  const second = { ...activity("Check"), streaming: true };
  const view = (messages: ChatMessageData[]) => <ThemeProvider light solid><ChatThread assistant pending messages={messages} /></ThemeProvider>;
  const { rerender } = render(view([first, second]));
  const group = screen.getByRole("button", { name: "2 steps: Read, Check, show details" });
  fireEvent.click(group);
  const nested = screen.getByRole("button", { name: "Read, show details" });
  fireEvent.click(nested);
  const details = screen.getByText("Read details");
  rerender(view([first, { ...second, content: "Check growing details" }, { ...activity("Write"), streaming: true }]));
  expect(screen.getByRole("button", { name: "3 steps: Read, Check, Write, hide details" })).toBe(group);
  expect(screen.getByRole("button", { name: "Read, hide details" })).toBe(nested);
  expect(screen.getByText("Read details")).toBe(details);
  expect(screen.queryByRole("progressbar", { name: "Assistant is thinking…" })).toBeNull();
  rerender(view([first, { ...second, streaming: false }]));
  expect(screen.getByRole("button", { name: "2 steps: Read, Check, hide details" })).toBe(group);
  expect(screen.getByRole("progressbar", { name: "Assistant is thinking…" })).toBeTruthy();
});

test("terminal activity remains individually expandable", () => {
  render(<ThemeProvider light solid><ChatThread terminal messages={[activity("Read"), activity("Check")]} /></ThemeProvider>);
  expect(screen.queryByRole("button", { name: /2 steps/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Check, show details" }));
  expect(screen.getByText("Check details")).toBeTruthy();
});
