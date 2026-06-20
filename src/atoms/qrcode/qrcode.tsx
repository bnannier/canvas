import RNQRCode from "react-native-qrcode-svg";
import { View, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./qrcode.styles.js";

// QRCode: encodes a string (a URL, an app-install link, a token) as a scannable
// QR code. It is built on react-native-qrcode-svg, which draws with react-native-svg,
// so the same code renders identically on iOS, Android, and the web. The look is
// fixed dark-on-white inside a white card (see qrcode.styles) because a QR must stay
// high-contrast to scan reliably; unlike most components it does not follow the theme.
//
// Boolean-prop API: a single size axis (first match wins, default medium).
//
//   <QRCode value="https://example.com" />     the medium 140px code
//   <QRCode value={url} small />                a compact 96px code
//   <QRCode value={url} large />                a large 200px code

export interface QRCodeProps {
  /** The string to encode: a URL, plain text, a token, etc. */
  value: string;
  // Size axis (pick one; default is the medium 140px code).
  /** A compact 96px code. */
  small?: boolean;
  /** A large 200px code. */
  large?: boolean;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// First-match size precedence; defaults to the medium code.
function sizeOf(p: QRCodeProps): number {
  if (p.small) return 96;
  if (p.large) return 200;
  return 140;
}

export function QRCode(props: QRCodeProps) {
  const { value, style } = props;
  return (
    <View style={[s.frame, style]}>
      {/* react-native-qrcode-svg throws on an empty string, so fall back to a space. */}
      <RNQRCode value={value || " "} size={sizeOf(props)} color={s.MODULE_COLOR} backgroundColor={s.FIELD_COLOR} />
    </View>
  );
}
