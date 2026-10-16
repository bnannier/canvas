import { createChat } from "./chat.shared.js";
import { webSkin } from "./chat.styles.js";
import { Button } from "../../atoms/button/button.js";
import { Textarea } from "../../atoms/textarea/textarea.js";
import { Spinner } from "../../atoms/spinner/spinner.js";
import { Chip } from "../../atoms/chip/chip.js";

const components = createChat(webSkin, { Button, Textarea, Spinner, Chip });

/** A controlled conversation with an independently scrolling thread and anchored composer. */
export const Chat = components.Chat;
/** A bounded message scrollport that follows the tail while the reader remains at the bottom. */
export const ChatThread = components.ChatThread;
/** One authored conversation message with safe assistant markdown and delivery state. */
export const ChatMessage = components.ChatMessage;
/** A controlled multiline draft with an explicit send action and anchored footer. */
export const ChatComposer = components.ChatComposer;
export type { ChatProps, ChatThreadProps, ChatMessageProps, ChatComposerProps, ChatMessageData, ChatAttachmentData } from "./chat.shared.js";
