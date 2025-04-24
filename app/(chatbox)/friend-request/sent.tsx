import { friendAPI } from "@/api/friend.api";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FriendRequestResponse } from "@/types/api/response/friend-request.response";
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendRequestItem = React.memo(({
    request,
    onCancel
}: {
    request: FriendRequestResponse,
    onCancel: (friendId: number) => void
}) => {
    const avatar = request.avatar;
    const fullName = `${request.first_name} ${request.last_name}`;
    const username = request.username;

    const navigateToProfile = () => {
        router.push({
            pathname: "/(user)",
            params: {
                avatar: avatar ?? "",
                name: fullName,
                toUserId: request.user_id.toString(),
            },
        });
    };

    return (
        <View style={styles.item}>
            <TouchableOpacity style={styles.userInfo} onPress={navigateToProfile}>
                <Image
                    source={{ uri: avatar ? `data:image/png;base64,${avatar}` : undefined }}
                    defaultSource={require("@/assets/images/default-avatar.png")}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.username}>@{username}</Text>
                </View>
            </TouchableOpacity>

            <IconButton
                icon="close"
                size={24}
                iconColor="#F44336"
                onPress={() => onCancel(request.user_id)}
            />
        </View>
    );
});

const FriendRequestSent = () => {
    const toaster = useToast();
    const [refreshing, setRefreshing] = React.useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userId = await AsyncStorage.getItem(STORAGE_KEY.ID);
                if (userId) setCurrentUserId(Number(userId));
            } catch (error) {
                console.error('Failed to load user ID:', error);
            }
        };
        loadUserId();
    }, []);

    const {
        data: requests = [],
        isLoading,
        refetch,
    } = useQuery<FriendRequestResponse[]>(
        ["sentFriendRequests", currentUserId],
        () => friendAPI.getSentFriendRequests(currentUserId),
        {
            staleTime: Infinity,
            enabled: !!currentUserId
        }
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const onMutationSuccess = useCallback(async (_, variables: number) => {
        toaster.show({ message: "Request cancelled", type: "success" });

        // Optimistically update the cache
        queryClient.setQueryData<FriendRequestResponse[]>(
            ["sentFriendRequests", currentUserId],
            (oldData) => oldData?.filter(req => req.user_id !== variables) ?? []
        );

        // Background refresh for consistency
        try {
            const freshData = await queryClient.fetchQuery<FriendRequestResponse[]>(
                ["sentFriendRequests", currentUserId],
                () => friendAPI.getSentFriendRequests(currentUserId)
            );

            if (JSON.stringify(freshData) !== JSON.stringify(requests)) {
                queryClient.setQueryData(["sentFriendRequests", currentUserId], freshData);
            }
        } catch (error) {
            console.log("Background refresh failed:", error);
        }
    }, [queryClient, currentUserId, toaster, requests]);

    const { mutate: cancelRequest } = useMutation(
        (friendId: number) => friendAPI.cancelFriendRequest(currentUserId, friendId),
        {
            onSuccess: onMutationSuccess,
            onMutate: async (friendId) => {
                // Optimistic update
                await queryClient.cancelQueries(["sentFriendRequests", currentUserId]);
                queryClient.setQueryData<FriendRequestResponse[]>(
                    ["sentFriendRequests", currentUserId],
                    (oldData) => oldData?.filter(req => req.user_id !== friendId) || []
                );
            },
            onError: (error: any) => {
                toaster.show({
                    message: error.response?.data?.message || "Failed to cancel request",
                    type: "error",
                });
            }
        }
    );

    const pendingRequests = requests?.filter(req => req.status === "pending") || [];

    if (isLoading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            data={pendingRequests}
            renderItem={({ item }) => (
                <FriendRequestItem
                    request={item}
                    onCancel={cancelRequest}
                />
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text>No pending sent requests</Text>
                </View>
            }
            contentContainerStyle={styles.listContent}
        />
    );
};

// Reuse the same styles from FriendRequestScreen
const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "white",
        borderRadius: 8,
        elevation: 2,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    textContainer: {
        flexShrink: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
        backgroundColor: "#f0f0f0",
    },
    name: {
        fontSize: 16,
        fontWeight: "500",
    },
    username: {
        fontSize: 14,
        color: "#666",
    },
});

export default FriendRequestSent;