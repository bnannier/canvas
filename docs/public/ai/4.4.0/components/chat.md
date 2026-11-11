# Chat

Package: @nannier/canvas
Version: 4.4.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 35b0556b3cf4787d8b9cdf8a7e93b47c770a9726957905f5b8d3a812e5fea783

Source: `src/organisms/chat/chat.md`
Human reference: https://canvas.nannier.com/components/chat

## Public imports

```tsx
import { Chat, ChatComposer, ChatMessage, ChatThread, Markdown } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A controlled assistant conversation with independently scrolling messages, clear author and provider identities, and an anchored multiline composer. The parent supplies the bounds; Chat fills the available height without choosing a fixed height of its own.

Messages remain application-owned `ChatMessageData`: keep each `id` stable while updating `content` during streaming. `pending` shows a three-dot thinking indicator until an explicitly `streaming` message arrives; pass `pendingIcon` to identify its provider. Streaming replies retain their own Responding indicator. Both animations stop when their state ends and stay still under Reduce Motion. `providerIcon` accepts an application-supplied provider logo beside the author; label the image or icon with the provider name for assistive technology. `provider` remains an optional supplementary text label such as the transport name. `error` adds a visible failure label; `notice` preserves delivery or fallback information. `footer` anchors connection, review, or other actions below the composer and outside the scrollport.

Chat draws the conversation as a card: messages 14 points apart inside a 16 point inset, assistant replies as plain 14 point text with no author line unless the app names an `author` or a provider (several AIs in one conversation), the person's own turns as a bubble in the accent's soft wash on the trailing side, and the composer under a hairline, its sunken field holding the draft and a round send button. Set `flush` to drop the card frame so the conversation sits directly on its host's fill, for example inside a Drawer or a Wizard body.

Set `assistant` to lay the conversation out like a desktop assistant's window instead. The thread and the composer share one centered column whose composer box is 768 points wide at most, with the user's bubble 16 points in from its edge. Assistant replies are plain 15 / 21 text across the column, 20 points in from the composer's edge, with list items on the line rhythm and paragraphs 12 apart. The person's own turns are a neutral bubble, 12 by 16 points in. Turns that change speaker sit 40 points apart and the blocks of one turn 20 apart. The composer is one raised, rounded 44 point box with no divider: a bare add icon, the draft, and a send control that stays quiet until there is something to send. The thread and the composer keep 24 point gutters; when either is narrower than 480 points (a phone, a side panel, a wizard body) the gutters shrink to 12 so the composer's text keeps its room. With `assistant`, `meta` names what will answer (a model, a provider) in one muted line at the end of the column under the composer. `assistant` and `flush` combine: a Wizard `assistant` body or a Drawer usually wants both.

Set `activity` on a message for work the assistant did rather than said, such as a command, a tool call or a process log. It shows as one muted line, its `author` then its `notice`, flush with the reply text, and expands to its markdown `content` when pressed. Consecutive activity messages fold into a single line naming each step ("Ran the tests, Process finished"), the way a desktop assistant folds its tool use; pressing it shows each step's own line.

Pass `actions` on any message for app-owned choices beneath its content: each has a stable `id`, a literal `label`, and optional `primary`. Chat, ChatThread, and ChatMessage call `onAction(messageId, actionId)` when chosen. Choices wrap at narrow widths and use each platform’s Button. `disabled`, `pending`, any streaming message in the thread, or an absent callback prevents activation. The app owns saving the choice, setting busy state while it is accepted, duplicate prevention, and removing resolved or historical actions. Actions do not send a composer draft or submit question answers.

Assistant content supports paragraphs, headings, lists, quotes, fenced code, bold, emphasis, and inline code through React Native text. HTML, images, and links stay literal text and never load or execute remote content. `plain` renders all source punctuation literally; user messages are always plain text. This is a small safe markdown subset rather than a complete CommonMark renderer.

`ChatThread` follows new content while the reader is within 48 points of the bottom. Scrolling up to read older messages pauses following; returning to the bottom resumes it. Message updates, streaming text, question-height changes, and viewport resizing coalesce into a tail adjustment after layout settles. Scrolling is immediate and never animated, so it does not add motion when text streams or Reduce Motion is enabled. The overflowing thread is keyboard focusable with a visible focus frame. The native app or owning Dialog handles safe areas and keyboard avoidance.

`ChatComposer` keeps Enter available for newlines. Its explicit Send control receives the trimmed draft through `onSend`; empty, disabled, pending, or uploading sends are blocked. An attached file permits an empty text draft. `sendDisabled` blocks only Send while leaving drafts, attachment controls, and message choices interactive; use it when a saved choice must be made before another freeform message. Pending replies leave the draft editable. The app owns draft clearing, transport, cancellation, persistence, and retry behavior.

Pass `terminal` to Chat or its standalone pieces for a flat, left-aligned monospace transcript. Messages use `❯` for the user and `●` for the assistant beside their author, preserving provider text and current delivery state. No user bubble or conversation card is added. The bare composer places `❯` and its multiline editor between two full-width hairlines, with an explicit rectangular Send action. Hardware Enter sends; Shift+Enter inserts a newline. IME composition and native soft-keyboard Enter retain their normal text-entry behavior. Sending returns focus to the editor; `autoFocus` optionally focuses it on mount. The app still owns clearing the draft, delivery, and preventing duplicate requests. Pending replies keep the draft editable and block sending.

`Markdown terminal` preserves the same safe document grammar with 13px monospace text, compact spacing, and semantic headings. Tables remain aligned table rows in a horizontal scrollport instead of becoming stacked cards. Fenced code and tabs remain literal whitespace. `Textarea terminal` supplies the prompt's bare monospace metrics and implies `embedded`; existing Textarea defaults remain unchanged.

Set `onAttach` to show the accessible paperclip action. The app owns file picking and uploading, passes composer `attachments`, and removes a staged file through `onRemoveAttachment(id)`. A `ChatAttachmentData` has an `id`, `name`, optional `uploading` or `error` flags, and optional `notice` text. Uploading and failed files block sending; remove a failed file or replace it after retrying. `attaching` also blocks attaching and sending while the app opens a picker or uploads. Saved message attachments use the same metadata; `onOpenAttachment(attachment)` on Chat, ChatThread, or ChatMessage delegates opening or downloading to the app. Canvas never requests, uploads, or opens file URLs itself.

An assistant message can include `questions`: each `ChatQuestionData` has a stable `id`, `title`, optional `multiple`, and `options` with an `id`, `label`, and optional `description`. Supply controlled `ChatQuestionAnswerData` entries in `questionAnswers` containing `questionId`, `optionId` for a single choice or `optionIds` for multiple choices, and optional `customText`. Set `multiple` on the question for checkboxes; a custom answer can be combined with regular choices. A single-choice question also offers Select multiple at the bottom-right of its action row: switching it on records `multiple: true` in its answer and uses `optionIds`, preserving the original question metadata. The switch retains existing selections and custom text. Switching it off returns to the first selected choice, or clears an empty draft. Every question offers Write my own answer under the reserved `__custom` option id, limited to 1000 characters.

The active form shows one question with a counter derived from the actual question count. Selecting an ordinary radio saves and advances before the last question. Custom text stays on the current question and uses Next; a blank custom answer cannot advance. Back is a neutral outline button that preserves saved selections and text. Revisited valid single choices offer Next. Checkboxes use Submit to advance; Submit appears only for multiple-choice questions and the last question. The last question always requires explicit Submit before the complete batch is sent, and every question must have a real answer. An incomplete earlier answer returns the reader to the first unresolved question instead of submitting. Submitted custom text is trimmed.

Chat, ChatThread, and ChatMessage expose `onQuestionAnswerChange(messageId, answers)`, `onQuestionIndexChange(messageId, index)`, and `onSubmitQuestionAnswers(messageId, answers)`. Record answer changes in message data and pass the zero-based `questionIndex` to control navigation, including saved continuation after reload. Omitting `questionIndex` uses local navigation state. The position is clamped to the actual list. The final callback receives fresh answers for the whole batch, including the current answer; set `questionsSubmitted` after accepting it. Repeated activations are guarded while navigation or submission settles. A busy state that ends without a saved receipt permits retry. The app owns persistence, transport, and duplicate prevention across requests.

Both answer callbacks and an enabled form are required for interaction. `disabled`, `pending`, and active streaming lock the current question. Use `questionsDisabled` for an inactive earlier batch: it shows every original question and option read-only, without navigation actions. `questionsSubmitted` shows saved answers with an Answers sent receipt. Multiple-choice receipts include every selected label and custom text; an answer-mode override is identified as Multiple answers selected by you. Question labels and descriptions remain literal text; RadioGroup supplies arrow navigation and accessible group names. The counter is announced as Question X of N in a polite live region; navigation moves focus there through the kit's shared browser and native accessibility focus mechanism.

The current question is framed by the existing compact, flat selected Card: a soft theme tint and primary border distinguish its counter, answers and actions from the surrounding conversation. Saved receipts and inactive question history remain unframed. The Card is visual only, so answer controls retain their own accessible roles and focus behavior.

`Markdown` reuses Chat's safe grammar and renderer for standalone documents. It preserves heading levels one through six, emphasis, inline and fenced code, quotes, ordered and unordered lists, nested indentation, static checked/unchecked task lists, horizontal rules, and pipe tables.
Tables use Canvas DataTable's container-responsive stacked layout on narrow surfaces, retaining every column on iOS too.
Checklists are read-only Canvas selection controls; reading a document never changes its source. HTML, links and image syntax remain inert text: no source is executed and no remote image is requested. `MarkdownProps` accepts the source as children, an optional accessibility label and test ID; `compact` uses dense document typography. The parent supplies width.


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

### Assistant layout

`assistant` lays the conversation out like a desktop assistant's window: a centered reading column, plain replies, a neutral user bubble, folded activity, and a raised composer with the model line under it.

```tsx
<Chat assistant meta="Claude CLI" style={{ height: 360 }} messages={[{ id: "ask", role: "user", content: "Help me plan the release." }, { id: "plan", role: "assistant", content: "Start with **scope** and a release checklist.\n\n1. Confirm acceptance criteria\n2. Run the affected checks\n3. Review the rollout" }, { id: "read", role: "system", activity: true, author: "Read the release notes", content: "CHANGELOG.md" }, { id: "ran", role: "system", activity: true, author: "Ran bun test", content: "42 passed" }]} value="" onChangeText={() => {}} onSend={() => {}} />
```

### Flush with a model line

`flush` drops the card frame, so an `assistant` conversation sits on its host's fill as a desktop window's does.

```tsx
<Chat assistant flush meta="Claude CLI" style={{ height: 320 }} messages={[{ id: "ask", role: "user", content: "Add a ghost that chases the player." }, { id: "plan", role: "assistant", content: "I'll add a **Chaser** ghost.\n\n1. Track the player tile\n2. Halve speed in tunnels" }, { id: "ran", role: "system", activity: true, author: "Ran bun test src/ghosts", content: "5 passed" }]} value="" onChangeText={() => {}} onSend={() => {}} />
```

### Terminal transcript

```tsx
<Chat terminal autoFocus style={{ height: 320 }} messages={[{ id: "request", role: "user", content: "Inspect the current change." }, { id: "reply", role: "assistant", author: "Claude", content: "I will read the **implementation** and its checks." }]} value="" onChangeText={() => {}} onSend={() => {}} footer={<Typography tiny muted>Enter to send · Shift+Enter for newline</Typography>} />
```

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

### Message choices

```tsx
<Stateful initial="">
  {(choice, setChoice) => (
    <ChatThread
      style={{ height: 240 }}
      messages={[{ id: "checkpoint", role: "assistant", content: choice ? `Selected: ${choice}` : "Your answers are saved. What would you like to do next?", actions: choice ? [] : [{ id: "draft", label: "Draft plan", primary: true }, { id: "continue", label: "Continue with questions" }] }]}
      onAction={(_messageId, actionId) => setChoice(actionId)}
    />
  )}
