import { friendAPI } from "@/api/friend.api";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";

const RenderItem = ({ name, item }: ItemInfo) => {
  const avatar: string = item?.from_user_profile?.profile[0]?.avatar;
  const toaster = useToast();
  const queryClient = useQueryClient();
  const declineRequest = useMutation(friendAPI.declineRequest, {
    onSuccess: (response) => {
      if (response.data) {
        toaster.show({
          message: "Thao tác thành công",
          duration: 2000,
          type: "success",
        });
        queryClient.invalidateQueries(["getFriendRequestsReceived"]);
      }
    },
    onError: (error: any) => {
      toaster.show({
        message: error.response.data.message,
        duration: 2000,
        type: "error",
      });
      queryClient.invalidateQueries(["getFriendRequestsReceived"]);
    },
  });
  const acceptRequest = useMutation(friendAPI.acceptRequest, {
    onSuccess: (response) => {
      if (response.data) {
        toaster.show({
          message: "Thao tác thành công",
          duration: 2000,
          type: "success",
        });
        queryClient.invalidateQueries(["getFriendRequestsReceived"]);
        queryClient.invalidateQueries(["findFriendsByText", ""]);
      }
    },
    onError: (error: any) => {
      toaster.show({
        message: error.response.data.message,
        duration: 2000,
        type: "error",
      });
      queryClient.invalidateQueries(["getFriendRequestsReceived"]);
    },
  });

  const handleDeclineRequest = () => {
    declineRequest.mutate(item.id);
  };
  
  const handleAcceptRequest =() => {
    acceptRequest.mutate(item.id);
  }

  const handleGoToBio = () => {
    router.push({
      pathname: "/(user)",
      params: {
        avatar: avatar,
        name,
        toUserId: item.id,
      },
    });
  }

  return (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleGoToBio}>
          <Image
            source={{
              uri: `data:image/png;base64, ${avatar}`,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.itemText}>{name}</Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleAcceptRequest}>
          <IconButton
            icon="check"
            size={20}
            iconColor="blue"
            onPress={handleAcceptRequest}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeclineRequest}>
          <IconButton
            icon="delete"
            size={20}
            iconColor="red"
            onPress={handleDeclineRequest}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FriendRequestReceived = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["getFriendRequestsReceived"],
    queryFn: () => friendAPI.getFriendRequestsReceived(),
    select: (rs) => {
      return rs.data;
    },
  });

  return (
    <>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          scrollEnabled={true}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <RenderItem
                item={item}
                name={item?.from_user_profile?.profile[0]?.fullname}
              />
            </View>
          )}
        />
      )}
    </>
  );
};

interface ItemInfo {
  name: string;
  item?: any;
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 5,
  },
});

export default FriendRequestReceived;
