# Code Block

Preformatted code block with monospace font and padding.

## Usage

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
/>
```

## Variants

### Variant - terminal

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
  terminal
/>
```

### Variant - numbered

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
  numbered
/>
```

### Variant - inline

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
  inline
/>
```

### Copy button

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
  copy
/>
```

### Wrap long lines

```tsx
<CodeBlock
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  filename="theme.ts"
  language="ts"
  wrap
/>
```

## Do & Don't

### Plain

**Do** — Use a pre element so whitespace, line breaks, and indentation survive verbatim.

```tsx
<CodeBlock code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`} />
```

**Don't** — A paragraph collapses the line breaks and indentation, so multi-line code reads as one run-on string.

```tsx
<View style={{ maxWidth: 360 }}>
  <Text style={{ fontSize: 13, fontFamily: "monospace" }}>const theme = getTheme(); setTheme(theme === "dark" ? "light" : "dark");</Text>
</View>
```

### Terminal

**Do** — Mark the prompt select-none so a copy yields only the command, not the shell glyph.

```tsx
<CodeBlock terminal code="npm install @olympusoss/canvas" />
```

**Don't** — Selectable prompt text means a reader who copies the line drags the $ marker into their shell.

```tsx
<View style={{ width: "100%", alignSelf: "flex-start", borderRadius: 8, backgroundColor: palette["zinc-900"], padding: 16 }}>
  <Text style={{ fontSize: 13, color: palette["zinc-100"], fontFamily: "monospace" }}>$ npm install @olympusoss/canvas</Text>
</View>
```

### Numbered

**Do** — Keep the gutter select-none so copying the block returns clean, runnable code.

```tsx
<CodeBlock numbered code={`const theme = getTheme();
setTheme(theme);`} />
```

**Don't** — Selectable line numbers get swept into the selection and pasted as 1 2 ahead of every line.

```tsx
<View style={{ width: "100%", alignSelf: "flex-start", flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.5), padding: 16 }}>
  <View style={{ marginRight: 16, alignItems: "flex-end" }}>
    <Text style={{ fontSize: 14, lineHeight: 28, color: alpha(tokens["muted-foreground"], 0.5), fontFamily: "monospace" }}>1</Text>
    <Text style={{ fontSize: 14, lineHeight: 28, color: alpha(tokens["muted-foreground"], 0.5), fontFamily: "monospace" }}>2</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground, fontFamily: "monospace" }}>const theme = getTheme();</Text>
    <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground, fontFamily: "monospace" }}>setTheme(theme);</Text>
  </View>
</View>
```

### Inline

**Do** — Reserve inline code for short tokens; move anything multi-line into a block.

```tsx
<View style={{ maxWidth: 360, gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 28 }}>Run the setup command:</Text>
  <CodeBlock code={`npm install @olympusoss/canvas
npm run build`} />
</View>
```

**Don't** — A long, multi-step command crammed inline wraps mid-token and offers no horizontal scroll.

```tsx
<View style={{ maxWidth: 360, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
  <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground }}>Run </Text>
  <View style={{ alignSelf: "flex-start", borderRadius: 4, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.muted, paddingHorizontal: 6, paddingVertical: 2 }}>
    <Text style={{ fontSize: 13, color: tokens.foreground, fontFamily: "monospace" }}>npm install @olympusoss/canvas && npm run build && npm run preview</Text>
  </View>
  <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground }}> to start.</Text>
</View>
```
