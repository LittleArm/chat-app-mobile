import { ChatLogContentType } from "./chatlogcontenttype.entity";

export class ChatLog {
  id: string;
  from_user: string;
  to_user: string;
  to_group: string;
  content: string;
  created_date: Date;
  latest_updated_date: Date;
  content_type_id: string;
  owner_id: string;
  content_type: ChatLogContentType;
}