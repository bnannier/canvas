import { useEffect, useRef, useState } from "react";
import type { ChatMessageData } from "@nannier/canvas";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Chat (`Canvas v4.0.0 Templates.dc.html`, `t.chat`): the assistant's
// header (its mark, provider and online state), the thread with its typing indicator, the
// suggestion chips and the composer. The conversation is the kit's controlled Chat, which
// fills the screen's height. Every part is a kit component from the frame's scope.

const OPENING: ChatMessageData[] = [
  { id: "hello", role: "assistant", content: "Hi. Ask how any Canvas component sizes itself, or which props it takes." },
];

const SUGGESTIONS = [
  { question: "How do I rebrand?", answer: "Set one hue. --ion is oklch(L C var(--hue)), so every fill, ring and glow moves together." },
  { question: "Does Card take a style prop?", answer: "No. There is no style escape hatch. Use the semantic booleans: <Card raised selected>." },
  { question: "What is a container tier?", answer: "A component measures its own width: compact under 560, regular to 900, wide above." },
];

const REPLIES = [
  "Every visual variation is a boolean prop. Within one axis you pass at most one.",
  "Components fill or hug. The parent provides the bounds.",
  "Glass is a theming mode: <ThemeProvider glass>.",
];

function ChatScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Chip, Icon, Emblem, Divider, Chat, ScrollView } = K;
  const [messages, setMessages] = useState<ChatMessageData[]>(OPENING);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", content: text }]);
    setDraft("");
    setPending(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      replyIndex.current = (replyIndex.current + 1) % REPLIES.length;
      const suggested = SUGGESTIONS.find((s) => s.question === text);
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", content: suggested ? suggested.answer : REPLIES[replyIndex.current]! }]);
      setPending(false);
    }, 1000);
  };

  return (
    <Column fill>
      <Card flush clip grow>
        <Column pad>
          <Row snug alignCenter>
            <Emblem primary><Icon sparkles decorative /></Emblem>
            <Column fill>
              <Typography small semibold>Canvas assistant</Typography>
              <Typography caption mono subtle>provider · Claude</Typography>
            </Column>
            <Row tight alignCenter>
              <Icon circle success size={8} decorative />
              <Typography caption medium success>online</Typography>
            </Row>
          </Row>
        </Column>
        <Divider soft />
        <Column fill>
          <Chat
            plain
            messages={messages}
            pending={pending}
            value={draft}
            onChangeText={setDraft}
            onSend={send}
            placeholder="Ask about a component…"
            sendLabel="Send"
            label="Canvas assistant"
            footer={
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row tight>
                  {SUGGESTIONS.map((s) => <Chip key={s.question} onPress={() => send(s.question)}>{s.question}</Chip>)}
                </Row>
              </ScrollView>
            }
          />
        </Column>
      </Card>
    </Column>
  );

}

export const CHAT_TEMPLATE: TemplateDoc = {
  slug: "chat",
  name: "Chat",
  group: "App",
  icon: "messagesSquare",
  description: "Assistant conversation: bubbles, typing indicator, suggestion chips and the composer.",
  path: "chat",
  app: true,
  Screen: ChatScreen,
};
