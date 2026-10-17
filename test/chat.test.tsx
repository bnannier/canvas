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

test("question forms keep answers and navigation controlled, then submit the final batch once", () => {
  const changes: { id: string | number; answers: ChatQuestionAnswerData[] }[] = [];
  const indices: number[] = [];
  const sent: ChatQuestionAnswerData[][] = [];
  const props = { value: "", onChangeText: () => {}, onSend: () => {}, onQuestionAnswerChange: (id: string | number, answers: ChatQuestionAnswerData[]) => changes.push({ id, answers }), onSubmitQuestionAnswers: (_id: string | number, answers: ChatQuestionAnswerData[]) => sent.push(answers), onQuestionIndexChange: (_id: string | number, index: number) => indices.push(index) };
  const { rerender } = render(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionIndex: 0 }]} /></ThemeProvider>);
  expect(screen.getByLabelText("Question 1 of 2").textContent).toBe("1 of 2");
  expect(screen.getByRole("button", { name: "Previous question" }).getAttribute("aria-disabled")).toBe("true");
  expect(screen.queryByRole("radiogroup", { name: "Who is it for?" })).toBeNull();
  const focused = screen.getByRole("radio", { name: /A focused release/ });
  fireEvent.click(focused);
  expect(changes[0]).toEqual({ id: "questions", answers: [{ questionId: "scope", optionId: "small" }] });
  expect(focused.getAttribute("aria-checked")).toBe("false");
  expect(indices).toEqual([1]);
  expect(sent).toEqual([]);
  expect(screen.getByLabelText("Question 1 of 2")).toBeTruthy();
  let answers = changes[0]!.answers;
  const update = (index: number) => rerender(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionAnswers: answers, questionIndex: index }]} /></ThemeProvider>);
  update(1);
  expect(document.activeElement).toBe(screen.getByLabelText("Question 2 of 2"));
  expect(screen.queryByRole("radiogroup", { name: "What should we build?" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Our team" }));
  answers = changes.at(-1)!.answers;
  update(1);
  fireEvent.keyDown(screen.getByRole("radio", { name: "Our team" }), { key: "ArrowDown" });
  answers = changes.at(-1)!.answers;
  expect(answers).toEqual([{ questionId: "scope", optionId: "small" }, { questionId: "audience", optionId: "public" }]);
  update(1);
  expect(sent).toEqual([]);
  const submit = screen.getByRole("button", { name: "Submit answer" });
  expect(submit.getAttribute("aria-disabled")).not.toBe("true");
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(sent).toEqual([answers]);
  rerender(<ThemeProvider light solid><Chat {...props} messages={[{ ...questionMessage, questionAnswers: answers, questionsSubmitted: true }]} /></ThemeProvider>);
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  expect(screen.getByText("Answers sent")).toBeTruthy();
  expect(screen.getByText("Everyone")).toBeTruthy();
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
  expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.change(editor, { target: { value: "x".repeat(1001) } });
  expect(changed[0]?.customText).toHaveLength(1000);
  rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: custom("  A pilot for partners  ") }} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
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
    expect(radio.getAttribute("aria-disabled")).toBe("true");
    if ("questionsDisabled" in state) {
      expect(screen.queryByRole("button", { name: "Next question" })).toBeNull();
      fireEvent.click(radio);
      continue;
    }
    const submit = screen.getByRole("button", { name: "Next question" });
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
    const message = { ...questionMessage, questions: [questions[0]!, { ...questions[1]!, multiple: true }] };
    const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: () => {} };
    const { rerender } = render(<ThemeProvider light solid><NativeChatMessage {...props} message={message} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("radio", { name: /A focused release/ }));
    expect(answers).toEqual([{ questionId: "scope", optionId: "small" }]);
    rerender(<ThemeProvider light solid><NativeChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
    expect(screen.getByLabelText("Question 2 of 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Our team" }));
    expect(answers).toEqual([{ questionId: "scope", optionId: "small" }, { questionId: "audience", optionIds: ["team"] }]);
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
  expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
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
  expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Also include onboarding  " } });
  update(changed);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
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
    const submit = screen.getByRole("button", { name: "Submit answer" });
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

