import { createInputOTP } from "./input-otp.shared.js";
import { webSkin } from "./input-otp.styles.js";

// Web InputOTP (the base; Metro falls back to it on native, web bundlers resolve it).
export const InputOTP = createInputOTP(webSkin);
export type { InputOTPProps } from "./input-otp.shared.js";
