import Svg, { Path } from "react-native-svg";

// The GitHub mark the home page and top bar link with. lucide-react dropped its brand
// glyphs, so the site ships it inline, the same path ported to react-native-svg.
// `fill="currentColor"` becomes an explicit `color` prop.
type LogoProps = { size?: number; color?: string };

export function Github({ size = 16, color = "currentColor" }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.57v-2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.23-3.17-.12-.3-.53-1.51.12-3.15 0 0 1-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.3-1.53 3.3-1.21 3.3-1.21.65 1.64.24 2.85.12 3.15.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z" />
    </Svg>
  );
}
