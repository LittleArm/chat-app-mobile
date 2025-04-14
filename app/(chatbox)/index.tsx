import ChatBoxComponent from "@/components/ChatBox";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { ChatBox } from "@/types/entities";

const UserChatBoxScreen = ({}) => {
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
      isGroupChat={false}
    />
  );
};

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  phoneCall: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  detailChatBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  detailText: {
    fontSize: 22,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
});

export default UserChatBoxScreen;
