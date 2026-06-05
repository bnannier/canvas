import { useId } from "react";

interface CanvasMarkProps {
  size?: number;
}

// The Canvas mark: a segmented rainbow "C". A ring of six hue segments (blue,
// green, amber, coral, pink, purple) around a transparent counter, with a
// wedge gap on the right forming the C. The counter is open, so it sits
// cleanly on any background (light, dark, glass). Gradient ids are namespaced
// per instance so several marks can render on one page.
export function CanvasMark({ size = 22 }: CanvasMarkProps) {
  const uid = useId().replace(/:/g, "");
  const g = (name: string) => `${uid}-${name}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Canvas">
      <defs>
        <linearGradient id={g("purple")} gradientUnits="userSpaceOnUse" x1="29.055" y1="30.958" x2="36.05" y2="40.585"><stop offset="0" stopColor="#8b1fd6" /><stop offset="1" stopColor="#b24dff" /></linearGradient>
        <linearGradient id={g("pink")} gradientUnits="userSpaceOnUse" x1="22.952" y1="32.536" x2="21.502" y2="44.347"><stop offset="0" stopColor="#e11150" /><stop offset="1" stopColor="#ff2d6e" /></linearGradient>
        <linearGradient id={g("coral")} gradientUnits="userSpaceOnUse" x1="17.509" y1="29.642" x2="8.528" y2="37.449"><stop offset="0" stopColor="#f5333a" /><stop offset="1" stopColor="#ff6a4d" /></linearGradient>
        <linearGradient id={g("amber")} gradientUnits="userSpaceOnUse" x1="15.433" y1="23.25" x2="3.578" y2="22.213"><stop offset="0" stopColor="#f78a18" /><stop offset="1" stopColor="#ffb43d" /></linearGradient>
        <linearGradient id={g("blue")} gradientUnits="userSpaceOnUse" x1="19.7" y1="16.552" x2="13.75" y2="6.246"><stop offset="0" stopColor="#1f86f0" /><stop offset="1" stopColor="#27cdf2" /></linearGradient>
        <linearGradient id={g("green")} gradientUnits="userSpaceOnUse" x1="28.169" y1="16.478" x2="33.939" y2="6.07"><stop offset="0" stopColor="#15b85f" /><stop offset="1" stopColor="#46e082" /></linearGradient>
      </defs>
      <path d="M31.293 28.557 L41.385 34.863 A20.5 20.5 0 0 1 28.959 43.891 L26.081 32.345 A8.6 8.6 0 0 0 31.293 28.557 Z" fill={`url(#${g("purple")})`} />
      <path d="M26.081 32.345 L28.959 43.891 A20.5 20.5 0 0 1 14.376 42.1 L19.963 31.593 A8.6 8.6 0 0 0 26.081 32.345 Z" fill={`url(#${g("pink")})`} />
      <path d="M19.963 31.593 L14.376 42.1 A20.5 20.5 0 0 1 4.736 31.011 L15.919 26.941 A8.6 8.6 0 0 0 19.963 31.593 Z" fill={`url(#${g("coral")})`} />
      <path d="M15.919 26.941 L4.736 31.011 A20.5 20.5 0 0 1 6.246 13.75 L16.552 19.7 A8.6 8.6 0 0 0 15.919 26.941 Z" fill={`url(#${g("amber")})`} />
      <path d="M16.552 19.7 L6.246 13.75 A20.5 20.5 0 0 1 24 3.5 L24 15.4 A8.6 8.6 0 0 0 16.552 19.7 Z" fill={`url(#${g("blue")})`} />
      <path d="M24 15.4 L24 3.5 A20.5 20.5 0 0 1 41.385 13.137 L31.293 19.443 A8.6 8.6 0 0 0 24 15.4 Z" fill={`url(#${g("green")})`} />
    </svg>
  );
}
