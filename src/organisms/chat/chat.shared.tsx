import { useRef, type ComponentType, type ReactNode } from "react";
import { type ScrollView as RNScrollView, type ViewProps } from "react-native";
import { View, Text, ScrollView, GlassSurface, useTheme, useFillStyle, FOCUS_RESET, type LayoutStyle } from "../../style/index.js";
import { useScrollFocus } from "../../style/use-scroll-focus.js";
import { useFocusFrame } from "../../style/focus-frame.js";
import { listProps, LIST_ITEM } from "../../style/list-semantics.js";
import { Button as WebButton, type ButtonProps } from "../../atoms/button/button.js";
import { Textarea as WebTextarea, type TextareaProps } from "../../atoms/textarea/textarea.js";
import { Spinner as WebSpinner, type SpinnerProps } from "../../atoms/spinner/spinner.js";
import { Icon } from "../../atoms/icon/icon.js";
import { chatAtBottom, chatBlocks, chatRuns } from "./chat.logic.js";
import * as s from "./chat.styles.js";

/** Application-owned message data. Update content under the same id while streaming. */
export interface ChatMessageData {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  author?: string;
  provider?: string;
  streaming?: boolean;
  /** Marks a failed reply with an explicit error label as well as error ink. */
  error?: boolean;
  /** Persisted delivery, fallback, or other supplementary information. */
  notice?: string;
}

export interface ChatMessageProps {
  message: ChatMessageData;
  /** Render assistant markdown punctuation literally. User messages are always plain text. */
  plain?: boolean;
  testID?: string;
}

export interface ChatThreadProps {
  messages: readonly ChatMessageData[];
  /** A reply is being prepared; no artificial message is added to the data. */
  pending?: boolean;
  pendingLabel?: string;
  label?: string;
  emptyState?: ReactNode;
  plain?: boolean;
  testID?: string;
  /** Parent composition only. Supply a bounded height, or a bounded flex parent. */
  style?: LayoutStyle;
}

export interface ChatComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  /** Receives the trimmed draft. The app owns clearing the draft and starting transport. */
  onSend: (value: string) => void;
  placeholder?: string;
  composerLabel?: string;
  sendLabel?: string;
  /** Optional application input limit; enforced by the native text field. */
  maxLength?: number;
  /** Prevent sending while a reply is pending; the draft remains editable. */
  pending?: boolean;
  disabled?: boolean;
  /** Anchored actions or help below the composer, outside the scrolling thread. */
  footer?: ReactNode;
  testID?: string;
}

export interface ChatProps extends ChatThreadProps, ChatComposerProps {}

interface ChatParts {
  Button: ComponentType<ButtonProps>;
  Textarea: ComponentType<TextareaProps>;
  Spinner: ComponentType<SpinnerProps>;
}

