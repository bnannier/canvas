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

Run these journeys in light and dark appearance, using screen-reader gestures:

1. Open the Form fixture. Navigate to Name, Fruit and Save choice. Verify the
   editable role, label, helper text and disabled state. Enter `Ap`, navigate
   through suggestions, select Apricot and confirm selection is announced once.
   Confirm selection count is 1 and submit count remains 0. Activate Save choice and
   confirm submit count becomes 1. Clear the field and verify empty state. Lock
   fruit and verify it is announced as disabled and cannot be edited.
2. Open Listbox. Verify Primary team has a name and selected option; Project teams
   exposes named checkboxes with checked/unchecked states. Activate the full
   Frontend row, confirm one state announcement and one change. Navigate away and
   back, then deactivate it and confirm the unchecked state. Decorative checkbox
   artwork must not add a second interactive stop inside a row.
3. Open the Drawer fixture and its child menu. Verify focus enters the native
   modal, background controls are not exposed as active modal content, and menu
   items have useful names and roles. Select an item and confirm focus returns to
   the trigger. Open it again, dismiss the child using the platform dismissal
   gesture/back action, and confirm the Drawer remains open. Dismiss the Drawer
   and confirm focus returns to its external trigger.
4. Repeat with large system text and ensure controls remain reachable by forward
   and backward navigation. Record clipped labels, missing state announcements,
   focus escapes and duplicate announcements as failures, with a reproduction.

A pass requires observed results for every step. Any missing device, signing
identity or screen-reader service remains an explicit external limitation. Keep
audio/video or accessibility inspector evidence where possible, with no personal
data entered into the sample app.
