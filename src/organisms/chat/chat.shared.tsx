import { createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type RefAttributes } from "react";
import { type ScrollView as RNScrollView, type TextInput as RNTextInput, type ViewProps } from "react-native";
import { View, Text, ScrollView, GlassSurface, useTheme, useFillStyle, useControllableState, FOCUS_RESET, LoopView, createLoopChannel, useReducedMotion, type LayoutStyle } from "../../style/index.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart, type AnatomyTarget } from "../../style/anatomy.js";
import { useScrollFocus } from "../../style/use-scroll-focus.js";
import { useFocusFrame } from "../../style/focus-frame.js";
import { usePinnedFocus } from "../../style/interaction-override.js";
import { focusInto } from "../../style/accessibility-focus.js";
import { listProps, LIST_ITEM } from "../../style/list-semantics.js";
import { Button as WebButton, type ButtonProps } from "../../atoms/button/button.js";
import { Textarea as WebTextarea, type TextareaProps } from "../../atoms/textarea/textarea.js";
import { Spinner as WebSpinner, type SpinnerProps } from "../../atoms/spinner/spinner.js";
import { Chip as WebChip, type ChipProps } from "../../atoms/chip/chip.js";
import { Radio as WebRadio, RadioGroup as WebRadioGroup, type RadioProps, type RadioGroupProps } from "../../atoms/radio/radio.js";
import { Checkbox as WebCheckbox, type CheckboxProps } from "../../atoms/checkbox/checkbox.js";
import { FormSection as WebFormSection, type FormSectionProps } from "../../molecules/form/form.js";
import { Switch as WebSwitch, type SwitchProps } from "../../atoms/switch/switch.js";
import { Card as WebCard, type CardProps } from "../../molecules/card/card.js";
import { Icon } from "../../atoms/icon/icon.js";
import { chatSubmitsOnEnter } from "./chat.logic.js";
import { useChatTailFollow } from "./chat-scroll.js";
import { createMarkdown, type MarkdownParts } from "./markdown.shared.js";
import { webSkin as markdownSkin } from "./markdown.styles.js";
import * as s from "./chat.styles.js";

/** Application-owned file metadata. Picking, uploading, and opening files belong to the app. */
export interface ChatAttachmentData {
  id: string;
  name: string;
  uploading?: boolean;
  error?: boolean;
  notice?: string;
}

/** One application-owned question, single-choice unless multiple is set. Reserve the option id `__custom` for freeform answers. */
export interface ChatQuestionData {
  id: string;
  title: string;
  /** Allow any nonempty set of choices, including a custom answer alongside other options. */
  multiple?: boolean;
  options: readonly { id: string; label: string; description?: string }[];
}

/** A controlled answer. `__custom` requires nonempty customText, limited to 1000 characters. */
export interface ChatQuestionAnswerData {
  questionId: string;
  optionId?: string;
  /** Multi-select answers use optionIds instead of optionId. */
  optionIds?: string[];
  /** Human-selected multi-answer mode for a question originally supplied as single-choice. */
  multiple?: boolean;
  customText?: string;
}

interface MessageActionCallbacks {
  /** The app owns action handling, persistence, and removing resolved actions. */
  onAction?: (messageId: string | number, actionId: string) => void;
}

interface QuestionCallbacks {
  /** Update the message's controlled questionAnswers; the app owns saving the draft. */
  onQuestionAnswerChange?: (messageId: string | number, answers: ChatQuestionAnswerData[]) => void;
  /** Submit the final complete answer set; the app owns transport and setting questionsSubmitted. */
  onSubmitQuestionAnswers?: (messageId: string | number, answers: ChatQuestionAnswerData[]) => void;
  /** Save the zero-based current question index; omit questionIndex for local navigation state. */
  onQuestionIndexChange?: (messageId: string | number, index: number) => void;
  /** Disable question forms while other application work is in progress. */
  disabled?: boolean;
  pending?: boolean;
}

