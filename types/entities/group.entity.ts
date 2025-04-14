import { GroupMembers } from "./groupmembers.entity";

export class Group {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_date: Date;
  latest_updated_by: string;
  latest_updated_date: Date;
  group_status_id: string;
  avatar: string;
  description: string;
  owner_id: string;
  group_members: GroupMembers[];
}