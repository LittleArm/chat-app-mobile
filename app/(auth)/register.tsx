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
            setErrorText("Đăng ký thành công! Vui lòng đăng nhập.");
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
            const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
            setErrorText(
                errorMessage.includes("already exists")
                    ? "Tài khoản hoặc email đã tồn tại!"
                    : errorMessage
            );
            setErrorVisible(true);
        },
    });

    const handleRegister = (event: GestureResponderEvent) => {
        event.preventDefault();

        if (!registerInfo.username || !registerInfo.email || !registerInfo.password ||
            !registerInfo.phone || !registerInfo.first_name || !registerInfo.last_name) {
            setErrorText("Vui lòng điền đầy đủ thông tin!");
            setErrorVisible(true);
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(registerInfo.email)) {
            setErrorText("Email không hợp lệ!");
            setErrorVisible(true);
            return;
        }

        if (registerInfo.phone.length < 10) {
            setErrorText("Số điện thoại không hợp lệ!");
            setErrorVisible(true);
            return;
        }

        if (registerInfo.password.length < 6) {
            setErrorText("Mật khẩu phải có ít nhất 6 ký tự!");
            setErrorVisible(true);
            return;
        }

        register.mutate(registerInfo);
    };

    const checkIdenticalConfirmedPass = (password: string) => {
        setConfirmPassword(password);
        if (password !== registerInfo.password) {
            setErrorText("Mật khẩu không trùng khớp!");
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
                <Text style={styles.title}>Đăng ký ZChat</Text>

                <View style={styles.formContainer}>
                    <TextInput
                        mode="outlined"
                        label="Tên đăng nhập"
                        placeholder="Nhập tên đăng nhập"
                        value={registerInfo.username}
                        onChangeText={(value) => onFormChangeHandler("username", value)}
                        autoCapitalize="none"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Email"
                        placeholder="Nhập email"
                        value={registerInfo.email}
                        onChangeText={(value) => onFormChangeHandler("email", value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Họ"
                        placeholder="Nhập họ"
                        value={registerInfo.first_name}
                        onChangeText={(value) => onFormChangeHandler("first_name", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Tên"
                        placeholder="Nhập tên"
                        value={registerInfo.last_name}
                        onChangeText={(value) => onFormChangeHandler("last_name", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Số điện thoại"
                        placeholder="Nhập số điện thoại"
                        value={registerInfo.phone}
                        onChangeText={handleChangePhone}
                        keyboardType="phone-pad"
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        secureTextEntry={true}
                        value={registerInfo.password}
                        onChangeText={(value) => onFormChangeHandler("password", value)}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu"
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={checkIdenticalConfirmedPass}
                        theme={{ colors: { primary: '#4FC3F7' } }}
                    />
                    {errorVisible && (
                        <ThemedText type={errorText.includes("thành công") ? "default" : "error"}>
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
                        ĐĂNG KÝ
                    </Button>
                    <Link href="/login" style={styles.loginLink}>
                        Đã có tài khoản? Đăng nhập
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