import { Stack } from "expo-router";
import "react-native-reanimated";

export {
    ErrorBoundary
} from "expo-router";

export default function DetailMessageLayout() {
    return (
        <Stack>
            <Stack.Screen options={{ headerTitle: 'Hội thoại', headerShown: false }} name="index" />
            <Stack.Screen options={{ headerTitle: 'Friend Requests' }} name="friend-request" />
        </Stack>
    );
}