for (const total of [1, 4]) {
  test(`question counters use all ${total} questions and the final explicit Submit requires a real answer to each`, () => {
    const items = Array.from({ length: total }, (_, index) => ({ id: `q${index}`, title: `Question ${index + 1}`, options: [{ id: "yes", label: "Yes" }] }));
    let answers: ChatQuestionAnswerData[] = [];
    const sent: ChatQuestionAnswerData[][] = [];
    const message = { ...questionMessage, questions: items };
    const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
    const { rerender } = render(<ThemeProvider light solid><ChatMessage {...props} message={message} /></ThemeProvider>);
    for (let index = 0; index < total; index++) {
      expect(screen.getByLabelText(`Question ${index + 1} of ${total}`).textContent).toBe(`${index + 1} of ${total}`);
      expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
      expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
      if (index === total - 1) expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
      else expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
      fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
      expect(sent).toEqual([]);
      rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(sent).toEqual([items.map((item) => ({ questionId: item.id, optionId: "yes" }))]);
    rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers, questionsSubmitted: true }} /></ThemeProvider>);
    expect(screen.getAllByText("Yes")).toHaveLength(total);
  });
}

for (const platform of ["web", "ios", "android"] as const) {
  test(`Back preserves and revises single and multiple custom answers on ${platform}`, async () => {
    const suffix = platform === "web" ? "" : `.${platform}`;
    const { ChatMessage: PlatformChatMessage } = await import(`../src/organisms/chat/chat${suffix}.tsx`);
    let answers: ChatQuestionAnswerData[] = [];
    const sent: ChatQuestionAnswerData[][] = [];
    const message = { ...questionMessage, questions: [questions[0]!, { ...questions[1]!, multiple: true }] };
    const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
    const { rerender } = render(<ThemeProvider light solid><PlatformChatMessage {...props} message={message} /></ThemeProvider>);
    const update = () => rerender(<ThemeProvider light solid><PlatformChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("radio", { name: "Write my own answer" }));
    update();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Partners first  " } });
    update();
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    update();
    expect(screen.getByLabelText("Question 2 of 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Our team" }));
    update();
    fireEvent.click(screen.getByRole("checkbox", { name: "Write my own answer" }));
    update();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Include contractors" } });
    update();
    fireEvent.click(screen.getByRole("button", { name: "Previous question" }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Partners first");
    fireEvent.click(screen.getByRole("radio", { name: "A complete release" }));
    update();
    expect(sent).toEqual([]);
    expect(screen.getByLabelText("Question 2 of 2")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Our team" }).getAttribute("aria-checked")).toBe("true");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Include contractors");
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(sent).toEqual([[{ questionId: "scope", optionId: "full" }, { questionId: "audience", optionIds: ["team", "__custom"], customText: "Include contractors" }]]);
  });
}

test("the last Submit returns to an earlier legacy skip until a real answer replaces it", () => {
  let answers: ChatQuestionAnswerData[] = [{ questionId: "scope", skipped: true }];
  let index = 1;
  const sent: ChatQuestionAnswerData[][] = [];
  const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onQuestionIndexChange: (_id: string | number, next: number) => { index = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
  const view = () => <ThemeProvider light solid><ChatMessage {...props} message={{ ...questionMessage, questionAnswers: answers, questionIndex: index }} /></ThemeProvider>;
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole("radio", { name: "Our team" }));
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(index).toBe(0);
  expect(sent).toEqual([]);
  rerender(view());
  expect(screen.getByText("Answer required")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Next question" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "A complete release" }));
  expect(answers).toEqual([{ questionId: "scope", optionId: "full" }, { questionId: "audience", optionId: "team" }]);
  expect(index).toBe(1);
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toEqual([answers]);
});

test("controlled navigation guards duplicate clicks and keeps all controls inactive while locked", () => {
  const indices: number[] = [];
  const answers: ChatQuestionAnswerData[] = [{ questionId: "scope", optionId: "small" }];
  const props = { onQuestionAnswerChange: () => {}, onQuestionIndexChange: (_id: string | number, index: number) => indices.push(index), onSubmitQuestionAnswers: () => {} };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...props} message={{ ...questionMessage, questionIndex: 0, questionAnswers: answers }} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
  expect(indices).toEqual([1]);
  for (const state of [{ disabled: true }, { pending: true }, { streaming: true }, { questionsDisabled: true }]) {
    rerender(<ThemeProvider light solid><ChatMessage {...props} disabled={"disabled" in state} pending={"pending" in state} message={{ ...questionMessage, questionIndex: 1, streaming: "streaming" in state, questionsDisabled: "questionsDisabled" in state }} /></ThemeProvider>);
    if ("questionsDisabled" in state) {
      expect(screen.queryByRole("button", { name: "Previous question" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
      continue;
    }
    for (const label of ["Previous question", "Submit answer"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(button);
    }
  }
  expect(indices).toEqual([1]);
});

test("historical skipped answers cannot submit and question positions are clamped to the actual list", () => {
  const message = { ...questionMessage, questions: [questions[0]!] };
  const props = { onQuestionAnswerChange: () => {}, onSubmitQuestionAnswers: () => {} };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionIndex: 99 }} /></ThemeProvider>);
  expect(screen.getByLabelText("Question 1 of 1")).toBeTruthy();
  for (const extra of [{}, { multiple: true }, { optionId: "small" }, { optionIds: ["small"] }, { customText: "Leftover draft" }]) {
    rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionIndex: -3, questionAnswers: [{ questionId: "scope", skipped: true, ...extra }] }} /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  }
});

