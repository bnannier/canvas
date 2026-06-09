```tsx
import { View, Text, cn } from "@olympusoss/canvas";

// Build your own components on the engine primitives the same way Canvas does:
// a className-driven View/Text/Pressable/Image/TextInput/ScrollView, with flat boolean
// props for each style choice (not string enums).
interface CalloutProps {
  children: React.ReactNode;
  /** Emphasised, filled style. */
  primary?: boolean;
}

export function Callout({ children, primary }: CalloutProps) {
  return (
    <View className={cn("rounded-md border border-border p-4", primary ? "bg-primary" : "bg-card")}>
      <Text className={cn("text-sm", primary ? "text-primary-foreground" : "text-foreground")}>
        {children}
      </Text>
    </View>
  );
}
```
