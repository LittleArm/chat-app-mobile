export class InsertChatLogDto {
  created_date: Date;
  content: string;
  content_type_code: string;
  is_group_chat: boolean;
  to_id: string;
}