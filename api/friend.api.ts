import { MakeRequestDto } from "@/types/api/dto";
import { FindByTextDto } from "@/types/api/dto/friend";
import { FriendResponse } from "@/types/api/response";
import { FriendRequestResponse } from "@/types/api/response/friend-request.response";
import http from "../utils/http";

export const FRIEND_URL = {
    FRIEND: "/friend",
    FRIEND_REQUEST: "/friend-request",
    FRIEND_REQUEST_RECEIVED: "/friend-request/list-received",
    FRIEND_REQUEST_SENT: "/friend-request/list-sent",
    FIND_BY_TEXT: "/friend/find-by-text",
    DECLINE_REQUEST: "/friend-request/decline",
    ACCEPT_REQUEST: "/friend-request/accept",

    ADD_FRIEND: "/addFriend/:userId/:friendId",
    ACCEPT_FRIEND: "/acceptFriend/:friendId/:userId",
    REJECT_FRIEND: "/rejectFriend/:friendId/:userId",
    SENT_FRIEND_REQUESTS: "/sentFriendRequests/:userId",
    RECEIVED_FRIEND_REQUESTS: "/receivedFriendRequests/:friendId",
    GET_FRIENDS: "/friends/:userId",
};

export const friendAPI = {
    getFriends() {
        return http.get<FriendResponse[]>(FRIEND_URL.GET_FRIENDS);
    },
    getFriendRequestsReceived() {
        return http.get<FriendRequestResponse[]>(
            FRIEND_URL.FRIEND_REQUEST_RECEIVED
        );
    },
    getFriendRequestsSent() {
        return http.get<FriendRequestResponse[]>(FRIEND_URL.FRIEND_REQUEST_SENT);
    },
    sendFriendRequest(makeRequestDto: MakeRequestDto) {
        return http.post<FriendRequestResponse>(
            FRIEND_URL.FRIEND_REQUEST,
            makeRequestDto
        );
    },
    findByText(findByTextDto: FindByTextDto) {
        return http.post<FriendResponse[]>(FRIEND_URL.FIND_BY_TEXT, findByTextDto);
    },
    declineRequest(requestId: string) {
        return http.get<FriendRequestResponse>(
            `${FRIEND_URL.DECLINE_REQUEST}/${requestId}`
        );
    },
    acceptRequest(requestId: string) {
        return http.get<FriendRequestResponse>(
            `${FRIEND_URL.ACCEPT_REQUEST}/${requestId}`
        );
    },
};