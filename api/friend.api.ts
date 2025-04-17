import { FriendResponse } from "@/types/api/response";
import { FriendRequestResponse } from "@/types/api/response/friend-request.response";
import http from "../utils/http";

export const FRIEND_URL = {
    ADD_FRIEND: "/addFriend/:userId/:friendId",
    ACCEPT_FRIEND: "/acceptFriend/:friendId/:userId",
    REJECT_FRIEND: "/rejectFriend/:friendId/:userId",
    SENT_FRIEND_REQUESTS: "/sentFriendRequests/:userId",
    RECEIVED_FRIEND_REQUESTS: "/receivedFriendRequests/:friendId",
    GET_FRIENDS: "/friends/:userId",
};

export const friendAPI = {
    addFriend(userId: string, friendId: string) {
        return http.post<{ message: string }>(FRIEND_URL.ADD_FRIEND.replace(":userId", userId).replace(":friendId", friendId));
    },
    acceptFriend(userId: string, friendId: string) {
        return http.put<{ message: string }>(FRIEND_URL.ACCEPT_FRIEND.replace(":friendId", friendId).replace(":userId", userId));
    },
    rejectFriend(userId: string, friendId: string) {
        return http.put<{ message: string }>(FRIEND_URL.REJECT_FRIEND.replace(":friendId", friendId).replace(":userId", userId));
    },
    getSentFriendRequests(userId: string) {
        return http.get<FriendRequestResponse[]>(FRIEND_URL.SENT_FRIEND_REQUESTS.replace(":userId", userId));
    },
    getReceivedFriendRequests(friendId: number) {
        return http.get<FriendRequestResponse[]>(FRIEND_URL.RECEIVED_FRIEND_REQUESTS.replace(":friendId", friendId.toString()));
    },
    getFriends(userId: number) {
        return http.get<FriendResponse[]>(FRIEND_URL.GET_FRIENDS.replace(":userId", userId.toString()));
    }
};