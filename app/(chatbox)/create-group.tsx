import { groupAPI } from '@/api/group.api';
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from 'react-native-paper-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { 
  EditableComboBox, 
  EditableComboBoxModelItem 
} from '@/components/ComboBox';
import { friendAPI } from '@/api/friend.api';
import { ActivityIndicator } from 'react-native-paper';

interface GroupAvatarInfo {
  uri: string;
  fileName: string;
};

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupImageInfo, setGroupImageInfo] = useState<GroupAvatarInfo>({uri: '', fileName: ''});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const toaster = useToast();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { fileName, uri } = result.assets[0] as {
        fileName: string;
        uri: string;
      };
      setGroupImageInfo({ uri, fileName });
    }
  };

  const { isLoading, data } = useQuery({
    queryKey: ["getFriends"],
    queryFn: () => friendAPI.getFriends(),
    enabled: true,
    select: (rs) => {
      let result: EditableComboBoxModelItem[] = [];
      rs.data.forEach(item => {
        result.push({
          id: item.to_user_profile.id,
          text: item.to_user_profile.profile[0].fullname,
          avatar: `data:image/png;base64, ${item.to_user_profile.profile[0]?.avatar}`,
        });
      });
      return result;
    },
  });

  const createGroup = useMutation(groupAPI.createGroup, {
    onSuccess: (response) => {
      const { name, id } = response.data;
      queryClient.invalidateQueries(["getGroupsByUser", ""]);
      toaster.show({
        message: 'Tạo nhóm thành công',
        duration: 2000,
        type: "success",
      });
      router.push({
        pathname: "/(chatbox)/group-chatbox",
        params: { groupName: name, groupId: id},
      });
    },
    onError: (error: any) => {
      toaster.show({
        message: error.message,
        duration: 2000,
        type: "error",
      });
    },
  });

  return isLoading ? 
    <ActivityIndicator /> 
    : (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo nhóm</Text>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            groupImageInfo.uri.length > 0
              ? {
                  uri: groupImageInfo.uri,
                }
              : require("@/assets/images/icon.png")
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Tên nhóm"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <EditableComboBox 
        items={data? data as EditableComboBoxModelItem[]: []}
        placeHolderText="Tìm bạn"
        onSelectionChanged={(ids: string[]) => {
          setSelectedIds(ids);
        }}
      />
      <Button title="Tạo nhóm" onPress={() => {
        createGroup.mutate({ name, description, user_ids: selectedIds });
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default CreateGroupScreen;
