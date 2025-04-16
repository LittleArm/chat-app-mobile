import { Conversation, Participant } from "../../../entities";

export type ConversationByUserResult = {
    id: number;
    type: string;
    creator_id: number;
    participants: number[];
};