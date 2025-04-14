import React, { useState } from "react";
import { Link, router } from "expo-router";
import { Button, Text, TextInput } from "react-native-paper";
import { StyleSheet, Image, GestureResponderEvent } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthContext";
import { LogInDto } from "@/types/api/dto";
import { STORAGE_KEY } from "@/utils/constants";
import { useMutation } from "react-query";
import { authAPI } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import useNotification from "@/hooks/useNotification";
import { userAPI } from "@/api/user.api";

export default function LoginScreen() {
  const [loginInfo, setLoginInfo] = useState({
    phone: "",
    password: "",
  } as LogInDto);
  const [errorText, setErrorText] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const { setAccessToken, setUserId } = useAuth();
  const token = useNotification();

  const addFirebaseToken = useMutation(userAPI.addFirebaseToken);

  const {isLoading, mutate: login} = useMutation(authAPI.login, {
    onSuccess: async (response) => {
      const { access_token, refresh_token, user, is_success } = response.data;

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
    onError: (error: any) => {
      setError(error.message);
      // enqueueSnackbar(error.response.data.message, {
      //   variant: "error",
      // });
    },
  });

  const setError = (errorMessage: string) => {
    setErrorText(errorMessage);
    setErrorVisible(errorMessage !== "");
  };

  const handleSubmit = (event: GestureResponderEvent) => {
    event.preventDefault();
    login(loginInfo);
  };

  const onFormChangeHandler = (key: string, value: string) => {
    setLoginInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangePhone = (value: string) => {
    const onlyNums = value.replace(/[^0-9]/g, "");
    if (onlyNums.length <= 10) {
      setLoginInfo((prev) => ({ ...prev, phone: onlyNums }));
    }
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
          autoFocus
          mode="outlined"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          value={loginInfo.phone}
          onChangeText={handleChangePhone}
        />
        <TextInput
          mode="outlined"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          secureTextEntry={true}
          value={loginInfo.password}
          onChangeText={(value) => onFormChangeHandler("password", value)}
        />
        {errorVisible && <ThemedText type="error">{errorText}</ThemedText>}
        <Button
          style={{ backgroundColor: "#0190f3" }}
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading}
        >
          Đăng nhập
        </Button>
        <Link
          href="/register"
          style={{
            color: "black",
          }}
        >
          Đăng ký mới
        </Link>
        <Link
          href="/forgot-password"
          style={{
            color: "black",
          }}
        >
          Quên mật khẩu?
        </Link>
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
