# Breadcrumbs

Hierarchical navigation showing where you are.

## Usage

```tsx
<Breadcrumb
  items={["Projects", "Identity Platform", "Settings", "Profile"]}
  chevron
/>
```

## Do & Don't

### Current page

**Do** — Ancestors are links; the page you're on is plain text at the end of the trail.

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — Linking the current page implies there's somewhere to go; it's a dead link to itself.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Identity Platform</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Settings</Text>
  </Pressable>
</View>
```

### Deep paths

**Do** — Collapse the middle to an ellipsis; keep the root and the last couple of levels.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">›</Text>
  <Text className="text-sm text-muted-foreground px-1">…</Text>
  <Text className="text-sm text-muted-foreground/60">›</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Avatar</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">›</Text>
  <Text className="text-sm font-medium text-foreground">Edit</Text>
</View>
```

**Don't** — A fully expanded deep path wraps and competes with the page.

```tsx
<Breadcrumb items={[
    "Projects",
    "Identity Platform",
    "Settings",
    "Profile",
    "Avatar",
    "Edit"
  ]} />
```

### Separator

**Do** — Pick one separator and use it the whole way.

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — Mixing separators in one trail looks broken.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Identity Platform</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">›</Text>
  <Text className="text-sm font-medium text-foreground">Settings</Text>
</View>
```

### Home root

**Do** — Give the home icon an aria-label so the root is announced.

```tsx
<Breadcrumb homeIcon items={["Settings"]} />
```

**Don't** — An icon-only root with no label is unclear to screen readers.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link" className="active:opacity-70">
    <Icon home muted size={14} />
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Text className="text-sm font-medium text-foreground">Settings</Text>
</View>
```

### Chevron

**Do** — Point the chevron in the reading direction (right in LTR) so each one means 'drill into the next level'.

```tsx
<Breadcrumb chevron items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A down (or back) chevron reads as a dropdown or a back affordance, not progression down the hierarchy.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">⌄</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Identity Platform</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">⌄</Text>
  <Text className="text-sm font-medium text-foreground">Settings</Text>
</View>
```

### Slash

**Do** — Keep the slash muted and lighter than the text so it reads as a quiet path divider.

```tsx
<Breadcrumb slash items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A full-weight, foreground slash competes with the labels and can read as part of a link.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm font-medium text-foreground px-1">/</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Identity Platform</Text>
  </Pressable>
  <Text className="text-sm font-medium text-foreground px-1">/</Text>
  <Text className="text-sm font-medium text-foreground">Settings</Text>
</View>
```

### Dot

**Do** — Use a centered middot (·) so the dot sits between the crumbs and clearly divides them.

```tsx
<Breadcrumb dot items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A baseline period looks like a typo or end-of-sentence, not a separator between crumbs.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Projects</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">.</Text>
  <Pressable accessibilityRole="link">
    <Text className="text-sm text-muted-foreground active:opacity-70">Identity Platform</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">.</Text>
  <Text className="text-sm font-medium text-foreground">Settings</Text>
</View>
```
