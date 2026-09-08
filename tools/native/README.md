# Native candidate verification

The smoke app is an isolated copy of `examples/starter`. Its checked-in dependency
stays pinned to npm. Candidate preparation verifies the release seal, installs the
exact tarball only in the copy, and compares installed package bytes before building
or testing. No source resolver, workspace link, `.origin` overlay or optional-peer
stub is allowed. These fixtures are outside the library's published `files` set.

Reviewed fixture bodies and route templates live in `examples/starter/smoke`,
outside the ordinary app's source and route graph. Preparation copies only the
entries listed in `smoke/manifest.json` into the temporary app after installing the
candidate, then typechecks the resulting app against that exact package. The docs
import those same bodies. This permits a candidate fixture to exercise a new API
without requiring the registry-pinned starter to compile against an unpublished API.
The smoke environment flag selects the app identity and enables prepared routes;
the flag alone does not install routes into the ordinary app.

The runner requires a clean checkout of the identified candidate, its `candidate`
directory, and the sealed `artifacts` directory. Use task-local output paths:

```sh
node scripts/native-smoke.mjs prepare --candidate /tmp/candidate --artifacts /tmp/artifacts --output /tmp/native-candidate
node scripts/install-maestro.mjs /tmp/native-tools
node scripts/native-smoke.mjs build --output /tmp/native-candidate --platform ios --device SIMULATOR_UDID
node scripts/native-smoke.mjs test --output /tmp/native-candidate --platform ios --device SIMULATOR_UDID --maestro /tmp/native-tools/maestro/bin/maestro
```

For Android, replace `ios` and `SIMULATOR_UDID` with `android` and an explicit adb
serial. Set `JAVA_HOME`, `ANDROID_HOME` and `PATH` for that command if the SDK/JDK
is not already configured. The runner does not alter shell profiles or SDK
installations. It installs only `com.nannier.canvas.starter.smoke`, preserving the
ordinary starter and docs apps. Maestro installs its native automation driver.

The release builds contain embedded JavaScript, so they do not require Metro.
Before input, the flow reads the actual runtime candidate revision and tarball hash,
compares the version bundled from the installed package's own `package.json`, and
rejects an HTTP Metro bundle URL. Form selection must fire once without submitting;
explicit submit must fire once; Listbox row taps must toggle once; and a Drawer
must host and select its child Autocomplete in the native window.

The shared public-ref fixture checks six attached hosts, positive Slider measurement,
cleanup and reattachment, and that focus requests do not activate controls. Radio,
Checkbox and Switch taps then exercise their change callbacks. A recorded focus request does
not prove native non-text focus or screen-reader focus; those depend on the OS and
React Native configuration and require their own observed checks.

The flow also selects the second Dropdown row (Archive) over the Drawer editor,
an unselected single Listbox option, an unchecked multi Listbox row, an inactive
Tab and an unchecked Radio. It checks identity or state and one callback per
activation. Disabled Archive, both disabled Listboxes, an individually disabled
Tab, whole disabled Tabs and a disabled RadioGroup retain their counters. The
disabled fixture query creates a fresh body, so previous selections cannot leak
into those checks. These are ordinary native taps, not proof of TalkBack hover
targeting or accessibility activation. The separate screen-reader protocol uses
these same controls in both appearances.

Each platform runs the flow in light and dark appearance, verifies the resolved
theme in diagnostics, and restores the device's prior appearance. It writes
`*-evidence/result.json`, separate JUnit reports, Maestro command logs and
screenshots. A result is written as passed only after both complete flows succeed.
Binary digests and app source inventories prevent an old binary or edited fixture
from being reused as candidate evidence. Preserve these files with the candidate
artifact. Device API level, OS and framework versions identify what was exercised;
one device run does not prove every supported OS version.

These flows exercise real native input and accessibility selectors. They do not
run VoiceOver or TalkBack. Their fields remain `not-run`; follow
[the screen-reader protocol](accessibility.md) for separate spoken-feedback checks.

Maestro is installed from an official release archive using the SHA256 in
`maestro.json`. Java17+ is required by the
[official CLI installation instructions](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli).
