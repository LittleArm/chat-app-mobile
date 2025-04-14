import { User } from "@/types/entities";

export type FriendResponse = {
  id: string;
  from_user: string;
  to_user: string;
  created_date: Date;
  deleted: boolean;
  to_user_profile: User;
}
