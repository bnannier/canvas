# AppFrame

The app's root frame and its scrolling screens. `AppFrame` mounts the safe-area context and the app-root overlay host, pads all four safe-area edges over the theme background, renders the app's top chrome in a banner region and lets its body (a router's Stack) fill the height left. `Page` is one screen inside it: the main region, a scroller with page gutters whose content is capped and centered at a step of the width scale.

Mount `AppFrame` once, inside `ThemeProvider`, at the root of the app. It is the app-root `OverlayProvider` itself, so menus, sheets and toasts render above the whole window and keep clear of the status bar, the Dynamic Island and the home indicator; do not mount a second root host around it. The safe-area context comes from `react-native-safe-area-context` when the app installs it (Expo Router apps already do); without it the frame keeps its layout and the insets resolve to 0.

Each screen renders a `Page`. Its content stacks at the loose rhythm and is capped at `widest` (1152) by default, the reading width of an app page on a desktop window; below the cap it fills the window between its gutters, which is all a phone is. A measure step (`xxxs` through `page`) narrows or widens it, `start` pins it to the leading edge, and `fluid` removes the cap. The page is also an overlay host of its own, so an anchored menu opened in it is framed by the page.

## Usage

The examples below render the frame inside the docs stage, where its parent is the stage instead of the window: the header, the body and the page measure behave as they do at an app's root, and the safe-area insets are 0.

```tsx
<AppFrame header={<Navbar bordered brand="Acme" links={["Overview", "Reports"]} />}>
  <Page>
    <Typography h2>Overview</Typography>
    <Card title="Revenue" description="$48,250 this week" />
  </Page>
</AppFrame>
```

## Variants

### Narrower measure

A form or a settings screen reads better at a narrower step; the page centers it.

```tsx
<AppFrame header={<Navbar bordered brand="Acme" />}>
  <Page md>
    <Typography h2>Profile</Typography>
    <Input label="Display name" defaultValue="Rachel Chen" />
    <Button primary>Save</Button>
  </Page>
</AppFrame>
```

### Pinned to the start

```tsx
<AppFrame header={<Navbar bordered brand="Acme" />}>
  <Page md start>
    <Typography h2>Notifications</Typography>
    <Switch defaultChecked description="A daily summary of your projects.">Email digest</Switch>
  </Page>
</AppFrame>
```

### Overlays in an enclosing viewport host

A screen whose modals must center in the visible viewport, not in the page's full scrolled content, wraps the page in a viewport-measured `OverlayProvider` and passes `inheritOverlays`, so the page is a plain content box and its overlays go to that host.

```tsx
<OverlayProvider viewport>
  <Page inheritOverlays>
    <Typography h2>Billing</Typography>
    <Select label="Plan" options={["Starter", "Team", "Enterprise"]} />
  </Page>
</OverlayProvider>
```

## Do & Don't

### The page measure

**Do**: Name the measure with a step on the page; the content fills it and centers.

```tsx
<Page md>
  <Typography h2>Profile</Typography>
  <Input label="Display name" />
</Page>
```

**Don't**: Hand-roll the scroller and cap a raw View with a number of your own; the width drifts off the shared scale and the page loses its main region and overlay host.

```tsx
<ScrollView style={{ flex: 1 }}>
  <View style={{ width: "100%", maxWidth: 1120, alignSelf: "center", padding: 24 }}>
    <Typography h2>Profile</Typography>
    <Input label="Display name" />
  </View>
</ScrollView>
```

### The app frame

**Do**: Let AppFrame own the safe area, the background and the banner region.

```tsx
<AppFrame header={<Navbar bordered brand="Acme" />}>
  <Page>
    <Typography h2>Overview</Typography>
  </Page>
</AppFrame>
```

**Don't**: Paint the background and wrap the header by hand; the insets, the overlay host and the banner role are each one more thing every app gets wrong.

```tsx
<View style={{ flex: 1, backgroundColor: tokens.background }}>
  <Navbar bordered brand="Acme" />
  <Page>
    <Typography h2>Overview</Typography>
  </Page>
</View>
```

## Accessibility

The header renders inside a `role="banner"` region and each Page is the screen's `role="main"` region, so assistive technology can jump between the app's chrome and its content. The page scroller keeps taps on its controls while the software keyboard is up (`keyboardShouldPersistTaps="handled"`), so a field's submit button works on the first tap. The frame adds no focus stops of its own.
