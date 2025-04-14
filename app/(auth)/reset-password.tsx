import React from "react";
import { Button, TextInput } from "react-native-paper";
import { StyleSheet, Image } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-paper-toast";
import { useMutation } from "react-query";
import { authAPI } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";
import useNotification from "@/hooks/useNotification";
import { userAPI } from "@/api/user.api";

export default function ResetPasswordScreen() {
  const { validPhone } = useLocalSearchParams<{
    validPhone: string;
  }>();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isPassIdentical, setIsPassIdentical] = React.useState(false);
  const toaster = useToast();
  const { setUserId, setAccessToken } = useAuth();
  const token = useNotification();

  const addFirebaseToken = useMutation(userAPI.addFirebaseToken);

  const resetPassword = useMutation(authAPI.resetPassword, {
    onSuccess: async (res) => {
      const { access_token, refresh_token, user, is_success } = res.data;

      if (is_success) {
        await AsyncStorage.setItem(STORAGE_KEY.ID, user.id);
        await AsyncStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, refresh_token);

        setUserId(user.id);
        setAccessToken(access_token);

        if (token) {
          // console.log(token);
          addFirebaseToken.mutate({ token });
        }

        router.navigate("../(tabs)");
      }
    },
    onError: (err: any) => {
      toaster.show({ message: err.message, type: "error" });
    },
  });

  const handleRequestChangePassword = () => {
    if (password !== confirmPassword) {
      toaster.show({ message: "Mật khẩu không khớp", type: "info" });
      return;
    }
    resetPassword.mutate({ phone: validPhone, new_password: password });
  };

  const checkValidPassword = (password: string) => {
    // TODO: Implement password validation logic
    if (true) {
      setPassword(password);
    }
  };

  const checkIdenticalConfirmedPass = (pass: string) => {
    setIsPassIdentical(pass === password);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.stepContainer}>
        <TextInput
          mode="outlined"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
        <TextInput
          mode="outlined"
          // error={!isPassIdentical}
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
          }}
        />
        <Button
          style={{ backgroundColor: "#0190f3" }}
          mode="contained"
          onPress={handleRequestChangePassword}
        >
          Xác nhận
        </Button>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
