import { Button, Chat, EmptyState, Row } from "@nannier/canvas";

const noop = () => {};

export const Conversation = () => (
  <Chat
    messages={[
      { id: "question", role: "user", content: "Help me plan the release." },
      { id: "answer", role: "assistant", author: "Planner", provider: "OpenAI", content: "Start with **scope** and a release checklist.\n\n1. Confirm acceptance criteria\n2. Run the affected checks\n3. Review the rollout" },
    ]}
    value=""
    onChangeText={noop}
    onSend={noop}
  />
);

export const Streaming = () => (
  <Chat
    messages={[{ id: "reply", role: "assistant", author: "Planner", provider: "OpenAI", content: "I am reviewing the **requirements**…", streaming: true }]}
    value="Add a mobile check"
    onChangeText={noop}
    onSend={noop}
    pending
  />
);

export const WithAttachments = () => (
  <Chat
    messages={[{ id: "request", role: "user", content: "Review this plan.", attachments: [{ id: "saved-plan", name: "release-plan.pdf" }] }]}
    value=""
    onChangeText={noop}
    onSend={noop}
    onAttach={noop}
    attachments={[{ id: "draft-notes", name: "notes.txt" }]}
    onRemoveAttachment={noop}
    onOpenAttachment={noop}
  />
);

export const Empty = () => (
  <Chat
    messages={[]}
    value=""
    onChangeText={noop}
    onSend={noop}
    emptyState={<EmptyState title="Plan your next change" description="Describe the outcome you want." />}
    footer={<Row snug wrap><Button ghost small>AI connections</Button><Button ghost small>Review requirements</Button></Row>}
  />
);
