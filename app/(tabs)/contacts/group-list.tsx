import { groupAPI } from "@/api/group.api";
import { router, useFocusEffect } from "expo-router";
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

const RenderItem = ({ groupId, name, item, onCallPress }: ItemInfo) => {
  const handleOnPress = () => {
    router.push({
      pathname: "/(chatbox)/group-chatbox",
      params: {
        chatboxId: "",
        avatar: item?.group.avatar,
        name,
        toGroupId: item?.group.id,
        toUserId: "",
      },
    });
  };
  return (
    <TouchableOpacity onPress={handleOnPress}>
      <View style={styles.itemContainer}>
        <TouchableOpacity style={styles.iconContainer} onPress={handleOnPress}>
          <Image
            source={{
              uri: item?.group.avatar
                ? `data:image/png;base64, ${item?.group.avatar}`
                : undefined,
            }}
            style={styles.avatar}
          />
          <Text style={styles.itemText}>{name}</Text>
        </TouchableOpacity>
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

const GroupListScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const handleCallPress = (type: string) => {
    // console.log(`Making ${type} call`);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["getGroupsByUser", searchQuery],
    queryFn: () => groupAPI.getGroups({ searchText: searchQuery }),
    select: (rs) => {
      return rs.data;
    },
    enabled: false,
  });

  const handleSearchFriend = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    refetch();
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries("getGroupsByUser");
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolContainer}>
        <Searchbar
          placeholder="Tìm kiếm"
          onChangeText={handleSearchFriend}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          scrollEnabled={true}
          data={data?.groups}
          keyExtractor={(item) => item.group_id}
          renderItem={({ item }) => {
            return (
              <RenderItem
                item={item}
                name={item.group.name}
                groupId={item.group_id}
                onCallPress={() => {
                  handleCallPress(item.group_id);
                }}
              />
            );
          }}
        />
      )}
    </View>
  );
};

interface ItemInfo {
  groupId: string;
  name: string;
  item?: any;
  onCallPress: (groupId: string) => void;
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
  container: {
    paddingBottom: 15,
  },
  toolContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
});

export default GroupListScreen;
