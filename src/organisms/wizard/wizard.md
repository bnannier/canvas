# Wizard

A modal workflow with fixed step navigation and footer actions around a bounded, scrolling body. The application owns stage content, validation, saving and transitions; Wizard composes the existing Dialog, Steps and Button controls.

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
<Wizard open={false} onOpenChange={() => {}} title="Project setup" steps={[{ label: "Details" }, { label: "Review" }]} current={1} previous={{ label: "Details", onPress: () => {} }} />
```

**Don't** — Hide the destination behind a generic label.

```tsx
<Wizard open={false} onOpenChange={() => {}} title="Project setup" steps={[{ label: "Details" }, { label: "Review" }]} current={1} previous={{ label: "Back", onPress: () => {} }} />
```

## Accessibility

Dialog supplies the accessible modal name, focus management, close action, Escape and native back behavior. The previous action carries its stage name; application actions provide their own labels and disabled states. Footer buttons stay on one row. At narrow widths the centered status moves above them; use Button `shrink` on application actions so long labels wrap within their button rather than moving the operation to another row. A controlled `onOpenChange` lets the application decide whether a dismissal request can proceed.
