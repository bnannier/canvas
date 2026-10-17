import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { type ScrollView as RNScrollView, type ViewProps } from "react-native";
import { View, Text, ScrollView, GlassSurface, useTheme, useFillStyle, useControllableState, FOCUS_RESET, LoopView, createLoopChannel, useReducedMotion, type LayoutStyle } from "../../style/index.js";
import { useScrollFocus } from "../../style/use-scroll-focus.js";
import { useFocusFrame } from "../../style/focus-frame.js";
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
import { Icon } from "../../atoms/icon/icon.js";
import { chatAtBottom, chatBlocks, chatRuns } from "./chat.logic.js";
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
  /** Historical skipped decision, rendered read-only. Active forms require an answer. @deprecated */
  skipped?: boolean;
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

export interface ChatMessageProps extends QuestionCallbacks {
  message: ChatMessageData;
  onOpenAttachment?: (attachment: ChatAttachmentData) => void;
  /** Render assistant markdown punctuation literally. User messages are always plain text. */
  plain?: boolean;
  testID?: string;
}

export interface ChatThreadProps extends QuestionCallbacks {
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

interface ChatParts {
  Button: ComponentType<ButtonProps>;
  Textarea: ComponentType<TextareaProps>;
  Spinner: ComponentType<SpinnerProps>;
  Chip: ComponentType<ChipProps>;
  Radio: ComponentType<RadioProps>;
  RadioGroup: ComponentType<RadioGroupProps>;
  Checkbox: ComponentType<CheckboxProps>;
  FormSection: ComponentType<FormSectionProps>;
  Switch: ComponentType<SwitchProps>;
}

export function createChat(skin: s.ChatSkin, { Button = WebButton, Textarea = WebTextarea, Spinner = WebSpinner, Chip = WebChip, Radio = WebRadio, RadioGroup = WebRadioGroup, Checkbox = WebCheckbox, FormSection = WebFormSection, Switch = WebSwitch }: Partial<ChatParts> = {}) {
  function Inline({ value }: { value: string }) {
    return <>{chatRuns(value).map((run, index) => <Text key={index} style={[run.strong ? s.strong : null, run.emphasis ? s.emphasis : null, run.code ? s.code : null]}>{run.text}</Text>)}</>;
  }

  function Thinking({ label, icon }: { label: string; icon?: ReactNode }) {
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
      <Text style={s.thinkingLabel(tokens)}>{label}</Text>
      <View style={s.dots} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[0, 1, 2].map((index) => <LoopView key={index} style={s.dot(tokens)} opacity={{ channel: pulse, inputRange: [0, 0.25, 0.5, 1], outputRange: [0.35, 1, 0.35, 0.35], offset: index / 6 }} />)}
      </View>
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

  function Questions({ message, disabled, pending, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange }: ChatMessageProps) {
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
      if (answer?.skipped !== undefined) return false;
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
          {answer?.skipped ? <Text style={skin.muted(tokens)}>Skipped</Text> : selected.map((id) => <Text key={id} selectable style={skin.body(tokens)}>{id === "__custom" ? answer?.customText : item.options.find((option) => option.id === id)?.label ?? "No answer"}</Text>)}
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
        {answer?.skipped ? <Text style={skin.muted(tokens)}>{message.questionsDisabled ? "Skipped" : "Answer required"}</Text> : null}
        {message.questionsDisabled && !question.multiple ? <View style={s.questionActions}><View style={s.questionMode}>{renderModeSwitch(question)}</View></View> : null}
      </View>;
    };
    if (message.questionsDisabled) return <View style={s.questions}>{questions.map(renderQuestion)}</View>;
    if (!question) return null;
    const answer = answers.find((entry) => entry.questionId === question.id);
    const showSubmit = multipleFor(question, answer) || index === questions.length - 1;
    const showNext = !showSubmit && (answer?.optionId === "__custom" || valid(question, answer));
    return <View style={s.questions}>
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
    </View>;
  }

