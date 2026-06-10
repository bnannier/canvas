```tsx
import { TextInput, useTheme } from "@olympusoss/canvas";

// Low-level primitive: no focus border and no react-native-web outline reset.
// Prefer the Input / Textarea COMPONENTS for real form fields. RN does not take
// the placeholder color through style, so pass placeholderTextColor directly.
function PinField() {
  const { tokens } = useTheme();
  return (
    <TextInput
      style={{
        width: "100%",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: tokens.input,
        backgroundColor: tokens.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: tokens.foreground,
      }}
      placeholder="000000"
      placeholderTextColor={tokens["muted-foreground"]}
      keyboardType="number-pad"
    />
  );
}
```
