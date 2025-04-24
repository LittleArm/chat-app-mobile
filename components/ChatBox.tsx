import { router, useFocusEffect } from "expo-router";
import React, {
    FC,
    memo,
    useCallback,
    useEffect,
    useRef,
    useMemo,
    useState,
} from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
    Platform,
} from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams } from 'expo-router';
import { conversationAPI } from "@/api/conversation.api";
import { STORAGE_KEY } from "@/utils/constants";
import EmojiSelector from "react-native-emoji-selector";

interface ChatInputProps {
    reset?: number;
    onSubmit?: (text: string) => void;
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
}

const ChatInput: FC<ChatInputProps> = ({ reset, onSubmit, setMessages }) => {
    const { userId } = useAuth();
    const params = useLocalSearchParams();
    const [inputMessage, setInputMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [userInfo, setUserInfo] = useState({
        id: userId?.toString() || "",
        username: "User",
        email: "",
        phone: "",
        first_name: "",
        last_name: "",
        avatar: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await conversationAPI.getUserInfo_chatbox(Number(userId));
                if (response.data) {
                    setUserInfo(prev => ({
                        ...prev,
                        ...response.data
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const username = userInfo.username || "Unknown";
    const websocketURL = STORAGE_KEY.CHAT_SOCKET_BASE_URL.replace("http://", "");
    const conversationId = params.conversationId?.toString() || "";
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socketUrl = `ws://${websocketURL}/ws/joinConversation/${conversationId}?userId=${userId}&username=${username}`;
        ws.current = new WebSocket(socketUrl);

        ws.current.onopen = () => {
            console.log("WebSocket connected ✅ at: ", socketUrl);
        };

        return () => {
            ws.current?.close();
        };
    }, [conversationId, userId, username]);

    useEffect(() => {
        setInputMessage("");
    }, [reset]);

    const handleInputText = (text: string) => {
        setInputMessage(text);
    };

    const handleOnPressSendButton = () => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not open.");
            return;
        }

        if (inputMessage.trim() === "") {
            return;
        }

        const tempMessage = {
            _id: Math.round(Math.random() * 1000000).toString(),
            text: inputMessage,
            createdAt: new Date(),
            user: {
                _id: userId,
            },
        };

        setMessages(previousMessages => GiftedChat.append(previousMessages, [tempMessage]));
        ws.current.send(inputMessage);
        setInputMessage("");
        setShowEmojiPicker(false);
        Keyboard.dismiss();
    };

    const handleEmojiSelect = (emoji: string) => {
        setInputMessage(prev => prev + emoji);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prev => !prev);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.inputContainer}>
            {showEmojiPicker && (
                <View style={styles.emojiPickerContainer}>
                    <EmojiSelector
                        onEmojiSelected={handleEmojiSelect}
                        columns={8}
                        showSearchBar={false}
                        showHistory={true}
                        showSectionTitles={false}
                    />
                </View>
            )}
            <View style={styles.inputMessageContainer}>
                <TouchableOpacity
                    onPress={toggleEmojiPicker}
                    style={styles.emojiButton}
                >
                    <FontAwesome
                        name={showEmojiPicker ? "keyboard-o" : "smile-o"}
                        size={24}
                        color="#666"
                    />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    value={inputMessage}
                    onChangeText={handleInputText}
                    multiline
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    onPress={handleOnPressSendButton}
                    style={[
                        styles.sendButton,
                        inputMessage.trim() ? styles.activeSendButton : null
                    ]}
                    disabled={!inputMessage.trim()}
                >
                    <FontAwesome
                        name="send"
                        size={20}
                        color={inputMessage.trim() ? "#007AFF" : "#ccc"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface ChatBoxProps {
    name?: string;
    chatboxId: string;
    avatar?: string;
    onSetting?: () => void;
}

const ChatBoxComponent = ({
    name,
    chatboxId,
    avatar,
    onSetting,
}: ChatBoxProps) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [resetChatInput, setResetChatInput] = useState(0);
    const { userId } = useAuth();
    const params = useLocalSearchParams();
    const conversationId = params.conversationId?.toString() || "";

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await conversationAPI.chatDetail(Number(conversationId));
                const formattedMessages = Array.isArray(response)
                    ? response.map((msg) => ({
                        _id: `${msg.convesationId}-${msg.senderId}-${new Date(msg.createAt).getTime()}`,
                        text: msg.content,
                        createdAt: new Date(msg.createAt),
                        user: { _id: msg.senderId.toString() }
                    })).reverse()
                    : [];

                setMessages(formattedMessages);
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            }
        };

        const intervalId = setInterval(fetchChatHistory, 1000);
        return () => clearInterval(intervalId);
    }, [conversationId]);

    const renderMessage = (props) => {
        const { currentMessage } = props;

        if (currentMessage.user._id === userId) {
            return (
                <View style={styles.outgoingMessageContainer}>
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            right: {
                                backgroundColor: "#61d5ff",
                                marginRight: 12,
                                marginVertical: 8,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            },
                        }}
                        textStyle={{
                            right: {
                                color: "#000",
                                fontSize: 16,
                            },
                        }}
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.incomingMessageContainer}>
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            left: {
                                backgroundColor: "#FFFFFF",
                                marginLeft: 12,
                                marginVertical: 8,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderWidth: 1,
                                borderColor: "#EEE",
                            },
                        }}
                        textStyle={{
                            left: {
                                color: "#000",
                                fontSize: 16,
                            },
                        }}
                    />
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <FontAwesome name="arrow-left" size={22} color={"#555"} />
                    </TouchableOpacity>
                    <Image
                        source={{
                            uri: `data:image/png;base64, ${avatar}`,
                        }}
                        defaultSource={require("@/assets/images/default-avatar.png")}
                        style={styles.avatar}
                    />
                    <Text style={styles.headerText} numberOfLines={1}>
                        {name || "Chat"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={onSetting}
                >
                    <Icon name="settings" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <GiftedChat
                messages={messages}
                renderInputToolbar={() => null}
                user={{ _id: userId }}
                minInputToolbarHeight={0}
                renderMessage={renderMessage}
                bottomOffset={Platform.select({ ios: 50, android: 20 })}
                alwaysShowSend={false}
                scrollToBottom
                scrollToBottomComponent={() => (
                    <View style={styles.scrollToBottom}>
                        <FontAwesome name="angle-double-down" size={22} color="#666" />
                    </View>
                )}
                listViewProps={{
                    style: styles.messagesList,
                    keyboardDismissMode: "on-drag",
                }}
            />
            <ChatInput reset={resetChatInput} setMessages={setMessages} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backButton: {
        marginRight: 16,
    },
    avatar: {
        height: 36,
        width: 36,
        borderRadius: 18,
    },
    headerText: {
        color: "#333",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 12,
        flexShrink: 1,
    },
    settingsButton: {
        padding: 4,
        marginLeft: 8,
    },
    messagesList: {
        backgroundColor: "#F5F5F5",
    },
    outgoingMessageContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginRight: 8,
    },
    incomingMessageContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 8,
    },
    inputContainer: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        paddingBottom: Platform.select({ ios: 8, android: 4 }),
    },
    emojiPickerContainer: {
        height: 250,
        backgroundColor: "#F5F5F5",
    },
    inputMessageContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#F0F0F0",
        borderRadius: 20,
        fontSize: 16,
        color: "#333",
        lineHeight: 20,
    },
    emojiButton: {
        padding: 8,
        marginRight: 4,
    },
    sendButton: {
        padding: 10,
        marginLeft: 8,
        borderRadius: 20,
    },
    activeSendButton: {
        backgroundColor: "#E3F2FD",
    },
    scrollToBottom: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 6,
        borderWidth: 1,
        borderColor: "#EEE",
    },
});

export default memo(ChatBoxComponent);