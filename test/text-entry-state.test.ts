import { describe, expect, it } from "bun:test";
import { textEntryState } from "../src/style/text-entry-state.ts";

// The availability every kit text field spreads on its TextInput: one place that says
// disabled on both channels (aria-disabled for the browser, accessibilityState for
// VoiceOver and TalkBack) and keeps read-only to editable={false} alone.

describe("textEntryState", () => {
  it("says disabled on the browser's channel and the native one", () => {
    expect(textEntryState({ disabled: true })).toEqual({ editable: false, accessibilityState: { disabled: true }, "aria-disabled": true });
  });

  it("omits aria-disabled while enabled, so an enabled field's markup is unchanged", () => {
    const state = textEntryState({});
    expect(state).toEqual({ editable: true, accessibilityState: { disabled: false }, "aria-disabled": undefined });
    expect(state["aria-disabled"]).toBeUndefined();
  });

  it("keeps read-only to editable={false}, never disabled", () => {
    expect(textEntryState({ readOnly: true })).toEqual({ editable: false, accessibilityState: { disabled: false }, "aria-disabled": undefined });
  });

  it("lets disabled win over read-only", () => {
    expect(textEntryState({ disabled: true, readOnly: true })).toEqual({ editable: false, accessibilityState: { disabled: true }, "aria-disabled": true });
  });
});
