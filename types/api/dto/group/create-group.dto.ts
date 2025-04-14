export class CreateGroupDto {
  name!: string;
  description: string | undefined;
  user_ids?: string[] = [];
}
