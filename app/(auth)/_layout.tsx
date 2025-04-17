import { Stack } from "expo-router";
import "react-native-reanimated";
export { ErrorBoundary } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen options={{ headerShown: false }} name="index" />
            <Stack.Screen options={{ headerShown: false }} name="login" />
            <Stack.Screen options={{ headerShown: false }} name="register" />
        </Stack>
    );
}
