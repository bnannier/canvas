```tsx
import { Image, View } from "@olympusoss/canvas";

// style carries size + radius; source / resizeMode are normal RN ImageProps.
// RN clips a photo to the circle via an overflow-hidden parent.
<View style={{ width: 48, height: 48, overflow: "hidden", borderRadius: 9999 }}>
  <Image style={{ width: "100%", height: "100%" }} source={{ uri: photo }} resizeMode="cover" />
</View>
```
