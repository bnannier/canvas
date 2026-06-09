```tsx
import { Image, View } from "@olympusoss/canvas";

// className carries size + radius; source / resizeMode are normal RN ImageProps.
// RN clips a photo to the circle via an overflow-hidden parent.
<View className="w-12 h-12 overflow-hidden rounded-full">
  <Image className="w-full h-full" source={{ uri: photo }} resizeMode="cover" />
</View>
```