for (const platform of ["web", "ios", "android"] as const) {
  test(`inactive history preserves every question and option while transient busy state keeps only the current question on ${platform}`, async () => {
    const suffix = platform === "web" ? "" : `.${platform}`;
    const { ChatMessage: PlatformChatMessage } = await import(`../src/organisms/chat/chat${suffix}.tsx`);
    let changes = 0;
    const message = { ...questionMessage, questionIndex: 1, questionsDisabled: true, questions: [questions[0]!, { ...questions[1]!, multiple: true }], questionAnswers: [{ questionId: "scope", optionId: "__custom", customText: "Saved draft" }, { questionId: "audience", optionIds: ["team"] }] };
    const props = { onQuestionAnswerChange: () => { changes++; }, onQuestionIndexChange: () => { changes++; }, onSubmitQuestionAnswers: () => { changes++; } };
    const { rerender } = render(<ThemeProvider light solid><PlatformChatMessage {...props} message={message} /></ThemeProvider>);
    expect(screen.getByRole("radiogroup", { name: "What should we build?" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Who is it for?" })).toBeTruthy();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Saved draft");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).readOnly).toBe(true);
    expect(screen.queryByRole("button")).toBeNull();
    for (const control of [...screen.getAllByRole("radio"), ...screen.getAllByRole("checkbox")]) {
      expect(control.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(control);
    }
    expect(changes).toBe(0);
    rerender(<ThemeProvider light solid><PlatformChatMessage {...props} pending message={{ ...message, questionsDisabled: false }} /></ThemeProvider>);
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.getByLabelText("Question 2 of 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  });
}

test("final submission can retry after transient failure, stays locked while busy, and never retries a saved receipt", () => {
  const sent: ChatQuestionAnswerData[][] = [];
  const message = { ...questionMessage, questions: [questions[0]!], questionAnswers: [{ questionId: "scope", optionId: "small" }] };
  const props = { onQuestionAnswerChange: () => {}, onSubmitQuestionAnswers: (_id: string | number, answers: ChatQuestionAnswerData[]) => sent.push(answers) };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...props} message={message} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toHaveLength(1);
  rerender(<ThemeProvider light solid><ChatMessage {...props} pending message={message} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toHaveLength(1);
  rerender(<ThemeProvider light solid><ChatMessage {...props} pending={false} message={message} /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toHaveLength(2);
  rerender(<ThemeProvider light solid><ChatMessage {...props} pending message={{ ...message, questionsSubmitted: true }} /></ThemeProvider>);
  rerender(<ThemeProvider light solid><ChatMessage {...props} pending={false} message={{ ...message, questionsSubmitted: true }} /></ThemeProvider>);
  expect(screen.queryByRole("button")).toBeNull();
  expect(sent).toHaveLength(2);
});

test("only multi-select and last questions display Submit; revisited regular single choices offer Next", () => {
  let answers: ChatQuestionAnswerData[] = [{ questionId: "scope", optionId: "small" }];
  let index = 0;
  const sent: ChatQuestionAnswerData[][] = [];
  const message = { ...questionMessage, questions: [questions[0]!, { ...questions[1]!, multiple: true }, { id: "end", title: "Last question?", options: [{ id: "yes", label: "Yes" }] }] };
  const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onQuestionIndexChange: (_id: string | number, next: number) => { index = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
  const view = () => <ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers, questionIndex: index }} /></ThemeProvider>;
  const { rerender } = render(view());
  expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  rerender(view());
  expect(screen.getByLabelText("Question 2 of 3")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(screen.getByRole("checkbox", { name: "Our team" }));
  rerender(view());
  expect(index).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  rerender(view());
  expect(screen.getByLabelText("Question 3 of 3")).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
  rerender(view());
  expect(sent).toEqual([]);
  expect(index).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toEqual([answers]);
});

test("non-last custom answers show a disabled Next until text is supplied and Back preserves the saved draft", () => {
  let answers: ChatQuestionAnswerData[] = [];
  let index = 0;
  const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onQuestionIndexChange: (_id: string | number, next: number) => { index = next; }, onSubmitQuestionAnswers: () => {} };
  const view = () => <ThemeProvider light solid><ChatMessage {...props} message={{ ...questionMessage, questionAnswers: answers, questionIndex: index }} /></ThemeProvider>;
  const { rerender } = render(view());
  expect(screen.queryByRole("button", { name: "Next question" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Write my own answer" }));
  rerender(view());
  expect(index).toBe(0);
  expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  expect(screen.getByRole("button", { name: "Next question" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft answer" } });
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  expect(answers).toEqual([{ questionId: "scope", optionId: "__custom", customText: "Draft answer" }]);
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Previous question" }));
  rerender(view());
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Draft answer");
  expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  expect(screen.getByRole("button", { name: "Next question" }).getAttribute("aria-disabled")).not.toBe("true");
});

for (const platform of ["web", "ios", "android"] as const) {
  test(`Select multiple preserves custom drafts and submits the human override without changing source metadata on ${platform}`, async () => {
    const suffix = platform === "web" ? "" : `.${platform}`;
    const { ChatMessage: PlatformChatMessage } = await import(`../src/organisms/chat/chat${suffix}.tsx`);
    let answers: ChatQuestionAnswerData[] = [{ questionId: "scope", optionId: "__custom", customText: "  A partner pilot  " }];
    let index = 0;
    const sent: ChatQuestionAnswerData[][] = [];
    const message = { ...questionMessage };
    const original = JSON.stringify(message.questions);
    const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onQuestionIndexChange: (_id: string | number, next: number) => { index = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
    const view = (submitted = false) => <ThemeProvider light solid><PlatformChatMessage {...props} message={{ ...message, questionAnswers: answers, questionIndex: index, questionsSubmitted: submitted }} /></ThemeProvider>;
    const { rerender } = render(view());
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: "Select multiple" }));
    expect(answers).toEqual([{ questionId: "scope", multiple: true, optionIds: ["__custom"], customText: "  A partner pilot  " }]);
    rerender(view());
    expect(screen.getByRole("switch", { name: "Select multiple" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.queryByRole("radio")).toBeNull();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("  A partner pilot  ");
    fireEvent.click(screen.getByRole("checkbox", { name: "A complete release" }));
    expect(answers[0]).toEqual({ questionId: "scope", multiple: true, optionIds: ["__custom", "full"], customText: "  A partner pilot  " });
    rerender(view());
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Include reporting  " } });
    expect(answers[0]?.multiple).toBe(true);
    rerender(view());
    expect(index).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(index).toBe(1);
    expect(sent).toEqual([]);
    rerender(view());
    fireEvent.click(screen.getByRole("radio", { name: "Our team" }));
    rerender(view());
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(sent).toEqual([[{ questionId: "scope", multiple: true, optionIds: ["__custom", "full"], customText: "Include reporting" }, { questionId: "audience", optionId: "team" }]]);
    expect(JSON.stringify(message.questions)).toBe(original);
    rerender(view(true));
    expect(screen.getByText("Multiple answers selected by you")).toBeTruthy();
    expect(screen.getByText("A complete release")).toBeTruthy();
    expect(screen.getByText("Include reporting")).toBeTruthy();
    expect(screen.getByText("Our team")).toBeTruthy();
  });
}

test("Select multiple can start empty, preserve a selected radio, return to its first choice, and clear an empty override", () => {
  let answers: ChatQuestionAnswerData[] = [];
  const message = { ...questionMessage, questions: [questions[0]!] };
  const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: () => {} };
  const view = () => <ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>;
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole("switch", { name: "Select multiple" }));
  expect(answers).toEqual([{ questionId: "scope", multiple: true, optionIds: [] }]);
  rerender(view());
  expect(screen.getByRole("button", { name: "Submit answer" }).getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(screen.getByRole("switch", { name: "Select multiple" }));
  expect(answers).toEqual([]);
  rerender(view());
  fireEvent.click(screen.getByRole("radio", { name: "A complete release" }));
  rerender(view());
  fireEvent.click(screen.getByRole("switch", { name: "Select multiple" }));
  expect(answers).toEqual([{ questionId: "scope", multiple: true, optionIds: ["full"] }]);
  rerender(view());
  fireEvent.click(screen.getByRole("checkbox", { name: "A focused release" }));
  rerender(view());
  fireEvent.click(screen.getByRole("switch", { name: "Select multiple" }));
  expect(answers).toEqual([{ questionId: "scope", optionId: "full" }]);
  rerender(view());
  expect(screen.getByRole("radio", { name: "A complete release" }).getAttribute("aria-checked")).toBe("true");
});

test("inactive human overrides retain checkboxes and a disabled mode switch", () => {
  let answers: ChatQuestionAnswerData[] = [{ questionId: "scope", multiple: true, optionIds: ["small", "full"] }];
  const sent: ChatQuestionAnswerData[][] = [];
  const message = { ...questionMessage, questions: [questions[0]!] };
  const props = { onQuestionAnswerChange: (_id: string | number, next: ChatQuestionAnswerData[]) => { answers = next; }, onSubmitQuestionAnswers: (_id: string | number, next: ChatQuestionAnswerData[]) => sent.push(next) };
  const { rerender } = render(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers, questionsDisabled: true }} /></ThemeProvider>);
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.getByRole("switch", { name: "Select multiple" }).getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByRole("checkbox", { name: "A complete release" }).getAttribute("aria-checked")).toBe("true");
  rerender(<ThemeProvider light solid><ChatMessage {...props} message={{ ...message, questionAnswers: answers }} /></ThemeProvider>);
  expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
  expect(sent).toEqual([[{ questionId: "scope", multiple: true, optionIds: ["small", "full"] }]]);
});

test("historical skipped receipts remain readable without introducing an active Skip action", () => {
  const message = { ...questionMessage, questionAnswers: [{ questionId: "scope", skipped: true }, { questionId: "audience", optionId: "team" }], questionsSubmitted: true };
  const original = JSON.stringify(message);
  render(<ThemeProvider light solid><ChatMessage message={message} /></ThemeProvider>);
  expect(screen.getByText("Skipped")).toBeTruthy();
  expect(screen.getByText("Our team")).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
  expect(JSON.stringify(message)).toBe(original);
});
