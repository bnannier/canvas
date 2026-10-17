import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chat, ChatMessage, type ChatAttachmentData, type ChatQuestionAnswerData } from "../src/organisms/chat/chat.tsx";
import { chatAtBottom, chatBlocks } from "../src/organisms/chat/chat.logic.ts";
import { Icon } from "../src/atoms/icon/icon.tsx";
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


test("chat exposes provider marks and application-owned saved file actions", () => {
  const attachment = { id: "file-1", name: "release-plan.pdf" };
  const opened: ChatAttachmentData[] = [];
  render(<ThemeProvider light solid><Chat messages={[{ id: "message", role: "assistant", content: "Review the plan.", providerIcon: <Icon sparkles accessibilityLabel="Provider logo" />, provider: "API", attachments: [attachment] }]} value="" onChangeText={() => {}} onSend={() => {}} onOpenAttachment={(file) => opened.push(file)} /></ThemeProvider>);
  expect(screen.getByRole("img", { name: "Provider logo" })).toBeTruthy();
  expect(screen.getByText("API")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Open release-plan.pdf" }));
  expect(opened).toEqual([attachment]);
});

test("chat attaches, removes, and sends files without requiring a text draft", () => {
  let picked = 0;
  const sent: string[] = [];
  const removed: string[] = [];
  const attachment = { id: "file-1", name: "notes.txt" };
  const props = { messages: [], value: "  ", onChangeText: () => {}, onSend: (value: string) => sent.push(value), onAttach: () => { picked++; }, onRemoveAttachment: (id: string) => removed.push(id), attachments: [attachment] };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Attach files" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
  expect(picked).toBe(1);
  expect(removed).toEqual(["file-1"]);
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(sent).toEqual([""]);
  for (const state of [{ attaching: true }, { attachments: [{ ...attachment, uploading: true }] }, { attachments: [{ ...attachment, error: true, notice: "Try attaching the file again." }] }]) {
    rerender(<ThemeProvider light solid><Chat {...props} {...state} /></ThemeProvider>);
    const send = screen.getByRole("button", { name: "Send message" });
    expect(send.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(send);
  }
  expect(screen.getByText("Upload failed")).toBeTruthy();
  expect(screen.getByText("Try attaching the file again.")).toBeTruthy();
  expect(sent).toEqual([""]);
});


test("thinking and streaming indicators exist only for an active reply", () => {
  const props = { value: "", messages: [], onChangeText: () => {}, onSend: () => {}, pendingIcon: <Icon sparkles accessibilityLabel="Pending provider" /> };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} pending /></ThemeProvider>);
  expect(screen.getByRole("progressbar", { name: "Assistant is thinking…" })).toBeTruthy();
  expect(screen.getByLabelText("Pending provider")).toBeTruthy();
  rerender(<ThemeProvider light solid><Chat {...props} pending messages={[{ id: "reply", role: "assistant", content: "A partial reply", streaming: true }]} /></ThemeProvider>);
  expect(screen.queryByRole("progressbar", { name: "Assistant is thinking…" })).toBeNull();
  expect(screen.getByRole("progressbar", { name: "Responding…" })).toBeTruthy();
  rerender(<ThemeProvider light solid><Chat {...props} messages={[{ id: "reply", role: "assistant", content: "A completed reply" }]} /></ThemeProvider>);
  expect(screen.queryByRole("progressbar")).toBeNull();
});

const questions = [
  { id: "scope", title: "What should we build?", options: [{ id: "small", label: "A focused release", description: "Start with the essential workflow." }, { id: "full", label: "A complete release" }] },
  { id: "audience", title: "Who is it for?", options: [{ id: "team", label: "Our team" }, { id: "public", label: "Everyone" }] },
];
const questionMessage = { id: "questions", role: "assistant" as const, content: "Choose an approach.", questions };

