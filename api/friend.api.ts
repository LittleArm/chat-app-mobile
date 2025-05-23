import { FriendResponse } from "@/types/api/response";
import { FriendRequestResponse } from "@/types/api/response/friend-request.response";
import { User_Info_Response } from "../types/api/response/user_info.response";
import http from "../utils/http";

export const FRIEND_URL = {
    ADD_FRIEND: "/addFriend/:userId/:friendId",
    CANCEL_FRIEND_REQUEST: "/cancelFriendRequest/:userId/:friendId",
    ACCEPT_FRIEND: "/acceptFriend/:friendId/:userId",
    REJECT_FRIEND: "/rejectFriend/:friendId/:userId",
    SENT_FRIEND_REQUESTS: "/sentFriendRequests/:userId",
    RECEIVED_FRIEND_REQUESTS: "/receivedFriendRequests/:friendId",
    GET_FRIENDS: "user/:userId/friends",
    FIND_USERS: "/user/:userId/findUsers",
};

export const friendAPI = {
    addFriend(userId: number, friendId: number) {
        return http.post<{ message: string }>(FRIEND_URL.ADD_FRIEND.replace(":userId", userId.toString()).replace(":friendId", friendId.toString()));
    },
    cancelFriendRequest(userId: number, friendId: number) {
        return http.delete<{ message: string }>(FRIEND_URL.CANCEL_FRIEND_REQUEST.replace(":userId", userId.toString()).replace(":friendId", friendId.toString()));
    },
    acceptFriend(userId: number, friendId: number) {
        return http.put<{ message: string }>(FRIEND_URL.ACCEPT_FRIEND.replace(":friendId", friendId.toString()).replace(":userId", userId.toString()));
    },
    rejectFriend(userId: number, friendId: number) {
        return http.put<{ message: string }>(FRIEND_URL.REJECT_FRIEND.replace(":friendId", friendId.toString()).replace(":userId", userId.toString()));
    },
    getSentFriendRequests(userId: number): Promise<FriendRequestResponse[]> {
        return http.get<{ requests: FriendRequestResponse[] }>(
            FRIEND_URL.SENT_FRIEND_REQUESTS.replace(":userId", userId.toString())
        ).then(response => response.data.requests);
    },
    getReceivedFriendRequests(friendId: number): Promise<FriendRequestResponse[]> {
        return http.get<{ requests: FriendRequestResponse[] }>(
            FRIEND_URL.RECEIVED_FRIEND_REQUESTS.replace(":friendId", friendId.toString())
        ).then(response => response.data.requests);
    },
    getFriends(userId: number) {
        return http.get<FriendResponse[]>(FRIEND_URL.GET_FRIENDS.replace(":userId", userId.toString()));
    },
    findUsers(userId: number, search: string) {
        return http.get<{ users: User_Info_Response[] }>(FRIEND_URL.FIND_USERS.replace(":userId", userId.toString()), {
            params: { search }
        });
    }
};