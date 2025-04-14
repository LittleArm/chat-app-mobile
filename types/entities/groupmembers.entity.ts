import { Group } from "./group.entity";
import { User } from "./user.entity";

export class GroupMembers {
  group_id: string;
  user_id: string;
  created_by: string;
  created_date: Date;
  group: Group;
  user: User;
}
