# Wizard

Package: @nannier/canvas
Version: 4.4.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 35b0556b3cf4787d8b9cdf8a7e93b47c770a9726957905f5b8d3a812e5fea783

Source: `src/organisms/wizard/wizard.md`
Human reference: https://canvas.nannier.com/components/wizard

## Public imports

```tsx
import { Wizard } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A modal workflow with a fixed step sidebar, a title and status header, and footer actions around a bounded, scrolling body. The application owns stage content, validation, saving and transitions; Wizard composes the existing Dialog, Steps and Button controls.

Add `embedded` to show an open wizard in a page as a specimen, the way a catalogue
or a showcase does: it keeps its look, its dialog role and its labelling, but it is
not modal. It does not take focus, trap Tab, set `aria-modal`, or close on Escape or
native back, and it renders in place in the page's flow instead of presenting into an
`OverlayProvider`.

## Usage

`ViewportOverlay` is docs-only scaffolding that presents the example above the docs page. In an application, mount Wizard beneath the app-root OverlayProvider.

```tsx
<Stateful initial={false}>
  {(open, setOpen) => <Stateful initial={0}>
    {(current, setCurrent) => <Column>
      <Button outline onPress={() => { setCurrent(0); setOpen(true); }}>Open project setup</Button>
      <ViewportOverlay><Wizard open={open} onOpenChange={setOpen} title="Set up a project"
        description="Choose the basics, then review your project."
        steps={[{ label: "Details" }, { label: "Review" }]} current={current}
        previous={current > 0 ? { label: "Details", onPress: () => setCurrent(0) } : undefined}
        status={`Step ${current + 1} of 2`}
        actions={<Button primary onPress={() => current === 0 ? setCurrent(1) : setOpen(false)}>{current === 0 ? "Review project" : "Create project"}</Button>}>
        <Column roomy>
          <Typography h3>{current === 0 ? "Project details" : "Ready to create"}</Typography>
          {current === 0 ? <Input label="Project name" defaultValue="Customer portal" /> : <Typography body>Customer portal is ready to create.</Typography>}
        </Column>
      </Wizard></ViewportOverlay>
    </Column>}
  </Stateful>}
</Stateful>
```

## Variants

### Team invitation

The status sits beside the title, with the previous action at the footer's start and the
application actions at its end. Compact steps occupy the fixed sidebar. When the panel is narrower than 520 points (a phone), the steps move under the title as segmented bars and the body takes the full width, so content such as a Chat is never squeezed beside the rail.

```tsx
<Wizard open embedded onOpenChange={() => {}} title="Create workspace"
  steps={[{ label: "Name" }, { label: "Members" }, { label: "Theme" }, { label: "Review" }]}
  current={1} status="Step 2 of 4" previous={{ label: "Back", onPress: () => {} }}
  actions={<Button>Continue</Button>}>
  <Typography body medium natural>Invite your team</Typography>
  <Input compact placeholder="noor@nannier.com" accessibilityLabel="First teammate email" />
  <Input compact placeholder="liang@nannier.com" accessibilityLabel="Second teammate email" />
</Wizard>
```

### Assistant workspace

`assistant` lays the wizard out like a desktop assistant window: the steps as a full-height
sidebar of rows, a 44 point top bar with the title and the status, and `previous` and
`actions` in a bar under the conversation. The body is unpadded so an `assistant flush` Chat fills it; a scrolled body
centers its content in the conversation's column. Below 720 points of panel the sidebar
gives way to segmented steps under the title.

```tsx
<Wizard open embedded assistant onOpenChange={() => {}} title="Plan a project" scrollBody={false}
  steps={[{ label: "Plan project" }, { label: "Review project plan" }, { label: "Plan workforce" }]}
  current={0} status="Autosaved" actions={<Button small ghost>Reset</Button>}>
  <Chat assistant flush meta="Claude CLI" messages={[{ id: "welcome", role: "assistant", content: "What should your project achieve?" }]} value="" onChangeText={() => {}} onSend={() => {}} />
