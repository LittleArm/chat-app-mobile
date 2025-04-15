import React, { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { StyleSheet, Image, GestureResponderEvent } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
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

        // Validate password match
        if (registerInfo.password !== confirmPassword) {
            setErrorText("Mật khẩu không trùng khớp!");
            setErrorVisible(true);
            return;
        }

        // Validate required fields
        if (!registerInfo.username || !registerInfo.email || !registerInfo.password ||
            !registerInfo.phone || !registerInfo.first_name || !registerInfo.last_name) {
            setErrorText("Vui lòng điền đầy đủ thông tin!");
            setErrorVisible(true);
            return;
        }

        // Simple email validation
        if (!/^\S+@\S+\.\S+$/.test(registerInfo.email)) {
            setErrorText("Email không hợp lệ!");
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
                    mode="outlined"
                    label="Tên đăng nhập"
                    placeholder="Nhập tên đăng nhập"
                    value={registerInfo.username}
                    onChangeText={(value) => onFormChangeHandler("username", value)}
                    autoCapitalize="none"
                    autoFocus
                />
                <TextInput
                    mode="outlined"
                    label="Email"
                    placeholder="Nhập email"
                    value={registerInfo.email}
                    onChangeText={(value) => onFormChangeHandler("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    mode="outlined"
                    label="Họ"
                    placeholder="Nhập họ"
                    value={registerInfo.first_name}
                    onChangeText={(value) => onFormChangeHandler("first_name", value)}
                />
                <TextInput
                    mode="outlined"
                    label="Tên"
                    placeholder="Nhập tên"
                    value={registerInfo.last_name}
                    onChangeText={(value) => onFormChangeHandler("last_name", value)}
                />
                <TextInput
                    mode="outlined"
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    value={registerInfo.phone}
                    onChangeText={handleChangePhone}
                    keyboardType="phone-pad"
                />
                <TextInput
                    mode="outlined"
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={true}
                    value={registerInfo.password}
                    onChangeText={(value) => onFormChangeHandler("password", value)}
                />
                <TextInput
                    mode="outlined"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={checkIdenticalConfirmedPass}
                />
                {errorVisible && (
                    <ThemedText type={errorText.includes("thành công") ? "default" : "error"}>
                        {errorText}
                    </ThemedText>
                )}
                <Button
                    style={{ backgroundColor: "#0190f3" }}
                    mode="contained"
                    onPress={handleRegister}
                    loading={register.isLoading}
                    disabled={register.isLoading}
                >
                    Đăng ký
                </Button>
                <Button
                    mode="text"
                    onPress={() => router.navigate("/login")}
                    style={{ marginTop: 8 }}
                >
                    Đã có tài khoản? Đăng nhập
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