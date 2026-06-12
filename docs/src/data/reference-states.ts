// Reference manifest for the /compare page.
//
// For each platform-skinned component, the per-platform reference library:
// one row per VARIANT the platform's reference documents, each row holding the
// STATES that variant is published in. Rendered by docs/src/pages/compare.tsx
// as inner rows of the Reference cell (the outer table stays platforms-as-rows,
// Canvas | Reference as columns).
//
// The reference for each platform is the same link PLATFORM-REFERENCES.md
// carries for that component: iOS = the Apple iOS 27 UI Kit symbols (Sketch),
// Android = the Compose / Material 3 docs, Web = Catalyst (or the row's web
// library). Apple's docs-assets marketing thumbnails are banned as references.
//
// State and variant vocabulary is the PLATFORM'S own, never Canvas's: iOS uses
// the kit's names (Idle, Pressed, Disabled, On, Off...), Android Material 3's,
// Web the reference library's. A state or variant a platform does not document
// is simply absent.
//
// Images are local captures (the kit's thumbnails are signed and cannot be
// hotlinked), living in the gitignored docs/public/refs/:
//   /refs/<platform>/<slug>/<rowKey>-<stateKey>-<light|dark>.png
// A missing dark file falls back to light with a "(light only)" tag.

export type RefPlatform = "ios" | "android" | "web";

export interface RefState {
  /** Filename-safe key (second segment of the image filename). */
  key: string;
  /** Platform-native state label shown under the panel. */
  label: string;
  note?: string;
}

export interface RefRow {
  /** Filename-safe key (first segment of the image filename). */
  key: string;
  /** Platform-native variant label, e.g. "Bordered Prominent", "Filled". */
  variant: string;
  /** Where the imagery came from (kit group path or page URL), for re-capture. */
  source?: string;
  states: RefState[];
}

export interface PlatformRefs {
  /** This platform's reference link from PLATFORM-REFERENCES.md. */
  url: string;
  /** Row-level caveat, e.g. "M3 has no separate textarea". */
  note?: string;
  rows: RefRow[];
}

/**
 * The platform has no such component. The statement says so plainly and may
 * name what the platform uses instead, in words only; lookalike controls are
 * never linked or captured as if they were the component.
 */
export interface PlatformNone {
  none: string;
}

export interface ComponentRefs {
  slug: string;
  name: string;
  level: "atoms" | "molecules" | "organisms";
  refs: Partial<Record<RefPlatform, PlatformRefs | PlatformNone>>;
}

