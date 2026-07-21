# QRCode

Encodes a string as a scannable QR code. Built on react-native-svg, so it renders the same on iOS, Android, and the web. The code stays a fixed dark-on-white card so any camera can read it, whatever the app theme.

## Usage

```tsx
<QRCode value="https://canvas.olympusoss.com" />
```

## Variants

### Small

```tsx
<QRCode value="https://canvas.olympusoss.com" small />
```

### Medium

```tsx
<QRCode value="https://canvas.olympusoss.com" />
```

### Large

```tsx
<QRCode value="https://canvas.olympusoss.com" large />
```

## Do & Don't

### Keep it scannable

**Do** — Leave the fixed dark-on-white card in place so the code stays high-contrast for any camera.

```tsx
<QRCode value="https://canvas.olympusoss.com" />
```

**Don't** — Shrinking a data-dense value to the small size drops the modules below a reliably scannable density.

```tsx
<QRCode value="https://canvas.olympusoss.com/get/the/app?ref=docs&utm=homepage&v=2" small />
```
