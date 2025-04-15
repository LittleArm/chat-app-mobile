import { Stack } from "expo-router";
import "react-native-reanimated";
export { ErrorBoundary } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }} name="index" />
      <Stack.Screen options={{ headerTitle: "Đăng nhập" }} name="login" />
      <Stack.Screen options={{ headerTitle: "Đăng ký" }} name="register" />
    </Stack>
  );
}
