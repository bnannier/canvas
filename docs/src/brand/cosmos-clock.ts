import { Animated, Easing } from "react-native";

// The Canvas Universe's singleton clock. Every Animated.Value lives at MODULE scope
// and loops forever; every mounted Cosmos binds its interpolations to these shared
// values, so any screen shows the same flight phase. That is what makes the journey
// CONTINUE across page changes, tab switches, and back-swipes: the sky is seeded
// identically everywhere and the phase is global, so a newly mounted screen renders
// the exact frame the previous screen was showing.
//
// Animated.loop resets a value to its CONSTRUCTOR value before every iteration
// (including the first), so all values are constructed at 0; pre-phase and poster
// states go through setValue. A stopped loop composite cannot be restarted
// (isFinished latches), so composites are REBUILT on every start; building is cheap.

export const FLIGHT_PERIOD = 32000;

export const clock = {
  /** Master fly-through phase, 0..1 over FLIGHT_PERIOD; shells derive staggered
   *  sawtooth phases from it via chained interpolations. */
  flight: new Animated.Value(0),
  /** Global shimmer, 0..1..0 over 7s: star twinkle, chart glow, core pulse. */
  twinkle: new Animated.Value(0),
  /** Galaxy core rotation, 0..1 over 180s. */
  coreSpin: new Animated.Value(0),
  /** Galaxy core breathing, 0..1..0 over 11s. */
  coreBreath: new Animated.Value(0),
  /** Comet cycle: parked offscreen 26s, then a 7s sweep. */
  comet: new Animated.Value(0),
};

type Mode = "running" | "poster";
let mode: Mode | null = null;
let count = 0;
let running: Animated.CompositeAnimation[] = [];
// The master phase survives stops (Frost toggled off and back on resumes the flight
// where it left off).
let flightPhase = 0;

const lin = (v: Animated.Value, duration: number) =>
  Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: false });

// Resume a linear 0..1 loop from `phase`: timing starts from the CURRENT value and
// never resets, so a head timing runs phase -> 1 at the loop's speed, then the loop
// owns the full passes (its per-iteration reset returns to the constructor value 0).
function linLoop(v: Animated.Value, period: number, phase: number) {
  v.setValue(phase);
  if (phase <= 0) return Animated.loop(lin(v, period));
  return Animated.sequence([lin(v, Math.round(period * (1 - phase))), Animated.loop(lin(v, period))]);
}

function breathe(v: Animated.Value, half: number) {
  v.setValue(0);
  return Animated.loop(
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]),
  );
}

function startAll() {
  running = [
    linLoop(clock.flight, FLIGHT_PERIOD, flightPhase),
    breathe(clock.twinkle, 3500),
    linLoop(clock.coreSpin, 180000, 0),
    breathe(clock.coreBreath, 5500),
    Animated.loop(
      Animated.sequence([
        Animated.delay(26000),
        Animated.timing(clock.comet, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ),
  ];
  running.forEach((a) => a.start());
}

function stopAll() {
  // stopAnimation's callback is synchronous on the JS driver: capture the live phase.
  clock.flight.stopAnimation((v) => {
    flightPhase = v % 1;
  });
  running.forEach((a) => a.stop());
  running = [];
}

// The composed poster still for Reduce Motion: shells graduated mid-flight (each
// sawtooth offset spreads the single 0.35), sky at mid-twinkle, galaxy resting,
// comet parked offscreen.
function poster() {
  stopAll();
  clock.flight.setValue(0.35);
  clock.twinkle.setValue(0.5);
  clock.coreSpin.setValue(0);
  clock.coreBreath.setValue(0.5);
  clock.comet.setValue(0);
}

/** Bind a Cosmos instance to the clock. Idempotent per mode; refcounted. */
export function retainCosmosClock(want: Mode): void {
  count++;
  if (mode === want) return;
  mode = want;
  if (want === "running") {
    stopAll();
    startAll();
  } else {
    poster();
  }
}

/** Release a Cosmos instance; the last release stops every timer (e.g. solid mode
 *  everywhere), capturing the flight phase for the next retain. */
export function releaseCosmosClock(): void {
  count = Math.max(0, count - 1);
  if (count === 0) {
    stopAll();
    mode = null;
  }
}
