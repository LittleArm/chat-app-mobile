import { Conversation, Participant } from "../../../entities";

export type ConversationByUserResult = {
    id: Conversation["id"];
    type: Conversation["type"];
    creator_id: Conversation["creator_id"];
    participants: Participant["user_id"][];
};