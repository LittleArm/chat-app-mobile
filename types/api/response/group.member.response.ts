import { GroupResponse } from "./group.response";

export type GroupMemberInfoResponse = {
    group_id: string;
    user_id: string;
    created_by: string;
    created_date: string;
    group: GroupResponse;
}

export type GroupMemberResponse = {
  groups: GroupMemberInfoResponse[];
  count: number;
};

export type GroupUserResponse = {
  users: (GroupMemberInfoResponse & { 
    user: { 
      profile: { 
        fullname: string,
        avatar?: string,
        user_id: string
      }[]
    }
  })[];
  count: number;
}
