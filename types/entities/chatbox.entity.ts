import { ChatBoxChatLog } from "./chatboxchatlog.entity";
import { Group } from "./group.entity";
import { User } from "./user.entity";

export class ChatBox {
  id: string;
  from_user: string;
  to_user: string;
  to_group: string;
  created_date: Date;
  latest_updated_date: Date;
  deleted: boolean;
  muted: boolean;
  last_accessed_date: Date;
  new_message: boolean;
  to_user_profile: User;
  to_group_profile: Group;
  chatbox_chatlogs: ChatBoxChatLog[];
}