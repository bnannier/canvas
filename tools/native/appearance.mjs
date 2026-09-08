/**
 * Parse stripped `cmd uimode night` stdout into the same writable shell token.
 * API 35 prints the custom subtype, never bare `custom`:
 * https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-15.0.0_r1/services/core/java/com/android/server/UiModeManagerService.java#2235
 * This preserves the mode and subtype, not every automatic-policy override.
 * @param {unknown} output
 */
export function parseAndroidNightMode(output) {
  const match = typeof output === "string"
    ? /^Night mode: (yes|no|auto|custom_schedule|custom_bedtime)$/.exec(output)
    : null;
  // JS's $ also matches before a final newline. Require the entire input.
  if (!match || match[0] !== output) {
    throw new Error("Cannot safely restore Android appearance: unrecognized night-mode output");
  }
  return match[1];
}
