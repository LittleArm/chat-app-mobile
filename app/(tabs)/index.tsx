import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Searchbar, Checkbox } from 'react-native-paper';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet, Modal, TextInput } from 'react-native';
import { useQuery } from 'react-query';
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conversationAPI } from '@/api/conversation.api';
import { friendAPI } from '@/api/friend.api';
import { router } from 'expo-router';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

interface ConversationWithDetails {
    id: number;
    name: string;
    type: string;
    creator_id: number;
    participants: {
        id: number;
        phone: string;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string;
    }[];
    seen: boolean;
    latest_message_id: number;
    latest_message_sender_id: number;
    latest_message_sender_name: string;
    latest_message_sender_avatar: string;
    latest_message_content: string;
    latest_message_created_at: Date;
}

interface FriendItem {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
    hasExistingConversation?: boolean;
}

const ConversationListScreen = () => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [friendSearchQuery, setFriendSearchQuery] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [conversationName, setConversationName] = useState('');

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

    // Fetch conversations
    const { data: conversations = [], isLoading, refetch } = useQuery(
        ['conversations', currentUserId],
        async () => {
            const response = await conversationAPI.listConversations(currentUserId!);
            return response || [];
        },
        {
            enabled: !!currentUserId,
            refetchInterval: 1000, // Refetch every 5 seconds (adjust as needed)
        }
    );

    // Fetch friends list
    const { data: friends, refetch: refetchFriends } = useQuery({
        queryKey: ["friends", currentUserId],
        queryFn: () => friendAPI.getFriends(currentUserId),
        select: (response) => response.data,
        enabled: !!currentUserId,
    });

    // Mark friends with existing conversations
    const [filteredFriends, setFilteredFriends] = useState<FriendItem[]>([]);
    useEffect(() => {
        if (friends) {
            let updatedFriends = [...friends];

            if (conversations) {
                updatedFriends = updatedFriends.map(friend => {
                    const hasExistingConversation = conversations.some(conv =>
                        conv.participants.some(p => p.id === friend.id) &&
                        conv.participants.length === 2 // Only 1:1 chats
                    );
                    return { ...friend, hasExistingConversation };
                });
            }

            setFilteredFriends(updatedFriends);
        }
    }, [friends, conversations]);

    const isGroupChat = (conversation: ConversationWithDetails) => {
        return conversation.participants.length > 2;
    };

    const getConversationName = (conversation: ConversationWithDetails) => {
        if (conversation.name) {
            return conversation.name;
        }

        const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
        if (otherParticipants.length === 1) {
            return `${otherParticipants[0].first_name} ${otherParticipants[0].last_name}`.trim() ||
                otherParticipants[0].username;
        }

        return otherParticipants.map(p =>
            `${p.first_name} ${p.last_name}`.trim() || p.username
        ).join(', ');
    };

    const getConversationAvatar = (conversation: ConversationWithDetails) => {
        if (conversation.type === 'group') {
            return null;
        }

        const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
        return otherParticipant?.avatar || '';
    };
    const getAvatarColor = (id: number) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F06292', '#7986CB', '#9575CD',
            '#64B5F6', '#4DB6AC', '#81C784', '#FFD54F',
            '#FF8A65', '#A1887F', '#90A4AE'
        ];
        return colors[id % colors.length];
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
            await refetchFriends();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch, refetchFriends]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(conversation => {
            const searchLower = searchQuery.toLowerCase();
            const name = getConversationName(conversation).toLowerCase();
            return name.includes(searchLower);
        });
    }, [conversations, searchQuery]);

    const handleFriendSelection = (friendId: number) => {
        setSelectedFriends(prev => {
            if (prev.includes(friendId)) {
                return prev.filter(id => id !== friendId);
            } else {
                return [...prev, friendId];
            }
        });
    };

    const handleConfirmSelection = useCallback(async () => {
        if (selectedFriends.length === 0 || !currentUserId) return;

        try {
            // If only one friend is selected and has existing conversation, navigate to it
            if (selectedFriends.length === 1) {
                const friendId = selectedFriends[0];
                const friend = filteredFriends.find(f => f.id === friendId);

                if (friend?.hasExistingConversation) {
                    const existingConversation = conversations.find(conv =>
                        conv.participants.some(p => p.id === friendId) &&
                        conv.participants.length === 2
                    );

                    if (existingConversation) {
                        router.push({
                            pathname: '/(chatbox)',
                            params: {
                                conversationId: existingConversation.id,
                                name: `${friend.first_name} ${friend.last_name}`.trim() || friend.username,
                                avatar: friend.avatar
                            }
                        });
                        setSelectedFriends([]);
                        setIsPopupVisible(false);
                        return;
                    }
                }
            }

            // Generate conversation name if not provided
            let name = conversationName;
            if (!name) {
                if (selectedFriends.length === 1) {
                    const friend = filteredFriends.find(f => f.id === selectedFriends[0]);
                    name = `${friend?.first_name} ${friend?.last_name}`.trim() || friend?.username || 'New Chat';
                } else {
                    name = `Group with ${selectedFriends.length} members`;
                }
            }

            // Create new conversation
            const isGroup = selectedFriends.length > 1;
            const conversationData = {
                type: isGroup ? 'group' : 'private',
                creator_id: currentUserId,
                participants: [currentUserId, ...selectedFriends],
                name: isGroup ? (conversationName || name) : null
            };

            const response = await conversationAPI.createConversation(conversationData);
            const newConversationId = response.data.id;

            // Navigate to the new conversation
            router.push({
                pathname: '/(chatbox)',
                params: {
                    conversationId: newConversationId,
                    name: name,
                    avatar: isGroup ? '' : filteredFriends.find(f => f.id === selectedFriends[0])?.avatar
                }
            });

            setSelectedFriends([]);
            setConversationName('');
            setIsPopupVisible(false);
            await refetch();

        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    }, [selectedFriends, filteredFriends, conversations, currentUserId, conversationName, refetch]);

    const renderFriendItem = useCallback(({ item }: { item: FriendItem }) => {
        const fullName = `${item.first_name} ${item.last_name}`.trim() || item.username;
        const avatarSource = item.avatar
            ? { uri: item.avatar }
            : require('@/assets/images/default-avatar.png');

        return (
            <TouchableOpacity
                style={styles.friendItem}
                onPress={() => handleFriendSelection(item.id)}
            >
                <Checkbox
                    status={selectedFriends.includes(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => handleFriendSelection(item.id)}
                    color="#007AFF"
                />
                <Image
                    source={avatarSource}
                    style={styles.friendAvatar}
                    defaultSource={require('@/assets/images/default-avatar.png')}
                />
                <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{fullName}</Text>
                    {item.hasExistingConversation && (
                        <Text style={styles.existingConversationText}>Existing conversation</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [selectedFriends]);

    const renderConversationItem = useCallback(({ item }: { item: ConversationWithDetails }) => {
        const lastMessageContent = item.latest_message_content || 'No messages yet';
        const lastMessageTime = item.latest_message_created_at
            ? moment(item.latest_message_created_at).format('h:mm A')
            : '';
        const name = getConversationName(item);
        const isGroup = isGroupChat(item);

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => router.push({
                    pathname: '/(chatbox)',
                    params: {
                        conversationId: item.id,
                        name,
                        avatar: isGroup ? '' : getConversationAvatar(item)
                    }
                })}
            >
                <View style={styles.avatarContainer}>
                    {isGroup ? (
                        <View style={[
                            styles.groupAvatar,
                            { backgroundColor: getAvatarColor(item.id) }
                        ]}>
                            <Text style={styles.groupAvatarText}>
                                {name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    ) : (
                        <Image
                            source={getConversationAvatar(item)
                                ? { uri: getConversationAvatar(item) }
                                : require('@/assets/images/default-avatar.png')
                            }
                            style={styles.avatar}
                            defaultSource={require('@/assets/images/default-avatar.png')}
                        />
                    )}
                </View>
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName}>{name}</Text>
                        <Text style={styles.conversationTime}>{lastMessageTime}</Text>
                    </View>
                    <Text
                        style={styles.conversationMessage}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {lastMessageContent}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, []);

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
            />

            {/* Conversation List */}
            {isLoading ? (
                <ActivityIndicator style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderConversationItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Floating New Conversation Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                    setSelectedFriends([]);
                    setIsPopupVisible(true);
                    refetchFriends();
                }}
            >
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>

            {/* New Conversation Popup */}
            <Modal
                visible={isPopupVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setSelectedFriends([]);
                    setConversationName('');
                    setIsPopupVisible(false);
                }}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popupTitle}>Start New Conversation</Text>

                        {/* Name input for group chats */}
                        {selectedFriends.length > 1 && (
                            <View style={styles.nameInputContainer}>
                                <Text style={styles.nameInputLabel}>Group Name (optional)</Text>
                                <TextInput
                                    style={styles.nameInput}
                                    placeholder="Enter group name"
                                    value={conversationName}
                                    onChangeText={setConversationName}
                                />
                            </View>
                        )}

                        {/* Friend search bar */}
                        <Searchbar
                            placeholder="Search friends"
                            onChangeText={setFriendSearchQuery}
                            value={friendSearchQuery}
                            style={styles.friendSearchBar}
                            inputStyle={styles.searchInput}
                        />

                        {/* Friends list */}
                        <FlatList
                            data={filteredFriends.filter(friend =>
                                `${friend.first_name} ${friend.last_name}`.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                                friend.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderFriendItem}
                            contentContainerStyle={styles.friendsList}
                            ListEmptyComponent={
                                <View style={styles.emptyFriendContainer}>
                                    <Text style={styles.emptyFriendText}>
                                        {friendSearchQuery ? 'No matching friends found' : 'No friends available'}
                                    </Text>
                                </View>
                            }
                        />

                        {/* Confirm button */}
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                selectedFriends.length === 0 && styles.disabledButton
                            ]}
                            onPress={handleConfirmSelection}
                            disabled={selectedFriends.length === 0}
                        >
                            <Text style={styles.confirmButtonText}>
                                {selectedFriends.length === 1 ?
                                    (filteredFriends.find(f => f.id === selectedFriends[0])?.hasExistingConversation ? 'Go to conversation' : 'Create conversation') : 'Create group chat'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setSelectedFriends([]);
                                setIsPopupVisible(false);
                            }}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
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
        backgroundColor: '#fff',
        position: 'relative',
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
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        marginRight: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    groupAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupAvatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    conversationTime: {
        fontSize: 12,
        color: '#666',
    },
    conversationMessage: {
        fontSize: 14,
        color: '#666',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginLeft: 82,
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
        color: '#757575',
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    popup: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    friendSearchBar: {
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        elevation: 0,
    },
    friendsList: {
        paddingVertical: 10,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    friendAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        color: '#333',
    },
    existingConversationText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyFriendContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyFriendText: {
        color: '#757575',
        fontSize: 14,
    },
    closeButton: {
        marginTop: 15,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nameInputContainer: {
        marginBottom: 15,
    },
    nameInputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    nameInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
});

export default ConversationListScreen;