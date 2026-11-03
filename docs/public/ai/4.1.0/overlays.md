# Overlay hosting

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Mount an `OverlayProvider` inside `ThemeProvider`, outside scrolling page content,
and let it fill the app window. Dropdowns, selects, autocompletes and popovers then
share measured viewport bounds, move above their triggers when needed, and scroll
long content within the available height. Opening a hosted menu preserves the
trigger's native view hierarchy and focus.

Nested providers can scope where cards are placed without restricting them to the
height of a short form. They inherit the root's visible bounds. A card that closes
on an outside tap still paints in the window's outermost provider, at the place
its nearest provider gives it, so a tap anywhere off it closes it, and the page
under it takes no touches until it closes. Use
`<OverlayProvider viewport>` for a deliberately bounded nested panel, whose size
must come from its viewport rather than its content.

Inside a custom React Native `Modal`, wrap the content in `GlassModalBlurTarget`,
then `<OverlayProvider separateWindow>`, in that order:

```jsx
<Modal visible={open} transparent onRequestClose={onClose} accessibilityViewIsModal>
  <GlassModalBlurTarget>
    <OverlayProvider separateWindow>{content}</OverlayProvider>
  </GlassModalBlurTarget>
</Modal>
```

The `separateWindow` provider gives the Modal's own cards a host in its window: its
measurements must not inherit bounds from a different native window, and without
it a card that closes on an outside tap paints in the main window's outermost
provider, behind the `Modal`. `GlassModalBlurTarget` hands the Modal's glass the
root provider's page on Android, so it frosts the page behind the Modal (see
Theming below); it renders no view and does nothing on iOS and the web. It belongs
only inside a `Modal`: in the main window, a react-native-screens or expo-router
modal screen included, its surfaces keep their solid skin. Canvas `Drawer` supplies
both automatically, and `ActionSheet` its bridge.

When page content scrolls under a header, declare the header's measured height as
`viewportInsets={{ top: headerHeight }}` on the root or a nested `viewport` host.
The optional `bottom` inset similarly reserves an overlapping footer. Insets are
relative to that host's own box and are intersected with the keyboard boundary;
changing them updates open cards without remounting their content.

Android keyboard avoidance supports full-screen edge-to-edge windows through
native keyboard events, and legacy resize-mode windows through their measured
root bounds. Legacy pan/nothing modes and multi-window coordinates are not
supported. iOS uses the keyboard frame; at the RN 0.74 support floor,
this requires a full-screen window because that RN version reports screen
coordinates. Current RN converts the frame to window coordinates. Web fitting
uses the layout viewport; RNW does not expose the mobile keyboard's visual
viewport. Clipping ancestors that are not viewport hosts do not contribute
additional bounds. With no provider, the legacy inline overlay remains available,
but has no viewport fitting or outside-tap backdrop.

## Dialog trigger focus

Keep the trigger mounted and focusable while the dialog opens so the focus manager can capture the return target. Avoid disabling that trigger on the same render that sets `open`; use the modal backdrop and focus isolation to prevent background interaction. On close, return focus to the trigger.

Component behavior and controlled/uncontrolled props: [Dialog](https://canvas.nannier.com/ai/4.1.0/components/dialog.md), [Popover](https://canvas.nannier.com/ai/4.1.0/components/popover.md), [Select](https://canvas.nannier.com/ai/4.1.0/components/select.md).
