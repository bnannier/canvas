# Canvas

**UI components for iOS, Android, and web. One React Native API.**

Build forms, navigation, dashboards, and charts with platform-specific skins,
light and dark themes, and semantic props like `<Button primary large>`.

[Live components](https://canvas.nannier.com/components) · [Documentation](https://canvas.nannier.com/) · [npm](https://www.npmjs.com/package/@nannier/canvas)

## Install

In an existing React Native or React Native Web app:

```bash
npm install @nannier/canvas
```

Using Expo or an older React Native version? Follow the
[platform setup guide](./USAGE.md#install) for compatible native dependencies.

## Quick start

```jsx
import { Button, ThemeProvider } from "@nannier/canvas";

export default function App() {
  return (
    <ThemeProvider>
      <Button primary large onPress={() => console.log("Saved")}>
        Save
      </Button>
    </ThemeProvider>
  );
}
```

The same component works on all three platforms. Style it with boolean props:
`primary`, `destructive`, `large`, `loading`, or `disabled`.
`ThemeProvider` follows the OS appearance by default; use props such as `dark`,
`rose`, and `glass` to choose a theme.

## Explore

- [Component catalog](https://canvas.nannier.com/components) — live examples and props.
- [Usage guide](./USAGE.md) — platform setup, optional dependencies, overlays, and theming.
- [Expo starter](./examples/starter/README.md) — a complete runnable app.
- [AI and CLI guide](./docs/public/agents.md) — version-aware API lookup, skills, and recipes; check CLI availability in your installed release.
- [Design reference](./DESIGN.md) — tokens, typography, and component conventions.

Match the docs to your installed version; repository source can be ahead of npm.
See the [changelog](./CHANGELOG.md) for release details.

## License

The npm package, including its packaged consumer assets, is [MIT-licensed](./LICENSE).
The repository source and source examples remain all rights reserved.

[Contributing](./CONTRIBUTING.md) · [Report a security issue](./SECURITY.md)
