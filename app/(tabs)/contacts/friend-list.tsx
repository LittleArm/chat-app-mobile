import { friendAPI } from "@/api/friend.api";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useEffect, useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { ActivityIndicator, IconButton, Searchbar } from "react-native-paper";
import { useQuery, useQueryClient } from "react-query";

interface FriendItem {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

const RenderItem = React.memo(({ item, onCallPress }: { item: FriendItem, onCallPress: (type: "audio" | "video") => void }) => {
    const fullName = `${item.first_name} ${item.last_name}`.trim() || item.username;
    const avatarSource = item.avatar
        ? { uri: item.avatar }
        : require('@/assets/images/default-avatar.png');

    const handleChatPress = useCallback(() => {
        router.push({
            pathname: "/(chatbox)",
            params: {
                chatboxId: "",
                avatar: item.avatar,
                name: fullName,
                toGroupId: "",
                toUserId: item.id.toString(),
            },
        });
    }, [item, fullName]);

    const handleGoToBio = useCallback(() => {
        router.push({
            pathname: "/(user)",
            params: {
                avatar: item.avatar,
                name: fullName,
                toUserId: item.id.toString(),
            },
        });
    }, [item, fullName]);

    return (
        <TouchableOpacity onPress={handleChatPress}>
            <View style={styles.itemContainer}>
                <View style={styles.userInfoContainer}>
                    <TouchableOpacity onPress={handleGoToBio}>
                        <Image
                            source={avatarSource}
                            style={styles.avatar}
                            defaultSource={require('@/assets/images/default-avatar.png')}
                        />
                    </TouchableOpacity>
                    <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
                        {fullName}
                    </Text>
                </View>
                <View style={styles.callButtonsContainer}>
                    <IconButton
                        icon="phone"
                        size={20}
                        iconColor="#4285F4"
                        onPress={() => onCallPress("audio")}
                    />
                    <IconButton
                        icon="video"
                        size={20}
                        iconColor="#4285F4"
                        onPress={() => onCallPress("video")}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
});

const FriendListScreen = ({ userId }: { userId: string }) => {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const queryClient = useQueryClient();

    const { isLoading, data: friends, refetch } = useQuery({
        queryKey: ["friends", userId],
        queryFn: () => friendAPI.getFriends(friends),
        select: (response) => response.data,
    });

    const filteredFriends = friends?.filter(friend => {
        const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
        const username = friend.username.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || username.includes(query);
    }) || [];

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const handleCallPress = useCallback((type: "audio" | "video") => {
        console.log(`Initiating ${type} call`);
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        return () => {
            queryClient.removeQueries(["friends", userId]);
        };
    }, [queryClient, userId]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Searchbar
                    placeholder="Tìm kiếm"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#4285F4"
                />
            </View>

            <Link href="/(chatbox)/friend-request/" style={styles.friendRequestLink}>
                <Text style={styles.friendRequestText}>Lời mời kết bạn</Text>
            </Link>

            {isLoading && !isRefreshing ? (
                <ActivityIndicator style={styles.loader} size="large" color="#4285F4" />
            ) : (
                <FlatList
                    data={filteredFriends}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <RenderItem item={item} onCallPress={handleCallPress} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={["#4285F4"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? "No matching friends found" : "No friends yet"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={filteredFriends.length === 0 && styles.emptyListContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchBar: {
        backgroundColor: '#f1f3f4',
        borderRadius: 20,
        elevation: 0,
        shadowOpacity: 0,
    },
    searchInput: {
        fontSize: 14,
    },
    friendRequestLink: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    friendRequestText: {
        color: '#4285F4',
        fontSize: 16,
        fontWeight: '500',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    callButtonsContainer: {
        flexDirection: 'row',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
    itemText: {
        fontSize: 16,
        color: '#202124',
        flexShrink: 1,
    },
    loader: {
        marginTop: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#5f6368',
    },
    emptyListContainer: {
        flex: 1,
    },
});

export default FriendListScreen;
