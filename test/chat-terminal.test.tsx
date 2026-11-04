import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chat, ChatComposer, Markdown } from "../src/organisms/chat/chat.tsx";
import { ChatComposer as IosComposer } from "../src/organisms/chat/chat.ios.tsx";
import { ChatComposer as AndroidComposer } from "../src/organisms/chat/chat.android.tsx";
import { chatSubmitsOnEnter } from "../src/organisms/chat/chat.logic.ts";
import { TERMINAL_FONT } from "../src/style/mono.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

test.each([["web", ChatComposer], ["ios", IosComposer], ["android", AndroidComposer]] as const)("%s terminal hardware Enter sends, Shift+Enter and IME remain text entry, and Send restores focus", (_platform, Composer) => {
  const sent: string[] = [];
  render(<ThemeProvider light solid><Composer terminal autoFocus testID="prompt" value={"  Inspect this\nchange  "} onChangeText={() => {}} onSend={value => sent.push(value)} /></ThemeProvider>);
  const editor = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
  expect(editor.ownerDocument.activeElement).toBe(editor);
  expect(editor.style.fontSize).toBe("13px");
  expect(editor.style.fontFamily).toBe(TERMINAL_FONT);
  expect(editor.style.paddingTop).toBe("0px");
  expect(editor.style.paddingBottom).toBe("0px");
  expect(screen.getByTestId("prompt")).toBeTruthy();
  expect(fireEvent.keyDown(editor, { key: "Enter", shiftKey: true })).toBe(true);
  expect(fireEvent.keyDown(editor, { key: "Enter", isComposing: true })).toBe(true);
  expect(fireEvent.keyDown(editor, { key: "Enter", keyCode: 229 })).toBe(true);
  expect(sent).toEqual([]);
  expect(fireEvent.keyDown(editor, { key: "Enter", shiftKey: false })).toBe(false);
  expect(sent).toEqual(["Inspect this\nchange"]);
  const send = screen.getByRole("button", { name: "Send message" });
  act(() => send.focus());
  fireEvent.click(send);
  expect(editor.ownerDocument.activeElement).toBe(editor);
  expect(sent).toEqual(["Inspect this\nchange", "Inspect this\nchange"]);
});

test("terminal blocked sending keeps pending drafts editable and honors all existing send gates", () => {
  const sent: string[] = [];
  const props = { terminal: true, value: "draft", onChangeText: () => {}, onSend: (value: string) => sent.push(value) };
  const { rerender } = render(<ThemeProvider light solid><ChatComposer {...props} /></ThemeProvider>);
  for (const state of [{ pending: true }, { sendDisabled: true }, { disabled: true }, { attaching: true }, { value: " \n " }, { attachments: [{ id: "upload", name: "file", uploading: true }] }]) {
    rerender(<ThemeProvider light solid><ChatComposer {...props} {...state} /></ThemeProvider>);
    const send = screen.getByRole("button", { name: "Send message" });
    const editor = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
    expect(send.getAttribute("aria-disabled")).toBe("true");
    expect(editor.disabled).toBe("disabled" in state);
    fireEvent.keyDown(editor, { key: "Enter", shiftKey: false });
    fireEvent.click(send);
  }
  expect(sent).toEqual([]);
});

test("native Enter without hardware modifiers preserves multiline behavior", () => {
  expect(chatSubmitsOnEnter({ nativeEvent: { key: "Enter" } })).toBe(false);
  expect(chatSubmitsOnEnter({ nativeEvent: { key: "Enter", shiftKey: false } })).toBe(true);
  for (const state of [{ shiftKey: true }, { isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { repeat: true }]) {
    expect(chatSubmitsOnEnter({ nativeEvent: { key: "Enter", shiftKey: false, ...state } })).toBe(false);
  }
});

test("terminal transcripts are flat, left aligned and preserve plain user whitespace", () => {
  const { container } = render(<ThemeProvider light solid><Chat terminal testID="terminal" messages={[{ id: "user", role: "user", content: "  indented\ttext", author: "User" }, { id: "assistant", role: "assistant", content: "## Answer\n\n**Done**", author: "Claude" }]} value="" onChangeText={() => {}} onSend={() => {}} /></ThemeProvider>);
  expect(screen.getByText("❯ User")).toBeTruthy();
  expect(screen.getByText("● Claude")).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2 }).style.fontSize).toBe("13px");
  expect(screen.getByTestId("terminal").style.borderWidth).toBe("");
  const user = Array.from(container.querySelectorAll("div")).find(node => node.textContent === "  indented\ttext");
  expect(user?.textContent).toBe("  indented\ttext");
  expect(user?.style.borderRadius).toBe("");
});

test("terminal Markdown keeps all semantic table columns, heading levels and fenced tabs", () => {
  render(<ThemeProvider light solid><Markdown terminal>{"# Scope\n\n| Name | State |\n| --- | --- |\n| A | Ready |\n\n```txt\n\tkeep  spaces\n```"}</Markdown></ThemeProvider>);
  expect(screen.getByRole("heading", { level: 1 }).style.fontFamily).toBe(TERMINAL_FONT);
  expect(screen.getByRole("table")).toBeTruthy();
  expect(screen.getAllByRole("row")).toHaveLength(2);
  expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  expect(screen.getByRole("columnheader", { name: "State" }).style.width).toBe("72px");
  expect(screen.getAllByRole("cell")).toHaveLength(2);
  expect(screen.getByText("keep spaces").textContent).toBe("\tkeep  spaces");
});

test("standard multiline chat still keeps Enter as a newline", () => {
  const sent: string[] = [];
  render(<ThemeProvider light solid><ChatComposer value="draft" onChangeText={() => {}} onSend={value => sent.push(value)} /></ThemeProvider>);
  expect(fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), { key: "Enter" })).toBe(true);
  expect(sent).toEqual([]);
});
