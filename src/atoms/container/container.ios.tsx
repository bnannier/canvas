import { createContainer } from "./container.shared.js";
import { iosSkin } from "./container.styles.js";

// iOS (HIG) Container. Metro resolves this file on iOS. Layout is a Shared
// treatment: iosSkin references the same padding scale as the web skin.
export const Container = createContainer(iosSkin);
export type { ContainerProps } from "./container.shared.js";
