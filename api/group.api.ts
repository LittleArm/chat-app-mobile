import { CreateGroupDto } from "@/types/api/dto";
import {
    FindByUserDto,
    UpdateGroupDto,
    UploadGroupImageDto,
} from "@/types/api/dto/group";
import { GroupMemberResponse } from "@/types/api/response/group.member.response";
import { GroupResponse } from "../types/api/response";
import http from "../utils/http";

export const GROUP_URL = {
    GROUP: "/group",
    GROUP_LIST: "/group-members/list-by-user",
    GROUP_UPLOAD_AVATAR: "/group/%/upload-image",
    GET: "/group",
};

export const groupAPI = {
    createGroup(createGroupDto: CreateGroupDto) {
        return http.post<GroupResponse>(GROUP_URL.GROUP, createGroupDto);
    },

    getGroups(findByUserDto: FindByUserDto) {
        return http.post<GroupMemberResponse>(GROUP_URL.GROUP_LIST, findByUserDto);
    },

    updateGroup(updateGroupDto: UpdateGroupDto) {
        return http.put<GroupResponse>(GROUP_URL.GROUP, updateGroupDto);
    },

    uploadAvatar(uploadImageDto: UploadGroupImageDto) {
        return http.post<GroupResponse>(
            GROUP_URL.GROUP_UPLOAD_AVATAR.replace("%", uploadImageDto.id),
            uploadImageDto.formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
    },
    get(groupId: string) {
        return http.get<GroupResponse>(`${GROUP_URL.GET}/${groupId}`);
    },
};