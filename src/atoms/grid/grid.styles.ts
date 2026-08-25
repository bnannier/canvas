// Grid shares the layout family's spacing scale: its gap axis is Row/Column's
// own booleans resolving against the same FlexSkin maps, so the two primitives
// can never drift apart. Layout is a "Shared" platform treatment (flexbox is
// identical on iOS, Android, and react-native-web); the three skins reference
// the same object on purpose, and the file exists to match the kit's
// platform-skin recipe.
export { webSkin, iosSkin, androidSkin, type FlexSkin } from "../layout/layout.styles.js";
