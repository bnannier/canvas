---
"@olympusoss/canvas": minor
---

Add engine-styled Image, TextInput, and ScrollView primitives

These className-aware wrappers (matching Box, Text, and Pressable) let you style
react-native's Image, TextInput, and ScrollView the Canvas way: each extends the
RN component's props, adds a `className`, and renders `style={[resolved, style]}`
so a caller-supplied style still wins. ScrollView adds a `contentClassName` prop for
the content container (RN's contentContainerStyle), where padding/gap/centering
belong; `className` styles the scroll frame.

Avatar, MediaObject, Input, and Textarea now use these primitives internally
instead of importing raw react-native components. Purely additive: new exports
plus internal refactors with no behavior change.

Canvas still does not re-export raw react-native (FlatList, Modal, Animated,
Dimensions, etc.); import those directly from react-native.
