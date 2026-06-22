import { createInputOTP } from "./input-otp.shared.js";
import { iosSkin } from "./input-otp.styles.js";

// iOS (HIG) InputOTP. Metro resolves this on iOS.
export const InputOTP = createInputOTP(iosSkin);
export type { InputOTPProps } from "./input-otp.shared.js";
