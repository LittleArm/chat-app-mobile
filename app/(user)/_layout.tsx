import { Stack } from "expo-router";
import "react-native-reanimated";

export {
  ErrorBoundary,
} from "expo-router";

export default function GroupSettingLayout() {
    return (
        <Stack>
            <Stack.Screen options={{headerTitle: 'Trang cá nhân'}} name="index" />
        </Stack>
    );
}
