# Canvas application recipes

Build a settings form, operations dashboard, or studio booking flow with the
published `@nannier/canvas@4.1.0` package. The starter uses one React Native app
for iOS, Android, and web, with Canvas controls and semantic layouts throughout.

## Try the showcase

Open the [recipe showcase](/recipes/) and use Settings, Dashboard, and Booking in
the navbar. On narrow
screens, scroll the navbar horizontally to reach its remaining controls.

- **Settings:** edit the name and email, toggle project updates and the weekly
  digest, and select Save settings. A name needs at least two characters and the
  email must have a valid format. The saved summary changes after a successful
  save; Cancel changes restores the last saved values. Enter submits the form.
- **Dashboard:** search by title, owner, or reference and combine the search with
  a status filter. Counts, planned units, ready items, and average progress reflect
  the filtered results. Clear filters or reset an empty result to see all work.
  Refresh sample data adds seven points to the studio launch, capped at 100;
  completion changes its status to Ready and updates the local activity log.
- **Booking:** choose a service, one of the next five dates, and a sample time
  slot, then enter a name and email. Changing the service or date clears the time
  selection. Confirm booking shows the sample summary; cancel the sample
  reservation to return to the form, or clear an unfinished draft. Dates and times
  use the device's local timezone.

Drafts survive navigation between recipes. Dark mode changes the app's appearance.
Reloading resets the profile, filters, progress, drafts, and sample reservations.

## Start a project

Use Node 22.13 or newer and a new destination directory. This command fetches the
exact npm release containing the CLI:

```sh
npx --yes @nannier/canvas@4.1.0 init --recipe settings --dir ./my-canvas-app
cd my-canvas-app
npm install
npx --no-install canvas doctor --json
npm run web
```

Replace `settings` with `dashboard` or `booking` to choose the first screen; each
starter includes all three flows. The initializer pins Canvas to `4.1.0`, copies
the starter without overwriting existing files, and prints next steps. It does not
install dependencies itself. Review the generated files and commit the resulting
lockfile. The doctor inspects local setup and required peers; it does not verify
application behavior. Native runs also need Xcode or Android tooling.

To install this exact Canvas release in an existing React Native project:

```sh
npm install --save-exact @nannier/canvas@4.1.0
npx --no-install canvas doctor --json
```

Follow the version-matched [installation guide](/ai/4.1.0/installation.md) for
required peers and runtime setup, and use the installed package's declarations
when adapting a recipe. Test keyboard use, narrow layouts, and each native target
you intend to ship.

## What the demos mean

Everything runs in React state for the current session. There is no backend,
persistence, authentication, email delivery, payment, real calendar availability,
or reservation with a business. Saving a profile does not change an account;
refreshing does not fetch a server; confirming a booking does not contact a studio.
Connect the explicit state transitions to your own services before using them for
real operations.

The npm distribution includes its own Canvas LICENSE and packaged starter terms.
The prepared showcase exposes the [distribution license](/recipes/LICENSE.canvas.txt)
and [package provenance](/recipes/provenance.json), which become available with
the demo deployment. Those notices do not grant a license to private repository
source.
