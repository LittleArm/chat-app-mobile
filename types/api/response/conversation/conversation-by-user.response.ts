import { Conversation, Participant } from "../../../entities";

export type ConversationByUserResult = {
    id: Conversation["id"];
    name: Conversation["name"];
    type: Conversation["type"];
    creator_id: Conversation["creator_id"];
    participants: Participant[];
    seen: boolean;
    latest_message_id: number;
    latest_message_sender_id: number;
    latest_message_sender_name: string;
    latest_message_sender_avatar: string;
    latest_message_content: string;
    latest_message_created_at: Date;
};