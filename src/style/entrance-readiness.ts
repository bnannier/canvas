import { createContext } from "react";

// Focus readiness only. A held ancestor must not announce ready descendants;
// each Entrance still controls its own animation independently.
export const EntranceReadinessContext = createContext(true);
