import { Profile } from "./profile.entity";

export class User {
  id: string;
  password: string;
  phone: string;
  created_date: Date;
  refresh_token_list: string[];
  active: boolean;
  profile: Profile[];
}