import ChatBoxComponent from "@/components/ChatBox";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

const GroupChatBoxScreen = () => {
  const { chatboxId, avatar, name, toGroupId, toUserId } =
    useLocalSearchParams<{
      chatboxId: string;
      avatar: string;
      name: string;
      toUserId: string;
      toGroupId: string;
    }>();
  return (
    <ChatBoxComponent
      name={name}
      chatboxId={chatboxId}
      toUserId={toUserId}
      toGroupId={toGroupId}
      avatar={avatar}
      isGroupChat={true}
      onSetting={() => {
        router.push({
          pathname: "/group-setting",
          params: { 
            chatboxId, 
            avatar, 
            name, 
            toGroupId, 
            toUserId
          },
        });
      }}
    />
  );
};

export default GroupChatBoxScreen;