test("question forms keep choices controlled, keyboard accessible, and complete before submission", () => {
  const changes: { id: string | number; answers: ChatQuestionAnswerData[] }[] = [];
  const sent: ChatQuestionAnswerData[][] = [];
  const props = { value: "", onChangeText: () => {}, onSend: () => {}, onQuestionAnswerChange: (id: string | number, answers: ChatQuestionAnswerData[]) => changes.push({ id, answers }), onSubmitQuestionAnswers: (_id: string | number, answers: ChatQuestionAnswerData[]) => sent.push(answers) };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} messages={[questionMessage]} /></ThemeProvider>);
  expect(screen.getByRole("radiogroup", { name: "What should we build?" })).toBeTruthy();
  const focused = screen.getByRole("radio", { name: /A focused release/ });
  fireEvent.click(focused);
  expect(changes[0]).toEqual({ id: "questions", answers: [{ questionId: "scope", optionId: "small" }] });
  expect(focused.getAttribute("aria-checked")).toBe("false");
  let answers = changes[0]!.answers;
  rerender(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionAnswers: answers }]} /></ThemeProvider>);
  expect(screen.getByRole("radio", { name: /A focused release/ }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("button", { name: "Submit answers" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.keyDown(screen.getByRole("radio", { name: /A focused release/ }), { key: "ArrowDown" });
  expect(changes.at(-1)?.answers).toEqual([{ questionId: "scope", optionId: "full" }]);
  fireEvent.click(screen.getByRole("radio", { name: "Our team" }));
  answers = changes.at(-1)!.answers;
  rerender(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionAnswers: answers }]} /></ThemeProvider>);
  const submit = screen.getByRole("button", { name: "Submit answers" });
  expect(submit.getAttribute("aria-disabled")).not.toBe("true");
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(sent).toEqual([answers]);
  rerender(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionAnswers: answers, questionsSubmitted: true }]} /></ThemeProvider>);
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.queryByRole("button", { name: "Submit answers" })).toBeNull();
  expect(screen.getByText("Answers sent")).toBeTruthy();
  expect(screen.getByText("Our team")).toBeTruthy();
});

test("custom answers are controlled, limited to 1000 characters, and require nonempty text", () => {
  let changed: ChatQuestionAnswerData[] = [];
  let sent: ChatQuestionAnswerData[] = [];
  const message = { ...questionMessage, questions: [questions[0]!] };
  const props = { onQuestionAnswerChange: (_id: string | number, answers: ChatQuestionAnswerData[]) => { changed = answers; }, onSubmitQuestionAnswers: (_id: string | number, answers: ChatQuestionAnswerData[]) => { sent = answers; } };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage message={message} {...props} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("radio", { name: "Write my own answer" }));
  expect(changed).toEqual([{ questionId: "scope", optionId: "__custom", customText: "" }]);
  const custom = (text: string) => [{ questionId: "scope", optionId: "__custom", customText: text }];
  rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: custom("  ") }} /></ThemeProvider>);
  const editor = screen.getByRole("textbox", { name: "Your answer: What should we build?" });
  expect(editor.getAttribute("maxLength")).toBe("1000");
  expect(screen.getByRole("button", { name: "Submit answers" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.change(editor, { target: { value: "x".repeat(1001) } });
  expect(changed[0]?.customText).toHaveLength(1000);
  rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: custom("  A pilot for partners  ") }} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
  expect(sent).toEqual(custom("A pilot for partners"));
  rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: sent, questionsSubmitted: true }} /></ThemeProvider>);
  expect(screen.getByText("A pilot for partners")).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
});

test("inactive question forms cannot change or submit while pending, streaming, disabled, or missing callbacks", () => {
  let events = 0;
  const answers = [{ questionId: "scope", optionId: "small" }, { questionId: "audience", optionId: "team" }];
  const props = { value: "", onChangeText: () => {}, onSend: () => {}, onQuestionAnswerChange: () => { events++; }, onSubmitQuestionAnswers: () => { events++; } };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} messages={[]} /></ThemeProvider>);
  for (const state of [{ pending: true }, { disabled: true }, { streaming: true }, { questionsDisabled: true }, { noChange: true }, { noSubmit: true }]) {
    rerender(<ThemeProvider light solid><Chat {...props} pending={"pending" in state} disabled={"disabled" in state} onQuestionAnswerChange={"noChange" in state ? undefined : props.onQuestionAnswerChange} onSubmitQuestionAnswers={"noSubmit" in state ? undefined : props.onSubmitQuestionAnswers} messages={[{ ...questionMessage, questionAnswers: answers, streaming: "streaming" in state, questionsDisabled: "questionsDisabled" in state }]} /></ThemeProvider>);
    const radio = screen.getByRole("radio", { name: "A complete release" });
    const submit = screen.getByRole("button", { name: "Submit answers" });
    expect(radio.getAttribute("aria-disabled")).toBe("true");
    expect(submit.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(radio);
    fireEvent.click(submit);
  }
  expect(events).toBe(0);
});

