# Section showcase checklist

Owner request, 2026-11-17: animate the component demonstrations on Layout, Controls,
Inputs, Navigation, Data, Charts, Overlays, and Skins to illustrate functionality.
These sequences drive the actual Canvas controls, charts, and embedded overlays.

- [x] Layout: cycle breakpoint previews, resize real containers and grids, demonstrate
      dashboard spans and navigation selection.
- [x] Controls: button loading/results, toggles, radio/checkbox selection, ranges,
      steppers, grouped controls, and identity/status states.
- [x] Inputs: typing, validation, selection, OTP completion, filters, and form submission.
- [x] Navigation: tabs, pages, active links, settings, and import progress.
- [x] Data: table selection/sorting/filtering, disclosures, carousel/calendar, chat,
      board movement, graph inspection, metrics, and progress.
- [x] Charts: all 27 chart types across 25 cards; inspect marks and animate values,
      geometry, progress, heatmap cells, and service health.
- [x] Overlays: 11 staged cards demonstrate opening/closing, actions, progress, and
      results without opening automatic page-level modals or stealing focus.
- [x] Skins: synchronized form, validation, saving, range, and toggle sequences;
      retain each platform's actual component skin.
- [x] Shared scheduler: independent staggered card sequences, visible, focused route, and foreground only.
- [x] Reader takeover: pointer, keyboard, focus, or edit stops that card's automatic
      sequence; a touch scroll only suspends it until the gesture ends.
- [x] Reduced Motion: static resting examples, including live preference changes;
      preserve manual edits.
- [x] Complete responsive browser verification and focused checks: 24 route/width
      combinations, 72 visible first/middle/last card checkpoints, no runtime errors
      or horizontal overflow; correct the phone Wizard caption clearance.

Delivery status is tracked in the chat and the
[Deploy workflow runs](https://github.com/bnannier/canvas/actions/workflows/deploy.yml).
Testing captures remain temporary and are never committed.
