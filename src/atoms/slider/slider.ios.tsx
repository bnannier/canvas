import { createSlider } from "./slider.shared.js";
import { iosSkin } from "./slider.styles.js";

// iOS (HIG) Slider. Metro resolves this file on iOS; the docs import it for preview.
export const Slider = createSlider(iosSkin);
export type { SliderProps } from "./slider.shared.js";
