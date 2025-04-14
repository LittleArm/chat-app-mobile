import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Button, TextInput } from "react-native-paper";
import { StyleSheet, Image } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { useMutation } from "react-query";
import { authAPI } from "@/api";
import { useToast } from "react-native-paper-toast";

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = React.useState("");
  const toaster = useToast();

  const checkUser = useMutation(authAPI.checkUserExist, {
    onSuccess: (res) => {
      if (res.data) {
        router.push({
          pathname: "./reset-password",
          params: { validPhone: phone },
        });
      } else {
        toaster.show({
          message: `Người dùng số điện thoại ${phone} không tồn tại.`,
          duration: 2000,
          type: "info",
        });
      }
    },
    onError: (err: any) => {
      toaster.show({
        message: err.message,
        duration: 2000,
        type: "error",
      });
    },
  });

  function handleSubmitPhoneNumber() {
    // TODO: Implement login logic
    // router.navigate("./reset-password");
    checkUser.mutate(phone);
  }

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
        <ThemedText>Nhập số điện thoại để lấy lại mật khẩu.</ThemedText>
        <TextInput
          autoFocus
          mode="outlined"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        <Button
          style={{ backgroundColor: "#0190f3" }}
          mode="contained"
          onPress={handleSubmitPhoneNumber}
        >
          Gửi
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
