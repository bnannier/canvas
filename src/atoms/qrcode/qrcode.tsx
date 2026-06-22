import { createQRCode } from "./qrcode.shared.js";
import { webSkin } from "./qrcode.styles.js";

// Web QRCode (the base; Metro falls back to it on native, web bundlers resolve it).
// Shared treatment: the look is identical on every platform (a fixed dark-on-white card).
export const QRCode = createQRCode(webSkin);
export type { QRCodeProps } from "./qrcode.shared.js";
