import { groupMemberAPI } from "@/api";
import { groupAPI } from "@/api/group.api";
import { GROUP_SETTING_ITEMS } from "@/utils/constants/group-setting-routes";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  TextInput
} from "react-native";
import { IconButton } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";

const RenderItem = ({ chatboxId, avatar, name, toGroupId, toUserId, item }: ItemInfo) => {
  const toaster = useToast();
  const queryClient = useQueryClient();
  const leaveGroup = useMutation(groupMemberAPI.leaveGroup, {
    onSuccess: (response) => {
      if (response.data) {
        toaster.show({
          message: "Thao tác thành công",
          duration: 1000,
          type: "success",
        });
        queryClient.invalidateQueries(['getGroupsByUser']);
        queryClient.invalidateQueries(['GetChatBoxListByUser']);
      }
    },
    onError: (error: any) => {
      toaster.show({
        message: error.response.data.message,
        duration: 2000,
        type: "error",
      });
    },
  });
  const GROUP_SETTING_ITEM_API_MAP = new Map<string, any> ([
    ['leave-group', leaveGroup]
  ]);

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => {
          const action = GROUP_SETTING_ITEM_API_MAP.get(item.id);
          if (action) {
            action.mutate(toGroupId);
          }
          router.push({
            pathname: item.route,
            params: { chatboxId, avatar, name, toGroupId, toUserId },
          });
        }}>
        <IconButton
          icon={item.icon}
          size={30}
          iconColor="gray"
        />
        <Text style={{ ...styles.itemText, color: item.textColor}}>{item.text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const GroupSettingScreen = () => {
  const toaster = useToast();
  const { chatboxId, avatar, name, toGroupId, toUserId } =
    useLocalSearchParams<{
      chatboxId: string;
      avatar: string;
      name: string;
      toUserId: string;
      toGroupId: string;
    }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [groupName, setGroupName] = React.useState('');
  const [groupAvatar, setGroupAvatar] = React.useState('');
  const [groupName1, setGroupName1] = React.useState('');

  const pickImage = async () => {
    // await ImagePicker.requestCameraPermissionsAsync();
    // let result = await ImagePicker.launchCameraAsync({
    //   cameraType: ImagePicker.CameraType.front,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 0.5,
    // }); //launch camera
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });
    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width * 0.2, height: height * 0.2 } }],
        {
          compress: 0.2,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      updateGroup.mutate({ 
        id: toGroupId,
        avatar: manipResult.base64
      });
    }
  };

  const updateGroup = useMutation(groupAPI.updateGroup, {
    onSuccess: (response) => {
      if (response.data) {
        toaster.show({
          message: "Thao tác thành công",
          duration: 1000,
          type: "success",
        });
        setGroupName(response.data.name)
        setGroupAvatar(response.data.avatar);
        queryClient.invalidateQueries(["getGroupsByUser"]);
      }
    },
    onError: (error: any) => {
      toaster.show({
        message: error.response.data.message,
        duration: 2000,
        type: "error",
      });
    },
  });

  const { refetch: refetchGroupInfo } = useQuery({
    queryKey: ["GetGroupInfo"],
    queryFn: () => groupAPI.get(toGroupId),
    enabled: false,
    select: (rs) => {
      if (rs.data && setProfile) {
        const { name, avatar } = rs.data;
        setProfile({ name, avatar });
      }
      return rs.data;
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetchGroupInfo();
    }, [])
  );

  const setProfile = (groupProfile: { name: string; avatar: string }) => {
    setGroupName(groupProfile.name);
    setGroupName1(groupProfile.name);
    setGroupAvatar(groupProfile.avatar);
  };

  return (
    <View>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            groupAvatar
              ? {
                  uri: `data:image/png;base64, ${groupAvatar}`,
                }
              : require("@/assets/images/icon.png")
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{groupName}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>
      <FlatList
          data={GROUP_SETTING_ITEMS}
          renderItem={({ item }: { item: any }) => (
            <RenderItem
              toGroupId={toGroupId}
              name={name}
              avatar={avatar}
              chatboxId={chatboxId}
              toUserId={toUserId}
              item={item}
            />
          )}
        />
      
      <Modal
        transparent={true}
        visible={isEditing}
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thay đổi tên nhóm</Text>
            <TextInput
              style={styles.input}
              value={groupName1}
              onChangeText={setGroupName1}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => setIsEditing(false)}>
                <Text style={styles.buttonText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {
                setIsEditing(false);
                if (groupName.length > 0) {
                  // console.log(groupName, toGroupId)
                  updateGroup.mutate({ 
                    id: toGroupId, 
                    name: groupName1
                  });
                }
              }}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>);
}

interface ItemInfo {
  chatboxId: string;
  avatar: string;
  name: string;
  toGroupId: string;
  toUserId: string;
  item: {
    id: any,
    icon?: any;
    text: string;
    route: any;
    textColor?: string;
  }
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 18,
    marginRight: 8,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 18,
    color: "#007BFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default GroupSettingScreen;
