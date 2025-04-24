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
    Modal,
} from "react-native";
import { ActivityIndicator, IconButton, Searchbar, Button } from "react-native-paper";
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
    const [isAddFriendModalVisible, setIsAddFriendModalVisible] = React.useState(false);
    const [phoneSearch, setPhoneSearch] = useState('');

    interface FriendResponse {
        id: number;
        username: string;
        email: string;
        phone: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
        created_at: string;
        updated_at: string;
    }

    const [searchResults, setSearchResults] = useState<FriendResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [requestSent, setRequestSent] = useState<Record<number, boolean>>({});

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

    const { data: friendRequests = [] } = useQuery({
        queryKey: ["friendRequests", currentUserId],        
        queryFn: () => {
            return friendAPI.getReceivedFriendRequests(currentUserId);
        },
        select: (response) => response,
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

    const onSubmitEditing = useCallback(async () => {
        if (phoneSearch.trim() && currentUserId) {
            setIsSearching(true);
            try {
                console.log('Starting search with phone:', phoneSearch);

                // First, refresh the friends list to ensure we have the latest data
                const friendsResponse = await refetch();
                const currentFriends = friendsResponse.data || [];
                console.log('Current friends:', currentFriends.map(f => f.id));

                // Then perform the search using the new API signature
                const response = await friendAPI.findUsers(currentUserId, phoneSearch);
                console.log('Search results:', response.data.users.map(u => u.id));

                // Filter out unwanted results with proper type comparison
                const filteredResults = response.data.users.filter(user => {
                    const isCurrentUser = user.id === String(currentUserId);
                    const isExistingFriend = currentFriends.some(friend =>
                        String(friend.id) === user.id
                    );

                    console.log(`User ${user.id}:`, {
                        isCurrentUser,
                        isExistingFriend,
                        shouldInclude: !isCurrentUser && !isExistingFriend,
                    });

                    return !isCurrentUser && !isExistingFriend;
                });

                console.log('Filtered results:', filteredResults.map(u => u.id));

                setSearchResults(filteredResults.map(user => ({
                    id: Number(user.id), // Convert to number if needed
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar || null,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                })));
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    }, [phoneSearch, currentUserId, refetch]);

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

            {/* Floating Add Friend Button */}
            <TouchableOpacity 
                style={styles.floatingButton}
                onPress={() => setIsAddFriendModalVisible(true)}
            >
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>

            {/* Add Friend Modal */}
            <Modal
                transparent={true}
                visible={isAddFriendModalVisible}
                onRequestClose={() => {
                    setIsAddFriendModalVisible(false);
                    setPhoneSearch('');
                    setSearchResults([]);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Friends</Text>
                        
                        <Searchbar
                            placeholder="Search by phone number"
                            onChangeText={setPhoneSearch}
                            value={phoneSearch}
                            style={styles.modalSearchBar}
                            onSubmitEditing={onSubmitEditing}  // Updated to use the new callback
                        />

                        {isSearching ? (
                            <ActivityIndicator style={styles.modalLoader} size="small" color="#4285F4" />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.searchResultItem}>
                                        <Image
                                            source={item.avatar ? { uri: item.avatar } : require('@/assets/images/default-avatar.png')}
                                            style={styles.searchResultAvatar}
                                        />
                                        <View style={styles.searchResultText}>
                                            <Text style={styles.searchResultName}>{item.first_name} {item.last_name}</Text>
                                            <Text style={styles.searchResultPhone}>{item.phone}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[
                                                styles.addButton,
                                                requestSent[item.id] && styles.addButtonSent
                                            ]}
                                            onPress={async () => {
                                                if (currentUserId && !requestSent[item.id]) {
                                                    try {
                                                        await friendAPI.addFriend(currentUserId, item.id);
                                                        setRequestSent(prev => ({
                                                            ...prev,
                                                            [item.id]: true
                                                        }));
                                                    } catch (error) {
                                                        console.error('Error sending request:', error);
                                                    }
                                                }
                                            }}
                                            disabled={requestSent[item.id]}
                                        >
                                            <Text style={styles.addButtonText}>
                                                {requestSent[item.id] ? 'Request Sent' : 'Add Friend'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    phoneSearch ? (
                                        <Text style={styles.noResultsText}>
                                            {searchResults.length === 0 && !isSearching
                                                ? "No users found or user is already your friend"
                                                : "No users found with this phone number"}
                                        </Text>
                                    ) : (
                                        <Text style={styles.instructionText}>
                                            Enter a phone number to search for friends
                                        </Text>
                                    )
                                }
                            />
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => {
                                setIsAddFriendModalVisible(false);
                                setPhoneSearch('');
                                setSearchResults([]);
                            }}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalSearchBar: {
        marginVertical: 10,
        backgroundColor: '#f5f5f5',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    searchResultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    searchResultText: {
        flex: 1,
    },
    searchResultName: {
        fontWeight: '500',
    },
    searchResultPhone: {
        color: '#666',
        fontSize: 12,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#4285F4',
    },
    addButtonSent: {
        backgroundColor: '#34A853',
    },
    addButtonText: {
        color: 'white',
        fontSize: 12,
    },
    modalLoader: {
        marginVertical: 20,
    },
    noResultsText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    instructionText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalCloseButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#4285F4',
        borderRadius: 5,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: 'white',
        fontSize: 16,
    },
    
});


export default FriendListScreen;