  function ChatMessage({ message, plain, onOpenAttachment, testID, ...questionProps }: ChatMessageProps) {
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
        <View style={[s.messageContent, message.questions?.length ? s.questionContent : null]}>
          <View style={s.identity}>
            {message.providerIcon}
            <Text style={skin.label(tokens)}>{author}</Text>
            {message.provider ? <Text style={skin.muted(tokens)}>{message.provider}</Text> : null}
          </View>
          {message.content ? user ? <GlassSurface layer="content" style={skin.message(tokens, true)}>{content}</GlassSurface> : content : null}
          {message.role === "assistant" && message.questions?.length ? <Questions key={message.id} message={message} {...questionProps} /> : null}
          <Attachments attachments={message.attachments} onOpen={onOpenAttachment} />
          {message.streaming ? <Thinking label="Responding…" /> : null}
          {message.error ? <Text accessibilityLiveRegion="polite" style={skin.muted(tokens, true)}>Reply failed</Text> : null}
          {message.notice ? <Text style={skin.muted(tokens, message.error)}>{message.notice}</Text> : null}
        </View>
      </View>
    );
  }

  function ChatThread({ messages, pending, pendingLabel = "Assistant is thinking…", pendingIcon, label = "Conversation", emptyState, plain, onOpenAttachment, testID, style, disabled, onQuestionAnswerChange, onSubmitQuestionAnswers, onQuestionIndexChange }: ChatThreadProps) {
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
            {messages.map((message) => <ChatMessage key={message.id} message={message} plain={plain} onOpenAttachment={onOpenAttachment} disabled={disabled} pending={pending || streaming} onQuestionAnswerChange={onQuestionAnswerChange} onSubmitQuestionAnswers={onSubmitQuestionAnswers} onQuestionIndexChange={onQuestionIndexChange} />)}
          </View>
          {pending && !streaming ? <View style={s.pending}><Thinking label={pendingLabel} icon={pendingIcon} /></View> : null}
        </ScrollView>
        {frame.innerRing()}
      </View>
    );
  }

  function ChatComposer({ value, onChangeText, onSend, placeholder = "Message the assistant…", composerLabel = "Message", sendLabel = "Send message", maxLength, disabled, pending, onAttach, attachments, onRemoveAttachment, attaching, footer, testID }: ChatComposerProps) {
    const { tokens } = useTheme();
    const [focused, setFocused] = useState(false);
    const fill = useFillStyle("ChatComposer");
    const filesPending = attaching || attachments?.some((attachment) => attachment.uploading || attachment.error);
    const canSend = !disabled && !pending && !filesPending && (value.trim().length > 0 || !!attachments?.length);
    return (
      <View style={[fill, s.composer]} testID={testID}>
        <GlassSurface static layer="control" stateBorder={focused} style={s.composerSurface(tokens, focused)}>
          {attachments?.length ? <View style={s.composerAttachments}><Attachments attachments={attachments} onRemove={onRemoveAttachment} disabled={disabled || pending} /></View> : null}
          <Textarea value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={composerLabel} rows={2} dense embedded maxLength={maxLength} disabled={disabled} style={s.editorHeight} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          <View style={s.composerRow}>
            {onAttach ? <Button ghost icon disabled={disabled || pending || attaching || attachments?.some((attachment) => attachment.uploading)} accessibilityLabel="Attach files" iconLeft={<Icon paperclip color={tokens["muted-foreground"]} size={18} />} onPress={onAttach} /> : null}
            <View style={s.actionSpace} />
            <Button primary icon disabled={!canSend} accessibilityLabel={sendLabel} iconLeft={<Icon arrowUp color={canSend ? tokens["action-foreground"] ?? tokens["primary-foreground"] : tokens["muted-foreground"]} size={18} />} onPress={() => { if (canSend) onSend(value.trim()); }} />
          </View>
        </GlassSurface>
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
