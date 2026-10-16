import { useEffect, useRef, useState } from "react";
import { Chat, Row, Chip, EmptyState, Icon, type ChatMessageData } from "@nannier/canvas";
import type { TemplateDoc } from "../types";
import { PreviewViewport } from "../../../ui/preview-viewport";

// This template exercises the same controlled conversation exported to consumers.

const THREAD: ChatMessageData[] = [
  { id: "question-1", role: "user", content: "Which plan includes SSO?" },
  { id: "answer-1", role: "assistant", author: "Canvas Assistant", content: "SSO and SAML are on the Enterprise plan. Pro covers custom domains and priority support; if you need identity-provider login, Enterprise is the one." },
  { id: "question-2", role: "user", content: "Can we trial Enterprise before committing?" },
  { id: "answer-2", role: "assistant", author: "Canvas Assistant", content: "Yes. Sales can enable a 30-day Enterprise pilot on your existing workspace, so nothing migrates and your data stays put." },
];

const CANNED_REPLIES = [
  "Good question. Pro includes custom domains, priority support, and unlimited projects; Enterprise adds SSO, SAML, and audit logs on top.",
  "You can change plans any time from Billing, and proration is automatic, so an upgrade takes effect immediately.",
  "I've shared a summary with your workspace admins. Anything else you'd like to check before the pilot starts?",
];

const SUGGESTIONS = [
  {
    label: "Compare plans",
    question: "Can you compare the plans for me?",
    reply: "Free covers 3 projects, Pro adds custom domains and priority support, and Enterprise brings SSO, SAML, and audit logs.",
  },
  {
    label: "Set up SSO",
    question: "How do I set up SSO?",
    reply: "SSO lives on the Enterprise plan. Head to Settings, then Authentication, and connect your identity provider; I can walk you through SAML when you're ready.",
  },
  {
    label: "Invite my team",
    question: "How do I invite my team?",
    reply: "Open Settings, then Team, and enter your teammates' emails. Editors can build, Viewers can browse, and Admins manage billing.",
  },
];

function ConversationLive() {
  const [messages, setMessages] = useState<ChatMessageData[]>(THREAD);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", content: text }]);
    setDraft("");
    setPending(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const reply = CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
      replyIndex.current += 1;
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", author: "Canvas Assistant", content: reply }]);
      setPending(false);
    }, 900);
  };

  return (
    <PreviewViewport height={420}><Chat messages={messages} value={draft} onChangeText={setDraft} onSend={send} pending={pending} placeholder="Ask about plans, billing, or setup…" /></PreviewViewport>
  );
}

function EmptyThreadLive() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const ask = (suggestion: (typeof SUGGESTIONS)[number]) => {
    if (pending) return;
    setAsked((prev) => [...prev, suggestion.label]);
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", content: suggestion.question }]);
    setPending(true);
    timer.current = setTimeout(() => {
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", author: "Canvas Assistant", content: suggestion.reply }]);
      setPending(false);
    }, 900);
  };

  const remaining = SUGGESTIONS.filter((s) => !asked.includes(s.label));

  return (
    <PreviewViewport>
      <Chat messages={messages} pending={pending} value="" onChangeText={() => {}} onSend={() => {}} emptyState={<EmptyState icon={<Icon messageCircle />} title="Ask anything" description="The assistant answers from your workspace’s docs and settings." />} footer={remaining.length > 0 ? <Row tight wrap center>{remaining.map((suggestion) => <Chip key={suggestion.label} onPress={() => ask(suggestion)}>{suggestion.label}</Chip>)}</Row> : undefined} />
    </PreviewViewport>
  );
}

export const CHAT_TEMPLATE: TemplateDoc = {
  slug: "chat",
  name: "Chat",
  description: "Assistant conversation: message bubbles, a typing indicator, suggestion chips, and the composer. Built from live Canvas components.",
  sections: [
    {
      title: "Conversation",
      anatomy: "The controlled Chat owns message anatomy, author labels, an independent thread scrollport, a pending indicator, and an anchored multiline composer. Sending appends your message and the assistant answers a moment later.",
      render: () => <ConversationLive />,
    },
    {
      title: "Empty thread",
      anatomy: "Before the first message: Chat shows an EmptyState and anchored suggestion Chips. Pressing a Chip seeds the conversation with that question and the assistant's answer.",
      render: () => <EmptyThreadLive />,
    },
  ],
};
