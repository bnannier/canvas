import { createSlider } from "./slider.shared.js";
import { webSkin } from "./slider.styles.js";

// Web Slider (the base; Metro falls back to it on native, web bundlers resolve it).
export const Slider = createSlider(webSkin);
export type { SliderProps } from "./slider.shared.js";
