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
} from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams } from 'expo-router';
import { conversationAPI } from "@/api/conversation.api";
import { STORAGE_KEY } from "@/utils/constants";

interface ChatInputProps {
    reset?: number;
    onSubmit?: (text: string) => void;
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
}
const ChatInput: FC<ChatInputProps> = ({ reset, onSubmit, setMessages }) => {
    const { userId } = useAuth();
    const params = useLocalSearchParams();
    const [inputMessage, setInputMessage] = useState("");
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
                        ...prev,  // Keep existing defaults for missing fields
                        ...response.data  // Overwrite with API data
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                // State already has defaults, no need to set
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

        // Create a temporary message object
        const tempMessage = {
            _id: Math.round(Math.random() * 1000000).toString(), // Temporary ID
            text: inputMessage,
            createdAt: new Date(),
            user: {
                _id: userId, // Replace with your current user's ID
            },
            // You might want to add a 'pending' flag if you need to track unsent messages
        };

        // Optimistically update the UI
        setMessages(previousMessages => GiftedChat.append(previousMessages, [tempMessage]));

        console.log("Sending message:", inputMessage);
        ws.current.send(inputMessage);
        setInputMessage("");

        // If your WebSocket sends back confirmation, you might update the temporary message
        // with the actual server data when received
    };

    return (
        <View style={styles.inputContainer}>
            <View style={styles.inputMessageContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tin nhắn"
                    placeholderTextColor="black"
                    value={inputMessage}
                    onChangeText={handleInputText}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={handleOnPressSendButton}
                        style={styles.sendButton}
                    >
                        <FontAwesome name="send" size={22} color={"gray"} />
                    </TouchableOpacity>
                </View>
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

        // Initial fetch

        // Set up interval for periodic fetching
        const intervalId = setInterval(fetchChatHistory, 1000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [conversationId]);

    const renderMessage = (props) => {
        const { currentMessage } = props;

        if (currentMessage.user._id === userId) {
            return (
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            right: {
                                backgroundColor: "#8bbbf7",
                                marginRight: 12,
                                marginVertical: 12,
                            },
                        }}
                        textStyle={{
                            right: {
                                color: "black",
                            },
                        }}
                    />
                </View>
            );
        } else {
            return (
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            left: {
                                marginLeft: 12,
                                marginVertical: 12,
                            },
                        }}
                        textStyle={{
                            left: {
                                color: "black",
                            },
                        }}
                    />
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.header}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: 18 }}
                    >
                        <FontAwesome name="arrow-left" size={22} color={"gray"} />
                    </TouchableOpacity>
                    <View>
                        <Image
                            source={{
                                uri: `data:image/png;base64, ${avatar}`,
                            }}
                            defaultSource={require("@/assets/images/default-avatar.png")}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={{ marginLeft: 16 }}>
                        <Text style={styles.headerText}>{name}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onSetting}
                    >
                        <Icon name="settings" size={24} color="#888" />
                    </TouchableOpacity>
                </View>
            </View>

            <GiftedChat
                messages={messages}
                renderInputToolbar={() => null}
                user={{ _id: userId }}
                minInputToolbarHeight={0}
                renderMessage={renderMessage}
            />
            <ChatInput reset={resetChatInput} setMessages={setMessages} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f3f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        elevation: 5,
        borderBottomColor: "gray",
        borderBottomWidth: 0.2,
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 999,
    },
    headerText: {
        color: "gray",
        fontSize: 18,
        fontWeight: "bold",
    },
    iconButton: {
        marginHorizontal: 5,
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 50,
    },
    inputContainer: {
        backgroundColor: "#fff",
        height: 72,
        alignItems: "center",
        justifyContent: "center",
    },
    inputMessageContainer: {
        height: 54,
        width: "90%",
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        alignItems: "center",
        borderColor: "rgba(128,128,128,.4)",
        borderWidth: 1,
    },
    input: {
        color: "black",
        flex: 1,
        paddingHorizontal: 10,
    },
    sendButton: {
        backgroundColor: "#fff",
        padding: 4,
        borderRadius: 999,
        marginHorizontal: 6,
    },
});

export default memo(ChatBoxComponent);