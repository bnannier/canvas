```tsx
import { ScrollView, View, Text, useTheme } from "@olympusoss/canvas";

// style sizes the FRAME (give it a bounded height so it scrolls);
// contentContainerStyle styles the inner content (padding, gap, centering).
function List({ rows }) {
  const { tokens } = useTheme();
  return (
    <ScrollView
      style={{ maxHeight: 160, borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}
      contentContainerStyle={{ padding: 12, gap: 8 }}
    >
      {rows.map((label) => (
        <View key={label} style={{ borderRadius: 6, backgroundColor: tokens.muted, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```
