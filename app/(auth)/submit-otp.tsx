import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Button, TextInput } from "react-native-paper";
import { StyleSheet, Image } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";

export default function SubmitOtpScreen() {
  const [otp, setOpt] = React.useState("");

  function handleSendOTP() {
    // TODO: Implement login logic
    if (true) {
        router.navigate("./reset-password");
    }
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
        <ThemedText>Nhập mã OTP.</ThemedText>
        <TextInput
          autoFocus
          mode="outlined"
          label="OTP"
          placeholder="Nhập mã OTP"
          value={otp}
          onChangeText={(text) => setOpt(text)}
        />
        <Button
          style={{ backgroundColor: "#0190f3" }}
          mode="contained"
          onPress={handleSendOTP}
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
