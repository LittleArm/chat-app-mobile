import { friendAPI } from "@/api/friend.api";
import { userAPI } from "@/api/user.api";
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
import { ProfileResponse } from "@/types/api/response";
import { FriendRequestResponse } from "@/types/api/response/friend-request.response"
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendRequestItem = React.memo(({
    request,
    onAccept,
    onDecline
}: {
    request: FriendRequestResponse,
    onAccept: (friendId: number) => void,
    onDecline: (friendId: number) => void
}) => {
    const { data: userProfile } = useQuery<ProfileResponse>(
        ["userProfile", request.user_id],
        () => userAPI.getUserProfile(request.user_id).then(res => res.data),
        { staleTime: Infinity } // Only load once unless explicitly refreshed
    );

    const avatar = userProfile?.avatar;
    const fullName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : `User ${request.user_id}`;
    const username = userProfile?.username ?? "";

    const navigateToProfile = () => {
        router.push({
            pathname: "/(user)",
            params: {
                avatar: avatar ?? "",
                name: fullName,
                username: username,
                userId: request.user_id.toString(),
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

            <View style={styles.actions}>
                <IconButton
                    icon="check"
                    size={24}
                    iconColor="#4CAF50"
                    onPress={() => onAccept(request.user_id)}
                />
                <IconButton
                    icon="close"
                    size={24}
                    iconColor="#F44336"
                    onPress={() => onDecline(request.user_id)}
                />
            </View>
        </View>
    );
});
const FriendRequestScreen = () => {
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
        ["receivedFriendRequests", currentUserId],
        () => friendAPI.getReceivedFriendRequests(currentUserId).then(res => res.data),
        { staleTime: Infinity } // Only load once unless explicitly refreshed
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const onMutationSuccess = useCallback(async (_, variables: number) => {
        // Show success message
        toaster.show({ message: "Operation successful", type: "success" });

        // Get current data from cache
        const currentData = queryClient.getQueryData<FriendRequestResponse[]>(["receivedFriendRequests", currentUserId]);

        // Optimistically update the cache by removing the processed request
        queryClient.setQueryData<FriendRequestResponse[]>(
            ["receivedFriendRequests", currentUserId],
            (oldData) => oldData?.filter(req => req.user_id !== variables) ?? []
        );

        // Optional: Background refetch to ensure data consistency
        try {
            const freshData = await queryClient.fetchQuery<FriendRequestResponse[]>(
                ["receivedFriendRequests", currentUserId],
                () => friendAPI.getReceivedFriendRequests(currentUserId).then(res => res.data)
            );

            // Only update if the fresh data is different from our optimistic update
            if (JSON.stringify(freshData) !== JSON.stringify(currentData)) {
                queryClient.setQueryData(["receivedFriendRequests", currentUserId], freshData);
            }
        } catch (error) {
            // Silent fail - we already did optimistic update
            console.log("Background refresh failed, using optimistic update");
        }
    }, [queryClient, currentUserId, toaster]);

    const { mutate: accept } = useMutation(
        (friendId: number) => friendAPI.acceptFriend(friendId, currentUserId),
        {
            onSuccess: onMutationSuccess,
            onMutate: async (friendId) => {
                // Optimistic update
                await queryClient.cancelQueries(["receivedFriendRequests", currentUserId]);
                queryClient.setQueryData<FriendRequestResponse[]>(
                    ["receivedFriendRequests", currentUserId],
                    (oldData) => oldData?.filter(req => req.id !== friendId) || []
                );
            }
        }
    );

    const { mutate: decline } = useMutation(
        (friendId: number) => friendAPI.rejectFriend(friendId, currentUserId),
        {
            onSuccess: onMutationSuccess,
            onMutate: async (friendId) => {
                // Optimistic update
                await queryClient.cancelQueries(["receivedFriendRequests", currentUserId]);
                queryClient.setQueryData<FriendRequestResponse[]>(
                    ["receivedFriendRequests", currentUserId],
                    (oldData) => oldData?.filter(req => req.id !== friendId) || []
                );
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
                    onAccept={accept}
                    onDecline={decline}
                />
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text>No pending friend requests</Text>
                </View>
            }
            contentContainerStyle={styles.listContent}
        />
    );
};

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
    actions: {
        flexDirection: "row",
    },
});

export default FriendRequestScreen;