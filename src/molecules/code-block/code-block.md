# Code Block

Preformatted code block with monospace font and padding.

## Usage

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
/>
```

## Variants

### Variant - terminal

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
  terminal
/>
```

### Variant - numbered

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
  numbered
/>
```

### Variant - inline

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
  inline
/>
```

### Copy button

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
  copy
/>
```

### Wrap long lines

```tsx
<CodeBlock
  code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
  filename="theme.ts"
  language="ts"
  wrap
/>
```

## Do & Don't

### Plain

**Do** — Use a pre element so whitespace, line breaks, and indentation survive verbatim.

```tsx
<CodeBlock code="const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");" />
```

**Don't** — A paragraph collapses the line breaks and indentation, so multi-line code reads as one run-on string.

```tsx
<View className="max-w-[360px]">
  <Text className="text-[13px]" style={{ fontFamily: "monospace" }}>const theme = getTheme(); setTheme(theme === "dark" ? "light" : "dark");</Text>
</View>
```

### Terminal

**Do** — Mark the prompt select-none so a copy yields only the command, not the shell glyph.

```tsx
<CodeBlock terminal code="npm install @olympusoss/canvas" />
```

**Don't** — Selectable prompt text means a reader who copies the line drags the $ marker into their shell.

```tsx
<View className="w-full self-start rounded-lg bg-zinc-900 p-4">
  <Text className="text-[13px] text-zinc-100" style={{ fontFamily: "monospace" }}>$ npm install @olympusoss/canvas</Text>
</View>
```

### Numbered

**Do** — Keep the gutter select-none so copying the block returns clean, runnable code.

```tsx
<CodeBlock numbered code="const theme = getTheme();\nsetTheme(theme);" />
```

**Don't** — Selectable line numbers get swept into the selection and pasted as 1 2 ahead of every line.

```tsx
<View className="w-full self-start flex-row rounded-lg border border-border bg-muted/50 p-4">
  <View className="mr-4 items-end">
    <Text className="text-sm leading-relaxed text-muted-foreground/50" style={{ fontFamily: "monospace" }}>1</Text>
    <Text className="text-sm leading-relaxed text-muted-foreground/50" style={{ fontFamily: "monospace" }}>2</Text>
  </View>
  <View className="flex-1">
    <Text className="text-sm leading-relaxed text-foreground" style={{ fontFamily: "monospace" }}>const theme = getTheme();</Text>
    <Text className="text-sm leading-relaxed text-foreground" style={{ fontFamily: "monospace" }}>setTheme(theme);</Text>
  </View>
</View>
```

### Inline

**Do** — Reserve inline code for short tokens; move anything multi-line into a block.

```tsx
<View className="max-w-[360px] gap-1.5">
  <Text className="text-sm leading-relaxed">Run the setup command:</Text>
  <CodeBlock code="npm install @olympusoss/canvas\nnpm run build" />
</View>
```

**Don't** — A long, multi-step command crammed inline wraps mid-token and offers no horizontal scroll.

```tsx
<View className="max-w-[360px] flex-row flex-wrap items-center">
  <Text className="text-sm leading-relaxed text-foreground">Run </Text>
  <View className="self-start rounded border border-border bg-muted px-1.5 py-0.5">
    <Text className="text-[13px] text-foreground" style={{ fontFamily: "monospace" }}>npm install @olympusoss/canvas && npm run build && npm run preview</Text>
  </View>
  <Text className="text-sm leading-relaxed text-foreground"> to start.</Text>
</View>
```
