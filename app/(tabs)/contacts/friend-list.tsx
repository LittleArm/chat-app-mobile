import { friendAPI } from "@/api/friend.api";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, IconButton, Searchbar } from "react-native-paper";
import { useQuery, useQueryClient } from "react-query";

const RenderItem = ({ userId, name, item, onCallPress }: ItemInfo) => {
  const handleOnPress = () => {
    router.push({
      pathname: "/(chatbox)",
      params: {
        chatboxId: "",
        avatar: item?.to_user_profile?.profile[0]?.avatar,
        name,
        toGroupId: "",
        toUserId: item?.to_user_profile?.id,
      },
    });
  };

  const handleGoToBio = () => {
    router.push({
      pathname: "/(user)",
      params: {
        avatar: item?.to_user_profile?.profile[0]?.avatar,
        name,
        toUserId: item?.to_user_profile?.id,
      },
    });
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <View style={styles.itemContainer}>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleGoToBio}>
            <Image
              source={{
                uri: item?.to_user_profile?.profile[0]?.avatar
                  ? `data:image/png;base64, ${item?.to_user_profile?.profile[0]?.avatar}`
                  : undefined,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.itemText}>{name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => onCallPress("audio")}>
            <IconButton
              icon="phone"
              size={20}
              iconColor="blue"
              onPress={() => {}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onCallPress("video")}>
            <IconButton
              icon="video"
              size={20}
              iconColor="blue"
              onPress={() => {}}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FriendListScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const handleCallPress = (type: string) => {
    // console.log(`Making ${type} call`);
  };
  const queryClient = useQueryClient();

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["findFriendsByText", searchQuery],
    queryFn: () => friendAPI.findByText({ text: searchQuery }),
    enabled: false,
    select: (rs) => {
      return rs.data;
    },
  });

  const handleSearchFriend = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    refetch();
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries("findFriendsByText");
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View>
      <View style={styles.toolContainer}>
        <Searchbar
          placeholder="Tìm kiếm"
          onChangeText={handleSearchFriend}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      <Link href="/(chatbox)/friend-request/" style={styles.link}>
        Lời mời kết bạn
      </Link>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          scrollEnabled={true}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RenderItem
              item={item}
              name={item.to_user_profile.profile[0].fullname}
              userId={item.from_user}
              onCallPress={handleCallPress}
            />
          )}
        />
      )}
    </View>
  );
};

interface ItemInfo {
  userId: string;
  name: string;
  item?: any;
  onCallPress: (name: string) => void;
}

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#fff",
  },
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
  link: {
    padding: 10,
    justifyContent: "center",
    color: "black",
  },
  toolContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
});

export default FriendListScreen;
