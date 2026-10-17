# Chat

A controlled assistant conversation with independently scrolling messages, clear author and provider identities, and an anchored multiline composer. The parent supplies the bounds; Chat fills the available height without choosing a fixed height of its own.

Messages remain application-owned `ChatMessageData`: keep each `id` stable while updating `content` during streaming. `pending` shows a three-dot thinking indicator until an explicitly `streaming` message arrives; pass `pendingIcon` to identify its provider. Streaming replies retain their own Responding indicator. Both animations stop when their state ends and stay still under Reduce Motion. `providerIcon` accepts an application-supplied provider logo beside the author; label the image or icon with the provider name for assistive technology. `provider` remains an optional supplementary text label such as the transport name. `error` adds a visible failure label; `notice` preserves delivery or fallback information. `footer` anchors connection, review, or other actions below the composer and outside the scrollport.

Assistant content supports paragraphs, headings, lists, quotes, fenced code, bold, emphasis, and inline code through React Native text. HTML, images, and links stay literal text and never load or execute remote content. `plain` renders all source punctuation literally; user messages are always plain text. This is a small safe markdown subset rather than a complete CommonMark renderer.

`ChatThread` follows new content while the reader is within 48 points of the bottom and leaves their position alone while they read older messages. Scrolling is immediate, so it does not add motion when text streams or Reduce Motion is enabled. The overflowing thread is keyboard focusable with a visible focus frame. The native app or owning Dialog handles safe areas and keyboard avoidance.

`ChatComposer` keeps Enter available for newlines. Its explicit Send control receives the trimmed draft through `onSend`; empty, disabled, pending, or uploading sends are blocked. An attached file permits an empty text draft. Pending replies leave the draft editable. The app owns draft clearing, transport, cancellation, persistence, and retry behavior.

Set `onAttach` to show the accessible paperclip action. The app owns file picking and uploading, passes composer `attachments`, and removes a staged file through `onRemoveAttachment(id)`. A `ChatAttachmentData` has an `id`, `name`, optional `uploading` or `error` flags, and optional `notice` text. Uploading and failed files block sending; remove a failed file or replace it after retrying. `attaching` also blocks attaching and sending while the app opens a picker or uploads. Saved message attachments use the same metadata; `onOpenAttachment(attachment)` on Chat, ChatThread, or ChatMessage delegates opening or downloading to the app. Canvas never requests, uploads, or opens file URLs itself.

An assistant message can include `questions`: each `ChatQuestionData` has a stable `id`, `title`, optional `multiple`, and `options` with an `id`, `label`, and optional `description`. Supply controlled `ChatQuestionAnswerData` entries in `questionAnswers` containing `questionId`, `optionId` for a single choice or `optionIds` for multiple choices, and optional `customText`. Set `multiple` on the question for checkboxes; a custom answer can be combined with regular choices. A single-choice question also offers Select multiple: switching it on records `multiple: true` in its answer and uses `optionIds`, preserving the original question metadata. The switch retains existing selections and custom text. Switching it off returns to the first selected choice, or clears an empty draft. Every question offers Write my own answer under the reserved `__custom` option id, limited to 1000 characters. Historical answers containing `skipped: true` remain readable in inactive history and saved receipts, but active questions require a real answer.

The active form shows one question with a counter derived from the actual question count. Selecting an ordinary radio saves and advances before the last question. Custom text stays on the current question and uses Next; a blank custom answer cannot advance. Back is a neutral outline button that preserves saved selections and text. Revisited valid single choices offer Next. Checkboxes use Submit to advance; Submit appears only for multiple-choice questions and the last question. The last question always requires explicit Submit before the complete batch is sent, and every question must have a real answer. An incomplete earlier answer returns the reader to the first unresolved question instead of submitting. Submitted custom text is trimmed.

Chat, ChatThread, and ChatMessage expose `onQuestionAnswerChange(messageId, answers)`, `onQuestionIndexChange(messageId, index)`, and `onSubmitQuestionAnswers(messageId, answers)`. Record answer changes in message data and pass the zero-based `questionIndex` to control navigation, including saved continuation after reload. Omitting `questionIndex` uses local navigation state. The position is clamped to the actual list. The final callback receives fresh answers for the whole batch, including the current answer; set `questionsSubmitted` after accepting it. Repeated activations are guarded while navigation or submission settles. A busy state that ends without a saved receipt permits retry. The app owns persistence, transport, and duplicate prevention across requests.

Both answer callbacks and an enabled form are required for interaction. `disabled`, `pending`, and active streaming lock the current question. Use `questionsDisabled` for an inactive earlier batch: it shows every original question and option read-only, without navigation actions. `questionsSubmitted` shows saved answers and historical skipped decisions with an Answers sent receipt. Multiple-choice receipts include every selected label and custom text; an answer-mode override is identified as Multiple answers selected by you. Question labels and descriptions remain literal text; RadioGroup supplies arrow navigation and accessible group names. The counter is announced as Question X of N in a polite live region; navigation moves focus there through the kit's shared browser and native accessibility focus mechanism.

## Usage

