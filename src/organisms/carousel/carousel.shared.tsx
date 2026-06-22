import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import {
  View,
  Text,
  Pressable,
  useTheme,
  useReducedMotion,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";
import { Icon } from "../../atoms/icon/icon.js";

// Shared Carousel shell. The structure (a horizontally paged FlatList of slides
// with snap paging, optional overlaid prev/next arrows, and a dot indicator
// strip), the controlled-or-uncontrolled current-index state, the viewport
// measurement, the paging/scroll math, the loop/clamp navigation, and the
// accessibility live here once; a platform file supplies only its skin (the
// slide corner radius, the dot shape/size/tint, the active-dot treatment, and
// the arrow button shape + press feedback) and calls createCarousel.
//
// The carousel is a CONTENT-layer surface, so it stays SOLID on every platform
// (it is never routed through GlassSurface; per Apple, glass is the material for
// the functional layer only).
//
// Current index is controlled OR uncontrolled:
//   - Uncontrolled: omit `index`; the component tracks the current slide in
//     internal state, seeded once from `defaultIndex` (default 0).
//   - Controlled: pass `index` plus `onIndexChange`; the parent owns the slide,
//     and an effect scrolls the FlatList whenever the controlled index changes.
//
// Paging: the FlatList is `horizontal pagingEnabled`; each slide sits in a
// wrapper View sized to the measured viewport width, so a swipe snaps exactly
// one slide. The current index is read off `onMomentumScrollEnd`
// (Math.round(contentOffset.x / width)). Arrows step +/-1 (clamped, or wrapped
// when `loop`); each dot jumps straight to its slide. All width math is guarded
// against the initial width === 0 frame (the FlatList renders only once the
// viewport has measured a positive width).

// The platform-varying surface. Everything shape/color/feedback-bearing the
// slides, arrows, and dots need lives here, built from the active tokens (so
// each follows light/dark).
export interface CarouselSkin {
  /** iOS/web dim the arrow on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android arrow ripple; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the arrow/dot Pressables, so the
   * react-native-web keyboard-focus blue ring (which a real device never shows)
   * is suppressed. No-op natively, where `outline*` are not real styles.
   */
  focusOutlineReset?: ViewStyle;

  /** The slide wrapper shape (corner radius; the content clips to it). */
  slide: (t: ColorTokens) => ViewStyle;

  /** The circular arrow button shape (size, radius, fill, border, shadow). */
  arrow: (t: ColorTokens) => ViewStyle;
  /** The chevron glyph size inside an arrow button, in px. */
  arrowIconSize: number;
  /** Extra inset of each arrow from the carousel edge, in px (left/right). */
  arrowInset: number;

  /** The dot strip layout (the centered Row below the slides). */
  dotsRow: (t: ColorTokens) => ViewStyle;
  /** One indicator dot; `active` widens/tints it to the brand `primary`. */
  dot: (t: ColorTokens, active: boolean) => ViewStyle;

  /** The default slide-content text type (when a slide is a plain string). */
  slideText: (t: ColorTokens) => TextStyle;
}

export interface CarouselItem {
  /** Stable identity for the slide. */
  key: string;
  /** The slide body. A string renders in the skin's slide-text type; a
   *  ReactNode renders as-is. */
  content: ReactNode;
}

export interface CarouselProps {
  /** The slides, left to right. */
  items: CarouselItem[];
  /** Controlled current slide. Pair with `onIndexChange`. Omit for uncontrolled. */
  index?: number;
  /** Initial current slide for the uncontrolled case (read once; default 0). */
  defaultIndex?: number;
  /** Called with the next current index whenever the slide changes. */
  onIndexChange?: (index: number) => void;
  /** Wrap from the last slide to the first (and first to last) on arrow nav. */
  loop?: boolean;
  /** Show the overlaid prev/next chevron buttons (default true). */
  showArrows?: boolean;
  /** Show the centered dot indicators below the slides (default true). */
  showDots?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  { key: "one", content: "Slide 1" },
  { key: "two", content: "Slide 2" },
  { key: "three", content: "Slide 3" },
];

// Clamp `i` into [0, count-1], or wrap around when `loop` is set.
function nextIndex(i: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  if (loop) return (i + count) % count;
  return Math.max(0, Math.min(count - 1, i));
}

/** Build a Carousel component from a platform skin. */
export function createCarousel(skin: CarouselSkin) {
  // One overlaid edge arrow (prev or next), vertically centered over the slides.
  function Arrow({
    side,
    disabled,
    onPress,
  }: {
    side: "prev" | "next";
    disabled: boolean;
    onPress: () => void;
  }) {
    const { tokens } = useTheme();
    const edge = side === "prev" ? { left: skin.arrowInset } : { right: skin.arrowInset };
    return (
      <View pointerEvents="box-none" style={[ARROW_LAYER, edge]}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          disabled={disabled}
          android_ripple={skin.ripple && !disabled ? skin.ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityLabel={side === "prev" ? "Previous slide" : "Next slide"}
          accessibilityState={{ disabled }}
          aria-disabled={disabled}
          style={({ pressed }) => [
            skin.arrow(tokens),
            skin.focusOutlineReset,
            disabled ? DISABLED_DIM : null,
            skin.pressedOpacity != null && pressed && !disabled ? { opacity: skin.pressedOpacity } : null,
          ]}
        >
          {side === "prev" ? (
            <Icon chevronLeft muted size={skin.arrowIconSize} />
          ) : (
            <Icon chevronRight muted size={skin.arrowIconSize} />
          )}
        </Pressable>
      </View>
    );
  }

  return function Carousel(props: CarouselProps) {
    const {
      items = DEFAULT_ITEMS,
      index,
      defaultIndex = 0,
      onIndexChange,
      loop = false,
      showArrows = true,
      showDots = true,
      style,
    } = props;
    const { tokens } = useTheme();
    const reduced = useReducedMotion();
    const count = items.length;

    // Uncontrolled store, seeded once from defaultIndex; ignored when controlled.
    const [internal, setInternal] = useState(() => nextIndex(defaultIndex, count, false));
    const controlled = index !== undefined;
    const current = controlled ? nextIndex(index!, count, false) : internal;

    // The measured viewport width. Width math is guarded against this 0 frame:
    // the FlatList renders only once a positive width has been measured.
    const [width, setWidth] = useState(0);
    const listRef = useRef<FlatList<CarouselItem>>(null);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      setWidth((prev) => (prev !== w ? w : prev));
    }, []);

    // Scroll the list to a slide index (no-op until the viewport has measured).
    // Reduce Motion jumps to the slide instead of animating the scroll.
    const scrollTo = useCallback(
      (i: number, animated: boolean) => {
        if (width > 0) listRef.current?.scrollToOffset({ offset: i * width, animated: animated && !reduced });
      },
      [width, reduced],
    );

    // Commit a new current index: update the uncontrolled store, notify the
    // parent, and (when uncontrolled) scroll the list to the slide.
    const goTo = useCallback(
      (i: number, animated = true) => {
        const target = nextIndex(i, count, loop);
        if (!controlled) {
          setInternal(target);
          scrollTo(target, animated);
        }
        onIndexChange?.(target);
      },
      [count, loop, controlled, onIndexChange, scrollTo],
    );

    // Keep the scroll position in sync with a controlled `index` and after the
    // viewport first measures (so the initial slide is correct when width lands).
    useEffect(() => {
      scrollTo(current, false);
    }, [current, width, scrollTo]);

    // Read the settled page off the momentum end and report it upward.
    const onMomentumScrollEnd = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (width <= 0) return;
        const i = Math.round(e.nativeEvent.contentOffset.x / width);
        if (i === current) return;
        if (!controlled) setInternal(i);
        onIndexChange?.(nextIndex(i, count, false));
      },
      [width, current, controlled, onIndexChange, count],
    );

    const atStart = current <= 0;
    const atEnd = current >= count - 1;
    const prevDisabled = !loop && atStart;
    const nextDisabled = !loop && atEnd;

    // One slide's body (a string renders in the skin type; a ReactNode renders as-is).
    const slideBody = (item: CarouselItem) =>
      typeof item.content === "string" ? (
        <Text style={skin.slideText(tokens)}>{item.content}</Text>
      ) : (
        item.content
      );

    return (
      <View style={[ROOT, style]}>
        <View style={VIEWPORT} onLayout={onLayout}>
          {width > 0 ? (
            <FlatList
              ref={listRef}
              data={items}
              keyExtractor={(item) => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              initialScrollIndex={current}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={[{ width }, skin.slide(tokens)]}>{slideBody(item)}</View>
              )}
            />
          ) : items[current] ? (
            // Pre-measurement fallback: the current slide, full-bleed, so the carousel
            // is NEVER blank even if onLayout is delayed or does not fire (some web
            // layout contexts). The paged, swipeable FlatList replaces this the moment
            // a positive width lands; the arrows/dots already page by swapping `current`.
            // Guarded on a present item so an empty `items=[]` renders an empty
            // viewport instead of dereferencing `undefined.content`.
            <View style={skin.slide(tokens)}>{slideBody(items[current])}</View>
          ) : null}

          {showArrows && count > 1 ? (
            <>
              <Arrow side="prev" disabled={prevDisabled} onPress={() => goTo(current - 1)} />
              <Arrow side="next" disabled={nextDisabled} onPress={() => goTo(current + 1)} />
            </>
          ) : null}
        </View>

        {showDots && count > 1 ? (
          <View style={skin.dotsRow(tokens)}>
            {items.map((item, i) => (
              <Pressable
                key={item.key}
                onPress={() => goTo(i)}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${i + 1}`}
                accessibilityState={{ selected: i === current }}
                aria-selected={i === current}
                style={({ pressed }) => [
                  skin.focusOutlineReset,
                  skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                ]}
              >
                <View style={skin.dot(tokens, i === current)} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  };
}

// w-full container; the slides sit over the viewport, the dots below. alignSelf
// stretch makes it fill a flex-column parent; minWidth keeps the carousel usable
// when it lands in a shrink-to-content parent (where `width:100%` would otherwise
// collapse it to the slide's min-content width). It still fills any wider parent.
const ROOT: ViewStyle = { width: "100%", alignSelf: "stretch", minWidth: 240 };

// The paged viewport; overflow is hidden so a half-snapped slide never leaks.
const VIEWPORT: ViewStyle = { width: "100%", alignSelf: "stretch", overflow: "hidden", position: "relative" };

// The absolute layer an arrow centers within (full height, pinned to one edge).
const ARROW_LAYER: ViewStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  justifyContent: "center",
};

// opacity-40: the dimmed disabled look applied per end arrow.
const DISABLED_DIM: ViewStyle = { opacity: 0.4 };
