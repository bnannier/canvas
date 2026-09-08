import { Redirect, Stack } from "expo-router";
import { useTheme } from "@nannier-com/canvas";

export default function TestingLayout() {
  const { tokens } = useTheme();
  if (process.env.EXPO_PUBLIC_CANVAS_SMOKE !== "1") return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.background } }} />;
}
