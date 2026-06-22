import { createSlider } from "./slider.shared.js";
import { androidSkin } from "./slider.styles.js";

// Material 3 Slider. Metro resolves this file on Android; the docs import it for preview.
export const Slider = createSlider(androidSkin);
export type { SliderProps } from "./slider.shared.js";
