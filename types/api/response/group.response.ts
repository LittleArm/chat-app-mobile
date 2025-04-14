export type GroupResponse = {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_date: Date;
  latest_updated_by: string;
  latest_updated_date: Date;
  avatar?: string;
  description?: string;
  group_id_status: string;
};
