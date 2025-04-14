import { authAPI } from "@/api";
import { userAPI } from "@/api/user.api";
import { useAuth } from "@/contexts/AuthContext";
import { LogOutDto } from "@/types/api/dto";
import { ProfileResponse } from "@/types/api/response/profile.response";
import { STORAGE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import * as React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";
import useNotification from "@/hooks/useNotification";
import { useEffect, useCallback, useLayoutEffect } from "react";

const SettingsScreen = () => {
  const toaster = useToast();
  const { setAccessToken, setUserId } = useAuth();
  const [profileInfo, setProfileInfo] = React.useState<ProfileResponse>({
    fullname: "",
    avatar: "",
    id: "",
  });
  const token = useNotification();
  const { userId } = useAuth();

  const pickImage = async () => {
    // await ImagePicker.requestCameraPermissionsAsync();
    // let result = await ImagePicker.launchCameraAsync({
    //   cameraType: ImagePicker.CameraType.front,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 0.5,
    // }); //launch camera
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });
    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width * 0.5, height: height * 0.5 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      setProfileInfo((prev) => ({ ...prev, avatar: manipResult.base64 }));
    }
  };

  const saveSettings = () => {
    updateProfile.mutate({
      profileId: profileInfo.id,
      fullname: profileInfo.fullname,
      avatar: profileInfo.avatar,
    });
  };

  // useQuery(["getMyProfile"], () => userAPI.getMyProfile(), {
  //   onSuccess: (response) => {
  //     const profiles: ProfileResponse[] = response.data;
  //     console.log(profiles);
  //     setProfileInfo({ ...profileInfo, ...profiles[0] });
  //   },
  //   onError: (error: any) => {
  //     toaster.show({ message: error.message, type: "error" });
  //   },
  // });

  const {
    refetch: refetchGetUserInfo,
    data: userInfo,
    isLoading: loadingGetUserInfo,
  } = useQuery({
    queryKey: ["getMyProfile"],
    queryFn: () => userAPI.getMyProfile(),
    select: (rs) => {
      if (rs.data && setProfile) {
        const profile: ProfileResponse = rs.data[0];
        setProfile(profile);
      }
      return rs.data[0];
    },
    enabled: false,
  });

  useEffect(() => {
    return () => {
      setProfile({
        fullname: "",
        avatar: "",
        id: "",
      });
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refetchGetUserInfo();
    }, [])
  );

  const setProfile = (profile: ProfileResponse) => {
    setProfileInfo({ ...profileInfo, ...profile });
  };

  const updateProfile = useMutation(userAPI.updateProfile, {
    onSuccess: (response) => {
      // const profile: ProfileResponse = response.data;
      // setProfileInfo({ ...profileInfo, ...profile });
      toaster.show({
        message: "Lưu hồ sơ thành công",
        duration: 2000,
        type: "success",
      });
    },
    onError: (error: any) => {
      toaster.show({
        message: "Lưu hồ sơ không thành công thành công",
        duration: 2000,
        type: "error",
      });
      // console.log(error);
    },
  });

  const removeFirebaseToken = useMutation(userAPI.removeFirebaseToken);

  const { isLoading, mutate: logout } = useMutation(authAPI.logout, {
    onSuccess: async (response) => {
      const succsess: boolean = response.data;
      if (succsess) {
        if (token) {
          removeFirebaseToken.mutate({ token, userId });
        }
        await AsyncStorage.clear();
        setAccessToken("");
        setUserId("");
        router.navigate("../(auth)");
      }
    },
    onError: (error: any) => {
      router.navigate("./");
    },
  });

  // useEffect(() => {
  //   refetchGetUserInfo();
  // }, []);

  const handleLogout = async () => {
    const userId: string | null = await AsyncStorage.getItem(STORAGE_KEY.ID);
    const refresh_token: string | null = await AsyncStorage.getItem(
      STORAGE_KEY.REFRESH_TOKEN
    );
    if (userId && refresh_token) {
      logout({ userId, refresh_token });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cài đặt</Text>

      {!loadingGetUserInfo && (
        <>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                profileInfo.avatar
                  ? {
                      uri: `data:image/png;base64, ${profileInfo.avatar}`,
                    }
                  : require("@/assets/images/icon.png")
              }
              style={styles.profileImage}
            />
            <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              value={profileInfo.fullname}
              onChangeText={(value: string) =>
                setProfileInfo({ ...profileInfo, fullname: value })
              }
              style={styles.input}
            />
          </View>
        </>
      )}

      <Button
        style={{ backgroundColor: "#0190f3" }}
        mode="contained"
        onPress={saveSettings}
      >
        Lưu
      </Button>
      <Button
        style={{ backgroundColor: "#0190f3", marginTop: 10 }}
        mode="contained"
        onPress={handleLogout}
        disabled={isLoading}
      >
        Đăng xuất
      </Button>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 10,
  },
  changePhotoText: {
    textAlign: "center",
    color: "blue",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});
