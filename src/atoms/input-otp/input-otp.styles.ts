import { MONO_FONT, shape } from "../../style/index.js";
import { fieldBorder } from "../../style/field-colors.js";
import { webSkin as inputWeb } from "../input/input.styles.js";
import { type InputOTPSkin, type Size } from "./input-otp.shared.js";

// Co-located InputOTP skins, drawn to the Canvas v4 hand-off (tools/v4/handoff/
// cv-kit-inputs.js `K.def('input-otp')`). Neither iOS nor Android ships a one-time-code
// control (PLATFORM-REFERENCES.md: iOS digit entry views are tvOS-only, Material 3 has
// no pin input), so every platform draws the hand-off's look and only the field corner
// changes, from each platform's row of the shape table (the hand-off's K.PF `--r-f`:
// 10 web, 8 iOS, 4 Android):
//   A row of SEPARATED cells 8 apart, each the Input's sunken well: a `surface-sunken`
//   box with a 1px `field-border` hairline, 36, 44 or 52 wide and 1.18 times as tall
//   (42, 52, 61). The active cell paints the `ring` edge with the Input's 4px accent
//   halo. The digit is the mono face at 500, 0.45 of the cell width (16, 20, 23). A
//   `groups` dash is the subtle ink in a 12 wide slot. The empty active cell draws a
//   1.5 wide accent caret 40% of the cell's height. Disabled dims the row to 0.45.
// The caret blinks on iOS and Android (their insertion-point idiom, on the loop
// primitive) and stays a static bar on the web, where the hand-off's blink would be a
// new motion (CLAUDE.md "Motion").

// The cell width per size; the height is 1.18 times it and the digit 0.45 of it.
const CELL_W: Record<Size, number> = { small: 36, base: 44, large: 52 };
const cellH = (size: Size) => Math.round(CELL_W[size] * 1.18);
const digitSize = (size: Size) => Math.round(CELL_W[size] * 0.45);

/** The hand-off's code field at one platform's field corner, with its caret blink. */
function codeSkin(radius: number, { liquid, continuous, caretBlink }: { liquid: boolean; continuous: boolean; caretBlink: boolean }): InputOTPSkin {
  return {
    liquid,
    gap: () => 8,
    cell: (t, size, { active }) => ({
      alignItems: "center",
      justifyContent: "center",
      width: CELL_W[size],
      height: cellH(size),
      borderRadius: radius,
      ...(continuous ? { borderCurve: "continuous" as const } : null),
      backgroundColor: t["surface-sunken"] ?? t.card,
      borderWidth: 1,
      borderColor: active ? t.ring : fieldBorder(t),
      ...(active ? inputWeb.focusHalo!(t, false) : null),
    }),
    digit: (t, size) => ({
      fontFamily: MONO_FONT,
      fontSize: digitSize(size),
      lineHeight: Math.round(digitSize(size) * 1.2),
      fontWeight: "500",
      color: t.foreground,
      textAlign: "center",
    }),
    separator: (t, size) => ({
      width: 12,
      textAlign: "center",
      fontSize: digitSize(size),
      lineHeight: Math.round(digitSize(size) * 1.2),
      color: t["subtle-foreground"] ?? t["muted-foreground"],
    }),
    caret: (t) => ({ width: 1.5, height: "40%", backgroundColor: t.primary }),
    caretBlink,
    disabledOpacity: 0.45,
  };
}

export const webSkin: InputOTPSkin = codeSkin(shape.web.field, { liquid: true, continuous: false, caretBlink: false });
export const iosSkin: InputOTPSkin = codeSkin(shape.ios.field, { liquid: false, continuous: true, caretBlink: true });
export const androidSkin: InputOTPSkin = codeSkin(shape.android.field, { liquid: false, continuous: false, caretBlink: true });
