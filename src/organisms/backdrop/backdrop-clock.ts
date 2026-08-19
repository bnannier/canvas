import { Animated, Easing } from "react-native";

// The Backdrop's animation clock: a small set of general-purpose looping channels
// that a scene binds its layers to. Every Animated.Value lives at MODULE scope and
// loops forever, so two Backdrops running at the same energy share one phase. That
// is what makes a backdrop CONTINUE across page changes, tab switches and
// back-swipes instead of restarting: the phase is global, so a newly mounted
// surface renders the exact frame the previous one was showing.
//
// Clocks are keyed by energy, because energy is the only prop that changes a RATE.
// Two backdrops at the same energy share values (continuity); two at different
// energies get independent clocks, which is correct rather than a bug.
//
// Two Animated quirks are encoded here and must not be "cleaned up":
//   - Animated.loop resets a value to its CONSTRUCTOR value before every iteration
//     (including the first), so all values are constructed at 0; pre-phase and
//     poster states go through setValue.
//   - A stopped loop composite cannot be restarted (isFinished latches), so
//     composites are REBUILT on every start. Building is cheap.
//
// Every loop passes useNativeDriver: false, without exception. See src/style/motion.ts:
// native-driver loops run one pass and freeze on react-native-web and do not advance
// under the New Architecture on iOS.

export type Energy = "calm" | "default" | "energetic";

/** Master flight period per energy, in ms. */
const FLIGHT_PERIOD: Record<Energy, number> = {
  calm: 44000,
  default: 32000,
  energetic: 20000,
};

/** The shimmer half-period per energy, in ms. */
const TWINKLE_HALF: Record<Energy, number> = {
  calm: 4600,
  default: 3500,
  energetic: 2400,
};

/** One body's full flare cycle per energy, in ms. Renderers spread a field across
 *  this cycle in phase buckets, so the sky sees a flare roughly every
 *  period/buckets rather than every period. */
const SCINTILLATE_PERIOD: Record<Energy, number> = {
  calm: 6400,
  default: 4600,
  energetic: 3200,
};

export interface BackdropClock {
  /** Master 0..1 ramp over the flight period. Layers derive staggered sawtooth
   *  phases from it, so every layer stays locked to one timeline. */
  flight: Animated.Value;
  /** Shimmer, 0..1..0. Pulse, breathe, anything that swells and settles as one. */
  twinkle: Animated.Value;
  /** Scintillation ramp, a linear 0..1 SAWTOOTH at the flare period. The sawtooth
   *  is the point: it can be phase-shifted per body (see the renderer's buckets)
   *  so flares land at unrelated moments across the field, which a ping-pong
   *  cannot do without a discontinuity at the turn. */
  scintillate: Animated.Value;
  /** Very slow 0..1 ramp (180s). Rotation, hue drift, anything near-static. */
  drift: Animated.Value;
  /** Medium 0..1..0 breath (11s). Scale and opacity swells. */
  breath: Animated.Value;
  /** Rare event cycle: parked, then a sweep. Comets, meteors, flashes. */
  event: Animated.Value;
}

interface Entry {
  clock: BackdropClock;
  mode: "running" | "poster" | null;
  count: number;
  running: Animated.CompositeAnimation[];
  /** The master phase survives stops, so toggling a backdrop off and back on
   *  resumes where it left off rather than restarting. */
  phase: number;
}

const entries = new Map<Energy, Entry>();

function makeClock(): BackdropClock {
  return {
    flight: new Animated.Value(0),
    twinkle: new Animated.Value(0),
    scintillate: new Animated.Value(0),
    drift: new Animated.Value(0),
    breath: new Animated.Value(0),
    event: new Animated.Value(0),
  };
}

function entryFor(energy: Energy): Entry {
  let e = entries.get(energy);
  if (!e) {
    e = { clock: makeClock(), mode: null, count: 0, running: [], phase: 0 };
    entries.set(energy, e);
  }
  return e;
}

/** Read a clock without retaining it (renderers bind interpolations to these). */
export function backdropClock(energy: Energy): BackdropClock {
  return entryFor(energy).clock;
}

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

function startAll(e: Entry, energy: Energy) {
  const flight = FLIGHT_PERIOD[energy];
  e.running = [
    linLoop(e.clock.flight, flight, e.phase),
    breathe(e.clock.twinkle, TWINKLE_HALF[energy]),
    linLoop(e.clock.scintillate, SCINTILLATE_PERIOD[energy], 0),
    linLoop(e.clock.drift, 180000, 0),
    breathe(e.clock.breath, 5500),
    Animated.loop(
      Animated.sequence([
        Animated.delay(Math.round(flight * 0.8)),
        Animated.timing(e.clock.event, {
          toValue: 1,
          duration: Math.round(flight * 0.22),
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ),
  ];
  e.running.forEach((a) => a.start());
}

function stopAll(e: Entry) {
  // stopAnimation's callback is synchronous on the JS driver: capture the live phase.
  e.clock.flight.stopAnimation((v) => {
    e.phase = v % 1;
  });
  e.running.forEach((a) => a.stop());
  e.running = [];
}

// The composed poster still for Reduce Motion: layers graduated mid-flight (each
// sawtooth offset spreads the single 0.35), sky at mid-shimmer, slow channels at
// rest, the rare event parked offscreen.
function poster(e: Entry) {
  stopAll(e);
  e.clock.flight.setValue(0.35);
  e.clock.twinkle.setValue(0.5);
  // Mid-ramp, not zero: the bucket offsets fan out from here, so the still frame
  // catches one bucket near its peak and the rest strung down the falloff, which
  // is a sky with bright and faint stars rather than one flat field.
  e.clock.scintillate.setValue(0.5);
  e.clock.drift.setValue(0);
  e.clock.breath.setValue(0.5);
  e.clock.event.setValue(0);
}

/** Bind a Backdrop to its clock. Idempotent per mode; refcounted per energy. */
export function retainBackdropClock(energy: Energy, want: "running" | "poster"): void {
  const e = entryFor(energy);
  e.count++;
  if (e.mode === want) return;
  e.mode = want;
  if (want === "running") {
    stopAll(e);
    startAll(e, energy);
  } else {
    poster(e);
  }
}

/** Release a Backdrop; the last release stops every timer for that energy,
 *  capturing the flight phase for the next retain. */
export function releaseBackdropClock(energy: Energy): void {
  const e = entries.get(energy);
  if (!e) return;
  e.count = Math.max(0, e.count - 1);
  if (e.count === 0) {
    stopAll(e);
    e.mode = null;
  }
}

/** Test seam: drop every clock so a suite starts from a known state. */
export function resetBackdropClocks(): void {
  entries.forEach((e) => stopAll(e));
  entries.clear();
}
