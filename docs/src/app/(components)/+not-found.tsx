// Keep the fallback with the dynamic docs routes: Expo prefers the current route
// group, so a home-group catch-all masks /foundations on client navigation. This
// group also keeps the fallback inside a registered tab on native.
export { NotFoundPage as default } from "../../ui/not-found";
