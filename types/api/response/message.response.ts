import { Message } from "@/types/entities";

export type MessageResponse = {
    content: Message["content"];
    createAt: Message["created_at"];
    convesationId: Message["conversation_id"];
    senderId: Message["sender_id"];
};