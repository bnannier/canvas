import { Redirect, Stack } from "expo-router";

export default function TestingLayout() {
  if (process.env.EXPO_PUBLIC_CANVAS_SMOKE !== "1") return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
