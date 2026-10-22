// The deep verification screens the native journeys drive (tools/native/flows).
export const JOURNEYS = [
  { route: "/testing/diagnostics", title: "Diagnostics", description: "Candidate runtime identity" },
  { route: "/testing/control-refs", title: "Control refs", description: "Public refs, focus requests and change callbacks" },
  { route: "/testing/form-autocomplete", title: "Form and autocomplete", description: "Selection, submit, keyboard bands and sheets" },
  { route: "/testing/listbox", title: "Listbox", description: "Single and multiple selection" },
  { route: "/testing/tabs", title: "Tabs", description: "Selection and disabled tabs" },
  { route: "/testing/escape-layers", title: "Overlays", description: "Drawer menus, dialogs and sheets" },
  { route: "/testing/carousel", title: "Carousel", description: "Native paging and the page picker" },
  { route: "/testing/materials", title: "Materials", description: "Glass and solid lifecycle and capture" },
  { route: "/testing/touch-target", title: "Touch targets", description: "Minimum hit areas" },
  { route: "/testing/hover", title: "Hover", description: "Pointer hover states" },
  { route: "/testing/avatar", title: "Avatar", description: "Generated avatar colours" },
] as const;
