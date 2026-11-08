# QRCode

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: ffd42edcc8828d3edcdcfd4bb3a9835f8b54674438055997f10ebf5989e7e006

Source: `src/atoms/qrcode/qrcode.md`
Human reference: https://canvas.nannier.com/components/qrcode

## Public imports

```tsx
import { QRCode } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Encodes a string as a scannable QR code. Built on react-native-svg,
so it renders the same on iOS, Android, and the web.
The code stays a fixed dark-on-white card so any camera can read it, whatever the app theme.

## Usage

```tsx
<QRCode value="https://canvas.nannier.com" />
```

## Variants

### Small

```tsx
<QRCode value="https://canvas.nannier.com" small />
```

### Large

```tsx
<QRCode value="https://canvas.nannier.com" large />
```

## Do & Don't

### Keep it scannable

**Do** — Leave the fixed dark-on-white card in place so the code stays high-contrast for any camera.

```tsx
<QRCode value="https://canvas.nannier.com" />
```

**Don't** — Shrinking a data-dense value to the small size drops the modules below a reliably scannable density.

```tsx
<QRCode value="https://canvas.nannier.com/get/the/app?ref=docs&utm=homepage&v=2" small />
```

## Supported props

### QRCodeProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string | yes |  | The string to encode: a URL, plain text, a token, etc. |
| small | boolean \| undefined | no | false | A compact 96px code. |
| large | boolean \| undefined | no | false | A large 200px code. |
| accessibilityLabel | string \| undefined | no |  | Spoken equivalent for screen readers. A QR code is camera-only content, so without a label assistive tech announces nothing. Defaults to `QR code encoding ${value}`; pass a generic label (e.g. "QR code") when surfacing the raw value is undesirable. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
