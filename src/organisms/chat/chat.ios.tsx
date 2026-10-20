import { createMarkdown } from "./markdown.shared.js";
import { iosSkin as markdownSkin } from "./markdown.styles.js";
import { createChat } from "./chat.shared.js";
import { iosSkin } from "./chat.styles.js";
import { Button } from "../../atoms/button/button.ios.js";
import { Textarea } from "../../atoms/textarea/textarea.ios.js";
import { Spinner } from "../../atoms/spinner/spinner.ios.js";
import { Chip } from "../../atoms/chip/chip.ios.js";
import { Radio, RadioGroup } from "../../atoms/radio/radio.ios.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.ios.js";
import { FormSection } from "../../molecules/form/form.ios.js";
import { Switch } from "../../atoms/switch/switch.ios.js";
import { Card } from "../../molecules/card/card.ios.js";

import { DataTable } from "../data-table/data-table.ios.js";
import { Divider } from "../../atoms/divider/divider.ios.js";

const components = createChat(iosSkin, { Button, Textarea, Spinner, Chip, Radio, RadioGroup, Checkbox, FormSection, Switch, Card, DataTable, Divider });

/** A controlled conversation with an independently scrolling thread and anchored composer. */
export const Chat = components.Chat;
/** A bounded message scrollport that follows the tail while the reader remains at the bottom. */
export const ChatThread = components.ChatThread;
/** One authored conversation message with safe assistant markdown and delivery state. */
export const ChatMessage = components.ChatMessage;
/** A controlled multiline draft with an explicit send action and anchored footer. */
export const ChatComposer = components.ChatComposer;
export type { ChatProps, ChatThreadProps, ChatMessageProps, ChatComposerProps, ChatMessageData, ChatAttachmentData, ChatQuestionData, ChatQuestionAnswerData } from "./chat.shared.js";

/** Safe document Markdown shared with Chat, including template sections, lists and tables. */
export const Markdown = createMarkdown(markdownSkin, { Checkbox, DataTable, Divider });
export type { MarkdownProps } from "./markdown.shared.js";
