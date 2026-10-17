# Chat

A controlled assistant conversation with independently scrolling messages, clear author and provider identities, and an anchored multiline composer. The parent supplies the bounds; Chat fills the available height without choosing a fixed height of its own.

Messages remain application-owned `ChatMessageData`: keep each `id` stable while updating `content` during streaming. `pending` shows a three-dot thinking indicator until an explicitly `streaming` message arrives; pass `pendingIcon` to identify its provider. Streaming replies retain their own Responding indicator. Both animations stop when their state ends and stay still under Reduce Motion. `providerIcon` accepts an application-supplied provider logo beside the author; label the image or icon with the provider name for assistive technology. `provider` remains an optional supplementary text label such as the transport name. `error` adds a visible failure label; `notice` preserves delivery or fallback information. `footer` anchors connection, review, or other actions below the composer and outside the scrollport.

Assistant content supports paragraphs, headings, lists, quotes, fenced code, bold, emphasis, and inline code through React Native text. HTML, images, and links stay literal text and never load or execute remote content. `plain` renders all source punctuation literally; user messages are always plain text. This is a small safe markdown subset rather than a complete CommonMark renderer.

`ChatThread` follows new content while the reader is within 48 points of the bottom and leaves their position alone while they read older messages. Scrolling is immediate, so it does not add motion when text streams or Reduce Motion is enabled. The overflowing thread is keyboard focusable with a visible focus frame. The native app or owning Dialog handles safe areas and keyboard avoidance.

`ChatComposer` keeps Enter available for newlines. Its explicit Send control receives the trimmed draft through `onSend`; empty, disabled, pending, or uploading sends are blocked. An attached file permits an empty text draft. Pending replies leave the draft editable. The app owns draft clearing, transport, cancellation, persistence, and retry behavior.

Set `onAttach` to show the accessible paperclip action. The app owns file picking and uploading, passes composer `attachments`, and removes a staged file through `onRemoveAttachment(id)`. A `ChatAttachmentData` has an `id`, `name`, optional `uploading` or `error` flags, and optional `notice` text. Uploading and failed files block sending; remove a failed file or replace it after retrying. `attaching` also blocks attaching and sending while the app opens a picker or uploads. Saved message attachments use the same metadata; `onOpenAttachment(attachment)` on Chat, ChatThread, or ChatMessage delegates opening or downloading to the app. Canvas never requests, uploads, or opens file URLs itself.

An assistant message can include `questions`: each `ChatQuestionData` has a stable `id`, `title`, optional `multiple`, and `options` with an `id`, `label`, and optional `description`. Supply controlled `ChatQuestionAnswerData` entries in `questionAnswers` containing `questionId`, `optionId` for a single choice or `optionIds` for multiple choices, and optional `customText`. Set `multiple` to render a named checkbox group with Select all that apply; custom answers can be combined with regular choices. Every question offers Write my own answer under the reserved `__custom` option id; custom text is limited to 1000 characters. Chat, ChatThread, and ChatMessage expose `onQuestionAnswerChange(messageId, answers)` and `onSubmitQuestionAnswers(messageId, answers)`. Record changes in message data and set `questionsSubmitted` after accepting submission. The complete answer set is submitted once per mounted message; use a new message id for a new request. The app owns persistence, transport, and the receipt state.

Submission requires a valid answer for each question (one option for single choice, a nonempty set of distinct options for multiple choice), both callbacks, and an enabled form. Blank custom text cannot submit; submitted custom text is trimmed. `questionsDisabled` keeps an earlier form read-only. `disabled`, `pending`, and active streaming also prevent selection and submission. `questionsSubmitted` replaces controls with the saved question and answer text plus an Answers sent receipt. Submitted multiple choices show every selected label and any custom text. Question labels and descriptions remain literal text; RadioGroup supplies keyboard arrow navigation and accessible group names.

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

Choose one answer or write your own. This example stores answers outside Chat, then preserves the submitted choices in its message data.

```tsx
<Stateful initial={{ answers: [] as { questionId: string; optionId?: string; optionIds?: string[]; customText?: string }[], submitted: false }}>
  {(state, setState) => (
    <ChatThread
      style={{ height: 540 }}
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
        questionsSubmitted: state.submitted
      }]}
      onQuestionAnswerChange={(_messageId, answers) => setState({ ...state, answers })}
      onSubmitQuestionAnswers={(_messageId, answers) => setState({ answers, submitted: true })}
    />
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
