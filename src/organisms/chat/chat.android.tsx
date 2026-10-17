import { createChat } from "./chat.shared.js";
import { androidSkin } from "./chat.styles.js";
import { Button } from "../../atoms/button/button.android.js";
import { Textarea } from "../../atoms/textarea/textarea.android.js";
import { Spinner } from "../../atoms/spinner/spinner.android.js";
import { Chip } from "../../atoms/chip/chip.android.js";
import { Radio, RadioGroup } from "../../atoms/radio/radio.android.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.android.js";
import { FormSection } from "../../molecules/form/form.android.js";
import { Switch } from "../../atoms/switch/switch.android.js";
import { Card } from "../../molecules/card/card.android.js";

const components = createChat(androidSkin, { Button, Textarea, Spinner, Chip, Radio, RadioGroup, Checkbox, FormSection, Switch, Card });

/** A controlled conversation with an independently scrolling thread and anchored composer. */
export const Chat = components.Chat;
/** A bounded message scrollport that follows the tail while the reader remains at the bottom. */
export const ChatThread = components.ChatThread;
/** One authored conversation message with safe assistant markdown and delivery state. */
export const ChatMessage = components.ChatMessage;
/** A controlled multiline draft with an explicit send action and anchored footer. */
export const ChatComposer = components.ChatComposer;
export type { ChatProps, ChatThreadProps, ChatMessageProps, ChatComposerProps, ChatMessageData, ChatAttachmentData, ChatQuestionData, ChatQuestionAnswerData } from "./chat.shared.js";
