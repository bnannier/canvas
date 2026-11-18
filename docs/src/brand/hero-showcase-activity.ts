import { createContext, useContext, useEffect, useState } from "react";

/** Only visible, unpaused hero specimens demonstrate their state. */
export const ShowcaseActivity = createContext(false);
/** Per-collage storage survives removal of a specimen between its turns. */
export const ShowcaseStep = createContext<{ current: number } | null>(null);

/** Keep the current demonstration frame when its specimen pauses or leaves view. */
export function useDemonstrationStep(period: number) {
  const active = useContext(ShowcaseActivity);
  const memory = useContext(ShowcaseStep);
  const [step, setStep] = useState(() => memory?.current ?? 0);
  useEffect(() => {
    if (!active || !memory) return;
    const timer = setInterval(() => {
      memory.current = (memory.current + 1) % 120;
      setStep(memory.current);
    }, period);
    return () => clearInterval(timer);
  }, [active, memory, period]);
  return step;
}
