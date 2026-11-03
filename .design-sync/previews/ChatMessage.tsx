import { ChatMessage, Column } from "@nannier/canvas";

export const Exchange = () => (
  <Column>
    <ChatMessage message={{ id: "q", role: "user", content: "Which checks matter for this change?" }} />
    <ChatMessage message={{ id: "a", role: "assistant", author: "Planner", provider: "OpenAI", content: "Run the **mobile layout** and accessibility checks first." }} />
  </Column>
);

export const Failed = () => (
  <ChatMessage
    message={{
      id: "failed",
      role: "assistant",
      author: "Planner",
      provider: "OpenAI",
      content: "The reply could not be completed.",
      error: true,
      notice: "Your draft is preserved. Try again when the provider is available.",
    }}
  />
);

export const WithAttachment = () => (
  <ChatMessage message={{ id: "req", role: "user", content: "Review this plan.", attachments: [{ id: "plan", name: "release-plan.pdf" }] }} />
);
