import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AuthRootScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Zchat</Text>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    style={[styles.button, styles.loginButton]}
                    labelStyle={styles.loginButtonLabel}
                    onPress={() => router.navigate("./login")}
                >
                    ĐĂNG NHẬP
                </Button>

                <Button
                    mode="outlined"
                    style={[styles.button, styles.registerButton]}
                    labelStyle={styles.registerButtonLabel}
                    onPress={() => router.navigate("./register")}
                >
                    ĐĂNG KÝ
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 60,
        fontWeight: "bold",
        marginBottom: 50,
        color: "#4FC3F7", // Light blue color
    },
    buttonContainer: {
        width: "100%",
        maxWidth: 300,
    },
    button: {
        marginVertical: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    loginButton: {
        backgroundColor: "#4FC3F7", // Light blue background
    },
    loginButtonLabel: {
        color: "white", // White text for login
        fontWeight: "bold",
        fontSize: 16,
    },
    registerButton: {
        borderColor: "#4FC3F7", // Light blue border
        backgroundColor: "transparent",
    },
    registerButtonLabel: {
        color: "black", // Black text for register
        fontWeight: "bold",
        fontSize: 16,
    },
});