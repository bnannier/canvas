// Vite-style `?raw` imports (inlined to a string by babel-plugin-inline-raw at build).
declare module "*?raw" {
  const content: string;
  export default content;
}
