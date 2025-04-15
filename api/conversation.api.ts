import http from "../utils/http";

export const CONVERSATION_URL = {
    CREATE_CONVERSATION: "/ws/createConversation",
    JOIN_CONVERSATION: "/ws/joinConversation/:conversationId",
    GET_CONVERSATIONS: "/ws/getConversations",
    GET_CLIENTS: "/ws/getClients/:conversationId",
};

export const conversationAPI = {
    createConversation(conversationData: any) {
        return http.post<{ message: string }>(CONVERSATION_URL.CREATE_CONVERSATION, conversationData);
    },

    joinConversation(conversationId: string) {
        return http.get<{ message: string }>(CONVERSATION_URL.JOIN_CONVERSATION.replace(":conversationId", conversationId));
    },

    getConversations() {
        return http.get<{ conversations: any[] }>(CONVERSATION_URL.GET_CONVERSATIONS);
    },

    getClients(conversationId: string) {
        return http.get<{ clients: any[] }>(CONVERSATION_URL.GET_CLIENTS.replace(":conversationId", conversationId));
    }
};
