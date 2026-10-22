import { Stack } from "expo-router";
import { useTheme } from "@nannier/canvas";

export default function TestingLayout() {
  const { tokens } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.background } }} />;
}
