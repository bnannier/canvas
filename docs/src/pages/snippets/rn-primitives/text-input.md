```tsx
import { TextInput, useTheme } from "@olympusoss/canvas";

// Low-level primitive: no focus border and no react-native-web outline reset.
// Prefer the Input / Textarea COMPONENTS for real form fields. RN does not take
// the placeholder color through style, so pass placeholderTextColor directly.
function PinField() {
  const { tokens } = useTheme();
  return (
    <TextInput
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
      placeholder="000000"
      placeholderTextColor={tokens["muted-foreground"]}
      keyboardType="number-pad"
    />
  );
}
```
