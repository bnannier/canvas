# Consumer compatibility gate

`bun run verify-consumer-support` packs the existing build once, installs that tarball in isolated temporary consumers, and removes the fixtures afterward. Run `bun run build` first. Pass a `.tgz` path to test an existing artifact, or `--artifacts <directory>` to verify the exact tarball and SHA-256 in a sealed release manifest.

The matrix covers:

| Consumer | React | React types | React Native | React Native Web | SVG |
| --- | --- | --- | --- | --- | --- |
| Web floor | 18.0.0 | 18.2.79 | 0.74.0 declarations only | 0.19.13 | 14.0.0 |
| Native floor | 18.2.0 | 18.2.79 | 0.74.0 | Not executed | 14.0.0 |
| Current | Root installed version | Root installed version | Root installed version | Root installed version | Root installed version |

React Native 0.74 requires React 18.2 exactly. Its native row uses that peer-valid pair; the web row executes React 18.0 through RNW, with RN installed only to supply Canvas's public types. Current versions come from the root frozen lockfile. Floor versions and bundler/compiler tools are explicit in `contract.mjs` so upgrades are reviewable.

Every row checks all reachable Canvas declarations with strict TypeScript and `skipLibCheck: false`, plus typed input callbacks and control host refs. It uses the native ES library, because RN 0.74's global declarations conflict with TypeScript's DOM globals. This checks the public package contract without hiding declaration errors. All optional Canvas peers must be absent, and installed package bytes must match the tarball without a source overlay or link.

Web rows bundle all public exports with ordinary RNW aliasing and web extension priority, then run a real Chromium journey: controlled text entry, keyboard checkbox activation, selection, Enter submission, programmatic host focus, and the absent QR peer's labeled fallback. Runtime exceptions and console errors fail the gate. Install the repository's Playwright Chromium before running this check.

Native rows use the matching stock Metro configuration and Babel preset, and bundle all public exports for iOS and Android with package exports both enabled and disabled. Sourcemaps must select native skins and material helpers. This is JavaScript packaging and declaration coverage, not an old-SDK device build or a claim that every historical native renderer has identical visuals. Current native build and interaction verification belongs to the standalone starter smoke runner.
