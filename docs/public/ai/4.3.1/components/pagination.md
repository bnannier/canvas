# Pagination

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 675fbe581e8b4ad6486d40d1b26a76d0ab3c2910cab444fa77edd63dd809f77b

Source: `src/atoms/pagination/pagination.md`
Human reference: https://canvas.nannier.com/components/pagination

## Public imports

```tsx
import { Pagination } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Page-of-N navigation for tables and lists.

Neither iOS nor Android has a numbered pagination control, so every platform shows the
same pager:
rounded hairline cells at 28, 34 or 40 (small, default, large), the page
numbers in 13px mono numerals, and the current page in the accent fill with a soft glow
beneath it. Previous and Next carry a chevron and a "Prev" / "Next" label beside the
numbers (the chevron alone at the small size and in the compact row), the truncation gap
is a quiet text ellipsis (…), and the rows-per-page trigger sits on the field edge. A resting page
or arrow takes the hover wash at once; a disabled pager dims as one, and in an enabled
pager the arrow at either end dims on its own.

In glass mode the current page is a brand-tinted control-layer puck behind its number;
the other pages and the hairline arrows paint no surface, so they stay bare. Beyond
seven pages a page change also shifts the window (an ellipsis moves, a number appears or
drops out). Solid mode keeps the accent fill.

## Usage

```tsx
<Pagination defaultPage={2} total={12} />
```

## Variants

### With item range

```tsx
<Pagination compact defaultPage={2} total={12} itemCount={118} />
```

### With size

```tsx
<Pagination defaultPage={2} total={12} withSize defaultPageSize={10} pageSizes={[10, 25, 50]} />
```

### Sizes

```tsx
<Column relaxed>
  <Pagination small defaultPage={2} total={12} />
  <Pagination defaultPage={2} total={12} />
  <Pagination large defaultPage={2} total={12} />
</Column>
```

### First and last page

```tsx
<Column relaxed>
  <Pagination defaultPage={1} total={3} />
  <Pagination defaultPage={3} total={3} />
</Column>
```

## Do & Don't

### compact

**Do** — Pass `itemCount` so the buttons carry a "Showing X-Y of N" range and position and total are always visible.

```tsx
<Pagination compact defaultPage={2} total={12} itemCount={118} />
```

**Don't** — Bare Previous/Next with no range label leaves the user unable to tell where they are or how much is left.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
  <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Previous page">
    <Icon chevronLeft size={16} />
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Next page">
    <Icon chevronRight size={16} />
  </Pressable>
</View>
```

### numbered

**Do** — Truncate the middle with an ellipsis; keep first, last, and a window around the current page.

```tsx
<Pagination defaultPage={2} total={12} />
```

**Don't** — Rendering every page number overflows and stops being scannable past a handful.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Previous page">
    <Icon chevronLeft muted size={16} />
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: tokens.primary }} accessibilityRole="button" accessibilityLabel="Page 1">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens["primary-foreground"] }}>1</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 2">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>2</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 3">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>3</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 4">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>4</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 5">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>5</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 6">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>6</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 7">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>7</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 8">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>8</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 9">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>9</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 10">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>10</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 11">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>11</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 9999 }} accessibilityRole="button" accessibilityLabel="Page 12">
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>12</Text>
  </Pressable>
  <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Next page">
    <Icon chevronRight size={16} />
  </Pressable>
</View>
```

### with-size

**Do** — Show "Page X of N" beside the size selector and reset to page 1 when the size changes.

```tsx
<Pagination withSize defaultPage={2} total={12} defaultPageSize={10} pageSizes={[10, 25, 50]} />
```

**Don't** — Offering a page-size selector without a page indicator hides which page the new size landed on.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] }}>Rows per page</Text>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Rows per page">
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "700", color: tokens.foreground }}>10</Text>
      <Icon chevronDown muted size={16} />
    </Pressable>
  </View>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
    <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Previous page">
      <Icon chevronLeft muted size={16} />
    </Pressable>
    <Pressable style={{ alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border }} accessibilityRole="button" accessibilityLabel="Next page">
      <Icon chevronRight size={16} />
    </Pressable>
  </View>
</View>
```

## Supported props

### PaginationProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| page | number \| undefined | no |  | Current page, 1-based (CONTROLLED). Clamped into the 1..total range before rendering. Omit for uncontrolled use. |
| defaultPage | number \| undefined | no |  | Initial page for uncontrolled use (a bare pagination navigates on press). |
| total | number \| undefined | no |  | Total number of pages. |
| onChange | ((page: number) => void) \| undefined | no |  | Fired with the next 1-based page when a control or number is pressed. |
| itemCount | number \| undefined | no |  | Total number of items across all pages. When set, the compact and with-size indicator reads "Showing X-Y of N" (the item range on the current page) instead of "Page X of N", computed from the current page and the page size. |
| compact | boolean \| undefined | no | false | Collapse to Prev/Next plus a "Page X of N" label, no number buttons. |
| withSize | boolean \| undefined | no | false | Prepend a "Rows per page" size selector to the compact Prev/Next + "Page X of N" layout. Takes precedence over `compact`. |
| pageSize | number \| undefined | no |  | Currently selected rows-per-page value shown in the selector (CONTROLLED). Omit for uncontrolled use. |
| defaultPageSize | number \| undefined | no |  | Initial rows-per-page value for uncontrolled use (the selector cycles on press). |
| pageSizes | number[] \| undefined | no |  | Selectable rows-per-page values; pressing the selector advances through them. |
| onPageSizeChange | ((size: number) => void) \| undefined | no |  | Fired with the next rows-per-page value when the selector is pressed. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium size). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium size). |
| disabled | boolean \| undefined | no | false | Size (pick one; default is the medium size). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
