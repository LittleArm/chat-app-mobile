import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const UserBioScreen = () => {
    const screenHeight = Dimensions.get("window").height;
    const backgroundHeight = (1 / 3) * screenHeight;

    const { avatar, name, toUserId } =
        useLocalSearchParams<{
            avatar: string;
            name: string;
            toUserId: string;
        }>();

    return (
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/unauth-cover.jpg")}
                style={[styles.backgroundImage, { height: backgroundHeight }]}
                resizeMode="cover"
            />
            <View style={styles.profileContainer}>
            <Image
                source={{
                    uri: `data:image/png;base64, ${avatar}`,
                }}
                defaultSource={require("@/assets/images/default-avatar.png")}
                style={styles.avatar}
            />
            <Text style={styles.username}>{name}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    position: "absolute",
    top: 0,
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "white",
    marginTop: -50,
  },
  username: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default UserBioScreen;
