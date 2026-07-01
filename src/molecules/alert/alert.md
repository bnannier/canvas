# Alerts

Inline notification banners: info, success, warning, and error, plus a full-width announcement bar. For a blocking confirmation prompt, see Alert Dialog.

## Usage

```tsx
<Alert
  info
  icon="ℹ"
  title="Heads up"
  description="Maintenance window scheduled for Sunday 2:00 UTC."
  dismissible
  actions={<Button link small>Learn more</Button>}
/>
```

## Variants

### Variant - success

```tsx
<Alert
  success
  icon="✓"
  title="All set"
  description="Your changes have been saved successfully."
  dismissible
  actions={<Button ghost small>View changes</Button>}
/>
```

### Variant - warning

```tsx
<Alert
  warning
  icon="⚠"
  title="Action required"
  description="Your trial expires in 3 days."
  dismissible
  actions={<Button primary small>Upgrade plan</Button>}
/>
```

### Variant - destructive

```tsx
<Alert
  error
  icon="✕"
  title="Something went wrong"
  description="Could not save your changes. Please try again."
  dismissible
  actions={<Button primary small>Retry</Button>}
/>
```

## Do & Don't

### info

**Do** — Reserve info for passive, non-urgent context (notices, tips); escalate to warning or destructive when action is required.

```tsx
<Alert info icon="ℹ" title="Heads up" description="Maintenance window scheduled for Sunday 2:00 UTC." />
```

**Don't** — Dressing an act-now message in the neutral info tone hides the urgency; users skim past it like an FYI.

```tsx
<Alert info icon="ℹ" title="Trial expires today" description="Upgrade now or you'll lose access to your projects." />
```

### success

**Do** — Make confirmations transient: auto-dismiss or give a Dismiss control so the success state clears once acknowledged.

```tsx
<Alert
  success
  icon="✓"
  title="Saved"
  description="Your changes have been saved successfully."
  actions={<Button ghost small>Dismiss</Button>}
/>
```

**Don't** — A success banner pinned with no way to dismiss it lingers as visual noise long after the action is done.

```tsx
<Alert success icon="✓" title="Saved" description="Your changes have been saved successfully." />
```

### warning

**Do** — State the consequence, the deadline, and the action: name what's wrong and give a button to resolve it.

```tsx
<Alert
  warning
  icon="⚠"
  title="Action required"
  description="Your trial expires in 3 days. Upgrade to keep your projects."
  actions={<Button primary small>Upgrade plan</Button>}
/>
```

**Don't** — A warning with no specifics or next step leaves the user guessing what to fix and by when.

```tsx
<Alert warning icon="⚠" title="Action required" description="Something needs your attention." />
```

### destructive

**Do** — Match the variant to the severity: reserve destructive for genuine failures, success for confirmations.

```tsx
<Alert error icon="✕" title="Something went wrong" description="Could not save your changes. Please try again." />
```

**Don't** — Using the destructive variant for non-errors cries wolf; users learn to tune out red and miss real failures.

```tsx
<Alert error icon="✕" title="Saved" description="Your changes have been saved successfully." />
```
