export type FriendRequestResponse = {
    CreatedAt: Date;
    UpdatedAt: Date;
    DeletedAt: Date;
    id: number;
    user_id: number;
    friend_id: number;
    status: string;
}