export function createChat(skin: s.ChatSkin, { Button = WebButton, Textarea = WebTextarea, Spinner = WebSpinner }: Partial<ChatParts> = {}) {
  function Inline({ value }: { value: string }) {
    return <>{chatRuns(value).map((run, index) => <Text key={index} style={[run.strong ? s.strong : null, run.emphasis ? s.emphasis : null, run.code ? s.code : null]}>{run.text}</Text>)}</>;
  }

  function ChatMessage({ message, plain, testID }: ChatMessageProps) {
    const { tokens } = useTheme();
    const fill = useFillStyle("ChatMessage");
    const user = message.role === "user";
    const author = message.author ?? (user ? "You" : message.role === "system" ? "System" : "Assistant");
    const body = skin.body(tokens);
    const content = user || plain ? <Text selectable style={body}>{message.content}</Text> : (
      <View style={s.blocks}>
        {chatBlocks(message.content).map((block, index) => {
          const text = <Text selectable style={[body, block.kind === "heading" ? s.heading : null, block.kind === "code" ? s.code : null, block.kind === "list" ? s.listText : null]}>{block.kind === "code" ? block.text : <Inline value={block.text} />}</Text>;
          if (block.kind === "list") return <View key={index} style={s.listRow}><Text style={body}>{block.marker}</Text>{text}</View>;
          return <View key={index} style={block.kind === "quote" ? s.quote(tokens) : undefined}>{text}</View>;
        })}
      </View>
    );
    return (
      <View {...LIST_ITEM} testID={testID} style={[fill, s.messageRow, user ? s.userRow : s.assistantRow]}>
        <View style={s.messageContent}>
          <View style={s.identity}>
            <Text style={skin.label(tokens)}>{author}</Text>
            {message.provider ? <Text style={skin.muted(tokens)}>{message.provider}</Text> : null}
          </View>
          {user ? <GlassSurface layer="content" style={skin.message(tokens, true)}>{content}</GlassSurface> : content}
          {message.streaming ? <Text accessibilityLiveRegion="polite" style={skin.muted(tokens)}>Responding…</Text> : null}
          {message.error ? <Text accessibilityLiveRegion="polite" style={skin.muted(tokens, true)}>Reply failed</Text> : null}
          {message.notice ? <Text style={skin.muted(tokens, message.error)}>{message.notice}</Text> : null}
        </View>
      </View>
    );
  }

  function ChatThread({ messages, pending, pendingLabel = "Assistant is thinking…", label = "Conversation", emptyState, plain, testID, style }: ChatThreadProps) {
    const fill = useFillStyle("ChatThread");
    const scroll = useRef<RNScrollView>(null);
    const following = useRef(true);
    const scrollFocus = useScrollFocus("vertical");
    const frame = useFocusFrame();
    const { ref: frameRef, ...frameTarget } = frame.target;
    const streaming = messages.some((message) => message.streaming);
    return (
      <View style={[fill, s.thread, style]} testID={testID}>
        <ScrollView
          {...frameTarget}
          ref={(node) => { scroll.current = node; frameRef(node); }}
          style={[s.thread, FOCUS_RESET]}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          accessibilityLabel={label}
          {...({ "aria-label": label } as ViewProps)}
          tabIndex={scrollFocus.tabIndex}
          onLayout={(event) => {
            scrollFocus.onLayout(event);
            if (following.current) scroll.current?.scrollToEnd({ animated: false });
          }}
          onContentSizeChange={(width, height) => {
            scrollFocus.onContentSizeChange(width, height);
            if (following.current) scroll.current?.scrollToEnd({ animated: false });
          }}
          onScroll={({ nativeEvent }) => {
            following.current = chatAtBottom(nativeEvent.contentOffset.y, nativeEvent.layoutMeasurement.height, nativeEvent.contentSize.height);
          }}
          scrollEventThrottle={32}
        >
          {!messages.length && !pending ? <View style={s.empty}>{emptyState}</View> : null}
          <View {...listProps({ label })} style={s.blocks}>
            {messages.map((message) => <ChatMessage key={message.id} message={message} plain={plain} />)}
          </View>
          {pending && !streaming ? <View style={s.pending}><Spinner small muted>{pendingLabel}</Spinner></View> : null}
        </ScrollView>
        {frame.innerRing()}
      </View>
    );
  }

  function ChatComposer({ value, onChangeText, onSend, placeholder = "Message the assistant…", composerLabel = "Message", sendLabel = "Send message", maxLength, disabled, pending, footer, testID }: ChatComposerProps) {
    const { tokens } = useTheme();
    const fill = useFillStyle("ChatComposer");
    const canSend = !disabled && !pending && value.trim().length > 0;
    return (
      <View style={[fill, s.composer, s.divider(tokens)]} testID={testID}>
        <View style={s.composerRow}>
          <View style={s.editor}>
            <Textarea value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={composerLabel} rows={2} dense maxLength={maxLength} disabled={disabled} style={s.editorHeight} />
          </View>
          <Button primary icon disabled={!canSend} accessibilityLabel={sendLabel} iconLeft={<Icon arrowUp color={canSend ? tokens["action-foreground"] ?? tokens["primary-foreground"] : tokens["muted-foreground"]} size={18} />} onPress={() => { if (canSend) onSend(value.trim()); }} />
        </View>
        {footer ? <View style={s.footer}>{footer}</View> : null}
      </View>
    );
  }

  function Chat(props: ChatProps) {
    const fill = useFillStyle("Chat");
    return <View style={[fill, s.root, props.style]} testID={props.testID}>
      <ChatThread {...props} style={undefined} testID={props.testID ? `${props.testID}-thread` : undefined} />
      <ChatComposer {...props} testID={props.testID ? `${props.testID}-composer` : undefined} />
    </View>;
  }
  return { Chat, ChatThread, ChatMessage, ChatComposer };
}
