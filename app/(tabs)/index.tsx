import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';
import { STORAGE_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conversationAPI } from '@/api/conversation.api';
import { userAPI } from '@/api/user.api';
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

const ConversationListScreen = () => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [enrichedConversations, setEnrichedConversations] = useState<ConversationWithLastMessage[]>([]);

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

    const getParticipantInfo = async (participantIds: number[], currentUserId: number) => {
        try {
            // Filter out the current user and get unique participants
            const uniqueParticipants = [...new Set(participantIds.filter(id => id !== currentUserId))];

            // If it's a one-on-one chat, get the other participant's info
            if (uniqueParticipants.length === 1) {
                const response = await userAPI.getUserProfile(uniqueParticipants[0]);
                const fullName = `${response.data.first_name} ${response.data.last_name}`.trim();
                return {
                    name: fullName,
                    avatar: response.data.avatar
                };
            }

            // If it's a group chat, return all unique participant names
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
                        // Fetch messages
                        const messagesResponse = await conversationAPI.chatDetail(conv.id);
                        const messages = messagesResponse;

                        // Get last message
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
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    const filteredConversations = enrichedConversations.filter(({ conversation, name }) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            name?.toLowerCase().includes(searchLower)
        );
    });

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
                            ? moment(item.lastMessage.createAt).format('h:mm A') // Changed to 12-hour format
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
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
        marginLeft: 82, // Avatar width + margin
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
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    navItem: {
        fontSize: 16,
        color: '#666',
    },
    navItemActive: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default ConversationListScreen;