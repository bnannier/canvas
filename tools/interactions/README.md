# Interaction evidence

Run `bun scripts/check-interaction-coverage.ts` from the repository root, or add
`--json` for the machine-readable report. CI checks the registry on every candidate.

`registry.ts` records the complete docs component inventory and reviewed behavioral
test declarations. Adding or removing a component requires an explicit inventory
update. Each evidence record names an active test title or interaction tag, its
component coverage, and the layer it exercises. A removed, renamed, commented-out,
or skipped test fails the check. Screenshot coverage alone is not interaction
coverage. A component with no registered evidence is reported as such; the report
does not infer that no test exists elsewhere.

The `unit-web` layer uses the repository's React Native Web DOM harness. Browser
keyboard and touch evidence refers to real Playwright input. None of these records
is a native-device or screen-reader result. Those result fields remain
`not-recorded` until actual candidate runtime evidence is recorded.

Focused journeys live in `e2e/journeys`. The desktop projects run Chromium, Firefox
and WebKit. Touch projects use Chromium with a Pixel viewport and WebKit with an
iPhone viewport, and assert trusted touch input. These are browser emulations;
they do not substitute for Android or iOS native execution.

Build the docs with `cd docs && bun run build:web`, then run
`bunx playwright test --project=journeys-webkit` from the root. The canonical test
server uses HTTPS and the export's unchanged security headers. Its disposable
loopback certificate is trusted only in the isolated Playwright contexts, with no
system trust changes. This matters because WebKit upgrades asset requests under
the production `upgrade-insecure-requests` policy, including on localhost.

The internal `/testing/diagnostics` route reports the manifest's source and
candidate revisions, source fingerprint, package version, React/RN versions and
native bundle details. The docs resolve Canvas source. The package version shown
there identifies source metadata, not a packed-consumer installation. Manifest
identity is captured when Metro starts or exports; restart Metro after changing
its inputs before using diagnostics as development evidence. Immutable CI exports
embed the tested candidate's identity, and browser journeys compare it to the
checked-out candidate. The home page's latest npm badge is independent.
