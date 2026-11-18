# QRCode

Encodes a string as a scannable QR code. Built on react-native-svg,
<!-- only: web -->
so it renders the same on iOS, Android, and the web.
<!-- /only -->
<!-- only: ios android -->
so it renders the same on every platform Canvas supports.
<!-- /only -->
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

### Center logo

The `logo` slot centers a decorative mark on a small white field and enables high error correction. Use a short value and size the logo to fit its square viewport, which is 15 px for `small`, 24 px by default, and 32 px for `large`.

High error correction holds less data than a plain code. Prefer a short URL: a value near the plain code's capacity can exceed the renderer's encoding limit when a logo is added.

```tsx
<QRCode value="https://canvas.nannier.com" large logo={<Icon sparkles size={24} />} />
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
