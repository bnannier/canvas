import { createChat } from "./chat.shared.js";
import { androidSkin } from "./chat.styles.js";
import { Button } from "../../atoms/button/button.android.js";
import { Textarea } from "../../atoms/textarea/textarea.android.js";
import { Spinner } from "../../atoms/spinner/spinner.android.js";

const components = createChat(androidSkin, { Button, Textarea, Spinner });

/** A controlled conversation with an independently scrolling thread and anchored composer. */
export const Chat = components.Chat;
/** A bounded message scrollport that follows the tail while the reader remains at the bottom. */
export const ChatThread = components.ChatThread;
/** One authored conversation message with safe assistant markdown and delivery state. */
export const ChatMessage = components.ChatMessage;
/** A controlled multiline draft with an explicit send action and anchored footer. */
export const ChatComposer = components.ChatComposer;
export type { ChatProps, ChatThreadProps, ChatMessageProps, ChatComposerProps, ChatMessageData } from "./chat.shared.js";
