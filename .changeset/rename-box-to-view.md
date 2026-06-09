---
"@olympusoss/canvas": major
---

Rename the Box primitive to View

BREAKING: the engine primitive `Box` is renamed to `View` (and `BoxProps` to
`ViewProps`), so all six styled primitives mirror their react-native counterparts
exactly: `View`, `Text`, `Pressable`, `Image`, `TextInput`, `ScrollView`.

Migrate by updating imports and JSX:

```diff
- import { Box } from "@olympusoss/canvas";
- <Box className="...">...</Box>
+ import { View } from "@olympusoss/canvas";
+ <View className="...">...</View>
```

The API is otherwise unchanged: `View` still takes a `className` plus all of
react-native's View props, and renders `style={[resolved, style]}`.