```tsx
<Chat
  style={{ height: 360 }}
  messages={[
    { id: "question", role: "user", content: "Help me plan the release." },
    { id: "answer", role: "assistant", author: "Planner", provider: "OpenAI", content: "Start with **scope** and a release checklist.\n\n1. Confirm acceptance criteria\n2. Run the affected checks\n3. Review the rollout" }
  ]}
  value=""
  onChangeText={() => {}}
  onSend={() => {}}
/>
```

## Variants

### Long conversation

```tsx
<Chat testID="chat-long" style={{ height: 320 }} messages={Array.from({ length: 28 }, (_, index) => ({ id: index, role: index % 2 === 0 ? "user" : "assistant", content: index % 2 === 0 ? `Review requirement ${index / 2 + 1}.` : "Confirm the expected behavior, check mobile layouts, and record the evidence before continuing." }))} value="A follow-up question" onChangeText={() => {}} onSend={() => {}} footer={<Typography tiny muted>The composer stays here while earlier messages scroll.</Typography>} />
```

### Streaming

```tsx
<Chat style={{ height: 320 }} messages={[{ id: "reply", role: "assistant", author: "Planner", provider: "OpenAI", content: "I am reviewing the **requirements**…", streaming: true }]} value="Add a mobile check" onChangeText={() => {}} onSend={() => {}} pending />
```

### Pending

```tsx
<Chat style={{ height: 300 }} messages={[{ id: "request", role: "user", content: "Which checks matter for this change?" }]} value="" onChangeText={() => {}} onSend={() => {}} pending pendingIcon={<Icon sparkles accessibilityLabel="Planner" size={24} />} pendingLabel="Planner is reviewing the project…" />
```

### Anchored actions

```tsx
<Chat style={{ height: 320 }} messages={[]} value="" onChangeText={() => {}} onSend={() => {}} emptyState={<EmptyState title="Plan your next change" description="Describe the outcome you want." />} footer={<Row snug wrap><Button ghost small>AI connections</Button><Button ghost small>Review requirements</Button></Row>} />
```

### Delivery notice

```tsx
<ChatMessage message={{ id: "failed", role: "assistant", author: "Planner", provider: "OpenAI", content: "The reply could not be completed.", error: true, notice: "Your draft is preserved. Try again when the provider is available." }} />
```

### Attachments

```tsx
<Chat style={{ height: 320 }} messages={[{ id: "request", role: "user", content: "Review this plan.", attachments: [{ id: "saved-plan", name: "release-plan.pdf" }] }]} value="" onChangeText={() => {}} onSend={() => {}} onAttach={() => {}} attachments={[{ id: "draft-notes", name: "notes.txt" }]} onRemoveAttachment={() => {}} onOpenAttachment={() => {}} />
```

### Selectable questions

Move through one question at a time. This example controls the saved position and answer draft separately so navigation and answer callbacks can update together.

```tsx
<Stateful initial={{ answers: [] as { questionId: string; optionId?: string; optionIds?: string[]; customText?: string; multiple?: boolean }[], submitted: false }}>
  {(state, setState) => (
    <Stateful initial={0}>
      {(questionIndex, setQuestionIndex) => (
        <ChatThread
          style={{ height: 420 }}
          messages={[{
            id: "planning-questions",
            role: "assistant",
            content: "Which release approach should we plan?",
            questions: [{ id: "scope", title: "What should the first release include?", options: [
              { id: "focused", label: "A focused first release", description: "Ship the essential workflow, then expand from feedback." },
              { id: "complete", label: "The complete workflow", description: "Include reporting, collaboration, and administration in the first release." }
            ] }, { id: "checks", title: "Which checks should we include?", multiple: true, options: [
              { id: "desktop", label: "Desktop browser testing" },
              { id: "mobile", label: "Mobile layout and accessibility testing" }
            ] }],
            questionAnswers: state.answers,
            questionIndex,
            questionsSubmitted: state.submitted
          }]}
          onQuestionAnswerChange={(_messageId, answers) => setState({ ...state, answers })}
          onQuestionIndexChange={(_messageId, index) => setQuestionIndex(index)}
          onSubmitQuestionAnswers={(_messageId, answers) => setState({ answers, submitted: true })}
        />
      )}
    </Stateful>
  )}
</Stateful>
```

### Separate pieces

```tsx
<ChatComposer value="Review the release plan" onChangeText={() => {}} onSend={() => {}} footer={<Typography tiny muted>Only reviewed requirements continue to execution.</Typography>} />
```

## Do & Don't

### Bound the thread

**Do** — Give the conversation a bounded parent or an explicit composition height so only its messages scroll.

```tsx
<ChatThread style={{ height: 240 }} label="Planning conversation" messages={[{ id: "one", role: "assistant", content: "Keep the composer outside the scrolling thread." }]} />
```

**Don't** — An unbounded thread grows with every message and pushes its composer away.

```tsx
<Column><ChatThread messages={[{ id: "one", role: "assistant", content: "An unbounded parent cannot provide a scrolling viewport." }]} /><ChatComposer value="" onChangeText={() => {}} onSend={() => {}} /></Column>
```
