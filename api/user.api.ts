import { ProfileResponse } from "../types/api/response";
import http from "../utils/http";

export const USER_URL = {
    GET_USER_PROFILE: "/user/:userId",
    //UPLOAD_AVATAR: "/user/:userId/uploadAvatar"
};

export const userAPI = {
    getUserProfile(userId: number) {
        return http.get<ProfileResponse>(USER_URL.GET_USER_PROFILE.replace(":userId", userId.toString()));
    },

    //uploadAvatar(userId: number, avatar: string) {

    //}
};
