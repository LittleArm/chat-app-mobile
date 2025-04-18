import { authAPI } from "@/api";
import { userAPI } from "@/api/user.api";
import { ProfileResponse } from "@/types/api/response";
import { STORAGE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import * as React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useQuery } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

const SettingsScreen = () => {
    const toaster = useToast();
    const [userId, setUserId] = React.useState<number | null>(null);
    const [profileInfo, setProfileInfo] = React.useState<ProfileResponse>({
        id: 0,
        username: "",
        email: "",
        phone: "",
        first_name: "",
        last_name: "",
        avatar: "",
        created_at: new Date(),
        updated_at: new Date()
    });

    // Load user ID on mount
    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                const id = await AsyncStorage.getItem(STORAGE_KEY.ID);
                if (id) setUserId(Number(id));
            } catch (error) {
                console.error("Failed to load user ID:", error);
                toaster.show({
                    message: "Failed to load user data",
                    type: "error"
                });
            }
        };
        loadUserData();
    }, []);

    // Pick image from gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            toaster.show({
                message: "Permission to access photos was denied",
                type: "error"
            });
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            try {
                const { uri, width, height } = result.assets[0];
                const manipResult = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { width: Math.floor(width * 0.5), height: Math.floor(height * 0.5) } }],
                    {
                        compress: 0.7,
                        format: ImageManipulator.SaveFormat.JPEG,
                        base64: true,
                    }
                );
                if (manipResult.base64) {
                    setProfileInfo(prev => ({
                        ...prev,
                        avatar: manipResult.base64
                    }));
                }
            } catch (error) {
                console.error("Image processing error:", error);
                toaster.show({
                    message: "Failed to process image",
                    type: "error"
                });
            }
        }
    };

    // Fetch user profile
    const { refetch: refetchUserProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) throw new Error("No user ID");
            const response = await userAPI.getUserProfile(userId);
            return response.data;
        },
        onSuccess: (data) => {
            setProfileInfo(data);
        },
        onError: (error: any) => {
            toaster.show({
                message: error.response?.data?.message || "Failed to load profile",
                type: "error"
            });
        },
        enabled: !!userId
    });

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (userId) refetchUserProfile();
        }, [userId])
    );

    // Simplified logout function using just access token
    const handleLogout = async () => {
        try {
            // Clear all stored authentication data
            await AsyncStorage.multiRemove([
                STORAGE_KEY.ACCESS_TOKEN,
                STORAGE_KEY.ID
            ]);

            setUserId(null);
            // Navigate to auth screen
            router.replace("/(auth)");

            // Optional: Call logout API if needed
            await authAPI.logout(); 

        } catch (error) {
            console.error("Logout error:", error);
            toaster.show({
                message: "Failed to logout properly",
                type: "error"
            });
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <Text style={styles.header}>Profile</Text>

                {!loadingProfile && (
                    <>
                        <TouchableOpacity onPress={pickImage}>
                            <Image
                                source={
                                    profileInfo.avatar
                                        ? { uri: `data:image/jpeg;base64,${profileInfo.avatar}` }
                                        : require("@/assets/images/default-avatar.png")
                                }
                                style={styles.profileImage}
                            />
                            <Text style={styles.changePhotoText}>Change Profile Picture</Text>
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                value={profileInfo.first_name}
                                onChangeText={(text) =>
                                    setProfileInfo({ ...profileInfo, first_name: text })
                                }
                                style={styles.input}
                                placeholder="Enter your first name"
                                readOnly
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                value={profileInfo.last_name}
                                onChangeText={(text) =>
                                    setProfileInfo({ ...profileInfo, last_name: text })
                                }
                                style={styles.input}
                                placeholder="Enter your last name"
                                readOnly
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                value={profileInfo.phone}
                                onChangeText={(text) =>
                                    setProfileInfo({ ...profileInfo, phone: text })
                                }
                                style={styles.input}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                readOnly
                            />
                        </View>
                    </>
                )}

                <Button
                    mode="contained"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
        paddingBottom: 40, // Add extra padding at the bottom
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: "center",
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#eee",
    },
    changePhotoText: {
        textAlign: "center",
        color: "#0190f3",
        marginBottom: 20,
        fontWeight: "500",
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: "500",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        borderRadius: 8,
    },
    logoutButton: {
        marginTop: 15,
        backgroundColor: "#f44336",
        paddingVertical: 10,
        borderRadius: 8,
    },
});

export default SettingsScreen;