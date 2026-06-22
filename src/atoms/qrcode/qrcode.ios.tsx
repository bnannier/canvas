import { createQRCode } from "./qrcode.shared.js";
import { iosSkin } from "./qrcode.styles.js";

// iOS QRCode. Metro resolves this file on iOS; the docs import it for preview.
// Shared treatment: iosSkin === webSkin, so the look matches the web base exactly
// (a QR code has no native iOS variant and must stay high-contrast to scan).
export const QRCode = createQRCode(iosSkin);
export type { QRCodeProps } from "./qrcode.shared.js";
