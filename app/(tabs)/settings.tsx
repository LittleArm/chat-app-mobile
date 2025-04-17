import { authAPI } from "@/api";
import { userAPI } from "@/api/user.api";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileResponse } from "@/types/api/response/profile.response";
import { STORAGE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import * as React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

const SettingsScreen = () => {
    const toaster = useToast();
    const { setAccessToken, setUserId } = useAuth();
    const [profileInfo, setProfileInfo] = React.useState<ProfileResponse>({
        fullname: "",
        avatar: "",
        id: "",
    });

    // Pick image from gallery
    const pickImage = async () => {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0,
        });

        if (!result.canceled) {
            const { uri, width, height } = result.assets[0];
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: width * 0.5, height: height * 0.5 } }],
                {
                    compress: 0.5,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true,
                }
            );
            setProfileInfo((prev) => ({ ...prev, avatar: manipResult.base64 }));
        }
    };

    // Save profile settings
    const saveSettings = () => {
        updateProfile.mutate({
            profileId: profileInfo.id,
            fullname: profileInfo.fullname,
            avatar: profileInfo.avatar,
        });
    };

    // Fetch user profile
    const {
        refetch: refetchGetUserInfo,
        isLoading: loadingGetUserInfo,
    } = useQuery({
        queryKey: ["getMyProfile"],
        queryFn: () => userAPI.getMyProfile(),
        onSuccess: (response) => {
            if (response.data) {
                const profile: ProfileResponse = response.data[0];
                setProfileInfo(profile);
            }
        },
        onError: (error: any) => {
            toaster.show({
                message: "Failed to load profile",
                type: "error"
            });
        },
        enabled: false,
    });

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refetchGetUserInfo();
        }, [])
    );

    // Update profile mutation
    const updateProfile = useMutation(userAPI.updateProfile, {
        onSuccess: () => {
            toaster.show({
                message: "Profile saved successfully",
                duration: 2000,
                type: "success",
            });
            refetchGetUserInfo();
        },
        onError: (error: any) => {
            toaster.show({
                message: error.message || "Failed to save profile",
                duration: 2000,
                type: "error",
            });
        },
    });

    // Logout mutation
    const { isLoading, mutate: logout } = useMutation(authAPI.logout, {
        onSuccess: async () => {
            await AsyncStorage.clear();
            setAccessToken("");
            setUserId("");
            router.replace("/(auth)");
        },
        onError: (error: any) => {
            toaster.show({
                message: error.message || "Logout failed",
                type: "error",
            });
        },
    });

    const handleLogout = async () => {
        const refresh_token = await AsyncStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
        if (refresh_token) {
            logout({ refresh_token });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>

            {!loadingGetUserInfo && (
                <>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={
                                profileInfo.avatar
                                    ? { uri: `data:image/png;base64, ${profileInfo.avatar}` }
                                    : require("@/assets/images/icon.png")
                            }
                            style={styles.profileImage}
                        />
                        <Text style={styles.changePhotoText}>Change Profile Picture</Text>
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            value={profileInfo.fullname}
                            onChangeText={(value: string) =>
                                setProfileInfo({ ...profileInfo, fullname: value })
                            }
                            style={styles.input}
                            placeholder="Enter your full name"
                        />
                    </View>
                </>
            )}

            <Button
                mode="contained"
                onPress={saveSettings}
                style={styles.saveButton}
                loading={updateProfile.isLoading}
            >
                Save
            </Button>

            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutButton}
                loading={isLoading}
            >
                Logout
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginBottom: 10,
    },
    changePhotoText: {
        textAlign: "center",
        color: "#0190f3",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 5,
        fontSize: 16,
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#0190f3",
        paddingVertical: 8,
    },
    logoutButton: {
        marginTop: 15,
        backgroundColor: "#f44336",
        paddingVertical: 8,
    },
});

export default SettingsScreen;