for (const platform of ["ios", "android"] as const) {
  test(`question forms use the ${platform} entry with controlled radio and checkbox selection`, async () => {
    const { ChatMessage: NativeChatMessage } = await import(`../src/organisms/chat/chat.${platform}.tsx`);
    let answers: ChatQuestionAnswerData[] = [];
    render(<ThemeProvider light solid><NativeChatMessage message={{ ...questionMessage, questions: [questions[0]!, { ...questions[1]!, multiple: true }] }} onQuestionAnswerChange={(_id, next) => { answers = next; }} onSubmitQuestionAnswers={() => {}} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("radio", { name: /A focused release/ }));
    expect(answers).toEqual([{ questionId: "scope", optionId: "small" }]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Our team" }));
    expect(answers).toEqual([{ questionId: "audience", optionIds: ["team"] }]);
  });
}

test("multiple-choice questions preserve checked options and combine them with a custom answer", () => {
  let changed: ChatQuestionAnswerData[] = [];
  let sent: ChatQuestionAnswerData[] = [];
  const message = { ...questionMessage, questions: [{ ...questions[0]!, multiple: true }] };
  const callbacks = { onQuestionAnswerChange: (_id: string | number, answers: ChatQuestionAnswerData[]) => { changed = answers; }, onSubmitQuestionAnswers: (_id: string | number, answers: ChatQuestionAnswerData[]) => { sent = answers; } };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...callbacks} message={message} /></ThemeProvider>);
  const update = (answers: ChatQuestionAnswerData[]) => rerender(<ThemeProvider light solid><ChatMessage {...callbacks} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
  expect(screen.getByRole("group", { name: "What should we build?" })).toBeTruthy();
  expect(screen.getByText("Select all that apply")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Submit answers" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(screen.getByRole("checkbox", { name: /A focused release/ }));
  expect(changed).toEqual([{ questionId: "scope", optionIds: ["small"] }]);
  expect(screen.getByRole("checkbox", { name: /A focused release/ }).getAttribute("aria-checked")).toBe("false");
  update(changed);
  fireEvent.click(screen.getByRole("checkbox", { name: "A complete release" }));
  expect(changed[0]?.optionIds).toEqual(["small", "full"]);
  update(changed);
  fireEvent.click(screen.getByRole("checkbox", { name: /A focused release/ }));
  expect(changed[0]?.optionIds).toEqual(["full"]);
  update(changed);
  fireEvent.click(screen.getByRole("checkbox", { name: "Write my own answer" }));
  expect(changed[0]?.optionIds).toEqual(["full", "__custom"]);
  update(changed);
  expect(screen.getByRole("button", { name: "Submit answers" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Also include onboarding  " } });
  update(changed);
  fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
  expect(sent).toEqual([{ questionId: "scope", optionIds: ["full", "__custom"], customText: "Also include onboarding" }]);
  rerender(<ThemeProvider light solid><ChatMessage {...callbacks} message={{ ...message, questionAnswers: sent, questionsSubmitted: true }} /></ThemeProvider>);
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(screen.getByText("A complete release")).toBeTruthy();
  expect(screen.getByText("Also include onboarding")).toBeTruthy();
});

test("multiple-choice validation rejects empty, duplicate, unknown, mixed-shape, and blank-custom answers", () => {
  let submissions = 0;
  const message = { ...questionMessage, questions: [{ ...questions[0]!, multiple: true }] };
  const callbacks = { onQuestionAnswerChange: () => {}, onSubmitQuestionAnswers: () => { submissions++; } };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...callbacks} message={message} /></ThemeProvider>);
  const invalid = [{ optionIds: [] }, { optionIds: ["small", "small"] }, { optionIds: ["unknown"] }, { optionIds: ["small"], optionId: "small" }, { optionIds: ["small", "__custom"], customText: " \n " }];
  for (const answer of invalid) {
    rerender(<ThemeProvider light solid><ChatMessage {...callbacks} message={{ ...message, questionAnswers: [{ questionId: "scope", ...answer }] }} /></ThemeProvider>);
    const submit = screen.getByRole("button", { name: "Submit answers" });
    expect(submit.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(submit);
  }
  expect(submissions).toBe(0);
});

for (const platform of ["web", "ios", "android"] as const) {
  test(`question checkboxes keep exact option names when selected and cleared on ${platform}`, async () => {
    const suffix = platform === "web" ? "" : `.${platform}`;
    const { ChatMessage: PlatformChatMessage } = await import(`../src/organisms/chat/chat${suffix}.tsx`);
    let answers: ChatQuestionAnswerData[] = [];
    const message = { id: "execution", role: "assistant" as const, content: "Choose execution tools.", questions: [{ id: "tools", title: "Which tools?", multiple: true, options: [{ id: "builtin", label: "Built-in execution", description: "Run work directly in Argus." }] }] };
    const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: () => {} };
    const { rerender } = render(<ThemeProvider light solid><PlatformChatMessage {...props} message={message} /></ThemeProvider>);
    const update = () => rerender(<ThemeProvider light solid><PlatformChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("checkbox", { name: "Built-in execution" }));
    update();
    const selected = screen.getByRole("checkbox", { name: "Built-in execution" });
    expect(selected.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(selected);
    update();
    expect(screen.getByRole("checkbox", { name: "Built-in execution" }).getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByRole("checkbox", { name: "Write my own answer" }));
    update();
    expect(screen.getByRole("checkbox", { name: "Write my own answer" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("checkbox", { name: "Write my own answer" }));
    update();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
}
