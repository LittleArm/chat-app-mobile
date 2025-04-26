// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { ToastProvider } from "react-native-paper-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChatProvider } from "@/contexts/ChatContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // For development, ignore all log notifications
  LogBox.ignoreAllLogs();

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={DefaultTheme}>
        <ToastProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ChatProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(chatbox)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(user)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ChatProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
