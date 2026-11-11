import { createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type RefAttributes } from "react";
import { type ScrollView as RNScrollView, type TextInput as RNTextInput, type ViewProps } from "react-native";
import { View, Text, ScrollView, GlassSurface, useTheme, useFillStyle, useControllableState, FOCUS_RESET, LoopView, createLoopChannel, useReducedMotion, useContainerWidth, type LayoutStyle } from "../../style/index.js";
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
  /**
   * Work the assistant did rather than said (a command, a tool call, a process log): one muted
   * line, `author` then `notice`, that expands to its markdown `content`, the way a desktop
   * assistant folds its tool use between replies.
   */
  activity?: boolean;
}

export interface ChatMessageProps extends QuestionCallbacks, MessageActionCallbacks {
  message: ChatMessageData;
  onOpenAttachment?: (attachment: ChatAttachmentData) => void;
  /** Render assistant markdown punctuation literally. User messages are always plain text. */
  plain?: boolean;
  /** Flat, compact monospace terminal transcript. */
  terminal?: boolean;
  /**
   * Lay the conversation out like a desktop assistant's window (the Claude desktop window,
   * reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a
   * neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a
   * quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look.
   */
  assistant?: boolean;
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
  /** Draw no frame: the conversation sits on its host's fill, as a desktop assistant's window does. */
  flush?: boolean;
  /**
   * Lay the conversation out like a desktop assistant's window (the Claude desktop window,
   * reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a
   * neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a
   * quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look.
   */
  assistant?: boolean;
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
  /** With `assistant`, a short muted line at the composer's end below it, naming the model or mode that will answer. */
  meta?: string;
  /**
   * Lay the conversation out like a desktop assistant's window (the Claude desktop window,
   * reference claude-desktop-chat): one centered reading column, plain 15 / 21 replies, a
   * neutral user bubble, a wider rhythm between turns, and a raised 44 px composer with a
   * quiet send control and the `meta` line. Without it, Chat draws the v4 hand-off's look.
   */
  assistant?: boolean;
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

/** The run of consecutive activity messages around `index`. */
function activityRun(messages: readonly ChatMessageData[], index: number) {
  let start = index;
  while (start > 0 && messages[start - 1]!.activity) start -= 1;
  let end = index;
  while (end + 1 < messages.length && messages[end + 1]!.activity) end += 1;
  return { start, items: messages.slice(start, end + 1) };
}

export function createChat(skin: s.ChatSkin, { Button = WebButton, Textarea = WebTextarea, Spinner = WebSpinner, Chip = WebChip, Radio = WebRadio, RadioGroup = WebRadioGroup, Checkbox = WebCheckbox, FormSection = WebFormSection, Switch = WebSwitch, Card = WebCard, DataTable, Divider }: Partial<ChatParts> = {}) {
  const Markdown = createMarkdown(markdownSkin, { Checkbox, DataTable, Divider }, false);
  // An `assistant` reply reads at that layout's body size (15 / 21), not the document's 14,
  // with list items on the line rhythm and paragraphs 12 apart.
  const AssistantMarkdown = createMarkdown({ ...markdownSkin, body: (tokens) => skin.assistantBody(tokens), spacing: s.REPLY_SPACING }, { Checkbox, DataTable, Divider }, false);

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

  function Questions({ message, disabled, pending, terminal, assistant, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange }: ChatMessageProps) {
    const stack = assistant ? s.assistantQuestionStack : s.questionStack;
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
        return <View key={item.id} style={stack}>
          <Text style={skin.label(tokens)}>{item.title}</Text>
          {!item.multiple && answer?.multiple ? <Text style={skin.muted(tokens)}>Multiple answers selected by you</Text> : null}
          {selected.map((id) => <Text key={id} selectable style={assistant ? skin.assistantBody(tokens) : skin.body(tokens)}>{id === "__custom" ? answer?.customText : item.options.find((option) => option.id === id)?.label ?? "No answer"}</Text>)}
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
      return <View key={question.id} style={stack}>
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

  function ActivityRow({ message, terminal, assistant, testID, nested }: Pick<ChatMessageProps, "message" | "terminal" | "assistant" | "testID"> & { nested?: boolean }) {
    const { tokens } = useTheme();
    const Details = assistant ? AssistantMarkdown : Markdown;
    const [open, setOpen] = useState(false);
    const summary = [message.author ?? "Activity", message.notice].filter(Boolean).join(" · ");
    const ink = tokens["subtle-foreground"] ?? tokens["muted-foreground"];
    return (
      <View {...(nested ? null : LIST_ITEM)} testID={testID} style={nested ? s.activityNested : assistant ? s.assistantActivity : s.activity}>
        <Button plainLink start accessibilityLabel={`${summary}, ${open ? "hide" : "show"} details`} {...({ "aria-expanded": open } as object)} disabled={!message.content}
          iconRight={message.content ? <Icon {...(open ? { chevronDown: true } : { chevronRight: true })} color={ink} size={12} /> : undefined} onPress={() => setOpen((value) => !value)}>
          <Text style={terminal ? s.terminalMuted(tokens) : s.activityLabel(tokens)}>{summary}</Text>
        </Button>
        {open && message.content ? <View style={s.activityBody(tokens)}><Details compact terminal={terminal}>{message.content}</Details></View> : null}
      </View>
    );
  }

  /** Several activity lines folded into one: their summaries on one line, each line's own
   * row (and details) behind it. */
  function ActivityGroup({ items, assistant }: { items: readonly ChatMessageData[]; assistant?: boolean }) {
    const { tokens } = useTheme();
    const [open, setOpen] = useState(false);
    const summary = items.map((item) => item.author ?? "Activity").join(", ");
    const ink = tokens["subtle-foreground"] ?? tokens["muted-foreground"];
    return (
      <View {...LIST_ITEM} style={assistant ? s.assistantActivity : s.activity}>
        <Button plainLink start accessibilityLabel={`${items.length} steps: ${summary}, ${open ? "hide" : "show"} details`} {...({ "aria-expanded": open } as object)}
          iconRight={<Icon {...(open ? { chevronDown: true } : { chevronRight: true })} color={ink} size={12} />} onPress={() => setOpen((value) => !value)}>
          <Text numberOfLines={1} style={s.activityLabel(tokens)}>{summary}</Text>
        </Button>
        {open ? <View style={[s.activityBody(tokens), s.activityGroupBody]}>{items.map((item) => <ActivityRow key={item.id} message={item} assistant={assistant} nested />)}</View> : null}
      </View>
    );
  }

  function MessageRow({ message, plain, terminal, assistant, onOpenAttachment, onAction, testID, anatomy, ...questionProps }: ChatMessageProps & { anatomy?: MessageAnatomy }) {
    if (message.activity) return <ActivityRow message={message} terminal={terminal} assistant={assistant} testID={testID} />;
    return <SpokenRow message={message} plain={plain} terminal={terminal} assistant={assistant} onOpenAttachment={onOpenAttachment} onAction={onAction} testID={testID} anatomy={anatomy} {...questionProps} />;
  }

  function SpokenRow({ message, plain, terminal, assistant, onOpenAttachment, onAction, testID, anatomy, ...questionProps }: ChatMessageProps & { anatomy?: MessageAnatomy }) {
    const { tokens } = useTheme();
    const fill = useFillStyle("ChatMessage");
    const actionsDisabled = !!(questionProps.disabled || questionProps.pending || message.streaming || !onAction);
    const user = message.role === "user";
    const author = message.author ?? (user ? "You" : message.role === "system" ? "System" : "Assistant");
    const desk = assistant && !terminal;
    const body = terminal ? s.terminalBody(tokens) : desk ? skin.assistantBody(tokens) : skin.body(tokens);
    const Reply = desk ? AssistantMarkdown : Markdown;
    const content = user || plain ? <Text selectable style={body}>{message.content}</Text> : <Reply compact terminal={terminal}>{message.content}</Reply>;
    const bubble = user && !terminal
      ? <GlassSurface layer="content" tint={desk ? tokens.muted : tokens["primary-soft"]} style={desk ? skin.assistantMessage(tokens) : skin.message(tokens, true)}>{content}</GlassSurface>
      : content;
    // As the hand-off's message renderer does, a turn carries an author line only when the
    // app names its author or provider (several AIs in one conversation); the terminal
    // always labels turns.
    const identified = terminal || !!message.author || !!message.provider || message.providerIcon != null;
    return (
      <View {...LIST_ITEM} testID={testID} style={[fill, s.messageRow, terminal ? null : user ? (desk ? s.assistantUserRow : s.userRow) : (desk ? s.assistantAssistantRow : s.assistantRow)]}>
        <View style={[s.messageContent, terminal ? s.terminalMessage : user ? s.userContent : null, message.questions?.length ? s.questionContent : null]}>
          {identified ? <View style={s.identity}>
            {message.providerIcon != null && !terminal ? <AnatomyPart part={anatomy?.avatar}>{message.providerIcon}</AnatomyPart> : null}
            <Text style={terminal ? s.terminalLabel(tokens) : skin.label(tokens)}>{terminal ? `${user ? "❯" : message.role === "system" ? "·" : "●"} ${author}` : author}</Text>
            {message.provider ? <Text style={terminal ? s.terminalMuted(tokens) : skin.muted(tokens)}>{message.provider}</Text> : null}
          </View> : null}
          {message.content ? <AnatomyPart part={anatomy?.body}>{bubble}</AnatomyPart> : null}
          {message.role === "assistant" && message.questions?.length ? <Questions key={message.id} message={message} terminal={terminal} assistant={desk} {...questionProps} /> : null}
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

  function Thread({ messages, pending, pendingLabel = "Assistant is thinking…", pendingIcon, label = "Conversation", emptyState, plain, terminal, flush, assistant, onOpenAttachment, testID, style, disabled, onAction, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange, framed }: ChatThreadProps & { framed: boolean }) {
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
    const desk = !!assistant && !terminal;
    const width = useContainerWidth();
    const narrow = desk && width.width > 0 && width.width < s.NARROW_WIDTH;
    const Frame = framed && !terminal ? GlassSurface : View;
    const parts = useContext(ChatAnatomyContext);
    // A part drawn by many messages goes to the first one that draws it.
    const firstUser = parts ? messages.findIndex((message) => message.role === "user" && message.content) : -1;
    const firstAssistant = parts ? messages.findIndex((message) => message.role !== "user" && message.content) : -1;
    const firstAvatar = parts ? messages.findIndex((message) => message.providerIcon != null) : -1;
    const anatomyOf = (message: ChatMessageData, index: number): MessageAnatomy | undefined =>
      parts ? { body: index === (message.role === "user" ? firstUser : firstAssistant) ? (message.role === "user" ? parts.user : parts.assistant) : undefined, avatar: index === firstAvatar ? parts.avatar : undefined } : undefined;
    return (
      <Frame layer="content" style={[fill, s.thread, framed && !terminal ? s.frame(tokens) : null, framed && flush ? s.flush : null, style]} testID={testID}>
        <ScrollView
          {...frameTarget}
          ref={(node) => { scroll.current = node; frameRef(node); }}
          style={[s.thread, FOCUS_RESET]}
          contentContainerStyle={terminal ? s.terminalContent : desk ? [s.assistantContent, narrow ? s.assistantNarrowContentGutter : null] : s.content}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          accessibilityLabel={label}
          {...({ "aria-label": label } as ViewProps)}
          tabIndex={scrollFocus.tabIndex}
          onLayout={(event) => {
            scrollFocus.onLayout(event);
            width.onLayout(event);
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
          <View {...listProps({ label })} style={terminal ? s.terminalBlocks : desk ? s.assistantBlocks : s.blocks}>
            {messages.map((message, index) => {
              // Consecutive activity folds into one line, as a desktop assistant folds its tool use;
              // the run is drawn once, at its first message.
              const run = !terminal && message.activity ? activityRun(messages, index) : null;
              if (run && run.start !== index) return null;
              const row = run && run.items.length > 1 ? <ActivityGroup key={message.id} items={run.items} assistant={desk} />
                : <MessageRow key={message.id} anatomy={anatomyOf(message, index)} message={message} plain={plain} terminal={terminal} assistant={desk} onOpenAttachment={onOpenAttachment} onAction={onAction} disabled={disabled} pending={pending || streaming} onQuestionAnswerChange={onQuestionAnswerChange} onSubmitQuestionAnswers={onSubmitQuestionAnswers} onQuestionIndexChange={onQuestionIndexChange} />;
              if (!desk || index === 0) return row;
              // A turn that changes speaker opens wider than the next block of the same turn.
              const turn = (message.role === "user") !== (messages[index - 1].role === "user");
              return <View key={message.id} style={{ marginTop: turn ? s.TURN_GAP : s.BLOCK_GAP }}>{row}</View>;
            })}
          </View>
          {pending && !streaming ? <View style={[s.pending, desk && messages.length ? { marginTop: s.TURN_GAP } : null]}><Thinking label={pendingLabel} icon={pendingIcon} terminal={terminal} /></View> : null}
        </ScrollView>
        {frame.innerRing()}
      </Frame>
    );
  }

  function ChatComposer(props: ChatComposerProps & { flush?: boolean }) {
    return <Composer {...props} framed />;
  }

  function Composer({ value, onChangeText, onSend, terminal, autoFocus, placeholder = "Message the assistant…", composerLabel = "Message", sendLabel = "Send message", maxLength, disabled, sendDisabled, pending, onAttach, attachments, onRemoveAttachment, attaching, footer, meta, assistant, testID, framed, flush }: ChatComposerProps & { framed: boolean; flush?: boolean }) {
    const { tokens } = useTheme();
    const editor = useRef<RNTextInput>(null);
    const [focusedState, setFocused] = useState(false);
    // An InteractionOverride's pinned focus shows the focused look (src/style/interaction-override.tsx).
    const focused = usePinnedFocus(!disabled) || focusedState;
    const fill = useFillStyle("ChatComposer");
    const filesPending = attaching || attachments?.some((attachment) => attachment.uploading || attachment.error);
    const canSend = !disabled && !sendDisabled && !pending && !filesPending && (value.trim().length > 0 || !!attachments?.length);
    const part = useContext(ChatAnatomyContext)?.composer;
    const desk = !!assistant && !terminal;
    const width = useContainerWidth();
    const narrow = desk && width.width > 0 && width.width < s.NARROW_WIDTH;
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
      <View ref={part?.ref} onLayout={(event) => { part?.onLayout?.(); width.onLayout(event); }} style={[framed && !terminal ? null : fill, terminal ? s.terminalComposer(tokens, focused) : desk ? [s.assistantComposer, narrow ? s.assistantNarrowGutter : null] : s.composer(tokens)]} testID={framed && !terminal ? undefined : testID}>
        <Surface static layer="control" stateBorder={focused} style={terminal ? s.terminalComposerSurface(tokens, focused) : desk ? s.assistantComposerSurface(tokens, focused) : s.composerSurface(tokens, focused)}>
          {attachments?.length ? <View style={s.composerAttachments}><Attachments attachments={attachments} onRemove={onRemoveAttachment} disabled={disabled || pending} /></View> : null}
          <View style={terminal ? s.terminalComposerRow : desk ? s.assistantComposerRow : s.composerRow}>
            {terminal ? <Text aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.terminalPrompt(tokens, disabled)}>❯</Text> : null}
            {onAttach ? <Button ghost mediumIcon circle={!terminal} disabled={disabled || pending || attaching || attachments?.some((attachment) => attachment.uploading)} accessibilityLabel="Attach files" iconLeft={<Icon {...(desk ? { plus: true } : { paperclip: true })} color={tokens["subtle-foreground"] ?? tokens["muted-foreground"]} size={16} />} onPress={onAttach} /> : null}
            <View style={s.editor}>
              <Textarea ref={editor} autoFocus={autoFocus} terminal={terminal} onKeyPress={onKeyPress} value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={composerLabel} rows={1} {...(desk ? { composer: true } : { dense: true })} embedded maxLength={maxLength} disabled={disabled} style={s.editorHeight} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
            </View>
            {terminal ? <Button ghost small disabled={!canSend} accessibilityLabel={sendLabel} onPress={send}><Text style={s.terminalFace}>Send</Text></Button>
              // `assistant`: quiet at rest like the reference's end controls; the call to action once there is a draft to send.
              : desk && !canSend ? <Button ghost mediumIcon circle disabled accessibilityLabel={sendLabel} iconLeft={<Icon arrowUp color={tokens["muted-foreground"]} size={15} />} onPress={send} />
                : <Button primary mediumIcon circle disabled={!canSend} accessibilityLabel={sendLabel} iconLeft={<Icon arrowUp color={canSend ? tokens["action-foreground"] ?? tokens["primary-foreground"] : tokens["muted-foreground"]} size={15} />} onPress={send} />}
          </View>
        </Surface>
        {meta && desk ? <Text style={s.meta(tokens)}>{meta}</Text> : null}
        {footer ? <View style={[s.footer, terminal ? s.terminalFooter : null]}>{footer}</View> : null}
      </View>
    );
    return framed && !terminal ? <GlassSurface layer="content" style={[fill, s.frame(tokens), flush ? s.flush : null]} testID={testID}>{body}</GlassSurface> : body;
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
      <ChatFrame layer="content" style={[fill, s.root, props.terminal ? null : s.frame(tokens), props.flush && !props.terminal ? s.flush : null, props.style]} testID={props.testID}>
        <Thread {...props} framed={false} style={undefined} testID={props.testID ? `${props.testID}-thread` : undefined} />
        <Composer {...props} framed={false} testID={props.testID ? `${props.testID}-composer` : undefined} />
      </ChatFrame>
    </AnatomyPart></ChatAnatomyContext.Provider></AnatomyScope>;
  }
  return { Chat, ChatThread, ChatMessage, ChatComposer };
}
