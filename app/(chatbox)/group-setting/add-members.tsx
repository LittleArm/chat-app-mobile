import { groupMemberAPI } from "@/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery } from "react-query";
import {
  EditableComboBox,
  EditableComboBoxModelItem,
} from "@/components/ComboBox";
import { friendAPI } from "@/api/friend.api";
import { ActivityIndicator } from "react-native-paper";
import { FriendResponse } from "@/types/api/response";
import { GroupUserResponse } from "@/types/api/response/group.member.response";
import { useAuth } from "@/contexts/AuthContext";

const AddMembersScreen = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { chatboxId, avatar, name, toGroupId, toUserId } =
    useLocalSearchParams<{
      chatboxId: string;
      avatar: string;
      name: string;
      toUserId: string;
      toGroupId: string;
    }>();
  const toaster = useToast();

  const {
    isLoading,
    data: friendList,
  } = useQuery({
    queryKey: ["getFriends"],
    queryFn: () => friendAPI.getFriends(),
    select: (rs) => {
      // let result: EditableComboBoxModelItem[] = [];
      // rs.data.forEach((item) => {
      //   result.push({
      //     id: item.to_user_profile.id,
      //     text: item.to_user_profile.profile[0].fullname,
      //     avatar: `data:image/png;base64, ${item.to_user_profile.profile[0]?.avatar}`,
      //   });
      // });
      return rs.data;
    },
  });

  const {
    isLoading: loadingGetGroupMembers,
    data: groupMembers,
  } = useQuery({
    queryKey: ["getGroupMembers", toGroupId],
    queryFn: () => groupMemberAPI.getGroupMembers(toGroupId),
    select: (rs) => {
      // console.log(rs.data)
      return rs.data;
    },
  });

  const addMembers = useMutation(groupMemberAPI.addGroupMember, {
    onSuccess: (response) => {
      toaster.show({
        message: "Thêm thành viên thành công",
        duration: 2000,
        type: "success",
      });
      router.back();
    },
    onError: (error: any) => {
      toaster.show({
        message: error.message,
        duration: 2000,
        type: "error",
      });
    },
  });

  const addableMembers = useMemo(() => {
    if (friendList && groupMembers) {
      const addableMembers = friendList.filter(
        (o) =>
          groupMembers.users.findIndex(
            (u) => u.user_id === o.to_user_profile.id
          ) === -1
      );
      let result: EditableComboBoxModelItem[] = [];
      addableMembers.forEach((item) => {
        result.push({
          id: item.to_user_profile.id,
          text: item.to_user_profile.profile[0].fullname,
          avatar: `data:image/png;base64, ${item.to_user_profile.profile[0]?.avatar}`,
        });
      });

      return result;
    }
  }, [friendList, groupMembers]);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <View style={styles.container}>
      <EditableComboBox
        items={addableMembers ? addableMembers : []}
        placeHolderText="Tìm bạn"
        onSelectionChanged={(ids: string[]) => {
          setSelectedIds(ids);
        }}
      />
      <Button
        title="Thêm thành viên"
        onPress={() => {
          addMembers.mutate({
            group_id: toGroupId,
            user_ids: selectedIds,
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default AddMembersScreen;
