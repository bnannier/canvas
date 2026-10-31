import { createButton } from "../../../src/atoms/button/button.shared";
import { webSkin } from "../../../src/atoms/button/button.styles";

// The Library's two authored calls use the same Button behavior and interaction skin,
// with the hand-off's hero typography and padding (distinct from K.btn's large size).
export const LibraryAction = createButton({
  ...webSkin,
  container: (tokens, intent, size, options) => ({
    ...webSkin.container(tokens, intent, size, options),
    height: 48,
    paddingHorizontal: intent === "outline" ? 18 : 22,
    gap: intent === "outline" ? 8 : 10,
    borderRadius: 12,
    borderWidth: intent === "outline" ? 1 : 0,
  }),
  label: (tokens, intent, size, options) => ({
    ...webSkin.label(tokens, intent, size, options),
    fontSize: 15,
    lineHeight: 15,
    ...(intent === "outline" ? { color: tokens["muted-foreground"] } : null),
  }),
});
