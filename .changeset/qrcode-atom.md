---
"@olympusoss/canvas": minor
---

Add a `QRCode` atom that encodes a string as a scannable QR code. It is built on
`react-native-qrcode-svg` (the kit's first runtime dependency, which draws through
the existing `react-native-svg` peer), so the same code renders identically on iOS,
Android, and the web. Boolean size axis (`small` / `large`, default medium); the code
stays a fixed dark-on-white card so it scans reliably in any app theme. The
`react-native-svg` peer range is raised to `>=14` to match what the QR library needs.
