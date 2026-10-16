import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chat, ChatMessage } from "../src/organisms/chat/chat.tsx";
import { chatAtBottom, chatBlocks } from "../src/organisms/chat/chat.logic.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

test("chat sends trimmed drafts once and blocks empty, pending, and disabled sends", () => {
  const sent: string[] = [];
  const change: string[] = [];
  const props = { messages: [], value: "  Ship the release\nwith tests  ", onChangeText: (value: string) => change.push(value), onSend: (value: string) => sent.push(value) };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} /></ThemeProvider>);
  const editor = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
  fireEvent.change(editor, { target: { value: "A follow-up" } });
  expect(change).toEqual(["A follow-up"]);
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(sent).toEqual(["Ship the release\nwith tests"]);
  for (const state of [{ value: " \n " }, { pending: true }, { disabled: true }]) {
    rerender(<ThemeProvider light solid><Chat {...props} {...state} /></ThemeProvider>);
    const send = screen.getByRole("button", { name: "Send message" });
    expect(send.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(send);
  }
  expect(sent).toHaveLength(1);
});

test("chat keeps its composer outside the thread and updates streaming messages under a stable identity", () => {
  const message = { id: "answer", role: "assistant" as const, author: "Planner", provider: "OpenAI", content: "A **safe** answer", streaming: true };
  const props = { value: "draft", onChangeText: () => {}, onSend: () => {}, pending: true, footer: <ChatMessage message={{ id: "footer", role: "system", content: "Review before execution" }} />, testID: "chat" };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} messages={[message]} /></ThemeProvider>);
  const thread = screen.getByTestId("chat-thread");
  const composer = screen.getByTestId("chat-composer");
  expect(thread.contains(composer)).toBe(false);
  expect(composer.textContent).toContain("Review before execution");
  expect(screen.getByText("Planner")).toBeTruthy();
  expect(screen.getByText("OpenAI")).toBeTruthy();
  expect(screen.queryByText("Assistant is thinking…")).toBeNull();
  expect(screen.getByText("Responding…")).toBeTruthy();
  const original = screen.getByText("Planner");
  rerender(<ThemeProvider light solid><Chat {...props} pending={false} messages={[{ ...message, content: "Completed answer", streaming: false, error: true, notice: "Connection interrupted" }]} /></ThemeProvider>);
  expect(screen.getByText("Planner")).toBe(original);
  expect(screen.getByText("Reply failed")).toBeTruthy();
  expect(screen.getByText("Connection interrupted")).toBeTruthy();
});

test("assistant markdown never creates HTML, links, or remote embeds", () => {
  const { container } = render(<ThemeProvider light solid><ChatMessage message={{ id: "unsafe", role: "assistant", content: '<img src="https://example.com/tracker">\n\n[link](javascript:alert(1))\n\n**Bold** and `code`\n\n- Check the plan\n\n```js\nconst safe = true;' }} /></ThemeProvider>);
  expect(container.querySelector("img, a, script")).toBeNull();
  expect(screen.getByText('<img src="https://example.com/tracker">')).toBeTruthy();
  expect(screen.getByText("Bold")).toBeTruthy();
  expect(screen.getByText("code")).toBeTruthy();
  expect(screen.getByText("const safe = true;")).toBeTruthy();
  expect(chatBlocks("```ts\nstreaming")).toEqual([{ kind: "code", text: "streaming" }]);
  expect(chatAtBottom(500, 400, 920)).toBe(true);
  expect(chatAtBottom(200, 400, 920)).toBe(false);
});
