import { describe, expect, mock, test } from "bun:test";
import { demoDelay, ShowcaseClock, type DemoStatus } from "../docs/src/ui/showcase/demo-clock.ts";

const playing: DemoStatus = { active: true, manual: false };
const paused: DemoStatus = { active: false, manual: false };
const manual: DemoStatus = { active: false, manual: true };

function track(clock: ShowcaseClock, id: string, options: { interval?: number; delay?: number } = {}) {
  const advance = mock(() => {});
  const reset = mock(() => {});
  const status = mock((_state: DemoStatus) => {});
  const unsubscribe = clock.subscribe(id, { ...options, advance, reset, status });
  return { advance, reset, status, unsubscribe };
}

function elapse(clock: ShowcaseClock, ms: number) {
  for (let remaining = ms; remaining > 0; remaining -= 100) clock.tick(Math.min(remaining, 100));
}

describe("section showcase clock", () => {
  test("staggers the first change by card and then uses the authored interval", () => {
    const clock = new ShowcaseClock();
    const [firstId, secondId] = ["c-input", "c-tabs"].sort((a, b) => demoDelay(a) - demoDelay(b));
    const interval = 1200;
    const first = track(clock, firstId!, { interval });
    const second = track(clock, secondId!, { interval });
    clock.visible(firstId!, true);
    clock.visible(secondId!, true);

    const firstAt = interval + demoDelay(firstId!);
    const secondAt = interval + demoDelay(secondId!);
    expect(firstAt).toBeLessThan(secondAt);
    elapse(clock, firstAt - 1);
    expect(first.advance).not.toHaveBeenCalled();
    clock.tick(1);
    expect(first.advance).toHaveBeenCalledTimes(1);
    expect(second.advance).not.toHaveBeenCalled();

    elapse(clock, secondAt - firstAt);
    expect(second.advance).toHaveBeenCalledTimes(1);
    elapse(clock, interval - (secondAt - firstAt) - 1);
    expect(first.advance).toHaveBeenCalledTimes(1);
    clock.tick(1);
    expect(first.advance).toHaveBeenCalledTimes(2);
  });

  test("pauses offscreen and in the background without counting suspended time", () => {
    const clock = new ShowcaseClock();
    const card = track(clock, "c-slider", { interval: 300, delay: 0 });
    expect(card.status).toHaveBeenLastCalledWith(paused);
    elapse(clock, 900);
    expect(card.advance).not.toHaveBeenCalled();

    clock.visible("c-slider", true);
    expect(card.status).toHaveBeenLastCalledWith(playing);
    clock.tick(100);
    clock.visible("c-slider", false);
    expect(card.status).toHaveBeenLastCalledWith(paused);
    elapse(clock, 1800);

    clock.visible("c-slider", true);
    clock.tick(80);
    clock.background(false);
    expect(card.status).toHaveBeenLastCalledWith(paused);
    elapse(clock, 1800);
    expect(card.advance).not.toHaveBeenCalled();
    expect(card.reset).not.toHaveBeenCalled();

    clock.background(true);
    expect(card.status).toHaveBeenLastCalledWith(playing);
    clock.tick(119);
    expect(card.advance).not.toHaveBeenCalled();
    clock.tick(1);
    expect(card.advance).toHaveBeenCalledTimes(1);
    clock.tick(299);
    expect(card.advance).toHaveBeenCalledTimes(1);
    clock.tick(1);
    expect(card.advance).toHaveBeenCalledTimes(2);
  });

  test("returns to the resting frame under Reduced Motion and restarts without a backlog", () => {
    const clock = new ShowcaseClock();
    const card = track(clock, "c-form", { interval: 200, delay: 300 });
    clock.visible("c-form", true);
    clock.tick(500);
    expect(card.advance).toHaveBeenCalledTimes(1);
    clock.tick(120);

    clock.motion(false);
    expect(card.reset).toHaveBeenCalledTimes(1);
    expect(card.status).toHaveBeenLastCalledWith(paused);
    elapse(clock, 2000);
    clock.motion(false);
    expect(card.reset).toHaveBeenCalledTimes(1);
    expect(card.advance).toHaveBeenCalledTimes(1);

    clock.motion(true);
    expect(card.status).toHaveBeenLastCalledWith(playing);
    clock.tick(199);
    expect(card.advance).toHaveBeenCalledTimes(1);
    clock.tick(1);
    expect(card.advance).toHaveBeenCalledTimes(2);
  });

  test("holding a card during a touch pauses only that card until the gesture ends", () => {
    const clock = new ShowcaseClock();
    const id = "c-input";
    const touched = track(clock, id, { interval: 200, delay: 0 });
    const sibling = track(clock, "c-select", { interval: 200, delay: 0 });
    clock.visible(id, true);
    clock.visible("c-select", true);
    clock.tick(100);

    clock.hold(id, true);
    expect(touched.status).toHaveBeenLastCalledWith(paused);
    clock.tick(300);
    expect(touched.advance).not.toHaveBeenCalled();
    expect(sibling.advance).toHaveBeenCalledTimes(1);

    clock.hold(id, false);
    expect(touched.status).toHaveBeenLastCalledWith(playing);
    clock.tick(99);
    expect(touched.advance).not.toHaveBeenCalled();
    clock.tick(1);
    expect(touched.advance).toHaveBeenCalledTimes(1);
    expect(touched.reset).not.toHaveBeenCalled();

    clock.hold(id, true);
    clock.stop(id);
    clock.hold(id, false);
    expect(touched.status).toHaveBeenLastCalledWith(manual);
    clock.tick(500);
    expect(touched.advance).toHaveBeenCalledTimes(1);
  });

  test("manual takeover stays with the card across subscriber rebind and preference changes", () => {
    const clock = new ShowcaseClock();
    const id = "c-switch";
    const first = track(clock, id, { interval: 200, delay: 0 });
    const second = track(clock, id, { interval: 240, delay: 0 });
    const sibling = track(clock, "c-radio", { interval: 200, delay: 0 });
    clock.visible(id, true);
    clock.visible("c-radio", true);
    clock.tick(240);
    expect(first.advance).toHaveBeenCalledTimes(1);
    expect(second.advance).toHaveBeenCalledTimes(1);

    clock.stop(id);
    expect(first.status).toHaveBeenLastCalledWith(manual);
    expect(second.status).toHaveBeenLastCalledWith(manual);
    first.unsubscribe();
    second.unsubscribe();
    expect(clock.watches(id)).toBe(false);
    const replacement = track(clock, id, { interval: 200, delay: 0 });
    expect(replacement.status).toHaveBeenLastCalledWith(manual);

    clock.motion(false);
    clock.background(false);
    clock.visible(id, false);
    clock.visible(id, true);
    clock.background(true);
    clock.motion(true);
    clock.tick(240);
    expect(replacement.status).toHaveBeenLastCalledWith(manual);
    expect(replacement.advance).not.toHaveBeenCalled();
    expect(replacement.reset).not.toHaveBeenCalled();
    expect(sibling.advance).toHaveBeenCalledTimes(2);
    expect(sibling.reset).toHaveBeenCalledTimes(1);
  });
});
