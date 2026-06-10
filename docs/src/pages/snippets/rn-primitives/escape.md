```tsx
import { useTheme } from "@olympusoss/canvas";
import { FlatList } from "react-native";

// For any RN component Canvas does not ship, build the style object from tokens
// and pass it directly. The missing-wrapper case is never a dead end.
function Rows({ data }) {
  const { tokens } = useTheme();
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      data={data}
      renderItem={({ item }) => <Row item={item} tokens={tokens} />}
    />
  );
}
```
