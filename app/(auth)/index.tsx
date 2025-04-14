import { router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AuthRootScreen() {
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
        <View style={styles.button_container}>
          <Button
            textColor="white"
            style={[styles.login, styles.button]}
            onPress={() => {
              router.navigate("./login");
            }}
          >
            Đăng nhập
          </Button>
          <Button
            textColor="white"
            style={[styles.register, styles.button]}
            onPress={() => {
              router.navigate("./register");
            }}
          >
            Tạo tài khoản mới
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  image_container: {
    height: "60%",
  },
  image: { height: "100%", width: "100%" },
  content: {
    height: "40%",
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
