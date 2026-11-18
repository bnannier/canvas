// One sparse clock for functional demonstrations. Components still own their
// smooth transitions; this only advances authored states, never animation frames.
export interface DemoStatus { active: boolean; manual: boolean }
interface Subscriber {
  interval: number;
  elapsed: number;
  next: number;
  advance: () => void;
  reset: () => void;
  status: (state: DemoStatus) => void;
}
interface DemoEntry { visible: boolean; manual: boolean; held: boolean; subscribers: Set<Subscriber> }

export function demoDelay(id: string): number {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return 200 + hash % 1200;
}

export class ShowcaseClock {
  private entries = new Map<string, DemoEntry>();
  private enabled = true;
  private foreground = true;

  private entry(id: string): DemoEntry {
    let entry = this.entries.get(id);
    if (!entry) {
      entry = { visible: false, manual: false, held: false, subscribers: new Set() };
      this.entries.set(id, entry);
    }
    return entry;
  }

  private state(entry: DemoEntry): DemoStatus {
    return { active: this.enabled && this.foreground && entry.visible && !entry.manual && !entry.held, manual: entry.manual };
  }

  private report(entry: DemoEntry) {
    const state = this.state(entry);
    for (const subscriber of entry.subscribers) subscriber.status(state);
  }

  subscribe(id: string, options: {
    interval?: number; delay?: number; advance: () => void; reset: () => void;
    status: (state: DemoStatus) => void;
  }): () => void {
    const interval = Math.max(160, options.interval ?? 1800);
    const subscriber: Subscriber = { ...options, interval, elapsed: 0, next: interval + (options.delay ?? demoDelay(id)) };
    const entry = this.entry(id);
    entry.subscribers.add(subscriber);
    subscriber.status(this.state(entry));
    return () => {
      entry.subscribers.delete(subscriber);
    };
  }

  watches(id: string): boolean { return (this.entries.get(id)?.subscribers.size ?? 0) > 0; }
  forget(id: string) { this.entries.delete(id); }

  visible(id: string, visible: boolean) {
    const entry = this.entry(id);
    if (entry.visible === visible) return;
    entry.visible = visible;
    this.report(entry);
  }

  stop(id: string) {
    const entry = this.entry(id);
    if (entry.manual) return;
    entry.manual = true;
    this.report(entry);
  }

  hold(id: string, held: boolean) {
    const entry = this.entry(id);
    if (entry.held === held) return;
    entry.held = held;
    this.report(entry);
  }

  motion(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    for (const entry of this.entries.values()) {
      for (const subscriber of entry.subscribers) {
        if (!enabled && !entry.manual) {
          subscriber.elapsed = 0;
          subscriber.next = subscriber.interval;
          subscriber.reset();
        }
      }
      this.report(entry);
    }
  }

  background(foreground: boolean) {
    if (this.foreground === foreground) return;
    this.foreground = foreground;
    for (const entry of this.entries.values()) {
      if (!foreground) entry.held = false;
      this.report(entry);
    }
  }

  tick(milliseconds: number) {
    if (!this.enabled || !this.foreground) return;
    for (const entry of this.entries.values()) {
      if (!this.state(entry).active) continue;
      for (const subscriber of entry.subscribers) {
        subscriber.elapsed += Math.max(0, Math.min(milliseconds, 500));
        if (subscriber.elapsed < subscriber.next) continue;
        subscriber.elapsed -= subscriber.next;
        subscriber.next = subscriber.interval;
        subscriber.advance();
      }
    }
  }
}
