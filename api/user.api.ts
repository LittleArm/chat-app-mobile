import { UpdateProfileDto } from "@/types/api/dto";
import { ProfileResponse } from "../types/api/response";
import http from "../utils/http";
import { FirebaseTokenDto } from "@/types/api/dto/user";

export const USER_URL = {
  MY_PROFILE: '/user/me/profiles',
  PROFILE: '/profile',
  ADD_FIREBASE_TOKEN: '/user/add-firebase-token',
  REMOVE_FIREBASE_TOKEN: '/user/remove-firebase-token',
  GET_USER_PROFILE: '/user/get-profile'
};

export const userAPI = {
  getMyProfile() {
    return http.get<ProfileResponse[]>(USER_URL.MY_PROFILE);
  },
  updateProfile(updateProfileDto: UpdateProfileDto) {
    return http.put<ProfileResponse>(USER_URL.PROFILE, updateProfileDto);
  },
  addFirebaseToken(firebaseTokenDto: FirebaseTokenDto){
    return http.post<boolean>(USER_URL.ADD_FIREBASE_TOKEN, firebaseTokenDto);
  },
  removeFirebaseToken(firebaseTokenDto: FirebaseTokenDto){
    return http.post<boolean>(USER_URL.REMOVE_FIREBASE_TOKEN, firebaseTokenDto);
  },
  getUserProfile(userId: string) {
    return http.get<ProfileResponse[]>(`${USER_URL.GET_USER_PROFILE}/${userId}`);
  },
};
