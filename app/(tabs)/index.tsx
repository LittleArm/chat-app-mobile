import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Searchbar, Checkbox } from 'react-native-paper';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet, Modal } from 'react-native';
import { useQuery } from 'react-query';
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conversationAPI } from '@/api/conversation.api';
import { userAPI } from '@/api/user.api';
import { friendAPI } from '@/api/friend.api';
import { router } from 'expo-router';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

interface ConversationWithLastMessage {
    conversation: {
        id: number;
        type: string;
        creator_id: number;
        participants: number[];
    };
    lastMessage?: {
        content: string;
        createAt: Date;
    };
    name?: string;
    avatar?: string;
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
    const [enrichedConversations, setEnrichedConversations] = useState<ConversationWithLastMessage[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [friendSearchQuery, setFriendSearchQuery] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

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
    const { data: conversationsData, isLoading, refetch } = useQuery(
        ['conversations', currentUserId],
        async () => {
            const response = await conversationAPI.listConversations(currentUserId!);
            return response;
        },
        { enabled: !!currentUserId }
    );

    // Fetch friends list
    const { data: friends, refetch: refetchFriends } = useQuery({
        queryKey: ["friends", currentUserId],
        queryFn: () => {
            return friendAPI.getFriends(currentUserId);
        },
        select: (response) => response.data,
        enabled: !!currentUserId,
    });

    // Mark friends with existing conversations
    useEffect(() => {
        if (friends && conversationsData) {
            const updatedFriends = friends.map(friend => {
                const hasExistingConversation = conversationsData.some(conv => 
                    conv.participants.includes(friend.id) && 
                    conv.type === 'direct'
                );
                return { ...friend, hasExistingConversation };
            });
            setFilteredFriends(updatedFriends);
        }
    }, [friends, conversationsData]);

    const [filteredFriends, setFilteredFriends] = useState<FriendItem[]>([]);

    const getParticipantInfo = async (participantIds: number[], currentUserId: number) => {
        try {
            const uniqueParticipants = [...new Set(participantIds.filter(id => id !== currentUserId))];

            if (uniqueParticipants.length === 1) {
                const response = await userAPI.getUserProfile(uniqueParticipants[0]);
                const fullName = `${response.data.first_name} ${response.data.last_name}`.trim();
                return {
                    name: fullName,
                    avatar: response.data.avatar
                };
            }

            const participantResponses = await Promise.all(
                uniqueParticipants.map(id => userAPI.getUserProfile(id))
            );

            const participantNames = participantResponses.map(res =>
                `${res.data.first_name} ${res.data.last_name}`.trim()
            );

            return {
                name: participantNames.join(', '),
                avatar: undefined
            };
        } catch (error) {
            console.error('Error fetching participant info:', error);
            return {
                name: 'Unknown User',
                avatar: undefined
            };
        }
    };

    // Fetch last message and participant names for each conversation
    useEffect(() => {
        const fetchConversationDetails = async () => {
            if (!conversationsData || !Array.isArray(conversationsData) || !currentUserId) {
                setEnrichedConversations([]);
                return;
            }

            const results = await Promise.all(
                conversationsData.map(async (conv) => {
                    try {
                        const messagesResponse = await conversationAPI.chatDetail(conv.id);
                        const messages = messagesResponse;

                        const lastMessage = messages.length > 0
                            ? messages.reduce((latest, current) =>
                                new Date(current.createAt) > new Date(latest.createAt) ? current : latest
                            )
                            : undefined;

                        const participantInfo = await getParticipantInfo(conv.participants, currentUserId);

                        return {
                            conversation: conv,
                            name: participantInfo.name,
                            avatar: participantInfo.avatar,
                            lastMessage: lastMessage ? {
                                content: lastMessage.content,
                                createAt: lastMessage.createAt
                            } : undefined
                        };
                    } catch (error) {
                        console.error(`Error processing conversation ${conv.id}:`, error);
                        return {
                            conversation: conv,
                            name: `Conversation ${conv.id}`
                        };
                    }
                })
            );

            setEnrichedConversations(results);
        };

        fetchConversationDetails();
    }, [conversationsData]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
            await refetchFriends();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch, refetchFriends]);

    const filteredConversations = enrichedConversations.filter(({ conversation, name }) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            name?.toLowerCase().includes(searchLower)
        );
    });

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
                    const existingConversation = enrichedConversations.find(conv => 
                        conv.conversation.participants.includes(friendId) && 
                        conv.conversation.type === 'private'
                    );
                    
                    if (existingConversation) {
                        router.push({
                            pathname: '/(chatbox)',
                            params: {
                                conversationId: existingConversation.conversation.id,
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
    
            // Create new conversation
            const conversationData = {
                type: selectedFriends.length === 1 ? 'private' : 'group',
                creator_id: currentUserId,
                participants: [currentUserId, ...selectedFriends]
            };
    
            const response = await conversationAPI.createConversation(conversationData);
            
            // Assuming the response contains the new conversation ID
            // You might need to adjust this based on your actual API response structure
            const newConversationId = response.data.id;
            
            // Navigate to the new conversation
            if (selectedFriends.length === 1) {
                const friend = filteredFriends.find(f => f.id === selectedFriends[0]);
                router.push({
                    pathname: '/(chatbox)',
                    params: {
                        conversationId: newConversationId,
                        name: `${friend?.first_name} ${friend?.last_name}`.trim() || friend?.username || 'New Chat',
                        avatar: friend?.avatar
                    }
                });
            } else {
                router.push({
                    pathname: '/(chatbox)',
                    params: {
                        conversationId: newConversationId,
                        name: `Group with ${selectedFriends.length} members`,
                        avatar: ''
                    }
                });
            }
    
            setSelectedFriends([]);
            setIsPopupVisible(false);
            
            // Refresh conversations list
            await refetch();
            
        } catch (error) {
            console.error('Error creating conversation:', error);

        }
    }, [selectedFriends, filteredFriends, enrichedConversations, currentUserId, refetch]);

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
                    keyExtractor={(item) => item.conversation.id.toString()}
                    renderItem={({ item }) => {
                        const lastMessageContent = item.lastMessage?.content || 'No messages yet';
                        const lastMessageTime = item.lastMessage?.createAt
                            ? moment(item.lastMessage.createAt).format('h:mm A')
                            : '';

                        return (
                            <TouchableOpacity
                                style={styles.conversationItem}
                                onPress={() => router.push({
                                    pathname: '/(chatbox)',
                                    params: {
                                        conversationId: item.conversation.id,
                                        name: item.name,
                                        avatar: item.avatar
                                    }
                                })}
                            >
                                <Image
                                    source={item.avatar ? { uri: item.avatar } : require('@/assets/images/default-avatar.png')}
                                    style={styles.avatar}
                                />
                                <View style={styles.conversationContent}>
                                    <View style={styles.conversationHeader}>
                                        <Text style={styles.conversationName}>{item.name}</Text>
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
                    }}
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
                    setIsPopupVisible(false);
                }}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popupTitle}>Start New Conversation</Text>
                        
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
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
});

export default ConversationListScreen;