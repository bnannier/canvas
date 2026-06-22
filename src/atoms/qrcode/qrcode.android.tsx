import { createQRCode } from "./qrcode.shared.js";
import { androidSkin } from "./qrcode.styles.js";

// Material 3 QRCode. Metro resolves this file on Android; the docs import it for preview.
// Shared treatment: androidSkin === webSkin, so the look matches the web base exactly
// (Material 3 has no QR control and a code must stay high-contrast to scan).
export const QRCode = createQRCode(androidSkin);
export type { QRCodeProps } from "./qrcode.shared.js";
