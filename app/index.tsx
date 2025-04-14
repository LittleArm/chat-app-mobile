import { STORAGE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AppSplashScreen() {
  const checkAccessToken = async () => {
    const access_token = await AsyncStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);    
    if (access_token) {
      router.push("/(tabs)");
    } else {
      router.push("/(auth)");
    }
  };

  useEffect(() => {
    checkAccessToken();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.image_container}>
        <Image
          style={styles.image}
          source={require("@/assets/images/unauth-cover.jpg")}
          resizeMode="cover"
        ></Image>
      </View>
      <View style={styles.content}>
        <Text style={styles.content_title}>Zola</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  image_container: {
    height: "100%",
  },
  image: { height: "100%", width: "100%" },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  content_title: {
    color: "#0190f3",
    fontWeight: "bold",
    fontSize: 50,
    textAlign: "center",
    marginTop: 8,
  },
  button_container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  button: { marginBottom: 8, paddingVertical: 4 },
  login: {
    backgroundColor: "#0190f3",
  },
  register: {
    backgroundColor: "gray",
  },
});