/** Application-owned message data. Update content under the same id while streaming. */
export interface ChatMessageData {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  author?: string;
  provider?: string;
  /** Application-supplied provider mark; give the image/icon an accessible provider name. */
  providerIcon?: ReactNode;
  attachments?: readonly ChatAttachmentData[];
  /** Application-owned choices beneath the message; omit once the choice is resolved. */
  actions?: readonly { id: string; label: string; primary?: boolean }[];
  streaming?: boolean;
  /** Optional structured question form beneath assistant content. */
  questions?: readonly ChatQuestionData[];
  /** Controlled answers, one entry per question. */
  questionAnswers?: readonly ChatQuestionAnswerData[];
  /** Controlled zero-based position within questions; the counter always uses the actual question count. */
  questionIndex?: number;
  /** Saved answers are shown read-only with an Answers sent receipt. */
  questionsSubmitted?: boolean;
  /** Show every original question and option read-only for an earlier or inactive batch. */
  questionsDisabled?: boolean;
  /** Marks a failed reply with an explicit error label as well as error ink. */
  error?: boolean;
  /** Persisted delivery, fallback, or other supplementary information. */
  notice?: string;
}

export interface ChatMessageProps extends QuestionCallbacks, MessageActionCallbacks {
  message: ChatMessageData;
  onOpenAttachment?: (attachment: ChatAttachmentData) => void;
  /** Render assistant markdown punctuation literally. User messages are always plain text. */
  plain?: boolean;
  /** Flat, compact monospace terminal transcript. */
  terminal?: boolean;
  testID?: string;
}

export interface ChatThreadProps extends QuestionCallbacks, MessageActionCallbacks {
  messages: readonly ChatMessageData[];
  onOpenAttachment?: (attachment: ChatAttachmentData) => void;
  /** A reply is being prepared; no artificial message is added to the data. */
  pending?: boolean;
  pendingLabel?: string;
  /** Application-supplied provider mark for a reply that has not started streaming. */
  pendingIcon?: ReactNode;
  label?: string;
  emptyState?: ReactNode;
  plain?: boolean;
  /** Flat, compact monospace terminal transcript. */
  terminal?: boolean;
  testID?: string;
  /** Parent composition only. Supply a bounded height, or a bounded flex parent. */
  style?: LayoutStyle;
}

export interface ChatComposerProps {
  /** Bare terminal prompt; hardware Enter sends and Shift+Enter inserts a newline. */
  terminal?: boolean;
  /** Focus the message input on mount. */
  autoFocus?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  /** Receives the trimmed draft. The app owns clearing the draft and starting transport. */
  onSend: (value: string) => void;
  placeholder?: string;
  composerLabel?: string;
  sendLabel?: string;
  /** Block only sending, keeping the draft, attachments, and message choices interactive. */
  sendDisabled?: boolean;
  /** Optional application input limit; enforced by the native text field. */
  maxLength?: number;
  /** Prevent sending while a reply is pending; the draft remains editable. */
  pending?: boolean;
  disabled?: boolean;
  /** Show an attachment control; the app owns its file picker and upload service. */
  onAttach?: () => void;
  attachments?: readonly ChatAttachmentData[];
  onRemoveAttachment?: (id: string) => void;
  /** File selection or upload is in progress; prevents attaching or sending again. */
  attaching?: boolean;
  /** Anchored actions or help below the composer, outside the scrolling thread. */
  footer?: ReactNode;
  testID?: string;
}

export interface ChatProps extends ChatThreadProps, ChatComposerProps {}

// The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx): Chat takes
// their handlers and hands them down this context, below its AnatomyScope, to the thread,
// message and composer that draw them. Standalone pieces see none.
interface ChatAnatomy {
  assistant?: AnatomyTarget;
  user?: AnatomyTarget;
  avatar?: AnatomyTarget;
  composer?: AnatomyTarget;
}
const ChatAnatomyContext = createContext<ChatAnatomy | undefined>(undefined);

/** The anatomy handlers one message takes, the first of its part in the thread. */
interface MessageAnatomy {
  body?: AnatomyTarget;
  avatar?: AnatomyTarget;
}

interface ChatParts extends MarkdownParts {
  Button: ComponentType<ButtonProps>;
  Textarea: ComponentType<TextareaProps & RefAttributes<RNTextInput>>;
  Spinner: ComponentType<SpinnerProps>;
  Chip: ComponentType<ChipProps>;
  Radio: ComponentType<RadioProps>;
  RadioGroup: ComponentType<RadioGroupProps>;
  Checkbox: ComponentType<CheckboxProps>;
  FormSection: ComponentType<FormSectionProps>;
  Switch: ComponentType<SwitchProps>;
  Card: ComponentType<CardProps>;
}