</Wizard>
```

### Child owns scrolling

Set `scrollBody={false}` for a bounded child such as Chat that already manages its own thread scroll. The header and footer retain their positions.

```tsx
<Stateful initial={false}>
  {(open, setOpen) => <Column>
    <Button outline onPress={() => setOpen(true)}>Open planning conversation</Button>
    <ViewportOverlay><Wizard open={open} onOpenChange={setOpen} title="Plan a project"
      steps={[{ label: "Details" }, { label: "Conversation" }, { label: "Review" }]} current={1}
      scrollBody={false} status="Saved" actions={<Button primary onPress={() => setOpen(false)}>Done</Button>}>
      <Chat messages={[{ id: "welcome", role: "assistant", content: "What should your project achieve?" }]} value="" onChangeText={() => {}} onSend={() => {}} />
    </Wizard></ViewportOverlay>
  </Column>}
</Stateful>
```

## Do & Don't

### Named backward navigation

**Do** — Name the previous stage so its destination is clear.

```tsx
<Wizard open embedded onOpenChange={() => {}} title="Project setup" steps={[{ label: "Details" }, { label: "Review" }]} current={1} previous={{ label: "Details", onPress: () => {} }} />
```

**Don't** — Hide the destination behind a generic label.

```tsx
<Wizard open embedded onOpenChange={() => {}} title="Project setup" steps={[{ label: "Details" }, { label: "Review" }]} current={1} previous={{ label: "Back", onPress: () => {} }} />
```

## Accessibility

Dialog supplies the accessible modal name, focus management, live close action, Escape and native back behavior. Embedded specimens keep the bare panel without a close action or modal focus ownership. The current sidebar stage carries `aria-current="step"`. The previous action carries its stage name; application actions provide their own labels and disabled states. Footer buttons stay on one row; use Button `shrink` on application actions so long labels wrap within their button rather than moving the operation to another row. A controlled `onOpenChange` lets the application decide whether a dismissal request can proceed.

## Supported props

### WizardProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | boolean | yes |  | Controlled modal visibility. |
| title | string | yes |  | Names the modal and its fixed header. |
| description | string \| undefined | no |  | Supporting text below the title. |
| steps | Step[] | yes |  | Ordered stages; the application owns their content and transitions. |
| current | number | yes |  | Zero-based active stage; earlier stages read as complete. |
| onOpenChange | (open: boolean) => void | yes |  | Called when the close action, Escape or native back requests dismissal. |
| panelWidth | number \| undefined | no | 620 | Maximum panel width; defaults to the hand-off's 620px and shrinks to its parent. |
| previous | { label: string; onPress: () => void; disabled?: boolean; } \| undefined | no |  | Named previous stage action at the footer's start. |
| actions | ReactNode | no |  | Application actions at the footer's end. |
| status | string \| undefined | no |  | Save/progress status beside the title in the fixed header. |
| children | ReactNode | no |  |  |
| scrollBody | boolean \| undefined | no | true | Scroll the body (default true). Set false when a child, such as Chat, owns its scroll. |
| embedded | boolean \| undefined | no | false | Show the open wizard as a non-modal specimen, for a catalogue or a showcase: it keeps its look, its dialog role and its labelling, but does not take focus, trap Tab, claim `aria-modal`, or close on Escape or native back. It renders in place, in the flow of the page, as Dialog's contained form does, rather than presenting into an OverlayProvider. |
| assistant | boolean \| undefined | no | false | Lay the wizard out like a desktop assistant's window (the Claude desktop window, reference claude-desktop-chat): the steps as sidebar rows down the panel's full height, a 44 px top bar with the title and the status, and `previous` and `actions` in a bar under the conversation. The body is unpadded so an `assistant flush` Chat fills it; a scrolled body centers its content in the conversation's column. The description is not drawn. |
| testID | string \| undefined | no |  | Prefix for modal, steps, body-scroll and footer test hooks. |

See [installation](https://canvas.nannier.com/ai/4.4.0/installation.md) for required peers and feature fallbacks.
