import { Platform, type Role } from "react-native";

// ARIA names a mutually exclusive menu choice menuitemradio. Fabric accepts
// radio instead; keep the browser spelling out of native props, as for LISTBOX.
export const MENU_CHOICE_ROLES = { web: "menuitemradio", native: "radio" satisfies Role } as const;
export const MENU_CHOICE: Role = Platform.OS === "web" ? (MENU_CHOICE_ROLES.web as Role) : MENU_CHOICE_ROLES.native;
