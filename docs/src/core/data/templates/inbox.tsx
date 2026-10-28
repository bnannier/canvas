import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Inbox (`Canvas v4.0.0 Templates.dc.html`, `t.inbox`): the conversation
// list beside the open thread (stacked once the screen is narrow), the thread's subject,
// message count and correspondent, its messages and the reply composer. Every part is a
// kit component from the frame's scope.

interface Message {
  who: string;
  text: string;
  when: string;
}

const CONVERSATIONS: { name: string; photo: string; subject: string; preview: string; when: string; unread: boolean; messages: Message[] }[] = [
  { name: "Grace Hopper", photo: "/grace-hopper.jpg", subject: "Q4 token review", preview: "Can we lock --ion before the freeze?", when: "9:41", unread: true, messages: [{ who: "Grace Hopper", text: "Can we lock --ion before the freeze? Design wants one more pass on the light ramp.", when: "9:41" }] },
  { name: "Kira Tanaka", photo: "/kira-tanaka.jpg", subject: "Glass on Android", preview: "The capture module needs a rebuild…", when: "Yesterday", unread: true, messages: [{ who: "Kira Tanaka", text: "The capture module needs a rebuild after the SDK bump. Blur falls back to solid until then.", when: "Yesterday" }] },
  { name: "Noor Park", photo: "/noor-park.jpg", subject: "Tab bar spacing", preview: "12px off the edge looks right", when: "Mon", unread: false, messages: [{ who: "Noor Park", text: "Floating 12px off the edge looks right on the 16 Pro. Shipping it.", when: "Mon" }] },
  { name: "Liang Bao", photo: "/liang-bao.jpg", subject: "Chart palette", preview: "Series order stays fixed", when: "Sun", unread: false, messages: [{ who: "Liang Bao", text: "Series order stays fixed when filtering. chart-3 is mint everywhere now.", when: "Sun" }] },
];

function InboxScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Input, Avatar, Badge, Divider } = K;
  const [open, setOpen] = useState(0);
  const [read, setRead] = useState<number[]>([0]);
  const [replies, setReplies] = useState<Record<number, Message[]>>({});
  const [draft, setDraft] = useState("");
  const thread = CONVERSATIONS[open]!;
  const messages = [...thread.messages, ...(replies[open] ?? [])];

  const select = (i: number) => {
    setOpen(i);
    setRead((prev) => (prev.includes(i) ? prev : [...prev, i]));
  };
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setReplies((prev) => ({ ...prev, [open]: [...(prev[open] ?? []), { who: "You", text, when: "now" }] }));
    setDraft("");
  };

  return (
    <Row stacks roomy>
      <Column span={5}>
        <Card compact>
          <Column tight>
            {CONVERSATIONS.map((c, i) => (
              <Card key={c.subject} flat compact selected={i === open} onPress={() => select(i)} accessibilityLabel={`${c.name}: ${c.subject}`}>
                <Row cozy alignStart>
                  <Avatar src={c.photo} name={c.name} />
                  <Column fill>
                    <Row between snug>
                      <Typography small semibold>{c.name}</Typography>
                      <Typography caption mono subtle>{c.when}</Typography>
                    </Row>
                    <Typography small medium numberOfLines={1}>{c.subject}</Typography>
                    <Typography caption subtle numberOfLines={1}>{c.preview}</Typography>
                  </Column>
                  {c.unread && !read.includes(i) ? <Badge dot primary accessibilityLabel="Unread" /> : null}
                </Row>
              </Card>
            ))}
          </Column>
        </Card>
      </Column>
      <Column span={7}>
        <Card flush clip>
          <Column pad>
            <Row snug alignCenter wrap>
              <Typography h5 level={2}>{thread.subject}</Typography>
              <Badge mono secondary>{String(messages.length)}</Badge>
              <Column fill>
                <Typography caption subtle right>{`with ${thread.name}`}</Typography>
              </Column>
            </Row>
          </Column>
          <Divider soft />
          <Column pad>
            <Column snug>
              {messages.map((m, i) => (
                <Card key={i} compact flat selected={m.who === "You"}>
                  <Column tight>
                    <Row between snug>
                      <Typography small semibold>{m.who}</Typography>
                      <Typography caption mono subtle>{m.when}</Typography>
                    </Row>
                    <Typography small subtle>{m.text}</Typography>
                  </Column>
                </Card>
              ))}
            </Column>
          </Column>
          <Divider soft />
          <Column padTight>
            <Row snug>
              <Column fill>
                <Input placeholder="Write a reply…" accessibilityLabel="Reply" value={draft} onChangeText={setDraft} onSubmitEditing={send} />
              </Column>
              <Button primary iconLeft={<Icon send decorative />} onPress={send}>Send</Button>
            </Row>
          </Column>
        </Card>
      </Column>
    </Row>
  );
}

export const INBOX_TEMPLATE: TemplateDoc = {
  slug: "inbox",
  name: "Inbox",
  group: "App",
  icon: "inbox",
  description: "Conversation list beside the open thread, stacking to one column on phones.",
  path: "inbox",
  app: true,
  Screen: InboxScreen,
};
