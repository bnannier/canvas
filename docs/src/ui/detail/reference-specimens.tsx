import { useState, type ReactNode } from "react";
import type { ChatMessageData } from "@nannier/canvas";
import type { ExampleScope } from "../../core/scope";
import type { PropDescriptors } from "./knobs";
import { usePinnedFocus } from "../../../../src/style/interaction-override";

// K.def('chat') and K.def('scroll-view') are compositions, not a standalone message
// or an empty primitive. Keep their authored specimen data here, and render the real
// components from the active platform scope just as the other detail specimens do.

export function referenceSpecimen(scope: ExampleScope, name: string, props: PropDescriptors): ReactNode | undefined {
  if (name === "Chat") return <ChatSpecimen scope={scope} plain={props.plain === true} />;
  if (name === "ScrollView") return <ScrollSpecimen scope={scope} horizontal={props.horizontal === true} />;
  if (name === "TextInput") return <TextInputSpecimen key={JSON.stringify(props)} scope={scope} props={props} />;
  if (name === "View") return <ViewSpecimen scope={scope} props={props} />;
  return undefined;
}

/** The raw input pedagogy in cv-kit-inputs.js, with the same native editing surface. */
function TextInputSpecimen({ scope, props }: { scope: ExampleScope; props: PropDescriptors }) {
  const { View, TextInput, tokens } = scope;
  const [value, setValue] = useState(typeof props.value === "string" ? props.value : "");
  const [focused, setFocused] = useState(false);
  const multiline = props.multiline === true;
  const editable = props.editable !== false;
  const pinnedFocus = usePinnedFocus(editable);
  return (
    <View style={{ width: 280, maxWidth: "100%" }}>
      <TextInput
        testID="detail-reference-text-input"
        accessibilityLabel="Text input example"
        placeholder={typeof props.placeholder === "string" ? props.placeholder : "Type here"}
        placeholderTextColor={tokens["subtle-foreground"]}
        value={value}
        onChangeText={setValue}
        multiline={multiline}
        editable={editable}
        aria-disabled={!editable || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: "100%", height: multiline ? 88 : 36, paddingHorizontal: 2, paddingTop: multiline ? 8 : 0, paddingBottom: 0, backgroundColor: "transparent", borderBottomWidth: 1, borderBottomColor: focused || pinnedFocus ? tokens.primary : tokens["field-border"], color: tokens.foreground, fontSize: 15, fontWeight: "400", textAlignVertical: multiline ? "top" : "center", outlineWidth: 0, opacity: editable ? 1 : 0.45 }}
      />
    </View>
  );
}

/** Two styled child Views make the primitive's actual container behavior visible. */
function ViewSpecimen({ scope, props }: { scope: ExampleScope; props: PropDescriptors }) {
  const { View, Typography, tokens } = scope;
  const children = props.children;
  const label = typeof children === "string" ? children
    : typeof children === "object" && "children" in children ? children.children ?? "View" : "View";
  return (
    <View testID="detail-reference-view" style={{ minWidth: 220, padding: 16, gap: 8, borderRadius: 12, backgroundColor: tokens.popover, borderWidth: 1, borderColor: tokens.border }}>
      {[label, "View"].map((text, index) => (
        <View key={index} testID={`detail-reference-view-child-${index + 1}`} style={{ minWidth: 44, minHeight: 36, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: tokens["primary-soft"], borderWidth: 1, borderStyle: "dashed", borderColor: tokens.ring, justifyContent: "center", alignItems: "center" }}>
          <Typography caption medium mono primary>{text}</Typography>
        </View>
      ))}
    </View>
  );
}

const CONVERSATION: readonly ChatMessageData[] = [
  { id: "brand-question", role: "user", content: "Can the accent follow our brand hue?" },
  { id: "brand-answer", role: "assistant", content: "Yes. Set one oklch hue and every ion token, glow and ring follows." },
];

/** A complete, working kit conversation; the parent supplies its reference bounds. */
function ChatSpecimen({ scope, plain }: { scope: ExampleScope; plain: boolean }) {
  const { Chat, View } = scope;
  const [messages, setMessages] = useState(CONVERSATION);
  const [draft, setDraft] = useState("");
  return (
    <View style={{ width: "100%", maxWidth: 520 }}>
      <Chat
        testID="detail-reference-chat"
        style={{ height: 320 }}
        messages={messages}
        plain={plain}
        placeholder="Message"
        value={draft}
        onChangeText={setDraft}
        onSend={(content) => {
          setMessages((current) => [...current, { id: `draft-${current.length}`, role: "user", content }]);
          setDraft("");
        }}
      />
    </View>
  );
}

/** The hand-off's ten numbered content tiles, inside an actual kit ScrollView. */
function ScrollSpecimen({ scope, horizontal }: { scope: ExampleScope; horizontal: boolean }) {
  const { ScrollView, View, Typography, tokens } = scope;
  return (
    <View style={{ width: "100%", maxWidth: 520 }}>
      <ScrollView
        testID="detail-reference-scroll-view"
        accessibilityLabel="Numbered tiles"
        horizontal={horizontal}
        style={{ height: horizontal ? 102 : 180, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens["surface-sunken"] }}
        contentContainerStyle={{ padding: 10, gap: horizontal ? 10 : 8 }}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <View
            key={index}
            testID={`detail-reference-scroll-tile-${index + 1}`}
            style={{ flexShrink: 0, width: horizontal ? 120 : undefined, height: horizontal ? 80 : 40, borderRadius: 10, backgroundColor: tokens.secondary, justifyContent: "center", alignItems: "center" }}
          >
            <Typography caption medium mono subtle>{index + 1}</Typography>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
