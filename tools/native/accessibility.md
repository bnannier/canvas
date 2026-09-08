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
