```tsx
import { useStyles } from "@olympusoss/canvas";
import { FlatList } from "react-native";

// For any RN component Canvas does not wrap, resolve a className yourself and
// spread it onto the component's style. The missing-wrapper case is never a dead end.
function Rows({ data }) {
  const frame = useStyles("flex-1");
  const content = useStyles("p-4 gap-2");
  return (
    <FlatList
      style={frame}
      contentContainerStyle={content}
      data={data}
      renderItem={({ item }) => <Row item={item} />}
    />
  );
}
```
