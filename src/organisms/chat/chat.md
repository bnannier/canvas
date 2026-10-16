# Chat

A controlled assistant conversation with independently scrolling messages, clear author and provider labels, and an anchored multiline composer. The parent supplies the bounds; Chat fills the available height without choosing a fixed height of its own.

Messages remain application-owned `ChatMessageData`: keep each `id` stable while updating `content` during streaming. `pending` shows a thinking indicator until an explicitly `streaming` message arrives. `error` adds a visible failure label; `notice` preserves delivery or fallback information. `footer` anchors connection, review, or other actions below the composer and outside the scrollport.

Assistant content supports paragraphs, headings, lists, quotes, fenced code, bold, emphasis, and inline code through React Native text. HTML, images, and links stay literal text and never load or execute remote content. `plain` renders all source punctuation literally; user messages are always plain text. This is a small safe markdown subset rather than a complete CommonMark renderer.

`ChatThread` follows new content while the reader is within 48 points of the bottom and leaves their position alone while they read older messages. Scrolling is immediate, so it does not add motion when text streams or Reduce Motion is enabled. The overflowing thread is keyboard focusable with a visible focus frame. The native app or owning Dialog handles safe areas and keyboard avoidance.

`ChatComposer` keeps Enter available for newlines. Its explicit Send control receives the trimmed draft through `onSend`; empty, disabled, or pending sends are blocked. Pending replies leave the draft editable. The app owns draft clearing, transport, cancellation, persistence, and retry behavior.

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
<Chat style={{ height: 300 }} messages={[{ id: "request", role: "user", content: "Which checks matter for this change?" }]} value="" onChangeText={() => {}} onSend={() => {}} pending pendingLabel="Planner is reviewing the project…" />
```

### Anchored actions

```tsx
<Chat style={{ height: 320 }} messages={[]} value="" onChangeText={() => {}} onSend={() => {}} emptyState={<EmptyState title="Plan your next change" description="Describe the outcome you want." />} footer={<Row snug wrap><Button ghost small>AI connections</Button><Button ghost small>Review requirements</Button></Row>} />
```

### Delivery notice

```tsx
<ChatMessage message={{ id: "failed", role: "assistant", author: "Planner", provider: "OpenAI", content: "The reply could not be completed.", error: true, notice: "Your draft is preserved. Try again when the provider is available." }} />
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
