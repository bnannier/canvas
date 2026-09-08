# Spoken-feedback verification

Record this separately from native smoke, browser accessibility trees and Axe.
Those checks cannot prove what a screen reader announces or how its gestures move
focus. Never mark either platform passed from a skin screenshot or a Maestro run.

Use the same identified candidate as native smoke. Capture the diagnostics screen
first and record source revision, candidate revision, package version, package
SHA256, binary digest, device model, OS version, screen-reader version, locale,
date and reviewer. Enter these values into a copy of `accessibility-record.json`.
Record the words actually spoken and any unexpected focus movement.

For VoiceOver, use a physical iPhone with a properly signed candidate build and
VoiceOver enabled in Settings. The simulator cannot provide this verification;
Apple explicitly requires a device for
[VoiceOver testing](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app).
An unsigned simulator build cannot be installed on a physical phone. Device
signing and access are required inputs, not an automated pass.

For TalkBack, use a physical Android device or an emulator with a functioning
TalkBack service. Confirm its installed service and version before starting. If
TalkBack is absent, record `blocked` and the missing service; do not replace it
with an accessibility-tree readout. The Android guide describes
[screen-reader testing and speech output](https://developer.android.com/guide/topics/ui/accessibility/testing).
Restore the device's previous accessibility settings after verification.

Do not run Maestro, UIAutomator, or an accessibility hierarchy dump while TalkBack
is active. A second accessibility service can change the behavior being measured.
Use actual touch exploration, screen-reader navigation, double-tap activation,
screen recordings and the service's speech output. Ordinary touch tests run with
TalkBack off and remain a separate result.

Start each journey from a fresh fixture instance and record its initial counters.
Changing the documented disabled/scenario query resets that fixture. Do not count
a stale screen's selection or a successful menu dismissal as a new activation.

Run these journeys in light and dark appearance, using screen-reader gestures:

1. Open the Form fixture. Navigate to Name, Fruit and Save choice. Verify the
   editable role, label, helper text and disabled state. Enter `Ap`, navigate
   through suggestions, select Apricot and confirm selection is announced once.
   Confirm selection count is 1 and submit count remains 0. Activate Save choice and
   confirm submit count becomes 1. Clear the field and verify empty state. Lock
   fruit and verify it is announced as disabled and cannot be edited.
2. Open `testing/listbox`. Primary team starts with Backend selected. Explore the
   initially unselected Frontend row, verify its own label, detail and focus bounds,
   then double-tap. Confirm Frontend is selected and both single Changes and Picks
   become 1. In Project teams, explore the initially unchecked Frontend row and
   activate it. Confirm its checked state and both multi counters become 1.
   Navigate away and back, deactivate it, then confirm unchecked and both counters
   become 2. Each full row must have one interactive stop, without a separate
   decorative checkbox. Open `testing/listbox?disabled=true`, try both Frontend
   rows, and confirm Backend remains selected, Project teams remains unchecked
   and all four counters remain 0.
3. Open `testing/escape-layers?scenario=drawer`, then Open drawer and Open menu.
   Verify focus enters the native modal and background controls are not exposed
   as active modal content. Explore the second row, Archive, at its painted
   position above the Alice editor. Its own bounds and menu-item name must receive
   focus, not the underlying Alice editor. Double-tap and confirm Selected:
   Archive, Selections: 1, menu closed and Drawer content still present. Record
   where accessibility focus returns. Reopen and dismiss only the child using the
   platform dismissal gesture/back action; the Drawer must remain open. Open
   `testing/escape-layers?scenario=drawer-disabled`, reopen the Drawer/menu and
   attempt Archive. It must not select or close the menu. Dismiss the child, then
   confirm Selected: None and Selections: 0. Dismiss the Drawer and record return
   focus to its external trigger.
4. Open `testing/tabs`. Overview starts selected. Explore inactive Activity and
   verify its own tab role, name, unselected state and focus bounds. Double-tap,
   confirm selected Activity and Changes: 1, then attempt Unavailable. Activity
   and the count must remain unchanged. Open `testing/tabs?disabled=true`, attempt
   Activity, and confirm Overview remains selected with Changes: 0.
5. Open a fresh `testing/control-refs` fixture. Daily starts checked, Weekly
   unchecked, and Changes: 0. Explore Weekly, confirm its own radio name and
   focus bounds, then double-tap. Weekly becomes checked and Changes becomes 1.
   Activate Disable controls, attempt Daily, then confirm Weekly remains checked
   and Changes remains 1. Activate Enable controls and Daily; Daily becomes
   checked and Changes becomes 2. Avoid the other controls during this journey,
   because they share the change counter.
6. Repeat with large system text and ensure controls remain reachable by forward
   and backward navigation. Record clipped labels, missing state announcements,
   focus escapes and duplicate announcements as failures, with a reproduction.

## iOS accessibility escape ownership

On the identified physical VoiceOver device, run these checks in both appearances.
Use the actual two-finger scrub gesture, not a simulated JavaScript event. Record
the focused target, visible state, callback counters and resulting announcement.

1. In `testing/escape-layers?scenario=drawer`, open the drawer and child menu.
   Focus Archive and scrub once. Only the menu should close, without selecting;
   scrub again from Drawer content to request the parent close. Repeat with
   `drawer-disabled`: disabled Archive still permits cancellation. Verify nested
   drawers on the Drawer docs page, with the inner drawer closing first.
2. In the same drawer scenario, open the child ActionSheet and scrub. No action
   should run; the drawer should remain. Repeat for the standalone sheet in
   `testing/escape-layers?scenario=glass-messages`, and cancel its built-in Dialog.
   Record the actual glass or accessibility-degraded material being exercised.
3. Open `testing/escape-layers?scenario=alert-gated`, activate Open gated alert
   and enter an incomplete confirmation token. Delete draft must stay disabled.
   Scrub to cancel, then verify Cancellations: 1, Confirmations: 0 and Closes: 1.
   Reopen and verify the confirmation field is empty and confirm remains disabled.
4. With an explicitly controlled owner that keeps its child open, make two
   distinct escape requests. Each must request child cancellation once; neither
   may dismiss or confirm the parent. Record the owner's actual policy and
   callbacks, not just the painted state.

Source and host-event tests establish the intended ownership and callback policy.
Simulator accessibility hierarchies do not establish this gesture or spoken focus
return. If physical access or signing is missing, retain these checks as pending.
Android system back and browser keyboard Escape are separate input paths; report
their observations separately. Sidebar drill-down navigation also owns a separate
back action, whereas accessibility escape dismisses its containing overlay.

## Autocomplete accessibility-focus return

Run these additional journeys in both appearances on the identified candidate.
Activate options through TalkBack or VoiceOver, not an ordinary tap or a Maestro
command. Record accessibility focus separately from editing focus: the painted
focus highlight and announced target establish the former; the caret, visible
soft keyboard and typing without refocusing establish the latter. A composed
speech-display screenshot records displayed text, not audio heard by a reviewer.

1. Open `testing/form-autocomplete?scenario=keyboard`. Focus Fruit, enter `Ap`
   using the soft keyboard, and touch-explore the painted Pineapple row. Confirm
   its own name and focus bounds before double-tapping once. The suggestions must
   close, Fruit must contain Pineapple, selection and value-change counts must
   each be 1, and submit count must remain 0. Observe accessibility focus return
   to the same Fruit input, with its own highlight and announced identity rather
   than the page heading or an underlying control. Confirm the keyboard and
   editing focus remain, then type `s` without tapping or refocusing the input;
   its text must become `Pineapples`, with no additional selection or submission.
2. Open `testing/form-autocomplete?scenario=modal-keyboard`, activate Open fruit
   drawer, and repeat `Ap` to Pineapple through the screen reader. Confirm the
   child suggestions close while the Drawer remains open. Accessibility focus
   must return to the same Drawer fruit input inside the native modal, with its
   own highlight and announced identity. Confirm the keyboard remains and type
   `s` without refocusing to obtain `Pineapples`. This Drawer fixture has no
   selection counters; record its actual field value and focus evidence instead.
3. Open `testing/form-autocomplete?scenario=accessibility-kept-open`. Activate
   Open retained suggestions, focus Accessible fruit and type `Ap`. Explore and
   double-tap Pineapple once. Confirm Selected: Pineapple, Selections: 1, Value
   changes: 1 and Submits: 0 while the suggestions remain open. The selection
   must not force accessibility focus to the input. Use screen-reader navigation
   to move accessibility focus to Close retained suggestions, then activate it.
   Confirm the menu closes and counters remain unchanged, without a delayed
   return to Accessible fruit reclaiming focus from that button. Record the
   actual focus destination and announcement throughout selection and closure.
4. Open `testing/form-autocomplete?scenario=accessibility-destination`. Focus
   Accessible fruit, type `Ap`, explore Pineapple and double-tap once. Confirm
   Selected: Pineapple, Selections: 1, Value changes: 1, Submits: 0 and
   Destination mounted. The original input and suggestions must be removed;
   the owner's Next destination input must receive editing focus through its
   autofocus behavior. Record accessibility focus separately, without assuming
   autofocus also moves it. Type into Next destination without refocusing and
   navigate with the screen reader. No stale request may reclaim focus for the
   removed Accessible fruit input.

The implementation observes React suggestion-subtree removal, not a native
mount-completion or screen-reader acknowledgement. Verify the positive return
after real typing as well as both cancellation cases on the actual runtime.
Native TextInput can reassign a callback ref to the same host after a text event;
such a detach conservatively cancels a pending return. A controlled value change
alone is not that text-event signal. Do not infer a successful return from unit
tests or editing focus alone, and keep ordinary-touch results separate.

For each disabled case, record the actual disabled announcement and exposure of
the control or its group, inert attempted activation, selected/checked state and
unchanged counters. An OS can skip disabled items in sequential navigation or
expose them differently from touch exploration. Do not require identical focus
order or wording across platforms. Missing observation is not a pass; record what
was reachable and what remains unverified. For enabled inactive controls, a label
in a tree or a counter alone is insufficient: the painted target's focus bounds,
spoken identity and double-tap result must agree.

A pass requires observed results for every step. Any missing device, signing
identity or screen-reader service remains an explicit external limitation. Keep
audio/video or accessibility inspector evidence where possible, with no personal
data entered into the sample app.


For glass visual evidence, open `testing/escape-layers?scenario=glass-messages`
on the identified candidate in both light and dark appearance. The scenario uses
forced glass with the inherited scheme and the containing Screen's plain backdrop.
Open the built-in Dialog and capture its description, currency prefix, Amount and
Reason fields; close it, then open the ActionSheet and capture its title/message.
Inspect the actual material, text contrast and clipping in the screenshots, and
compare the declared foreground color with the painted adjacent backdrop for
contrast measurements. Cross-check glyph interiors, without substituting
antialiased edge samples for the foreground color.
The canonical flow captures both surfaces with ordinary taps. Visibility assertions
and source tint-over-scrim calculations do not prove native pixel contrast or
spoken feedback; keep those acceptance results separate.
