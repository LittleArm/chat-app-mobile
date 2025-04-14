import { SimpleMenu } from "@/components/Menu";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Searchbar, Badge } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import { MESSAGE_MENU_ITEMS } from "@/utils/constants/message-menu-items";
import { useChat } from "@/contexts/ChatContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { chatAPI } from "@/api/chat.api";
import { ChatBox } from "@/types/entities";
import { wp } from "@/helpers";
import moment from "moment";
import "moment/locale/vi";
import { useToast } from "react-native-paper-toast";
moment.locale("vi");
import messaging from "@react-native-firebase/messaging";

interface ListItemProps {
  avatar?: string;
  name?: string;
  item?: ChatBox;
  lastMessage?: string;
  time?: string;
  isNewMessage?: boolean;
  onPress: () => void;
}

const ListItem = ({
  item,
  avatar,
  name,
  lastMessage,
  time,
  isNewMessage,
  onPress,
}: ListItemProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.itemContainer}>
        <View style={{ width: "15%" }}>
          <Image
            source={{
              uri: `data:image/png;base64, ${avatar}`,
            }}
            style={styles.avatar}
          />
        </View>
        <View style={{ width: "85%" }}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={styles.name}>{name}</Text>
            <Text style={isNewMessage ? styles.newMessage : styles.message}>
              {time}
            </Text>
          </View>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={isNewMessage ? styles.newMessage : styles.message}>
              {lastMessage}
            </Text>
            {isNewMessage && <Badge size={12}></Badge>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FriendListSreen = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    toUserId,
    toGroupId,
    chatboxId,
    setChatboxId,
    setToUserId,
    setToGroupId,
    setChatProfile,
  } = useChat();
  const queryClient = useQueryClient();
  const toaster = useToast();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["GetChatBoxListByUser"],
    queryFn: () => chatAPI.listChatBox(),
    enabled: false,
    select: (rs) => {
      return rs.data;
    },
  });

  const setSeen = useMutation(chatAPI.setChatboxSeen, {
    onSuccess: (res) => {
      if (res.data) {
        // queryClient.invalidateQueries(["GetChatBoxListByUser"]);
        refetch();
      }
    },
    onError: (err: any) => {
      toaster.show({
        message: err,
        duration: 2000,
        type: "error",
      });
    },
  });

  const handleSearchMessage = (text: string) => {
    setSearchQuery(text);
  };

  const handleItemPress = (chatbox: ChatBox, avatar: string, name: string) => {
    const { id } = chatbox;
    if (chatbox.new_message) {
      setSeen.mutate(id);
    }
    if (chatbox.to_group_profile) {
      router.push({
        pathname: "/(chatbox)/group-chatbox",
        params: {
          chatboxId: id,
          avatar,
          name,
          toGroupId: chatbox.to_group_profile.id,
          toUserId: "",
        },
      });
    } else {
      router.push({
        pathname: "/(chatbox)",
        params: {
          chatboxId: id,
          avatar,
          name,
          toGroupId: "",
          toUserId: chatbox.to_user_profile.id,
        },
      });
    }
  };

  useEffect(() => {
    // refetch();
    messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", JSON.stringify(remoteMessage));
      refetch();
    });
    return () => {
      queryClient.removeQueries("GetChatBoxListByUser");
    };
  }, []);

  // useEffect(() => {
  //   return () => {
  //     setProfile({
  //       fullname: "",
  //       avatar: "",
  //       id: "",
  //     });
  //   };
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View>
      <View style={styles.barContainer}>
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearchMessage}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SimpleMenu items={MESSAGE_MENU_ITEMS} />
      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          scrollEnabled={true}
          data={data ? data.data : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let avatar: string, name: string;
            if (item.to_group_profile) {
              avatar = item.to_group_profile.avatar;
              name = item.to_group_profile.name;
            } else {
              avatar = item.to_user_profile.profile[0].avatar;
              name = item.to_user_profile.profile[0].fullname;
            }
            const lastMessage = item.chatbox_chatlogs[0].chat_log.content;
            const time = moment(item.latest_updated_date).fromNow();
            return (
              <ListItem
                key={item.id}
                avatar={avatar}
                name={name}
                item={item}
                lastMessage={lastMessage}
                time={time}
                isNewMessage={item.new_message}
                onPress={() => handleItemPress(item, avatar, name)}
              />
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flex: 12,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    // alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: wp(100),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
  },
  message: {
    fontSize: 16,
    color: "gray",
  },
  newMessage: {
    fontSize: 16,
  },
  detailContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailText: {
    fontSize: 22,
  },
});

export default FriendListSreen;
