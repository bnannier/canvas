import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// The web HTML shell, mirroring the Vite docs index.html: Geist font preloads, the
// favicon, and the inline script that applies the saved theme / surface / density to
// <html> before first paint (preventing a flash). Web-only; ignored on native.
const THEME_SCRIPT = `(function(){try{
  var t = localStorage.getItem('canvas-theme');
  if (t === 'light') document.documentElement.classList.remove('dark');
  else if (t === 'dark') document.documentElement.classList.add('dark');
  var s = localStorage.getItem('canvas-surface');
  if (s === 'glass') document.documentElement.dataset.surface = 'glass';
  var d = localStorage.getItem('canvas-density');
  if (d === 'compact' || d === 'comfy') document.documentElement.dataset.density = d;
}catch(e){}})();`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Canvas - Design System</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossOrigin="" />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