export function createChat(skin: s.ChatSkin, { Button = WebButton, Textarea = WebTextarea, Spinner = WebSpinner, Chip = WebChip, Radio = WebRadio, RadioGroup = WebRadioGroup, Checkbox = WebCheckbox, FormSection = WebFormSection, Switch = WebSwitch, Card = WebCard, DataTable, Divider }: Partial<ChatParts> = {}) {
  const Markdown = createMarkdown(markdownSkin, { Checkbox, DataTable, Divider }, false);

  function Thinking({ label, icon, terminal }: { label: string; icon?: ReactNode; terminal?: boolean }) {
    const { tokens } = useTheme();
    const reduced = useReducedMotion();
    const channel = useRef<ReturnType<typeof createLoopChannel> | null>(null);
    channel.current ??= createLoopChannel({ period: 1200 });
    const pulse = channel.current;
    useEffect(() => {
      if (reduced) { pulse.park(0.4); return; }
      pulse.play();
      return () => pulse.stop();
    }, [pulse, reduced]);
    return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }} aria-busy style={s.thinking}>
      {icon ? <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{icon}</View> : null}
      <View style={s.dots} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[0, 1, 2].map((index) => <LoopView key={index} style={s.dot(tokens)} opacity={{ channel: pulse, inputRange: [0, 0.25, 0.5, 1], outputRange: [0.35, 1, 0.35, 0.35], offset: index / 6 }} />)}
      </View>
      <Text style={terminal ? s.terminalMuted(tokens) : s.thinkingLabel(tokens)}>{label}</Text>
    </View>;
  }

  function Attachments({ attachments, onOpen, onRemove, disabled }: { attachments?: readonly ChatAttachmentData[]; onOpen?: (attachment: ChatAttachmentData) => void; onRemove?: (id: string) => void; disabled?: boolean }) {
    const { tokens } = useTheme();
    if (!attachments?.length) return null;
    return <View style={s.attachments}>{attachments.map((attachment) => (
      <View key={attachment.id} style={s.attachment}>
        <Chip
          icon={<Icon paperclip decorative size={14} />}
          destructive={attachment.error}
          onPress={onOpen && !attachment.uploading && !attachment.error ? () => onOpen(attachment) : undefined}
          onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
          accessibilityLabel={onOpen ? `Open ${attachment.name}` : attachment.name}
          disabled={disabled}
        >{attachment.name}</Chip>
        {attachment.uploading ? <Spinner small muted>Uploading {attachment.name}…</Spinner> : null}
        {attachment.error ? <Text accessibilityLiveRegion="polite" style={skin.muted(tokens, true)}>Upload failed</Text> : null}
        {attachment.notice ? <Text style={skin.muted(tokens, attachment.error)}>{attachment.notice}</Text> : null}
      </View>
    ))}</View>;
  }

  function Questions({ message, disabled, pending, terminal, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange }: ChatMessageProps) {
    const { tokens } = useTheme();
    const [position, setPosition] = useControllableState(message.questionIndex, 0, (next) => onQuestionIndexChange?.(message.id, next));
    const questions = message.questions ?? [];
    const index = Math.max(0, Math.min(questions.length - 1, Number.isFinite(position) ? Math.trunc(position) : 0));
    const question = questions[index];
    // Guard activations until controlled navigation catches up, and guard the final
    // batch while the application records submission. Answers remain app-owned.
    const submitted = useRef(false);
    const advancing = useRef<number | null>(null);
    const progress = useRef<View>(null);
    const previousIndex = useRef(index);
    useEffect(() => {
      advancing.current = null;
      if (previousIndex.current !== index) focusInto(progress.current);
      previousIndex.current = index;
    }, [index]);
    const answers = message.questionAnswers ?? [];
    const busy = !!(disabled || pending || message.streaming);
    const wasBusy = useRef(busy);
    useEffect(() => {
      if (wasBusy.current && !busy && !message.questionsSubmitted) {
        submitted.current = false;
        advancing.current = null;
      }
      wasBusy.current = busy;
    }, [busy, message.questionsSubmitted]);
    const locked = busy || !!(message.questionsDisabled || message.questionsSubmitted);
    const editable = !locked && !!onQuestionAnswerChange && !!onSubmitQuestionAnswers;
    const multipleFor = (item: ChatQuestionData, answer?: ChatQuestionAnswerData) => item.multiple || answer?.multiple === true;
    const valid = (item: ChatQuestionData, answer?: ChatQuestionAnswerData) => {
      const multiple = multipleFor(item, answer);
      const selected = multiple ? answer?.optionIds ?? [] : answer?.optionId ? [answer.optionId] : [];
      return selected.length > 0 && new Set(selected).size === selected.length
        && (answer?.multiple === undefined || answer.multiple === true)
        && (multiple ? answer?.optionId === undefined : answer?.optionIds === undefined)
        && selected.every((id) => id === "__custom"
          ? !!answer?.customText?.trim() && answer.customText.length <= 1000
          : item.options.some((option) => option.id !== "__custom" && option.id === id));
    };
    const normalized = (item: ChatQuestionData, answer: ChatQuestionAnswerData): ChatQuestionAnswerData => {
      const multiple = multipleFor(item, answer);
      const selected = multiple ? { optionIds: [...answer.optionIds!], ...(answer.multiple === true ? { multiple: true } : {}) } : { optionId: answer.optionId };
      const custom = multiple ? answer.optionIds!.includes("__custom") : answer.optionId === "__custom";
      return { questionId: item.id, ...selected, ...(custom ? { customText: answer.customText!.trim() } : {}) };
    };
    const replacing = (answer: ChatQuestionAnswerData | undefined, questionId = answer?.questionId) => questions.flatMap((item) => {
      const next = item.id === questionId ? answer : answers.find((entry) => entry.questionId === item.id);
      return next ? [next] : [];
    });
    const change = (answer: ChatQuestionAnswerData | undefined, questionId = answer?.questionId) => {
      if (!editable || submitted.current || advancing.current === index) return;
      onQuestionAnswerChange?.(message.id, replacing(answer, questionId));
    };
    const advance = (answer: ChatQuestionAnswerData) => {
      if (!editable || submitted.current || advancing.current === index || !valid(question, answer)) return;
      advancing.current = index;
      const nextAnswers = replacing(normalized(question, answer));
      onQuestionAnswerChange?.(message.id, nextAnswers);
      if (index < questions.length - 1) { setPosition(index + 1); return; }
      const unresolved = questions.findIndex((item) => !valid(item, nextAnswers.find((entry) => entry.questionId === item.id)));
      if (unresolved >= 0) { setPosition(unresolved); return; }
      submitted.current = true;
      onSubmitQuestionAnswers?.(message.id, questions.map((item) => normalized(item, nextAnswers.find((entry) => entry.questionId === item.id)!)));
    };
    if (message.questionsSubmitted) return <View style={s.questions}>
      {questions.map((item) => {
        const answer = answers.find((entry) => entry.questionId === item.id);
        const selected = multipleFor(item, answer) ? answer?.optionIds ?? [] : answer?.optionId ? [answer.optionId] : [];
        return <View key={item.id} style={s.blocks}>
          <Text style={skin.label(tokens)}>{item.title}</Text>
          {!item.multiple && answer?.multiple ? <Text style={skin.muted(tokens)}>Multiple answers selected by you</Text> : null}
          {selected.map((id) => <Text key={id} selectable style={skin.body(tokens)}>{id === "__custom" ? answer?.customText : item.options.find((option) => option.id === id)?.label ?? "No answer"}</Text>)}
        </View>;
      })}
      <Text accessibilityLiveRegion="polite" style={skin.muted(tokens)}>Answers sent</Text>
    </View>;
    const renderModeSwitch = (question: ChatQuestionData) => {
      const answer = answers.find((entry) => entry.questionId === question.id);
      const multiple = multipleFor(question, answer);
      const selected = multiple ? answer?.optionIds ?? [] : answer?.optionId ? [answer.optionId] : [];
      const custom = selected.includes("__custom");
      return <Switch small accessibilityLabel="Select multiple" checked={!!multiple} disabled={!editable} onChange={(next) => {
        if (next) change({ questionId: question.id, multiple: true, optionIds: [...selected], ...(custom ? { customText: answer?.customText ?? "" } : {}) });
        else {
          const first = selected[0];
          change(first ? { questionId: question.id, optionId: first, ...(first === "__custom" ? { customText: answer?.customText ?? "" } : {}) } : undefined, question.id);
        }
      }}>Select multiple</Switch>;
    };
    const renderQuestion = (question: ChatQuestionData) => {
      const answer = answers.find((entry) => entry.questionId === question.id);
      const multiple = multipleFor(question, answer);
      const override = !question.multiple && answer?.multiple === true ? { multiple: true } : {};
      const selected = multiple ? answer?.optionIds ?? [] : answer?.optionId ? [answer.optionId] : [];
      const custom = selected.includes("__custom");
      const selectMany = (id: string, checked: boolean) => {
        const optionIds = checked ? [...new Set([...selected, id])] : selected.filter((value) => value !== id);
        change({ questionId: question.id, ...override, optionIds, ...(optionIds.includes("__custom") ? { customText: answer?.customText ?? "" } : {}) });
      };
      return <View key={question.id} style={s.blocks}>
        {multiple ? <FormSection title={question.title} description="Select all that apply">
          {question.options.filter((option) => option.id !== "__custom").map((option) => <Checkbox selection accessibilityLabel={option.label} key={option.id} checked={selected.includes(option.id)} disabled={!editable} description={option.description} onChange={(checked) => selectMany(option.id, checked)}>{option.label}</Checkbox>)}
          <Checkbox selection accessibilityLabel="Write my own answer" checked={custom} disabled={!editable} onChange={(checked) => selectMany("__custom", checked)}>Write my own answer</Checkbox>
        </FormSection> : <RadioGroup label={question.title} value={answer?.optionId ?? ""} disabled={!editable} onChange={(value) => {
          const next = { questionId: question.id, optionId: String(value), ...(value === "__custom" ? { customText: answer?.customText ?? "" } : {}) };
          if (value !== "__custom" && index < questions.length - 1) advance(next);
          else change(next);
        }}>
          {question.options.filter((option) => option.id !== "__custom").map((option) => <Radio key={option.id} value={option.id} description={option.description}>{option.label}</Radio>)}
          <Radio value="__custom">Write my own answer</Radio>
        </RadioGroup>}
        {custom ? <Textarea dense label={`Your answer: ${question.title}`} value={answer?.customText ?? ""} maxLength={1000} rows={3} readOnly={!editable} onChangeText={(customText) => change({ questionId: question.id, ...(multiple ? { ...override, optionIds: selected } : { optionId: "__custom" }), customText: customText.slice(0, 1000) })} /> : null}
        {message.questionsDisabled && !question.multiple ? <View style={s.questionActions}><View style={s.questionMode}>{renderModeSwitch(question)}</View></View> : null}
      </View>;
    };
    if (message.questionsDisabled) return <View style={s.questions}>{questions.map(renderQuestion)}</View>;
    if (!question) return null;
    const answer = answers.find((entry) => entry.questionId === question.id);
    const showSubmit = multipleFor(question, answer) || index === questions.length - 1;
    const showNext = !showSubmit && (answer?.optionId === "__custom" || valid(question, answer));
    const QuestionFrame = terminal ? View : Card;
    return <QuestionFrame flat selected compact testID="chat-active-question"><View style={s.questions}>
      <View ref={progress} accessible accessibilityRole="text" tabIndex={-1} accessibilityLabel={`Question ${index + 1} of ${questions.length}`} aria-label={`Question ${index + 1} of ${questions.length}`} accessibilityLiveRegion="polite" aria-live="polite" style={FOCUS_RESET}>
        <Text style={skin.muted(tokens)}>{index + 1} of {questions.length}</Text>
      </View>
      {renderQuestion(question)}
      <View style={s.questionActions}>
        <View style={s.questionButtons}>
          <Button outline small accessibilityLabel="Previous question" disabled={!editable || index === 0} onPress={() => {
            if (!editable || index === 0 || submitted.current || advancing.current === index) return;
            advancing.current = index;
            setPosition(index - 1);
          }}>Back</Button>
          {showNext ? <Button primary small accessibilityLabel="Next question" disabled={!editable || !valid(question, answer)} onPress={() => { if (answer) advance(answer); }}>Next</Button> : null}
          {showSubmit ? <Button primary small accessibilityLabel="Submit answer" disabled={!editable || !valid(question, answer)} onPress={() => { if (answer) advance(answer); }}>Submit</Button> : null}
        </View>
        {!question.multiple ? <View style={s.questionMode}>{renderModeSwitch(question)}</View> : null}
      </View>
    </View></QuestionFrame>;
  }

  function ChatMessage(props: ChatMessageProps) {
    return <MessageRow {...props} />;
  }

  function MessageRow({ message, plain, terminal, onOpenAttachment, onAction, testID, anatomy, ...questionProps }: ChatMessageProps & { anatomy?: MessageAnatomy }) {
    const { tokens } = useTheme();
    const fill = useFillStyle("ChatMessage");
    const actionsDisabled = !!(questionProps.disabled || questionProps.pending || message.streaming || !onAction);
    const user = message.role === "user";
    const author = message.author ?? (user ? "You" : message.role === "system" ? "System" : "Assistant");
    const body = terminal ? s.terminalBody(tokens) : skin.body(tokens);
    const content = user || plain ? <Text selectable style={body}>{message.content}</Text> : <Markdown compact terminal={terminal}>{message.content}</Markdown>;
    const bubble = user && !terminal ? <GlassSurface layer="content" tint={tokens["primary-soft"]} style={skin.message(tokens, true)}>{content}</GlassSurface> : content;
    return (
      <View {...LIST_ITEM} testID={testID} style={[fill, s.messageRow, terminal ? null : user ? s.userRow : s.assistantRow]}>
        <View style={[s.messageContent, terminal ? s.terminalMessage : user ? s.userContent : null, message.questions?.length ? s.questionContent : null]}>
          <View style={s.identity}>
            {message.providerIcon != null && !terminal ? <AnatomyPart part={anatomy?.avatar}>{message.providerIcon}</AnatomyPart> : null}
            <Text style={terminal ? s.terminalLabel(tokens) : skin.label(tokens)}>{terminal ? `${user ? "❯" : message.role === "system" ? "·" : "●"} ${author}` : author}</Text>
            {message.provider ? <Text style={terminal ? s.terminalMuted(tokens) : skin.muted(tokens)}>{message.provider}</Text> : null}
          </View>
          {message.content ? <AnatomyPart part={anatomy?.body}>{bubble}</AnatomyPart> : null}
          {message.role === "assistant" && message.questions?.length ? <Questions key={message.id} message={message} terminal={terminal} {...questionProps} /> : null}
          {message.actions?.length ? <View style={s.questionButtons}>
            {message.actions.map((action) => <Button key={action.id} small primary={action.primary} outline={!action.primary} disabled={actionsDisabled} onPress={() => {
              if (!actionsDisabled) onAction?.(message.id, action.id);
            }}>{action.label}</Button>)}
          </View> : null}
          <Attachments attachments={message.attachments} onOpen={onOpenAttachment} />
          {message.streaming ? <Thinking label="Responding…" terminal={terminal} /> : null}
          {message.error ? <Text accessibilityLiveRegion="polite" style={terminal ? s.terminalMuted(tokens, true) : skin.muted(tokens, true)}>Reply failed</Text> : null}
          {message.notice ? <Text style={terminal ? s.terminalMuted(tokens, message.error) : skin.muted(tokens, message.error)}>{message.notice}</Text> : null}
        </View>
      </View>
    );
  }

  // A standalone thread or composer is framed like the conversation; inside Chat the frame is
  // the conversation's own.
  function ChatThread(props: ChatThreadProps) {
    return <Thread {...props} framed />;
  }

  function Thread({ messages, pending, pendingLabel = "Assistant is thinking…", pendingIcon, label = "Conversation", emptyState, plain, terminal, onOpenAttachment, testID, style, disabled, onAction, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange, framed }: ChatThreadProps & { framed: boolean }) {
    const { tokens } = useTheme();
    const fill = useFillStyle("ChatThread");
    const scroll = useRef<RNScrollView>(null);
    const tail = useChatTailFollow(scroll);
    const { requestFollow } = tail;
    useEffect(() => { requestFollow(); }, [messages, pending, pendingLabel, pendingIcon, requestFollow]);
    const scrollFocus = useScrollFocus("vertical");
    const frame = useFocusFrame();
    const { ref: frameRef, ...frameTarget } = frame.target;
    const streaming = messages.some((message) => message.streaming);
    const Frame = framed && !terminal ? GlassSurface : View;
    const parts = useContext(ChatAnatomyContext);
    // A part drawn by many messages goes to the first one that draws it.
    const firstUser = parts ? messages.findIndex((message) => message.role === "user" && message.content) : -1;
    const firstAssistant = parts ? messages.findIndex((message) => message.role !== "user" && message.content) : -1;
    const firstAvatar = parts ? messages.findIndex((message) => message.providerIcon != null) : -1;
    const anatomyOf = (message: ChatMessageData, index: number): MessageAnatomy | undefined =>
      parts ? { body: index === (message.role === "user" ? firstUser : firstAssistant) ? (message.role === "user" ? parts.user : parts.assistant) : undefined, avatar: index === firstAvatar ? parts.avatar : undefined } : undefined;
    return (
      <Frame layer="content" style={[fill, s.thread, framed && !terminal ? s.frame(tokens) : null, style]} testID={testID}>
        <ScrollView
          {...frameTarget}
          ref={(node) => { scroll.current = node; frameRef(node); }}
          style={[s.thread, FOCUS_RESET]}
          contentContainerStyle={terminal ? s.terminalContent : s.content}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          accessibilityLabel={label}
          {...({ "aria-label": label } as ViewProps)}
          tabIndex={scrollFocus.tabIndex}
          onLayout={(event) => {
            scrollFocus.onLayout(event);
            tail.onLayout(event.nativeEvent.layout.height);
          }}
          onContentSizeChange={(width, height) => {
            scrollFocus.onContentSizeChange(width, height);
            tail.onContentSizeChange(height);
          }}
          onScroll={({ nativeEvent }) => {
            tail.onScroll(nativeEvent.contentOffset.y, nativeEvent.layoutMeasurement.height, nativeEvent.contentSize.height);
          }}
          scrollEventThrottle={32}
        >
          {!messages.length && !pending ? <View style={s.empty}>{emptyState}</View> : null}
          <View {...listProps({ label })} style={terminal ? s.terminalBlocks : s.blocks}>
            {messages.map((message, index) => <MessageRow key={message.id} anatomy={anatomyOf(message, index)} message={message} plain={plain} terminal={terminal} onOpenAttachment={onOpenAttachment} onAction={onAction} disabled={disabled} pending={pending || streaming} onQuestionAnswerChange={onQuestionAnswerChange} onSubmitQuestionAnswers={onSubmitQuestionAnswers} onQuestionIndexChange={onQuestionIndexChange} />)}
          </View>
          {pending && !streaming ? <View style={s.pending}><Thinking label={pendingLabel} icon={pendingIcon} terminal={terminal} /></View> : null}
        </ScrollView>
        {frame.innerRing()}
      </Frame>
    );
  }

  function ChatComposer(props: ChatComposerProps) {
    return <Composer {...props} framed />;
  }

  function Composer({ value, onChangeText, onSend, terminal, autoFocus, placeholder = "Message the assistant…", composerLabel = "Message", sendLabel = "Send message", maxLength, disabled, sendDisabled, pending, onAttach, attachments, onRemoveAttachment, attaching, footer, testID, framed }: ChatComposerProps & { framed: boolean }) {
    const { tokens } = useTheme();
    const editor = useRef<RNTextInput>(null);
    const [focusedState, setFocused] = useState(false);
    // An InteractionOverride's pinned focus shows the focused look (src/style/interaction-override.tsx).
    const focused = usePinnedFocus(!disabled) || focusedState;
    const fill = useFillStyle("ChatComposer");
    const filesPending = attaching || attachments?.some((attachment) => attachment.uploading || attachment.error);
    const canSend = !disabled && !sendDisabled && !pending && !filesPending && (value.trim().length > 0 || !!attachments?.length);
    const part = useContext(ChatAnatomyContext)?.composer;
    const send = () => {
      if (!canSend) return;
      onSend(value.trim());
      if (terminal) editor.current?.focus();
    };
    const onKeyPress: TextareaProps["onKeyPress"] = (event) => {
      if (!terminal || !chatSubmitsOnEnter(event)) return;
      // RNW keyboard events are cancelable; soft-keyboard native events keep newline.
      event.preventDefault();
      send();
    };
    const Surface = terminal ? View : GlassSurface;
    const body = (
      <View ref={part?.ref} onLayout={part?.onLayout} style={[framed && !terminal ? null : fill, terminal ? s.terminalComposer(tokens, focused) : s.composer(tokens)]} testID={framed && !terminal ? undefined : testID}>
        <Surface static layer="control" stateBorder={focused} style={terminal ? s.terminalComposerSurface(tokens, focused) : s.composerSurface(tokens, focused)}>
          {attachments?.length ? <View style={s.composerAttachments}><Attachments attachments={attachments} onRemove={onRemoveAttachment} disabled={disabled || pending} /></View> : null}
          <View style={terminal ? s.terminalComposerRow : s.composerRow}>
            {terminal ? <Text aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.terminalPrompt(tokens, disabled)}>❯</Text> : null}
            {onAttach ? <Button ghost mediumIcon circle={!terminal} disabled={disabled || pending || attaching || attachments?.some((attachment) => attachment.uploading)} accessibilityLabel="Attach files" iconLeft={<Icon paperclip color={tokens["subtle-foreground"] ?? tokens["muted-foreground"]} size={16} />} onPress={onAttach} /> : null}
            <View style={s.editor}>
              <Textarea ref={editor} autoFocus={autoFocus} terminal={terminal} onKeyPress={onKeyPress} value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={composerLabel} rows={1} dense embedded maxLength={maxLength} disabled={disabled} style={s.editorHeight} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
            </View>
            {terminal ? <Button ghost small disabled={!canSend} accessibilityLabel={sendLabel} onPress={send}><Text style={s.terminalFace}>Send</Text></Button> : <Button primary mediumIcon circle disabled={!canSend} accessibilityLabel={sendLabel} iconLeft={<Icon arrowUp color={canSend ? tokens["action-foreground"] ?? tokens["primary-foreground"] : tokens["muted-foreground"]} size={15} />} onPress={send} />}
          </View>
        </Surface>
        {footer ? <View style={[s.footer, terminal ? s.terminalFooter : null]}>{footer}</View> : null}
      </View>
    );
    return framed && !terminal ? <GlassSurface layer="content" style={[fill, s.frame(tokens)]} testID={testID}>{body}</GlassSurface> : body;
  }

  function Chat(props: ChatProps) {
    const { tokens } = useTheme();
    const fill = useFillStyle("Chat");
    // The hand-off's parts in its order: Thread, Assistant message, User message, Avatar,
    // Composer, taken before the AnatomyScope so the messages' markdown, Buttons and
    // Textarea register nothing; the last four reach their nodes through the context.
    const threadPart = useAnatomyPart("Thread");
    const assistantPart = useAnatomyPart("Assistant message");
    const userPart = useAnatomyPart("User message");
    const avatarPart = useAnatomyPart("Avatar");
    const composerPart = useAnatomyPart("Composer");
    const anatomy = useMemo<ChatAnatomy>(() => ({ assistant: assistantPart, user: userPart, avatar: avatarPart, composer: composerPart }), [assistantPart, userPart, avatarPart, composerPart]);
    const ChatFrame = props.terminal ? View : GlassSurface;
    return <AnatomyScope><ChatAnatomyContext.Provider value={anatomy}><AnatomyPart part={threadPart}>
      <ChatFrame layer="content" style={[fill, s.root, props.terminal ? null : s.frame(tokens), props.style]} testID={props.testID}>
        <Thread {...props} framed={false} style={undefined} testID={props.testID ? `${props.testID}-thread` : undefined} />
        <Composer {...props} framed={false} testID={props.testID ? `${props.testID}-composer` : undefined} />
      </ChatFrame>
    </AnatomyPart></ChatAnatomyContext.Provider></AnatomyScope>;
  }
  return { Chat, ChatThread, ChatMessage, ChatComposer };
}
