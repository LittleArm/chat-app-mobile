import React, { useState } from "react";
import { Link, router } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { StyleSheet, Text, GestureResponderEvent, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { LogInDto } from "@/types/api/dto";
import { STORAGE_KEY } from "@/utils/constants";
import { useMutation } from "react-query";
import { authAPI } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
            setError(error.response?.data?.message || "Phone or password is not correct!");
        },
    });

    const setError = (errorMessage: string) => {
        setErrorText(errorMessage);
        setErrorVisible(errorMessage !== "");
    };

    const handleSubmit = (event: GestureResponderEvent) => {
        event.preventDefault();

        if (!loginInfo.phone || !loginInfo.password) {
            setErrorText("Please enter phone number and password!");
            setErrorVisible(true);
            return;
        }

        if (loginInfo.phone.length < 10) {
            setErrorText("Invalid phone number!");
            setErrorVisible(true);
            return;
        }

        if (loginInfo.password.length < 6) {
            setErrorText("Password must be at least 6 characters!");
            setErrorVisible(true);
            return;
        }

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
        <View style={styles.container}>
            <Text style={styles.title}>Login ZChat</Text>
      
            <View style={styles.formContainer}>
                <TextInput
                    mode="outlined"
                    label="Phone"
                    placeholder="Phone"
                    value={loginInfo.phone}
                    onChangeText={handleChangePhone}
                    keyboardType="phone-pad"
                    theme={{ colors: { primary: '#4FC3F7' } }}
                />
                <TextInput
                    mode="outlined"
                    label="Password"
                    placeholder="Password"
                    secureTextEntry={true}
                    value={loginInfo.password}
                    style={{ marginBottom: 10 }}
                    onChangeText={(value) => onFormChangeHandler("password", value)}
                    theme={{ colors: { primary: '#4FC3F7' } }}
                />        

                {errorVisible && <Text style={styles.errorText}>{errorText}</Text>}     
                
                <Button
                    mode="contained"
                    style={styles.loginButton}
                    onPress={handleSubmit}
                    loading={isLoading}
                >
                    LOGIN
                </Button>
        
                <Link href="/register" style={styles.registerLink}>
                    Register
                </Link>
            </View>
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
    loginButton: {
        backgroundColor: "#0091ff",
        paddingVertical: 8,
        borderRadius: 4,
        marginBottom: 10,
    },
    registerLink: {
        textAlign: "center",
        marginBottom: 16,
        textDecorationLine: "underline",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        marginBottom: 10,
    },
});
