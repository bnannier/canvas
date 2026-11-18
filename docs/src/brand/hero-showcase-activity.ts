import { createContext, useContext, useEffect, useState } from "react";

/** Only visible, unpaused hero specimens demonstrate their state. */
export const ShowcaseActivity = createContext(false);

/** Keep the current demonstration frame when its specimen pauses or leaves view. */
export function useDemonstrationStep(period: number) {
  const active = useContext(ShowcaseActivity);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setStep(previous => (previous + 1) % 120), period);
    return () => clearInterval(timer);
  }, [active, period]);
  return step;
}
