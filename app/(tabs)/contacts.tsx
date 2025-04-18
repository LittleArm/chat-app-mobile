import { friendAPI } from "@/api/friend.api";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useEffect, useCallback, useState, useMemo } from "react";
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
import { useQuery } from "react-query";
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FriendItem {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

const RenderItem = React.memo(({ item, onCallPress }: { item: FriendItem, onCallPress: (type: "audio" | "video") => void }) => {
    const fullName = useMemo(() =>
        `${item.first_name} ${item.last_name}`.trim() || item.username,
        [item.first_name, item.last_name, item.username]
    );

    const avatarSource = useMemo(() =>
        item.avatar
            ? { uri: item.avatar }
            : require('@/assets/images/default-avatar.png'),
        [item.avatar]
    );

    const handleChatPress = useCallback(() => {
        console.log("Chat Press");
        //router.push({
        //    pathname: "/(chatbox)",
        //    params: {
        //        chatboxId: "",
        //        avatar: item.avatar,
        //        name: fullName,
        //        toGroupId: "",
        //        toUserId: item.id.toString(),
        //    },
        //});
    }, [item, fullName]);

    const handleGoToBio = useCallback(() => {
        console.log("Bio Press");
        //router.push({
        //    pathname: "/(user)",
        //    params: {
        //        avatar: item.avatar,
        //        name: fullName,
        //        toUserId: item.id.toString(),
        //    },
        //});
    }, [item, fullName]);

    return (
        <TouchableOpacity onPress={handleChatPress}>
            <View style={styles.itemContainer}>
                <View style={styles.userInfoContainer}>
                    <TouchableOpacity onPress={handleGoToBio}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={avatarSource}
                                style={styles.avatar}
                                defaultSource={require('@/assets/images/default-avatar.png')}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.textContainer}>
                        <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
                            {fullName}
                        </Text>
                    </View>
                </View>
                <View style={styles.callButtonsContainer}>
                    <IconButton
                        icon="phone"
                        size={20}
                        iconColor="#4285F4"
                        onPress={() => onCallPress("audio")}
                        style={styles.callButton}
                    />
                    <IconButton
                        icon="video"
                        size={20}
                        iconColor="#4285F4"
                        onPress={() => onCallPress("video")}
                        style={styles.callButton}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
});

const FriendListScreen = () => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Load user ID
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

    const { isLoading, data: friends, refetch } = useQuery({
        queryKey: ["friends", currentUserId],
        queryFn: () => {
            return friendAPI.getFriends(currentUserId);
        },
        select: (response) => response.data,
        enabled: !!currentUserId,
    });

    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests", currentUserId],        
        queryFn: () => {
            return friendAPI.getReceivedFriendRequests(currentUserId);
        },
        select: (response) => response.data,
        enabled: !!currentUserId,
    });

    const friendRequestCount = friendRequests?.length || 0;

    const filteredFriends = useMemo(() => {
        if (!friends) return [];

        return friends.filter(friend => {
            const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
            const username = friend.username.toLowerCase();
            const query = searchQuery.toLowerCase();
            return fullName.includes(query) || username.includes(query);
        });
    }, [friends, searchQuery]);

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const handleCallPress = useCallback((type: "audio" | "video") => {
        console.log(`Initiating ${type} call`);
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Searchbar
                    placeholder="Search friends"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#4285F4"
                    theme={{ colors: { primary: '#4285F4' } }}
                />
            </View>

            <Link href="/(chatbox)/friend-request/" asChild>
                <TouchableOpacity style={styles.friendRequestButton}>
                    <Text style={styles.friendRequestText}>Friend Requests</Text>
                    {friendRequestCount > 0 && (
                        <View style={styles.friendRequestBadge}>
                            <Text style={styles.friendRequestBadgeText}>{friendRequestCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
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
                            tintColor="#4285F4"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? "No matching friends found" : "No friends yet"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={filteredFriends.length === 0 ? styles.emptyListContainer : styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerContainer: {
        padding: 0,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    searchBar: {
        margin: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        elevation: 0,
    },
    searchInput: {
        fontSize: 14,
        minHeight: 36,
    },
    friendRequestButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    friendRequestText: {
        color: '#4285F4',
        fontSize: 16,
        fontWeight: '500',
    },
    friendRequestBadge: {
        backgroundColor: '#EA4335',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendRequestBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    textContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#202124',
        fontWeight: '500',
    },
    lastSeenText: {
        fontSize: 12,
        color: '#9E9E9E',
        marginTop: 2,
    },
    callButtonsContainer: {
        flexDirection: 'row',
    },
    callButton: {
        margin: 0,
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
    listContainer: {
        paddingBottom: 16,
    },
});


export default FriendListScreen;
