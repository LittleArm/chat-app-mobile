import { Redirect, router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { STORAGE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export { ErrorBoundary } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }} name="index" />
      <Stack.Screen options={{ headerTitle: "Đăng nhập" }} name="login" />
      <Stack.Screen options={{ headerTitle: "Đăng ký" }} name="register" />
      <Stack.Screen
        options={{ headerTitle: "Quên mật khẩu" }}
        name="forgot-password"
      />
      <Stack.Screen
        options={{ headerTitle: "Xác nhận OTP" }}
        name="submit-otp"
      />
      <Stack.Screen
        options={{ headerTitle: "Nhập mật khẩu mới" }}
        name="reset-password"
      />
    </Stack>
  );
}
