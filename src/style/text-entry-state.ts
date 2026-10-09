// A kit text field's availability, said on every channel at once. Internal: every kit
// field that wraps a TextInput spreads it, and it is not part of the package's API.
//
// `editable={false}` alone reaches the browser only as the readonly attribute
// (react-native-web), so a disabled field stayed a Tab stop, took focus and was read as
// read-only. `aria-disabled` is what react-native-web turns into the native disabled
// attribute (which also takes the field out of the tab order) plus aria-disabled, and
// what React Native maps onto accessibilityState.disabled on iOS and Android, where a
// multiline iOS field (a Textarea) was otherwise never announced as dimmed. It is
// omitted while the field is enabled, so an enabled field's markup is unchanged; the
// accessibilityState stays explicit, the native channel react-native-web drops.
//
// Read-only keeps `editable={false}` alone: the browser keeps the field focusable and its
// text selectable. Natively React Native maps `editable={false}` itself to a disabled view
// (Android's setEnabled(false), `enabled = NO` on an iOS single-line field), so there
// VoiceOver and TalkBack announce a read-only field as dimmed, and Android's text cannot be
// selected. React Native's TextInput has no read-only mode of its own to map to instead
// (see PLATFORM-REFERENCES.md, "Text entry").

export interface TextEntryState {
  editable: boolean;
  accessibilityState: { disabled: boolean };
  "aria-disabled"?: boolean;
}

export function textEntryState({ disabled, readOnly }: { disabled?: boolean; readOnly?: boolean }): TextEntryState {
  const off = !!disabled;
  return { editable: !off && !readOnly, accessibilityState: { disabled: off }, "aria-disabled": off || undefined };
}
