```tsx
import { View, Text, useTheme } from "@olympusoss/canvas";

// Build your own components the way Canvas does: raw RN View/Text styled with a
// style object built from the tokens, with flat boolean props for each style
// choice (not string enums).
interface CalloutProps {
  children: React.ReactNode;
  /** Emphasised, filled style. */
  primary?: boolean;
}

export function Callout({ children, primary }: CalloutProps) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 16, backgroundColor: primary ? tokens.primary : tokens.card }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: primary ? tokens["primary-foreground"] : tokens.foreground }}>
        {children}
      </Text>
    </View>
  );
}
```
