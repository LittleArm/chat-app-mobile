import { ChatBox } from "./chatbox.entity";
import { ChatLog } from "./chatlog.entity";

export class ChatBoxChatLog {
  id: string;
  chat_box_id: string;
  chat_log_id: string;
  created_date: Date;
  deleted: boolean;
  emote_id: string;
  chat_box: ChatBox;
  chat_log: ChatLog;
}