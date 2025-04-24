import { User } from "@/types/entities";

export type FriendRequestResponse = {
    id: number;
    user_id: User["id"];
    username: User["username"];
    email: User["email"];
    phone: User["phone"];
    first_name: User["first_name"];
    last_name: User["last_name"];
    avatar: User["avatar"];
    created_at: Date;
    status: string;
}