export const REFERENCE_STATES: ComponentRefs[] = [
  {
    slug: "button",
    name: "Button",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons",
        rows: [
          {
            key: "bordered-prominent",
            variant: "Bordered Prominent",
            source: "Buttons/{scheme}/Large/Bordered Prominent/Text",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "bordered",
            variant: "Bordered",
            source: "Buttons/{scheme}/Large/Bordered/Text",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "borderless",
            variant: "Borderless",
            source: "Buttons/{scheme}/Large/Default/Borderless/Text",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "destructive",
            variant: "Destructive (Bordered Prominent)",
            source: "Buttons/{scheme}/Large/Destructive/Bordered Prominent/Text",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "glass-prominent",
            variant: "Glass Prominent",
            source: "Buttons/{scheme}/Large/Glass Prominent",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/button",
        rows: [
          {
            key: "filled",
            variant: "Filled button",
            source: "https://developer.android.com/develop/ui/compose/components/button#filled",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'A filled button.' High-emphasis, solid background.",
              },
            ],
          },
          {
            key: "filled-tonal",
            variant: "Filled tonal button",
            source: "https://developer.android.com/develop/ui/compose/components/button#filled-tonal",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'A tonal button.' Surface-matched tonal background.",
              },
            ],
          },
          {
            key: "outlined",
            variant: "Outlined button",
            source: "https://developer.android.com/develop/ui/compose/components/button#outlined",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'An outlined button.' Border, no fill; medium emphasis.",
              },
            ],
          },
          {
            key: "elevated",
            variant: "Elevated button",
            source: "https://developer.android.com/develop/ui/compose/components/button#elevated",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'An elevated button.' Shadowed surface.",
              },
            ],
          },
        ],
        note: "Docs depict each variant only in its default enabled rendering (one PNG per variant, all verified as image/png)",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/button",
        rows: [
          {
            key: "solid",
            variant: "Solid (default, color=dark/zinc)",
            source: "https://catalyst.tailwindui.com/docs/button#button-colors",
            states: [
              {
                key: "default",
                label: "default",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "outline",
            variant: "Outline (outline prop)",
            source: "https://catalyst.tailwindui.com/docs/button#outline-buttons",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "plain",
            variant: "Plain (plain prop)",
            source: "https://catalyst.tailwindui.com/docs/button#plain-buttons",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Catalyst (Tailwind Plus) Button docs, publicly fetchable",
      },
    },
  },
  {
    slug: "button-group",
    name: "Button Group (segmented)",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls",
        rows: [
          {
            key: "large",
            variant: "Large",
            source: "Segmented Controls/{scheme}/Large",
            states: [
              {
                key: "enabled",
                label: "Enabled",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "small",
            variant: "Small",
            source: "Segmented Controls/{scheme}/Small",
            states: [
              {
                key: "enabled",
                label: "Enabled",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "segment",
            variant: "Segment (single button)",
            source: "Segmented Controls/􀻃/{scheme}",
            states: [
              {
                key: "unselected",
                label: "Unselected",
              },
              {
                key: "touch",
                label: "Touch",
              },
              {
                key: "selected",
                label: "Selected",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/segmented-button",
        rows: [
          {
            key: "single-select",
            variant: "Single-select segmented button (SingleChoiceSegmentedButtonRow)",
            source: "Section 'Create a single-select segmented button'",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: Day/Month/Week row with 'Day' selected; shows selected and unselected segments in one image (verified PNG, 634x150)",
              },
            ],
          },
          {
            key: "multi-select",
            variant: "Multi-select segmented button (MultiChoiceSegmentedButtonRow)",
            source: "Section 'Create a multi-select segmented button'",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: Walk/Ride/Drive row with 'Walk' and 'Ride' checked; shows checked and unchecked segments in one image (verified PNG, 500x126)",
              },
            ],
          },
        ],
        note: "Docs depict each variant as one composite screenshot (selected and unselected segments together); no separate hovered/focused/pressed/disabl",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/toggle-group",
        rows: [
          {
            key: "default",
            variant: "Default (type=\"single\", variant=\"default\")",
            states: [
              {
                key: "default",
                label: "default",
              },
              {
                key: "toggled-on",
                label: "toggled on (data-state=on)",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "outline",
            variant: "Outline (variant=\"outline\")",
            states: [
              {
                key: "default",
                label: "default",
              },
              {
                key: "toggled-on",
                label: "toggled on (data-state=on)",
              },
            ],
          },
          {
            key: "small",
            variant: "Small (size=\"sm\")",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "large",
            variant: "Large (size=\"lg\")",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Page sections: default hero demo, Outline, Size, Spacing, Vertical, Disabled, Custom",
      },
    },
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    level: "atoms",
    refs: {
      ios: {
        none: "iOS has no checkbox; the checkbox toggle style is macOS-only. iOS uses switches in list rows and toggle-style buttons elsewhere.",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/checkbox",
        rows: [
          {
            key: "checkbox",
            variant: "Checkbox (basic)",
            source: "https://developer.android.com/develop/ui/compose/components/checkbox",
            states: [
              {
                key: "unchecked",
                label: "unchecked",
              },
              {
                key: "checked",
                label: "checked",
              },
            ],
          },
          {
            key: "tri-state-checkbox",
            variant: "TriStateCheckbox (parent/child)",
            source: "https://developer.android.com/develop/ui/compose/components/checkbox",
            states: [
              {
                key: "unchecked",
                label: "unchecked (all children off)",
              },
              {
                key: "checked",
                label: "checked (all children on)",
              },
              {
                key: "indeterminate",
                label: "indeterminate (some children on)",
              },
            ],
          },
          {
            key: "checkbox-states-overview",
            variant: "Checkbox (M3 states overview)",
            source: "https://developer.android.com/develop/ui/compose/components/checkbox",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "single composite hero image showing the three states: unselected, selected, indeterminate",
              },
            ],
          },
        ],
        note: "The Compose page depicts only unselected/selected/indeterminate; hovered/pressed/disabled visuals are not shown on this page (they live in t",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/checkbox",
        rows: [
          {
            key: "basic",
            variant: "Basic example",
            source: "https://catalyst.tailwindui.com/docs/checkbox",
            states: [
              {
                key: "default",
                label: "default (unchecked)",
              },
              {
                key: "checked",
                label: "checked",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label (CheckboxField + Label)",
            source: "https://catalyst.tailwindui.com/docs/checkbox",
            states: [
              {
                key: "default",
                label: "default (unchecked)",
              },
              {
                key: "checked",
                label: "checked",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description (CheckboxField + Label + Description)",
            source: "https://catalyst.tailwindui.com/docs/checkbox",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-accent-color",
            variant: "With accent color (color prop)",
            source: "https://catalyst.tailwindui.com/docs/checkbox",
            states: [
              {
                key: "checked",
                label: "checked",
              },
            ],
          },
        ],
        note: "Page is publicly fetchable",
      },
    },
  },
  {
    slug: "radio",
    name: "Radio",
    level: "atoms",
    refs: {
      ios: {
        none: "iOS has no radio button; it is a macOS-only control. iOS apps use a single-select checkmark list or a picker instead.",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/radio-button",
        rows: [
          {
            key: "radio-button",
            variant: "RadioButton (standalone)",
            source: "Page intro / hero figure",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite official image: selected (filled circle) and unselected radio buttons side by side",
              },
            ],
          },
          {
            key: "radio-button-group",
            variant: "RadioButton group with labels (basic implementation)",
            source: "Basic implementation section",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Three labeled options (Calls, Missed, Friends) with one selected",
              },
            ],
          },
        ],
        note: "Compose docs define a single RadioButton style (Material 3)",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/radio",
        rows: [
          {
            key: "basic",
            variant: "Basic example (RadioGroup + RadioField + Radio + Label)",
            states: [
              {
                key: "default",
                label: "default (unchecked)",
              },
              {
                key: "selected",
                label: "selected",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-fieldset",
            variant: "With fieldset (Fieldset + Legend + Text)",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "accent-color",
            variant: "With accent color",
            states: [
              {
                key: "selected",
                label: "selected (accent color visible)",
              },
            ],
          },
        ],
        note: "Catalyst (Tailwind UI) Radio docs are public",
      },
    },
  },
  {
    slug: "switch",
    name: "Switch",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toggles",
        rows: [
          {
            key: "on",
            variant: "On",
            source: "Toggles/{scheme}/On",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "pressed",
                label: "Pressed",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "off",
            variant: "Off",
            source: "Toggles/{scheme}/Off",
            states: [
              {
                key: "idle",
                label: "Idle",
              },
              {
                key: "pressed",
                label: "Pressed",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/switch",
        rows: [
          {
            key: "overview",
            variant: "Overview (Material 3 switch, light and dark)",
            source: "Page hero, Figure 1",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite image showing checked and unchecked switches in light and dark mode",
              },
            ],
          },
          {
            key: "basic",
            variant: "Basic switch",
            source: "Basic implementation",
            states: [
              {
                key: "unchecked",
                label: "unchecked (enabled)",
                note: "Figure 2",
              },
              {
                key: "checked",
                label: "checked (enabled)",
                note: "Figure 3",
              },
            ],
          },
          {
            key: "custom-thumb",
            variant: "Custom thumb (thumbContent icon)",
            source: "Advanced implementation > Custom thumb",
            states: [
              {
                key: "checked",
                label: "checked (enabled)",
                note: "Figure 4; docs only depict the icon in the checked state",
              },
            ],
          },
          {
            key: "custom-colors",
            variant: "Custom colors (SwitchDefaults.colors)",
            source: "Advanced implementation > Custom colors",
            states: [
              {
                key: "checked",
                label: "checked (enabled)",
                note: "Figure 5; single image of a checked switch with custom thumb and track colors",
              },
            ],
          },
        ],
        note: "Compose Material 3 docs document a single switch style plus two customizations (thumbContent icon, SwitchDefaults colors)",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/switch",
        rows: [
          {
            key: "basic",
            variant: "Basic switch (standalone, aria-label)",
            states: [
              {
                key: "default",
                label: "default (unchecked)",
              },
              {
                key: "checked",
                label: "checked (defaultChecked)",
              },
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label (SwitchField + Label)",
            states: [
              {
                key: "default",
                label: "default",
              },
              {
                key: "disabled",
                label: "disabled (on SwitchField)",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description (Label + Description)",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "accent-color",
            variant: "With accent color (color prop)",
            states: [
              {
                key: "checked",
                label: "checked",
              },
            ],
          },
        ],
        note: "Catalyst documents 11 sections; top 5 canonical variants listed",
      },
    },
  },
  {
    slug: "input",
    name: "Input",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Text%2520Fields",
        rows: [
          {
            key: "text-field",
            variant: "Text Field",
            source: "Text Fields/{scheme}",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "placeholder",
                label: "Placeholder",
              },
              {
                key: "typing",
                label: "Typing",
              },
              {
                key: "empty-typing",
                label: "Empty Typing",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/text/user-input",
        rows: [
          {
            key: "filled",
            variant: "TextField (filled, state-based)",
            source: "https://developer.android.com/develop/ui/compose/text/user-input",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
          {
            key: "outlined",
            variant: "OutlinedTextField",
            source: "https://developer.android.com/develop/ui/compose/text/user-input",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "screenshot shows the primary-colored border and floating label",
              },
            ],
          },
          {
            key: "multiline",
            variant: "TextField (multiline, TextFieldLineLimits.MultiLine)",
            source: "https://developer.android.com/develop/ui/compose/text/user-input",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
        ],
        note: "This is the Compose how-to guide, not the M3 component spec: it publishes a single composite screenshot per variant and does not depict inte",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/input",
        rows: [
          {
            key: "basic",
            variant: "Basic input",
            source: "https://catalyst.tailwindui.com/docs/input",
            states: [
              {
                key: "default",
                label: "default",
              },
              {
                key: "disabled",
                label: "disabled",
              },
              {
                key: "invalid",
                label: "invalid",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label (Field + Label)",
            source: "https://catalyst.tailwindui.com/docs/input",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description (Field + Description)",
            source: "https://catalyst.tailwindui.com/docs/input",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-icon",
            variant: "With icon",
            source: "https://catalyst.tailwindui.com/docs/input",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Catalyst (Tailwind UI kit) Input docs, publicly accessible",
      },
    },
  },
  {
    slug: "textarea",
    name: "Textarea",
    level: "atoms",
    refs: {
      ios: {
        url: "https://developer.apple.com/design/human-interface-guidelines/text-views",
        note: "text view: UITextView / SwiftUI TextEditor; the iOS 27 kit has no text view symbols, so there is no kit imagery to capture",
        rows: [],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/text/user-input",
        rows: [
          {
            key: "filled",
            variant: "TextField (filled, Material 3)",
            source: "Section: Choose TextField implementation",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
          {
            key: "outlined",
            variant: "OutlinedTextField (outlined, Material 3)",
            source: "Section: Choose TextField implementation",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
          {
            key: "multiline",
            variant: "Multiline TextField (filled, textarea-style)",
            source: "Section: Style TextField (multiline example, closest analog to a textarea)",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
        ],
        note: "The Compose user-input page only depicts the default (enabled) appearance of each text field implementation; it publishes no images of disab",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/textarea",
        rows: [
          {
            key: "basic",
            variant: "Basic textarea",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label (Field + Label)",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description (Field + Label + Description)",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "disabled",
            variant: "Disabled (disabled prop on Field or Textarea)",
            states: [
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
        ],
        note: "Catalyst Textarea docs are publicly accessible",
      },
    },
  },
  {
    slug: "select",
    name: "Select",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus",
        rows: [
          {
            key: "menu",
            variant: "Menu",
            source: "Menus/{scheme}",
            states: [
              {
                key: "iphone",
                label: "iPhone",
              },
              {
                key: "ipad",
                label: "iPad",
              },
            ],
          },
          {
            key: "menu-item",
            variant: "Menu Item",
            source: "Menus/􀻃/{scheme}/iPhone/Menu Item",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "menu-item-selectable",
            variant: "Menu Item (selectable)",
            source: "Menus/􀻃/{scheme}/iPhone/Menu Item - Selectable",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
        note: "iOS selects present as menus",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/menu",
        rows: [
          {
            key: "dropdown-menu",
            variant: "DropdownMenu (basic)",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite screenshot: menu expanded with two items (Refresh, Settings), anchored to a three-dot IconButton in an app bar. Verified image (160x533 PNG).",
              },
            ],
          },
          {
            key: "minimal-dropdown-menu",
            variant: "Minimal drop-down menu",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite screenshot: expanded menu with Option 1 / Option 2 below a three-dot IconButton trigger. Verified image.",
              },
            ],
          },
          {
            key: "long-dropdown-menu",
            variant: "Longer (scrollable) drop-down menu",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite screenshot: expanded menu with many options (Option 1-19) requiring scroll. Verified image (432x2769 PNG).",
              },
            ],
          },
          {
            key: "dropdown-menu-dividers-icons",
            variant: "Drop-down menu with dividers and icons",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite screenshot: expanded menu with leading icons (Profile, Settings, Send Feedback, About, Help), trailing icons, and HorizontalDivider separators. Verified image.",
              },
            ],
          },
        ],
        note: "Compose docs cover menus (DropdownMenu / DropdownMenuItem) rather than a dedicated select control",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/select",
        rows: [
          {
            key: "basic",
            variant: "Basic example",
            source: "https://catalyst.tailwindui.com/docs/select",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label (Field + Label)",
            source: "https://catalyst.tailwindui.com/docs/select",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description (Field + Description)",
            source: "https://catalyst.tailwindui.com/docs/select",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "disabled",
            variant: "Disabled state (disabled on Field)",
            source: "https://catalyst.tailwindui.com/docs/select",
            states: [
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
        ],
        note: "Catalyst Select docs (publicly fetchable)",
      },
    },
  },
  {
    slug: "combobox",
    name: "Combobox",
    level: "atoms",
    refs: {
      ios: {
        none: "combo boxes are macOS-only; iOS apps use a text field plus a menu or picker instead.",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/menu",
        rows: [
          {
            key: "dropdown-menu-basic",
            variant: "Basic drop-down menu",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image, captioned 'A basic drop-down menu with two items listed', shown expanded",
              },
            ],
          },
          {
            key: "dropdown-menu-minimal",
            variant: "Minimal dropdown menu (icon-button trigger)",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: three-dot icon button with expanded menu showing Option 1 and Option 2",
              },
            ],
          },
          {
            key: "dropdown-menu-long",
            variant: "Long scrollable dropdown menu",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image, captioned 'A long, scrollable drop-down menu', shown expanded",
              },
            ],
          },
          {
            key: "dropdown-menu-with-details",
            variant: "Dropdown menu with sections and icons",
            source: "https://developer.android.com/develop/ui/compose/components/menu",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: menu divided into sections with leading and trailing icons, shown expanded",
              },
            ],
          },
        ],
        note: "This Compose page documents DropdownMenu/DropdownMenuItem only; ExposedDropdownMenuBox (Material 3's true combobox analog) is not covered he",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/combobox",
        rows: [
          {
            key: "basic",
            variant: "Basic example",
            source: "https://catalyst.tailwindui.com/docs/combobox",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-label",
            variant: "With label",
            source: "https://catalyst.tailwindui.com/docs/combobox",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-description",
            variant: "With description",
            source: "https://catalyst.tailwindui.com/docs/combobox",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "disabled",
            variant: "Disabled state",
            source: "https://catalyst.tailwindui.com/docs/combobox",
            states: [
              {
                key: "disabled",
                label: "disabled",
              },
            ],
          },
        ],
        note: "Catalyst documents many compositional sections (with placeholder, avatars, flags, secondary text, custom layout, controlled, custom filterin",
      },
    },
  },
  {
    slug: "tabs",
    name: "Tabs",
    level: "organisms",
    refs: {
      ios: {
        none: "iOS has no in-page tabs control; closely related subviews switch with a segmented control, and the tab bar is app-level navigation.",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/tabs",
        rows: [
          {
            key: "primary",
            variant: "Primary tabs (PrimaryTabRow)",
            source: "https://developer.android.com/develop/ui/compose/components/tabs",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite PrimaryTabRow example (Songs, Album, Playlist) showing the selected tab (Songs, underlined) alongside unselected tabs",
              },
            ],
          },
          {
            key: "secondary",
            variant: "Secondary tabs (SecondaryTabRow)",
            source: "https://developer.android.com/develop/ui/compose/components/tabs",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite image: three primary tabs with icons (Flights, Trips, Explore) above two secondary tabs without icons (Overview, Specifications)",
              },
            ],
          },
        ],
        note: "The Compose page documents two variants (primary and secondary tab rows) with composite images only; per-state imagery is not published ther",
      },
      web: {
        url: "https://headlessui.com/react/tabs",
        rows: [
          {
            key: "basic",
            variant: "Basic example (TabGroup / TabList / Tab / TabPanels / TabPanel)",
            source: "https://headlessui.com/react/tabs#basic-example",
            states: [
              {
                key: "default",
                label: "default (first tab data-selected)",
              },
            ],
          },
        ],
        note: "Headless UI ships unstyled components; states are exposed as data attributes (data-selected, data-hover, data-focus, data-active, data-disab",
      },
    },
  },
  {
    slug: "dialog",
    name: "Dialog",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts",
        rows: [
          {
            key: "alert",
            variant: "Alert",
            source: "Alerts/{scheme}",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "stacked",
                label: "Buttons Stacked",
              },
              {
                key: "input-1",
                label: "Input Field x 1",
              },
              {
                key: "input-2",
                label: "Input Field x 2",
              },
            ],
          },
          {
            key: "alert-button",
            variant: "Alert Button",
            source: "Alerts/􀻃/{scheme}",
            states: [
              {
                key: "primary",
                label: "Primary",
              },
              {
                key: "secondary",
                label: "Secondary",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/dialog",
        rows: [
          {
            key: "alert-dialog",
            variant: "Alert dialog (AlertDialog, Material themed with title, text, icon, dismiss and confirm buttons)",
            source: "Section 'Alert dialog', Figure 2",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: 'An alert dialog with buttons' shown open; verified image/png",
              },
            ],
          },
          {
            key: "dialog-basic",
            variant: "Dialog composable, basic example (minimal Card with text only)",
            source: "Section 'Dialog composable > Basic example', Figure 3",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: 'Minimal dialog' shown open over scrim; verified image/png",
              },
            ],
          },
          {
            key: "dialog-advanced",
            variant: "Dialog composable, advanced example (custom content with image, dismiss and confirm buttons)",
            source: "Section 'Dialog composable > Advanced example', Figure 4",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: 'A dialog that includes an image' shown open; verified image/png",
              },
            ],
          },
        ],
        note: "The Compose docs depict each dialog variant only in its open (enabled) state; no hovered/focused/pressed/disabled imagery is published on th",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/dialog",
        rows: [
          {
            key: "basic",
            variant: "Basic example (DialogTitle, DialogDescription, DialogBody, DialogActions; open/onClose props)",
            states: [
              {
                key: "default",
                label: "default (open)",
              },
            ],
          },
          {
            key: "width",
            variant: "Dialog width (size prop, xs through 5xl, default lg)",
            states: [
              {
                key: "default",
                label: "default (open, sized)",
              },
            ],
          },
          {
            key: "from-dropdown",
            variant: "Opening from dropdown (dialog rendered outside the dropdown menu)",
            states: [
              {
                key: "default",
                label: "default (open via dropdown item)",
              },
            ],
          },
          {
            key: "auto-focus",
            variant: "Auto-focusing elements (autoFocus prop on a form control inside the dialog)",
            states: [
              {
                key: "default",
                label: "default (open, field auto-focused)",
              },
            ],
          },
        ],
        note: "Catalyst docs page is publicly fetchable",
      },
    },
  },
  {
    slug: "alert-dialog",
    name: "Alert Dialog",
    level: "molecules",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts",
        rows: [
          {
            key: "alert",
            variant: "Alert",
            source: "Alerts/{scheme}",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "stacked",
                label: "Buttons Stacked",
              },
            ],
          },
          {
            key: "alert-button",
            variant: "Alert Button",
            source: "Alerts/􀻃/{scheme}",
            states: [
              {
                key: "primary",
                label: "Primary",
              },
              {
                key: "secondary",
                label: "Secondary",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/dialog",
        rows: [
          {
            key: "alert-dialog",
            variant: "AlertDialog (Material 3, icon + title + text, dismiss and confirm buttons)",
            source: "https://developer.android.com/develop/ui/compose/components/dialog",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'An open alert dialog that has both a dismiss and confirm button.' Verified HTTP 200 image/png.",
              },
            ],
          },
          {
            key: "basic-dialog",
            variant: "Dialog composable, minimal (Card with label only)",
            source: "https://developer.android.com/develop/ui/compose/components/dialog",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'A dialog that contains nothing other than a label.' Verified HTTP 200 image/png.",
              },
            ],
          },
          {
            key: "dialog-with-image",
            variant: "Dialog composable, advanced (image content + dismiss and confirm buttons)",
            source: "https://developer.android.com/develop/ui/compose/components/dialog",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'A dialog displaying Mount Feathertop, Victoria, with a dismiss button and a confirm button.' Verified HTTP 200 image/png.",
              },
            ],
          },
          {
            key: "dialog-overview",
            variant: "Dialog (overview/anatomy illustration)",
            source: "https://developer.android.com/develop/ui/compose/components/dialog",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Caption: 'An example of a dialog populated with text and icons.' Verified HTTP 200 image/svg+xml.",
              },
            ],
          },
        ],
        note: "The Compose docs show each dialog variant as a single static open screenshot; no hovered/focused/pressed/disabled states are depicted for th",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/alert-dialog",
        rows: [
          {
            key: "basic",
            variant: "Basic (default size: title, description, Cancel + Continue)",
            source: "https://ui.shadcn.com/docs/components/alert-dialog",
            states: [
              {
                key: "default",
                label: "default (open)",
              },
            ],
          },
          {
            key: "small",
            variant: "Small (size=\"sm\")",
            source: "https://ui.shadcn.com/docs/components/alert-dialog",
            states: [
              {
                key: "default",
                label: "default (open)",
              },
            ],
          },
          {
            key: "media",
            variant: "With media (AlertDialogMedia icon/image)",
            source: "https://ui.shadcn.com/docs/components/alert-dialog",
            states: [
              {
                key: "default",
                label: "default (open)",
              },
            ],
          },
          {
            key: "small-with-media",
            variant: "Small with media (size=\"sm\" + AlertDialogMedia)",
            source: "https://ui.shadcn.com/docs/components/alert-dialog",
            states: [
              {
                key: "default",
                label: "default (open)",
              },
            ],
          },
        ],
        note: "shadcn/ui documents layout variants (size prop 'default' | 'sm', plus AlertDialogMedia and a destructive action example); no disabled state ",
      },
    },
  },
  {
    slug: "dropdown",
    name: "Dropdown",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus",
        rows: [
          {
            key: "menu",
            variant: "Menu",
            source: "Menus/{scheme}",
            states: [
              {
                key: "iphone",
                label: "iPhone",
              },
              {
                key: "ipad",
                label: "iPad",
              },
              {
                key: "ipad-shortcuts",
                label: "iPad with Shortcuts",
              },
            ],
          },
          {
            key: "menu-item",
            variant: "Menu Item",
            source: "Menus/􀻃/{scheme}/iPhone/Menu Item",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/menu",
        rows: [
          {
            key: "basic",
            variant: "Basic drop-down menu",
            source: "Section: Create a basic drop-down menu (Figures 1-2)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Open menu with two items triggered by a three-dot IconButton; Figure 1 (basicmenu1.png) shows the same variant. Verified image/png.",
              },
            ],
          },
          {
            key: "long-scrollable",
            variant: "Longer drop-down menu (scrollable)",
            source: "Section: Create a longer drop-down menu (Figure 3)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite shot of the open menu with many items requiring scroll. Verified image/png.",
              },
            ],
          },
          {
            key: "with-dividers-icons",
            variant: "Drop-down menu with dividers and leading icons",
            source: "Section: Create a longer drop-down menu with dividers (Figure 4)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Open menu with Profile/Settings/Send Feedback/About/Help sections, leading icons, and HorizontalDivider separators. Verified image/png.",
              },
            ],
          },
        ],
        note: "The Compose docs cover DropdownMenu/DropdownMenuItem only (no exposed dropdown or cascading menu on this page)",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/dropdown",
        rows: [
          {
            key: "basic",
            variant: "Basic example",
            states: [
              {
                key: "default",
                label: "default (menu open)",
              },
            ],
          },
          {
            key: "with-sections",
            variant: "With sections",
            states: [
              {
                key: "default",
                label: "default (menu open)",
              },
            ],
          },
          {
            key: "with-icons",
            variant: "With icons",
            states: [
              {
                key: "default",
                label: "default (menu open)",
              },
            ],
          },
          {
            key: "with-disabled-items",
            variant: "With disabled items",
            states: [
              {
                key: "disabled-item",
                label: "menu open with disabled item",
              },
            ],
          },
        ],
        note: "Catalyst docs page is publicly fetchable",
      },
    },
  },
  {
    slug: "row-menu",
    name: "Row Menu (context menu)",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus",
        rows: [
          {
            key: "menu",
            variant: "Context Menu",
            source: "Menus/{scheme}",
            states: [
              {
                key: "iphone",
                label: "iPhone",
              },
              {
                key: "content-view",
                label: "With Content View",
              },
            ],
          },
          {
            key: "menu-item",
            variant: "Menu Item",
            source: "Menus/􀻃/{scheme}/iPhone/Menu Item",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "destructive",
                label: "Destructive",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
        note: "iOS context menu",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/menu",
        rows: [
          {
            key: "basic-dropdown",
            variant: "Basic drop-down menu",
            source: "Figure 1. A basic drop-down menu with two items listed.",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Shown open, anchored to a three-dot icon button; composite image only.",
              },
            ],
          },
          {
            key: "minimal-dropdown",
            variant: "Minimal drop-down menu",
            source: "Figure 2. A minimal drop-down menu with only two options.",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Shown open with two DropdownMenuItem entries (Option 1, Option 2).",
              },
            ],
          },
          {
            key: "long-scrollable-dropdown",
            variant: "Long, scrollable drop-down menu",
            source: "Figure 3. A long, scrollable drop-down menu.",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Shown open with many options requiring scrolling.",
              },
            ],
          },
          {
            key: "sectioned-dropdown-icons",
            variant: "Drop-down menu with sections, dividers, and leading/trailing icons",
            source: "Figure 4. A drop-down menu divided into sections with leading and trailing icons.",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Shown open with HorizontalDivider sections and leadingIcon/trailingIcon items (Profile, Settings, Send Feedback, About, Help).",
              },
            ],
          },
        ],
        note: "The Compose menu page documents a single component, DropdownMenu, in four pictured configurations",
      },
      web: {
        url: "https://www.radix-ui.com/primitives/docs/components/dropdown-menu",
        note: "button-anchored row actions menu; Radix Context Menu covers only the right-click variant",
        rows: [
          {
            key: "basic",
            variant: "Dropdown Menu (hero demo)",
            source: "https://www.radix-ui.com/primitives/docs/components/dropdown-menu",
            states: [
              {
                key: "closed",
                label: "trigger (closed)",
              },
              {
                key: "open",
                label: "open menu",
              },
            ],
          },
        ],
      },
    },
  },
  {
    slug: "popover",
    name: "Popover",
    level: "atoms",
    refs: {
      android: {
        none: "Material 3 has no popover component; the closest M3 patterns are the rich tooltip and menus.",
      },
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Popovers%2520%2528iPad%2520Only%2529",
        rows: [
          {
            key: "arrow",
            variant: "Arrow Positions",
            source: "Popovers (iPad Only)/{scheme}",
            states: [
              {
                key: "top-middle",
                label: "Top Middle",
              },
              {
                key: "bottom-middle",
                label: "Bottom Middle",
              },
              {
                key: "leading-middle",
                label: "Leading Middle",
              },
              {
                key: "trailing-middle",
                label: "Trailing Middle",
              },
            ],
          },
        ],
        note: "iPad only",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/popover",
        rows: [
          {
            key: "basic",
            variant: "Basic (header, title, description)",
            source: "https://ui.shadcn.com/docs/components/popover",
            states: [
              {
                key: "closed",
                label: "closed (trigger only)",
              },
            ],
          },
          {
            key: "with-form",
            variant: "With Form (Field, FieldGroup, Input inside PopoverContent)",
            source: "https://ui.shadcn.com/docs/components/popover",
            states: [
              {
                key: "closed",
                label: "closed (trigger only)",
              },
            ],
          },
        ],
        note: "shadcn Popover has no intent/size style variants; rows map to the documented example sections",
      },
    },
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    level: "atoms",
    refs: {
      ios: {
        none: "iOS has no tooltip; the HIG scopes hover tooltips to apps running on a Mac and to visionOS. Apps surface hints with TipKit tips or popovers instead.",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/tooltip",
        rows: [
          {
            key: "plain",
            variant: "Plain tooltip",
            source: "Section \"Display a plain tooltip\" (Figure 2)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single-line label tooltip shown above a heart icon button; appears on hover or long-press of the anchor.",
              },
            ],
          },
          {
            key: "rich",
            variant: "Rich tooltip",
            source: "Section \"Display a rich tooltip\" (Figure 3)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Multi-line tooltip with title and body text shown above an info icon button.",
              },
            ],
          },
          {
            key: "rich-custom",
            variant: "Rich tooltip, customized (title + dismiss action)",
            source: "Section \"Customize a rich tooltip\" (Figure 4)",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Custom rich tooltip with title, caret, and a dismiss action button, anchored to a camera icon.",
              },
            ],
          },
        ],
        note: "Compose M3 docs document two tooltip styles (plain, rich) plus a customized rich tooltip",
      },
      web: {
        url: "https://www.radix-ui.com/primitives/docs/components/tooltip",
        rows: [
          {
            key: "default",
            variant: "Default (Provider > Root > Trigger > Portal > Content + Arrow)",
            states: [
              {
                key: "closed",
                label: "data-state=closed",
              },
            ],
          },
        ],
        note: "Radix Tooltip is an unstyled primitive; its official state vocabulary is the [data-state] attribute on Trigger/Content: \"closed\", \"delayed-o",
      },
    },
  },
  {
    slug: "overlays",
    name: "Overlays (sheet / drawer)",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets",
        rows: [
          {
            key: "sheet-iphone",
            variant: "Sheet (iPhone)",
            source: "Sheets/{scheme}/iPhone",
            states: [
              {
                key: "large",
                label: "Large Detent",
              },
              {
                key: "medium",
                label: "Medium Detent",
              },
              {
                key: "inspector",
                label: "Inspector",
              },
            ],
          },
          {
            key: "sheet-ipad",
            variant: "Sheet (iPad)",
            source: "Sheets/{scheme}",
            states: [
              {
                key: "ipad",
                label: "iPad",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/bottom-sheets",
        rows: [
          {
            key: "modal-bottom-sheet",
            variant: "Modal bottom sheet (ModalBottomSheet)",
            source: "https://developer.android.com/develop/ui/compose/components/bottom-sheets",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image on the page; shows the sheet open over scrim. Hidden state is documented via SheetState.hide()/onDismissRequest but not depicted.",
              },
            ],
          },
          {
            key: "partial-bottom-sheet",
            variant: "Partial bottom sheet (ModalBottomSheet with skipPartiallyExpanded = false)",
            source: "https://developer.android.com/develop/ui/compose/components/bottom-sheets-partial",
            states: [
              {
                key: "partially-expanded",
                label: "partially expanded",
                note: "Figure 1: sheet initially fills only part of the screen",
              },
              {
                key: "expanded",
                label: "expanded (full screen)",
                note: "Figure 2: sheet after the user swipes up to fill the screen",
              },
            ],
          },
        ],
        note: "Compose docs depict sheet value states (PartiallyExpanded, Expanded, Hidden via SheetState), not interaction states like pressed or hovered",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/sheet",
        rows: [
          {
            key: "default",
            variant: "Default (slides in from right)",
            source: "https://ui.shadcn.com/docs/components/sheet#usage",
            states: [
              {
                key: "open",
                label: "open",
              },
            ],
          },
          {
            key: "side-top",
            variant: "Side: top",
            source: "https://ui.shadcn.com/docs/components/sheet#side",
            states: [
              {
                key: "open",
                label: "open",
              },
            ],
          },
          {
            key: "side-bottom",
            variant: "Side: bottom",
            source: "https://ui.shadcn.com/docs/components/sheet#side",
            states: [
              {
                key: "open",
                label: "open",
              },
            ],
          },
          {
            key: "side-left",
            variant: "Side: left",
            source: "https://ui.shadcn.com/docs/components/sheet#side",
            states: [
              {
                key: "open",
                label: "open",
              },
            ],
          },
        ],
        note: "shadcn/ui Sheet (built on Radix Dialog)",
      },
    },
  },
  {
    slug: "spinner",
    name: "Spinner",
    level: "atoms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Progress%2520Indicators",
        rows: [
          {
            key: "spinner",
            variant: "Indeterminate Spinner",
            source: "Progress Indicators/{scheme}",
            states: [
              {
                key: "small",
                label: "Small",
              },
              {
                key: "regular",
                label: "Regular",
              },
              {
                key: "large",
                label: "Large",
              },
              {
                key: "labeled",
                label: "With Label",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/progress",
        rows: [
          {
            key: "linear-determinate",
            variant: "Linear determinate (LinearProgressIndicator with progress)",
            source: "https://developer.android.com/develop/ui/compose/components/progress#determinate",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite Figure 1 (both types). Variant-specific motion demo is a video, not an image: https://developer.android.com/static/develop/ui/compose/images/components/linear-indicator-determinate.mp4 (verified video/mp4)",
              },
            ],
          },
          {
            key: "circular-determinate",
            variant: "Circular determinate (CircularProgressIndicator with progress)",
            source: "https://developer.android.com/develop/ui/compose/components/progress#determinate",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite Figure 1 (both types). Variant-specific motion demo is a video, not an image: https://developer.android.com/static/develop/ui/compose/images/components/circular-indicator-determinate.mp4 (verified video/mp4)",
              },
            ],
          },
          {
            key: "linear-indeterminate",
            variant: "Linear indeterminate (LinearProgressIndicator)",
            source: "https://developer.android.com/develop/ui/compose/components/progress#indeterminate",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite Figure 1 (both types). Variant-specific motion demo is a video, not an image: https://developer.android.com/static/develop/ui/compose/images/components/linear-indicator.mp4 (verified video/mp4)",
              },
            ],
          },
          {
            key: "circular-indeterminate",
            variant: "Circular indeterminate (CircularProgressIndicator)",
            source: "https://developer.android.com/develop/ui/compose/components/progress#indeterminate",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite Figure 1 (both types). Variant-specific motion demo is a video, not an image: https://developer.android.com/static/develop/ui/compose/images/components/circular-indicator.mp4 (verified video/mp4)",
              },
            ],
          },
        ],
        note: "Compose M3 docs depict each variant with an mp4 motion demo, not a still image",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/spinner",
        note: "Radix has no spinner primitive; its Progress is a progress bar, a different component",
        rows: [
          {
            key: "spinner",
            variant: "Spinner",
            source: "https://ui.shadcn.com/docs/components/spinner",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
      },
    },
  },
  {
    slug: "pagination",
    name: "Pagination",
    level: "atoms",
    refs: {
      android: {
        none: "Material 3 has no pagination component; M3 lists scroll continuously or load incrementally instead.",
      },
      ios: {
        none: "iOS has no numbered pagination; the dot page control is a swipe indicator for a handful of peer views, not page navigation for tables.",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/pagination",
        rows: [
          {
            key: "basic",
            variant: "Basic example (Previous/Next + page list + gap)",
            source: "https://catalyst.tailwindui.com/docs/pagination#basic-example",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "current-page",
            variant: "Current page active state (PaginationPage current)",
            source: "https://catalyst.tailwindui.com/docs/pagination#current-page-active-state",
            states: [
              {
                key: "current",
                label: "current page highlighted",
              },
            ],
          },
          {
            key: "disabled-prev-next",
            variant: "Disabling previous/next links (href omitted)",
            source: "https://catalyst.tailwindui.com/docs/pagination#disabling-previous-next-links",
            states: [
              {
                key: "disabled",
                label: "previous/next disabled",
              },
            ],
          },
          {
            key: "without-page-links",
            variant: "Without page links (Previous/Next only)",
            source: "https://catalyst.tailwindui.com/docs/pagination#without-page-links",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Catalyst exports Pagination, PaginationPrevious, PaginationNext, PaginationList, PaginationPage, PaginationGap",
      },
    },
  },
  {
    slug: "stepper",
    name: "Stepper",
    level: "organisms",
    refs: {
      android: {
        none: "steppers were a Material 1 pattern, dropped from the guidelines; Material 3 has no stepper component.",
      },
      ios: {
        none: "iOS has no multi-step wizard component; the HIG steppers page and the kit Stepper group are the +/- increment control. Flows use page controls or progress indicators instead.",
      },
      web: {
        url: "https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars",
        rows: [
          {
            key: "simple",
            variant: "Simple",
            source: "https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "panels",
            variant: "Panels",
            source: "https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "bullets",
            variant: "Bullets",
            source: "https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "circles",
            variant: "Circles",
            source: "https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Original link https://tailwindui.com/components/application-ui/navigation/steps now 301-redirects here (Tailwind UI was renamed Tailwind Plu",
      },
    },
  },
  {
    slug: "navbars",
    name: "Navbar",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars",
        rows: [
          {
            key: "top-iphone",
            variant: "Top Nav (iPhone)",
            source: "Toolbars/Top (44pt)/{scheme}/iPhone",
            states: [
              {
                key: "title",
                label: "Standard Title",
              },
              {
                key: "large",
                label: "Standard Large",
              },
              {
                key: "two-line",
                label: "Title 2 Line",
              },
            ],
          },
          {
            key: "top-ipad",
            variant: "Top Nav (iPad)",
            source: "Toolbars/Top (44pt)/{scheme}/iPad",
            states: [
              {
                key: "default-title",
                label: "Default Title",
              },
              {
                key: "large-title",
                label: "Large Title",
              },
            ],
          },
          {
            key: "bottom",
            variant: "Bottom Toolbar",
            source: "Toolbars/Bottom (48pt)/{scheme}/Composed",
            states: [
              {
                key: "controls",
                label: "Controls",
              },
              {
                key: "search",
                label: "Search",
              },
              {
                key: "search-focus",
                label: "Search Focused",
              },
            ],
          },
          {
            key: "buttons",
            variant: "Toolbar Buttons",
            source: "Toolbars/􀻃/{scheme}/Buttons - Symbol",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "selected",
                label: "Selected",
              },
              {
                key: "tinted",
                label: "Tinted",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
        ],
        note: "iOS 26+ nav bars are toolbars",
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/app-bars",
        rows: [
          {
            key: "top-app-bar-small",
            variant: "Small top app bar",
            source: "Small top app bar section",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
          {
            key: "top-app-bar-center-aligned",
            variant: "Center aligned top app bar",
            source: "Center aligned top app bar section",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
          {
            key: "top-app-bar-medium",
            variant: "Medium top app bar",
            source: "Medium top app bar section",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "page publishes only a line diagram for this variant, no rendered screenshot",
              },
            ],
          },
          {
            key: "top-app-bar-large",
            variant: "Large top app bar",
            source: "Large top app bar section",
            states: [
              {
                key: "enabled",
                label: "enabled",
              },
            ],
          },
        ],
        note: "Compose docs show one composite screenshot per app bar variant in its default (enabled) state; no per-interaction state imagery (pressed/foc",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/navbar",
        rows: [
          {
            key: "basic-example",
            variant: "Basic example",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-logo",
            variant: "With logo",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-active-state",
            variant: "With active state (current prop)",
            states: [
              {
                key: "current",
                label: "current item indicator (current prop)",
              },
              {
                key: "default",
                label: "non-current sibling items",
              },
            ],
          },
          {
            key: "with-dropdown",
            variant: "With dropdown",
            states: [
              {
                key: "closed",
                label: "menu closed",
              },
            ],
          },
        ],
        note: "Catalyst styles NavbarItem via Headless UI data attributes: data-hover and data-active backgrounds plus a focus ring; the current item indic",
      },
    },
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sidebar",
        rows: [
          {
            key: "items",
            variant: "Items",
            source: "Sidebar/{scheme}/Items",
            states: [
              {
                key: "level0",
                label: "Level 0",
              },
              {
                key: "level1",
                label: "Level 1",
              },
              {
                key: "level2",
                label: "Level 2",
              },
            ],
          },
          {
            key: "item-states",
            variant: "Item States",
            source: "Sidebar/􀻃/{scheme}/States",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "selected",
                label: "Selected",
              },
              {
                key: "disabled",
                label: "Disabled",
              },
            ],
          },
          {
            key: "header",
            variant: "Header",
            source: "Sidebar/{scheme}/Header",
            states: [
              {
                key: "header",
                label: "Header",
              },
            ],
          },
          {
            key: "search",
            variant: "Search",
            source: "Sidebar/􀻃/{scheme}/Search",
            states: [
              {
                key: "placeholder",
                label: "Placeholder",
              },
              {
                key: "value",
                label: "Value",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/drawer",
        rows: [
          {
            key: "modal",
            variant: "Modal navigation drawer (ModalNavigationDrawer)",
            source: "https://developer.android.com/develop/ui/compose/components/drawer",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: open drawer shown in light and dark mode (verified content-type image/png)",
              },
            ],
          },
          {
            key: "modal-detailed",
            variant: "Detailed modal drawer (sections + NavigationDrawerItem)",
            source: "https://developer.android.com/develop/ui/compose/components/drawer",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Single composite image: open drawer with two labeled sections, icons, and a selected item (verified content-type image/png)",
              },
            ],
          },
        ],
        note: "The Compose page documents the two Material drawer types (standard, modal) but only ships code examples and images for the modal drawer (Mod",
      },
      web: {
        url: "https://catalyst.tailwindui.com/docs/sidebar",
        rows: [
          {
            key: "basic",
            variant: "Basic example",
            source: "https://catalyst.tailwindui.com/docs/sidebar",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-icons",
            variant: "With icons",
            source: "https://catalyst.tailwindui.com/docs/sidebar",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
          {
            key: "with-active-state",
            variant: "With active state (current prop)",
            source: "https://catalyst.tailwindui.com/docs/sidebar",
            states: [
              {
                key: "current",
                label: "current item",
              },
            ],
          },
          {
            key: "with-section-headings",
            variant: "With section headings (SidebarHeading)",
            source: "https://catalyst.tailwindui.com/docs/sidebar",
            states: [
              {
                key: "default",
                label: "default",
              },
            ],
          },
        ],
        note: "Catalyst's docs enumerate examples, not states: the only documented state prop is `current` on SidebarItem (shown in the 'With active state'",
      },
    },
  },
  {
    slug: "calendar",
    name: "Calendar (date picker)",
    level: "organisms",
    refs: {
      ios: {
        url: "https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Date%2520and%2520Time%2520Pickers",
        rows: [
          {
            key: "inline",
            variant: "Inline Picker",
            source: "Date and Time Pickers/Inline Picker/{scheme}",
            states: [
              {
                key: "date",
                label: "Date",
              },
              {
                key: "time",
                label: "Time",
              },
              {
                key: "date-time",
                label: "Date and Time",
              },
            ],
          },
          {
            key: "compact",
            variant: "Compact Picker",
            source: "Date and Time Pickers/Compact Picker/{scheme}",
            states: [
              {
                key: "date",
                label: "Date",
              },
              {
                key: "time",
                label: "Time",
              },
            ],
          },
          {
            key: "wheel",
            variant: "Wheel",
            source: "Date and Time Pickers/Wheel/{scheme}",
            states: [
              {
                key: "time",
                label: "Time Picker",
              },
            ],
          },
          {
            key: "dates",
            variant: "Date Cells",
            source: "Date and Time Pickers/􀻃/Dark/Dates",
            states: [
              {
                key: "default",
                label: "Default",
              },
              {
                key: "selected",
                label: "Selected",
              },
              {
                key: "current",
                label: "Current",
              },
              {
                key: "current-selected",
                label: "Current and Selected",
              },
            ],
          },
        ],
      },
      android: {
        url: "https://developer.android.com/develop/ui/compose/components/datepickers",
        rows: [
          {
            key: "docked",
            variant: "Docked date picker",
            source: "https://developer.android.com/develop/ui/compose/components/datepickers",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: DOB text field with trailing calendar icon and the docked calendar open below it, with a selected day",
              },
            ],
          },
          {
            key: "modal",
            variant: "Modal date picker",
            source: "https://developer.android.com/develop/ui/compose/components/datepickers",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: dialog calendar with a selected date and OK/Cancel actions",
              },
            ],
          },
          {
            key: "modal-input",
            variant: "Modal date picker with input",
            source: "https://developer.android.com/develop/ui/compose/components/datepickers",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: dialog in text-input mode for typing the date directly",
              },
            ],
          },
          {
            key: "range",
            variant: "Modal date range picker",
            source: "https://developer.android.com/develop/ui/compose/components/datepickers",
            states: [
              {
                key: "enabled",
                label: "enabled",
                note: "Composite: dialog calendar with start date, end date, and the highlighted range between them",
              },
            ],
          },
        ],
        note: "The Compose docs depict each date picker variant with one composite screenshot; no per-state (hovered/pressed/disabled) imagery is published",
      },
      web: {
        url: "https://ui.shadcn.com/docs/components/calendar",
        rows: [
          {
            key: "default",
            variant: "Default (single selection)",
            source: "https://ui.shadcn.com/docs/components/calendar",
            states: [
              {
                key: "default",
                label: "default (selected day shown)",
              },
            ],
          },
          {
            key: "range",
            variant: "Range Calendar (mode=\"range\")",
            source: "https://ui.shadcn.com/docs/components/calendar",
            states: [
              {
                key: "default",
                label: "default (range start, end, and middle styling)",
              },
            ],
          },
          {
            key: "month-year-dropdown",
            variant: "Month and Year Selector (captionLayout=\"dropdown\")",
            source: "https://ui.shadcn.com/docs/components/calendar",
            states: [
              {
                key: "default",
                label: "default (dropdown caption closed)",
              },
            ],
          },
          {
            key: "booked-dates",
            variant: "Booked Dates (disabled days)",
            source: "https://ui.shadcn.com/docs/components/calendar",
            states: [
              {
                key: "default",
                label: "default with disabled/booked days struck out",
              },
            ],
          },
        ],
        note: "shadcn/ui Calendar wraps react-day-picker",
      },
    },
  },
];
