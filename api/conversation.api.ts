import http from "../utils/http";
import { MessageResponse } from "../types/api/response/message.response";
import { ConversationByUserResult } from "../types/api/response/conversation";
import { User_Info_Response } from "../types/api/response/user_info.response";       

export const CONVERSATION_URL = {
    LIST_CONVERSATIONS: "/user/:userId/conversations",
    CHAT_DETAIL: "/conversations/:conversationId/messages",
    SEEN_MESSAGE: "/seenMessages/:conversationId",
    CREATE_CONVERSATION: "/ws/createConversation",
    JOIN_CONVERSATION: "/ws/joinConversation/:conversationId",
    GET_CLIENTS: "/ws/getClients/:conversationId",
    GET_USER_INFO_CHAT: "/user/:userId",
};

export const conversationAPI = {
    listConversations(userId: number): Promise<ConversationByUserResult[]> {
        return http.get<{ conversations: ConversationByUserResult[] }>(
            CONVERSATION_URL.LIST_CONVERSATIONS.replace(":userId", userId.toString())
        ).then(response => response.data.conversations);
    },

    chatDetail(conversationId: number): Promise<MessageResponse[]> {
        return http.get<{ messages: MessageResponse[] }>(
            CONVERSATION_URL.CHAT_DETAIL.replace(":conversationId", conversationId.toString())
        ).then(response => response.data.messages);
    },

    //TODO
    createConversation(conversationData: any) {
        return http.post<{ id: string | number }>(CONVERSATION_URL.CREATE_CONVERSATION, conversationData);
    },

    joinConversation(conversationId: number) {
        return http.get<{ message: string }>(CONVERSATION_URL.JOIN_CONVERSATION.replace(":conversationId", conversationId.toString()));
    },

    getClients(conversationId: number) {
        return http.get<{ clients: any[] }>(CONVERSATION_URL.GET_CLIENTS.replace(":conversationId", conversationId.toString()));
    },

    // api/conversation.api.ts
    getUserInfo_chatbox(userId: number) {
        return http.get<User_Info_Response>(CONVERSATION_URL.GET_USER_INFO_CHAT.replace(":userId", userId.toString()));
    }
};
