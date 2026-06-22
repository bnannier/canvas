import RNQRCode from "react-native-qrcode-svg";
import { View, type StyleProp, type ViewStyle } from "../../style/index.js";

// Shared QRCode shell. The structure (a fixed dark-on-white card wrapping the
// react-native-qrcode-svg renderer) and the boolean-prop size axis live here once;
// a platform file supplies only its skin (the card shape + the module/field colors)
// and calls createQRCode.
//
// QRCode is built on react-native-qrcode-svg, which draws with react-native-svg, so
// the same code renders identically on iOS, Android, and the web. The look is fixed
// dark-on-white inside a white card because a QR must stay high-contrast to scan
// reliably; unlike most components it does not follow the theme.
//
// QRCode is a "Shared" platform treatment: there is no native QR control to match on
// any platform, and contrast requirements forbid per-OS restyling, so the iOS, Android,
// and Web skins are identical (the three skin exports point at the same values).
//
// Boolean-prop API: a single size axis (first match wins, default medium).
//
//   <QRCode value="https://example.com" />     the medium 140px code
//   <QRCode value={url} small />                a compact 96px code
//   <QRCode value={url} large />                a large 200px code

export interface QRCodeSkin {
  /** The card shape: quiet-zone padding, radius, and white field around the code. */
  frame: ViewStyle;
  /** Near-black module color (the dark squares). Fixed for scan contrast. */
  moduleColor: string;
  /** The light field behind the modules. Fixed for scan contrast. */
  fieldColor: string;
}

export interface QRCodeProps {
  /** The string to encode: a URL, plain text, a token, etc. */
  value: string;
  // Size axis (pick one; default is the medium 140px code).
  /** A compact 96px code. */
  small?: boolean;
  /** A large 200px code. */
  large?: boolean;
  /**
   * Spoken equivalent for screen readers. A QR code is camera-only content, so
   * without a label assistive tech announces nothing. Defaults to
   * `QR code encoding ${value}`; pass a generic label (e.g. "QR code") when
   * surfacing the raw value is undesirable.
   */
  accessibilityLabel?: string;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// First-match size precedence; defaults to the medium code.
function sizeOf(p: QRCodeProps): number {
  if (p.small) return 96;
  if (p.large) return 200;
  return 140;
}

export function createQRCode(skin: QRCodeSkin) {
  return function QRCode(props: QRCodeProps) {
    const { value, accessibilityLabel, style } = props;
    // The QR draws as a bare SVG of rects (an <svg> of rects on web via RNW); without
    // a label assistive tech announces nothing, not even that a code is present. Expose
    // a spoken equivalent of the otherwise camera-only content. aria-label is added for
    // RNW, which does not forward accessibilityLabel as the web image's accessible name.
    const label = accessibilityLabel ?? `QR code encoding ${value}`;
    return (
      <View
        style={[skin.frame, style]}
        accessible
        accessibilityRole="image"
        role="img"
        accessibilityLabel={label}
        aria-label={label}
      >
        {/* react-native-qrcode-svg throws on an empty string, so fall back to a space. */}
        <RNQRCode value={value || " "} size={sizeOf(props)} color={skin.moduleColor} backgroundColor={skin.fieldColor} />
      </View>
    );
  };
}