</Stateful>
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

### Document Markdown

```tsx
<Markdown compact>{`# Release scope

## Acceptance criteria
- [ ] Behavior verified
- [x] Requirement recorded

| Story | Priority | Status |
| --- | --- | --- |
| Saved scope | Must | Backlog |`}</Markdown>
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

## Supported props

### ChatMessageProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onAction | ((messageId: string \| number, actionId: string) => void) \| undefined | no |  | The app owns action handling, persistence, and removing resolved actions. |
| onQuestionAnswerChange | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Update the message's controlled questionAnswers; the app owns saving the draft. |
| onSubmitQuestionAnswers | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Submit the final complete answer set; the app owns transport and setting questionsSubmitted. |
| onQuestionIndexChange | ((messageId: string \| number, index: number) => void) \| undefined | no |  | Save the zero-based current question index; omit questionIndex for local navigation state. |
| disabled | boolean \| undefined | no | false | Disable question forms while other application work is in progress. |
| pending | boolean \| undefined | no | false |  |
| message | ChatMessageData | yes |  |  |
| onOpenAttachment | ((attachment: ChatAttachmentData) => void) \| undefined | no |  |  |
| plain | boolean \| undefined | no | false | Render assistant markdown punctuation literally. User messages are always plain text. |
| terminal | boolean \| undefined | no | false | Flat, compact monospace terminal transcript. |
| assistant | boolean \| undefined | no | false | Lay the conversation out like a desktop assistant's window (the Claude desktop window, reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look. |
| testID | string \| undefined | no |  |  |

### ChatThreadProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onAction | ((messageId: string \| number, actionId: string) => void) \| undefined | no |  | The app owns action handling, persistence, and removing resolved actions. |
| onQuestionAnswerChange | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Update the message's controlled questionAnswers; the app owns saving the draft. |
| onSubmitQuestionAnswers | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Submit the final complete answer set; the app owns transport and setting questionsSubmitted. |
| onQuestionIndexChange | ((messageId: string \| number, index: number) => void) \| undefined | no |  | Save the zero-based current question index; omit questionIndex for local navigation state. |
| disabled | boolean \| undefined | no | false | Disable question forms while other application work is in progress. |
| messages | readonly ChatMessageData[] | yes |  |  |
| onOpenAttachment | ((attachment: ChatAttachmentData) => void) \| undefined | no |  |  |
| pending | boolean \| undefined | no | false | A reply is being prepared; no artificial message is added to the data. |
| pendingLabel | string \| undefined | no | "Assistant is thinking…" |  |
| pendingIcon | ReactNode | no |  | Application-supplied provider mark for a reply that has not started streaming. |
| label | string \| undefined | no | "Conversation" |  |
| emptyState | ReactNode | no |  |  |
| plain | boolean \| undefined | no | false |  |
| terminal | boolean \| undefined | no | false | Flat, compact monospace terminal transcript. |
| flush | boolean \| undefined | no | false | Draw no frame: the conversation sits on its host's fill, as a desktop assistant's window does. |
| assistant | boolean \| undefined | no | false | Lay the conversation out like a desktop assistant's window (the Claude desktop window, reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look. |
| testID | string \| undefined | no |  |  |
| style | LayoutStyle | no |  | Parent composition only. Supply a bounded height, or a bounded flex parent. |

### ChatComposerProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| terminal | boolean \| undefined | no | false | Bare terminal prompt; hardware Enter sends and Shift+Enter inserts a newline. |
| autoFocus | boolean \| undefined | no | false | Focus the message input on mount. |
| value | string | yes |  |  |
| onChangeText | (value: string) => void | yes |  |  |
| onSend | (value: string) => void | yes |  | Receives the trimmed draft. The app owns clearing the draft and starting transport. |
| placeholder | string \| undefined | no | "Message the assistant…" |  |
| composerLabel | string \| undefined | no | "Message" |  |
| sendLabel | string \| undefined | no | "Send message" |  |
| sendDisabled | boolean \| undefined | no | false | Block only sending, keeping the draft, attachments, and message choices interactive. |
| maxLength | number \| undefined | no |  | Optional application input limit; enforced by the native text field. |
| pending | boolean \| undefined | no | false | Prevent sending while a reply is pending; the draft remains editable. |
| disabled | boolean \| undefined | no | false |  |
| onAttach | (() => void) \| undefined | no |  | Show an attachment control; the app owns its file picker and upload service. |
| attachments | readonly ChatAttachmentData[] \| undefined | no |  |  |
| onRemoveAttachment | ((id: string) => void) \| undefined | no |  |  |
| attaching | boolean \| undefined | no | false | File selection or upload is in progress; prevents attaching or sending again. |
| footer | ReactNode | no |  | Anchored actions or help below the composer, outside the scrolling thread. |
| meta | string \| undefined | no |  | With `assistant`, a short muted line at the composer's end below it, naming the model or mode that will answer. |
| assistant | boolean \| undefined | no | false | Lay the conversation out like a desktop assistant's window (the Claude desktop window, reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look. |
| testID | string \| undefined | no |  |  |

### ChatProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onAction | ((messageId: string \| number, actionId: string) => void) \| undefined | no |  | The app owns action handling, persistence, and removing resolved actions. |
| onQuestionAnswerChange | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Update the message's controlled questionAnswers; the app owns saving the draft. |
| onSubmitQuestionAnswers | ((messageId: string \| number, answers: ChatQuestionAnswerData[]) => void) \| undefined | no |  | Submit the final complete answer set; the app owns transport and setting questionsSubmitted. |
| onQuestionIndexChange | ((messageId: string \| number, index: number) => void) \| undefined | no |  | Save the zero-based current question index; omit questionIndex for local navigation state. |
| disabled | boolean \| undefined | no | false | Disable question forms while other application work is in progress. |
| messages | readonly ChatMessageData[] | yes |  |  |
| onOpenAttachment | ((attachment: ChatAttachmentData) => void) \| undefined | no |  |  |
| pending | boolean \| undefined | no | false | A reply is being prepared; no artificial message is added to the data. |
| pendingLabel | string \| undefined | no |  |  |
| pendingIcon | ReactNode | no |  | Application-supplied provider mark for a reply that has not started streaming. |
| label | string \| undefined | no |  |  |
| emptyState | ReactNode | no |  |  |
| plain | boolean \| undefined | no | false |  |
| terminal | boolean \| undefined | no | false | Flat, compact monospace terminal transcript. |
| flush | boolean \| undefined | no | false | Draw no frame: the conversation sits on its host's fill, as a desktop assistant's window does. |
| assistant | boolean \| undefined | no | false | Lay the conversation out like a desktop assistant's window (the Claude desktop window, reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look. |
| testID | string \| undefined | no |  |  |
| style | LayoutStyle | no |  | Parent composition only. Supply a bounded height, or a bounded flex parent. |
| autoFocus | boolean \| undefined | no | false | Focus the message input on mount. |
| value | string | yes |  |  |
| onChangeText | (value: string) => void | yes |  |  |
| onSend | (value: string) => void | yes |  | Receives the trimmed draft. The app owns clearing the draft and starting transport. |
| placeholder | string \| undefined | no |  |  |
| composerLabel | string \| undefined | no |  |  |
| sendLabel | string \| undefined | no |  |  |
| sendDisabled | boolean \| undefined | no | false | Block only sending, keeping the draft, attachments, and message choices interactive. |
| maxLength | number \| undefined | no |  | Optional application input limit; enforced by the native text field. |
| onAttach | (() => void) \| undefined | no |  | Show an attachment control; the app owns its file picker and upload service. |
| attachments | readonly ChatAttachmentData[] \| undefined | no |  |  |
| onRemoveAttachment | ((id: string) => void) \| undefined | no |  |  |
| attaching | boolean \| undefined | no | false | File selection or upload is in progress; prevents attaching or sending again. |
| footer | ReactNode | no |  | Anchored actions or help below the composer, outside the scrolling thread. |
| meta | string \| undefined | no |  | With `assistant`, a short muted line at the composer's end below it, naming the model or mode that will answer. |

### MarkdownProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | string | yes |  | Untrusted Markdown source. HTML, URLs and images remain inert text. |
| compact | boolean \| undefined | no | false | Denser document typography using Canvas's body reading scale. |
| terminal | boolean \| undefined | no | false | Compact monospace transcript, with flat horizontally scrolling tables. |
| accessibilityLabel | string \| undefined | no |  |  |
| testID | string \| undefined | no |  |  |

See [installation](https://canvas.nannier.com/ai/4.4.0/installation.md) for required peers and feature fallbacks.
