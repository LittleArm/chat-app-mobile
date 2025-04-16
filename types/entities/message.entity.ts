export class Message {
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    sender_id: number;
    conversation_id: number;
    content: string;
};