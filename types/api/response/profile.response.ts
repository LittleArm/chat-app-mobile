import { User } from "@/types/entities";

export type ProfileResponse = {
    id: User["id"],
    username: User["username"],
    email: User["email"],
    phone: User["phone"],
    first_name: User["first_name"],
    last_name: User["last_name"],
    avatar: User["avatar"],
    created_at: User["CreateAt"],
    updated_at: User["UpdatedAt"]
};