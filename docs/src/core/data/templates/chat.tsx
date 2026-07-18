import { Row, Column, Card, Typography, Button, Input, Chip, Avatar, Spinner, EmptyState, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Assistant chat built from real Canvas components. Bubbles are small Cards
// (selected = the user's primary-tinted side, flat = the assistant), so the
// thread needs no hand-rolled surfaces.

const THREAD = [
  { from: "user", text: "Which plan includes SSO?" },
  { from: "assistant", text: "SSO and SAML are on the Enterprise plan. Pro covers custom domains and priority support; if you need identity-provider login, Enterprise is the one." },
  { from: "user", text: "Can we trial Enterprise before committing?" },
  { from: "assistant", text: "Yes. Sales can enable a 30-day Enterprise pilot on your existing workspace, so nothing migrates and your data stays put." },
];

function Bubble({ from, text }: { from: string; text: string }) {
  const user = from === "user";
  return (
    <Row end={user} start={!user}>
      <Card compact selected={user} flat={!user} style={{ maxWidth: "85%" }}>
        <Typography small>{text}</Typography>
      </Card>
    </Row>
  );
}

export const CHAT_TEMPLATE: TemplateDoc = {
  slug: "chat",
  name: "Chat",
  description: "Assistant conversation: message bubbles, a typing indicator, suggestion chips, and the composer. Built from live Canvas components.",
  sections: [
    {
      title: "Conversation",
      anatomy: "Bubbles are compact Cards (primary-tinted for the user, flat for the assistant), a Spinner typing row, then the composer Input with its send Button.",
      render: () => (
        <Column cozy>
          <Row snug alignCenter>
            <Avatar small name="AI" />
            <Column tight>
              <Typography small medium>Canvas Assistant</Typography>
              <Typography tiny>Answers from your workspace docs</Typography>
            </Column>
          </Row>
          <Column snug>
            {THREAD.map((m, i) => (
              <Bubble key={i} from={m.from} text={m.text} />
            ))}
            <Row start snug alignCenter>
              <Spinner small />
              <Typography tiny>Assistant is typing…</Typography>
            </Row>
          </Column>
          <Row snug alignCenter>
            <Column fill>
              <Input placeholder="Ask about plans, billing, or setup…" block />
            </Column>
            <Button primary icon iconLeft={<Icon send primaryForeground size={18} />} accessibilityLabel="Send message" />
          </Row>
        </Column>
      ),
    },
    {
      title: "Empty thread",
      anatomy: "Before the first message: an EmptyState plus suggestion Chips that seed the conversation.",
      render: () => (
        <Column cozy alignCenter>
          <EmptyState
            icon={<Icon messageCircle />}
            title="Ask anything"
            description="The assistant answers from your workspace's docs and settings."
          />
          <Row tight wrap center>
            <Chip onPress={() => {}}>Compare plans</Chip>
            <Chip onPress={() => {}}>Set up SSO</Chip>
            <Chip onPress={() => {}}>Invite my team</Chip>
          </Row>
        </Column>
      ),
    },
  ],
};
