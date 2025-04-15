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

export default function LoginScreen() {
  const [loginInfo, setLoginInfo] = useState({
    phone: "",
    password: "",
  } as LogInDto);
  const [errorText, setErrorText] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const { setAccessToken, setUserId } = useAuth();

  const {isLoading, mutate: login} = useMutation(authAPI.login, {
    onSuccess: async (response) => {
      const { AccessToken, id, username } = response.data;

      if (AccessToken) {
        await AsyncStorage.setItem(STORAGE_KEY.ID, id);
        await AsyncStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, AccessToken);
        // If you have a refresh token in the new API, add it here

        setUserId(id);
        setAccessToken(AccessToken);

        router.navigate("../(tabs)");
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Login failed");
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
