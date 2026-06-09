```tsx
import { ScrollView, View, Text } from "@olympusoss/canvas";

// className styles the FRAME (give it a bounded height so it scrolls);
// contentClassName styles the inner content container (padding, gap, centering).
<ScrollView
  className="max-h-[160px] rounded-md border border-border"
  contentClassName="p-3 gap-2"
>
  {rows.map((label) => (
    <View key={label} className="rounded-md bg-muted px-3 py-2">
      <Text className="text-sm text-foreground">{label}</Text>
    </View>
  ))}
</ScrollView>
```
