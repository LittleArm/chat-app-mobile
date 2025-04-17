import React, { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { StyleSheet, Text, View, GestureResponderEvent, ScrollView } from "react-native";
import { RegisterDto } from "@/types/api/dto";
import { useMutation } from "react-query";
import { authAPI } from "@/api";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";

export default function RegisterScreen() {
    const [registerInfo, setRegisterInfo] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
        first_name: "",
        last_name: "",

    } as RegisterDto);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);

    const register = useMutation(authAPI.register, {
        onSuccess: (response) => {
            setErrorText("Registration successful! Please login.");
            setErrorVisible(true);
            // Clear form
            setRegisterInfo({
                username: "",
                email: "",
                password: "",
                phone: "",
                first_name: "",
                last_name: "",
            });
            setConfirmPassword("");
            // Auto-navigate to login after 2 seconds
            setTimeout(() => router.navigate("/login"), 2000);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Registration failed";
            setErrorText(
                errorMessage.includes("already exists")
                    ? "Account or email already exists!"
                    : errorMessage
            );
            setErrorVisible(true);
        },
    });

    const handleRegister = (event: GestureResponderEvent) => {
        event.preventDefault();

        if (!registerInfo.username || !registerInfo.email || !registerInfo.password ||
            !registerInfo.phone || !registerInfo.first_name || !registerInfo.last_name) {
            setErrorText("Please fill in all information!");
            setErrorVisible(true);
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(registerInfo.email)) {
            setErrorText("Invalid email!");
            setErrorVisible(true);
            return;
        }

        if (registerInfo.phone.length < 10) {
            setErrorText("Invalid phone number!");
            setErrorVisible(true);
            return;
        }

        if (registerInfo.password.length < 6) {
            setErrorText("Password must be at least 6 characters!");
            setErrorVisible(true);
            return;
        }

        register.mutate(registerInfo);
    };

    const checkIdenticalConfirmedPass = (password: string) => {
        setConfirmPassword(password);
        if (password !== registerInfo.password) {
            setErrorText("Passwords do not match!");
            setErrorVisible(true);
        } else {
            setErrorText("");
            setErrorVisible(false);
        }
    };

    const onFormChangeHandler = (key: string, value: string) => {
        setRegisterInfo((prev) => ({ ...prev, [key]: value }));
    };

    const handleChangePhone = (value: string) => {
        const onlyNums = value.replace(/[^0-9]/g, "");
        if (onlyNums.length <= 10) {
            setRegisterInfo((prev) => ({ ...prev, phone: onlyNums }));
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Register ZChat</Text>

                <View style={styles.formContainer}>
                    <TextInput
                        mode="outlined"
                        label="Username"
                        placeholder="Username"
                        value={registerInfo.username}
                        onChangeText={(value) => onFormChangeHandler("username", value)}
                        autoCapitalize="none"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Email"
                        placeholder="Email"
                        value={registerInfo.email}
                        onChangeText={(value) => onFormChangeHandler("email", value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="First Name"
                        placeholder="First Name"
                        value={registerInfo.first_name}
                        onChangeText={(value) => onFormChangeHandler("first_name", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Last Name"
                        placeholder="Last Name"
                        value={registerInfo.last_name}
                        onChangeText={(value) => onFormChangeHandler("last_name", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Phone"
                        placeholder="Phone"
                        value={registerInfo.phone}
                        onChangeText={handleChangePhone}
                        keyboardType="phone-pad"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Password"
                        placeholder="Password"
                        secureTextEntry={true}
                        value={registerInfo.password}
                        onChangeText={(value) => onFormChangeHandler("password", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={checkIdenticalConfirmedPass}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    {errorVisible && (
                        <ThemedText type={errorText.includes("successful") ? "default" : "error"}>
                            {errorText}
                        </ThemedText>
                    )}
                    <Button
                        style={{ backgroundColor: "#0091ff", marginTop: 5, borderRadius: 4 }}
                        mode="contained"
                        onPress={handleRegister}
                        loading={register.isLoading}
                        disabled={register.isLoading}
                    >
                        REGISTER
                    </Button>
                    <Link href="/login" style={styles.loginLink}>
                        Already have an account? Sign in
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    scrollContainer: {
        padding: 20,
        justifyContent: "center",
        flexGrow: 1, // Important for ScrollView content to center properly
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 10,
        textAlign: "center",
        color: "#4FC3F7",
    },
    formContainer: {
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
    },
    loginLink: {
        textAlign: "center",
        marginTop: 10,
        textDecorationLine: "underline",
    },
});