import { createInputOTP } from "./input-otp.shared.js";
import { androidSkin } from "./input-otp.styles.js";

// Material 3 InputOTP. Metro resolves this on Android.
export const InputOTP = createInputOTP(androidSkin);
export type { InputOTPProps } from "./input-otp.shared.js";
