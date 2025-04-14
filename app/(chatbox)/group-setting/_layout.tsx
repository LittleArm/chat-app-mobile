import { Stack } from "expo-router";
import "react-native-reanimated";

export {
  ErrorBoundary,
} from "expo-router";

export default function GroupSettingLayout() {
  return (
    <Stack>
      <Stack.Screen options={{headerTitle: 'Tuỳ chọn'}} name="index" />
      <Stack.Screen options={{headerTitle: 'Thêm thành viên'}} name="add-members" />
      <Stack.Screen options={{headerTitle: 'Quản lý thành viên'}} name="members" />
    </Stack>
  );
}
